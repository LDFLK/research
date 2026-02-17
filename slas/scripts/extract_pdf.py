#!/usr/bin/env python3
"""
Extract SLAS seniority list PDFs into JSON files matching the 2026 schema.

Usage:
    python extract_pdf.py                    # Extract all PDFs
    python extract_pdf.py 2025_sp_grade      # Extract single file
    python extract_pdf.py --year 2024        # Extract all grades for a year
"""

import json
import re
import sys
from pathlib import Path

import pdfplumber

RAW_DIR = Path(__file__).parent.parent / "raw_data"
DATA_DIR = Path(__file__).parent.parent / "data"

# Month name to number mapping for D-Mon-YYYY format
MONTH_MAP = {
    "Jan": "1", "Feb": "2", "Mar": "3", "Apr": "4",
    "May": "5", "Jun": "6", "Jul": "7", "Aug": "8",
    "Sep": "9", "Oct": "10", "Nov": "11", "Dec": "12",
}

# Grade configurations
GRADE_CONFIG = {
    "sp_grade": {
        "title": "List of Special Grade Officers",
        "grade": "Special Grade",
        "grade_short": "SP",
        "has_serial_and_seniority": True,
        "date_fields": [
            "dateOfBirth", "dateOfEntryToGradeIII",
            "dateOfPromotionToGradeII", "dateOfPromotionToGradeI",
            "dateOfPromotionToGradeSP",
        ],
    },
    "grade_i": {
        "title": "List of Grade I SLAS Officers",
        "grade": "Grade I",
        "grade_short": "GI",
        "has_serial_and_seniority": True,
        "date_fields": [
            "dateOfBirth", "dateOfEntryToGradeIII",
            "dateOfPromotionToGradeII", "dateOfPromotionToGradeI",
        ],
    },
    "grade_ii": {
        "title": "List of Grade II SLAS Officers",
        "grade": "Grade II",
        "grade_short": "GII",
        "has_serial_and_seniority": False,
        "date_fields": [
            "dateOfBirth", "dateOfEntryToGradeIII",
            "dateOfPromotionToGradeII",
        ],
    },
    "grade_iii": {
        "title": "List of Grade III SLAS Officers",
        "grade": "Grade III",
        "grade_short": "GIII",
        "has_serial_and_seniority": False,
        "date_fields": [
            "dateOfBirth", "dateOfEntryToGradeIII",
        ],
    },
}

CONTACT_INFO = "If there are any corrections to be done please contact SLAS Branch. (TP 0112698605)"

# Date patterns
DATE_SLASH_RE = re.compile(r"^\d{1,2}/\d{1,2}/\d{4}$")        # M/D/YYYY
DATE_DASH_RE = re.compile(r"^\d{1,2}-[A-Z][a-z]{2}-\d{4}$")   # D-Mon-YYYY
FILE_NUM_RE = re.compile(r"^75/10/\d{3,5}$")


def is_date_word(text):
    """Check if a word is a date (but NOT a file number)."""
    if FILE_NUM_RE.match(text):
        return False
    return bool(DATE_SLASH_RE.match(text) or DATE_DASH_RE.match(text))


def normalize_date(date_str):
    """Convert any date format to M/D/YYYY."""
    if not date_str:
        return ""
    date_str = date_str.strip()

    # Already M/D/YYYY or MM/DD/YYYY
    if DATE_SLASH_RE.match(date_str):
        return date_str

    # D-Mon-YYYY → M/D/YYYY
    m = DATE_DASH_RE.match(date_str)
    if m:
        parts = date_str.split("-")
        day = parts[0]
        month = MONTH_MAP.get(parts[1], parts[1])
        year = parts[2]
        return f"{month}/{day}/{year}"

    return date_str


def clean_text(text):
    """Clean extracted text: normalize whitespace, strip."""
    if not text:
        return ""
    text = re.sub(r"\s+", " ", text).strip()
    text = text.strip(" -,")
    return text


# ── Table-based extraction (for 2025 PDFs with visible borders) ──────────

def extract_with_tables(pdf, grade_key, year):
    """Extract using pdfplumber's table extraction (works for 2025 PDFs)."""
    config = GRADE_CONFIG[grade_key]
    officers = []

    for page in pdf.pages:
        tables = page.extract_tables()
        if not tables:
            continue

        for table in tables:
            for row in table[1:]:  # Skip header
                if not row or not row[0]:
                    continue

                first_cell = row[0].strip() if row[0] else ""
                if not first_cell.isdigit():
                    continue

                try:
                    if config["has_serial_and_seniority"]:
                        officer = {
                            "serialNo": int(row[0].strip()),
                            "currentSeniorityNo": int(row[1].strip()),
                            "fileNumber": row[2].strip() if row[2] else "",
                            "name": clean_text(row[3]),
                            "presentPost": clean_text(row[4]),
                            "presentWorkPlace": clean_text(row[5]),
                        }
                        date_start = 6
                    else:
                        sn = int(row[0].strip())
                        officer = {
                            "serialNo": sn,
                            "currentSeniorityNo": sn,
                            "fileNumber": row[1].strip() if row[1] else "",
                            "name": clean_text(row[2]),
                            "presentPost": clean_text(row[3]),
                            "presentWorkPlace": clean_text(row[4]),
                        }
                        date_start = 5

                    for i, field in enumerate(config["date_fields"]):
                        idx = date_start + i
                        if idx < len(row) and row[idx]:
                            officer[field] = normalize_date(row[idx].strip())
                        else:
                            officer[field] = ""

                    if officer["fileNumber"] and FILE_NUM_RE.match(officer["fileNumber"]):
                        officers.append(officer)
                except (ValueError, IndexError):
                    continue

    return officers


# ── Column-position-based extraction (for 2021-2024 borderless PDFs) ─────

def detect_columns(pdf, grade_key):
    """Detect column x-boundaries from DATA word positions (not headers).

    The header text is centered and doesn't align with data columns.
    Instead, we detect boundaries from the actual data by finding where
    known post-title keywords and workplace keywords consistently appear.
    """
    config = GRADE_CONFIG[grade_key]

    # Collect words from first 5 pages for robust detection
    all_words = []
    for page in pdf.pages[:5]:
        words = page.extract_words(keep_blank_chars=False, x_tolerance=2, y_tolerance=2)
        all_words.extend(words)

    # File number position
    file_words = [w for w in all_words if FILE_NUM_RE.match(w["text"])]
    if not file_words:
        return None
    file_x_end = round(max(w["x1"] for w in file_words))

    # Date columns
    date_words = [w for w in all_words if is_date_word(w["text"]) and w["top"] > 80]
    if not date_words:
        return None

    date_x_vals = sorted(set(round(w["x0"]) for w in date_words))
    n_dates = len(config["date_fields"])

    date_cols = []
    for x in date_x_vals:
        if not date_cols or x - date_cols[-1] > 15:
            date_cols.append(x)
        else:
            date_cols[-1] = (date_cols[-1] + x) // 2
    if len(date_cols) < n_dates:
        date_cols = date_x_vals[-n_dates:]
    date_col_starts = date_cols[-n_dates:]
    first_date_x = date_col_starts[0] - 10

    # --- Detect post column start from data ---
    # Post title keywords that appear at the START of the post column
    post_start_keywords = {
        "Secretary", "Addl.", "Additional", "Chief", "Director", "Dy.",
        "Deputy", "Commissioner", "Divisional", "Attached", "Acting",
        "Interdicted", "Foreign", "Leave", "Controller", "Registrar",
        "Senior", "Sen.", "Municipal", "Provincial", "Committee",
        "Assistant", "Asst.", "Actingt",
    }

    # Find x positions of post keywords that are in the data area and
    # between file number and dates
    post_keyword_xs = []
    for w in all_words:
        if (w["text"] in post_start_keywords
            and w["top"] > 80
            and w["x0"] > file_x_end + 30  # At least 30px after file num
            and w["x0"] < first_date_x):
            post_keyword_xs.append(round(w["x0"]))

    if post_keyword_xs:
        # Find the most common post keyword x position (the column start)
        from collections import Counter
        # Cluster within 10px
        clusters = []
        for x in sorted(post_keyword_xs):
            if not clusters or x - clusters[-1][-1] > 10:
                clusters.append([x])
            else:
                clusters[-1].append(x)
        # Pick the cluster with the most members
        biggest_cluster = max(clusters, key=len)
        post_x = round(sum(biggest_cluster) / len(biggest_cluster))
    else:
        post_x = file_x_end + 80  # Fallback

    # --- Detect workplace column start from data ---
    # Workplace keywords that appear at the START of the workplace column
    wp_start_keywords = {
        "Ministry", "Department", "Office", "District", "Divisional",
        "Provincial", "Chief", "Commission", "Election", "Public",
        "Sri", "National", "Central", "Western", "Southern", "Northern",
        "Eastern", "North", "South", "Sabaragamuwa", "Uva",
        "Colombo", "Batticaloa", "Kandy",
    }

    wp_keyword_xs = []
    for w in all_words:
        if (w["text"] in wp_start_keywords
            and w["top"] > 80
            and w["x0"] > post_x + 20  # At least 20px after post column
            and w["x0"] < first_date_x):
            wp_keyword_xs.append(round(w["x0"]))

    if wp_keyword_xs:
        from collections import Counter
        clusters = []
        for x in sorted(wp_keyword_xs):
            if not clusters or x - clusters[-1][-1] > 10:
                clusters.append([x])
            else:
                clusters[-1].append(x)
        biggest_cluster = max(clusters, key=len)
        workplace_x = round(sum(biggest_cluster) / len(biggest_cluster))
    else:
        workplace_x = post_x + 80  # Fallback

    return {
        "file_x_end": file_x_end,
        "post_x": post_x,
        "workplace_x": workplace_x,
        "date_col_starts": date_col_starts,
        "first_date_x": first_date_x,
    }


def extract_with_positions(pdf, grade_key, year):
    """Extract using word positions with detected column boundaries.

    Uses a "row band" approach: each officer occupies a vertical band from
    just above their file number to just above the next file number. This
    handles multi-line cells where name/post/workplace words span several
    y-positions within the same logical row.
    """
    config = GRADE_CONFIG[grade_key]
    cols = detect_columns(pdf, grade_key)
    if not cols:
        print(f"    Could not detect columns, falling back to text parsing")
        return extract_with_text_regex(pdf, grade_key, year)

    officers = []

    for page in pdf.pages:
        words = page.extract_words(keep_blank_chars=False, x_tolerance=2, y_tolerance=2)
        if not words:
            continue

        # Find all file number words and their y positions
        file_num_words = sorted(
            [w for w in words if FILE_NUM_RE.match(w["text"])],
            key=lambda w: w["top"],
        )
        if not file_num_words:
            continue

        # For each file number, define the row band
        for idx, fn_word in enumerate(file_num_words):
            fn_y = fn_word["top"]

            # Row band: from 15px above this file number to just before the next one
            band_top = fn_y - 15
            if idx + 1 < len(file_num_words):
                band_bottom = file_num_words[idx + 1]["top"] - 8
            else:
                band_bottom = fn_y + 40  # Last officer: extend 40px below

            # Collect all words in this band
            band_words = [w for w in words if band_top <= w["top"] <= band_bottom]

            # Also exclude words from other officers' file numbers in overlapping bands
            other_fns = set(fw["text"] for fw in file_num_words if fw is not fn_word)

            pending = {
                "main_words": band_words,
                "extra_words": [],
                "file_number": fn_word["text"],
            }
            officer = build_officer_from_words(pending, config, cols)
            if officer:
                officers.append(officer)

    return officers


def build_officer_from_words(pending, config, cols):
    """Build an officer dict from collected words using column x-boundaries.

    Uses the detected header positions to separate name, post, and workplace
    into distinct columns rather than relying on regex splitting.
    """
    all_words = pending["main_words"] + pending["extra_words"]
    file_number = pending["file_number"]
    file_word = next((w for w in pending["main_words"] if w["text"] == file_number), None)
    if not file_word:
        return None

    file_x_end = cols["file_x_end"]
    post_x = cols["post_x"]
    workplace_x = cols["workplace_x"]
    first_date_x = cols["first_date_x"]

    # Filter out file numbers and date words from the middle area
    def is_content_word(w):
        return (not FILE_NUM_RE.match(w["text"])
                and not is_date_word(w["text"])
                and w["x0"] < first_date_x)

    # Serial numbers: words before file number that are digits
    pre_words = [w for w in all_words if w["x0"] < file_word["x0"]]
    serial_nums = [w["text"] for w in pre_words if w["text"].strip().isdigit()]

    # Name words: between file number end and post column start
    name_words = [w for w in all_words
                  if w["x0"] >= file_x_end and w["x0"] < post_x - 5
                  and is_content_word(w)]
    name_words.sort(key=lambda w: (w["top"], w["x0"]))
    name_text = clean_text(" ".join(w["text"] for w in name_words))

    # Post words: between post column start and workplace column start
    post_words = [w for w in all_words
                  if w["x0"] >= post_x - 5 and w["x0"] < workplace_x - 5
                  and is_content_word(w)]
    post_words.sort(key=lambda w: (w["top"], w["x0"]))
    post_text = clean_text(" ".join(w["text"] for w in post_words))

    # Workplace words: between workplace column start and first date column
    wp_words = [w for w in all_words
                if w["x0"] >= workplace_x - 5 and w["x0"] < first_date_x
                and is_content_word(w)]
    wp_words.sort(key=lambda w: (w["top"], w["x0"]))
    wp_text = clean_text(" ".join(w["text"] for w in wp_words))

    # Date words: in the date columns area (from the main officer line only)
    date_words_list = [w for w in pending["main_words"]
                       if is_date_word(w["text"]) and w["x0"] >= first_date_x]
    date_words_list.sort(key=lambda w: w["x0"])

    officer = {
        "fileNumber": file_number,
        "name": name_text,
        "presentPost": post_text,
        "presentWorkPlace": wp_text,
    }

    # Serial/seniority numbers
    if config["has_serial_and_seniority"]:
        if len(serial_nums) >= 2:
            officer["serialNo"] = int(serial_nums[0])
            officer["currentSeniorityNo"] = int(serial_nums[1])
        elif len(serial_nums) == 1:
            officer["serialNo"] = int(serial_nums[0])
            officer["currentSeniorityNo"] = int(serial_nums[0])
        else:
            officer["serialNo"] = 0
            officer["currentSeniorityNo"] = 0
    else:
        sn = int(serial_nums[0]) if serial_nums else 0
        officer["serialNo"] = sn
        officer["currentSeniorityNo"] = sn

    # Date fields
    for i, field in enumerate(config["date_fields"]):
        if i < len(date_words_list):
            officer[field] = normalize_date(date_words_list[i]["text"])
        else:
            officer[field] = ""

    if FILE_NUM_RE.match(officer["fileNumber"]):
        return officer
    return None


# ── Fallback text-regex extraction ───────────────────────────────────────

def extract_with_text_regex(pdf, grade_key, year):
    """Fallback: extract using full text and regex."""
    config = GRADE_CONFIG[grade_key]
    officers = []
    n_dates = len(config["date_fields"])

    # Combined date pattern for both formats
    date_pat = r"(?:\d{1,2}/\d{1,2}/\d{4}|\d{1,2}-[A-Z][a-z]{2}-\d{4})"

    if config["has_serial_and_seniority"]:
        # SP, GI: serialNo seniorityNo fileNumber name post workplace dates...
        line_re = re.compile(
            r"^\s*(\d+)\s+(\d+)\s+(75/10/\d{3,5})\s+"
            r"(.+?)\s+"
            r"(" + r"\s+".join([date_pat] * n_dates) + r")\s*$"
        )
    else:
        # GII, GIII: senNo fileNumber name post workplace dates...
        line_re = re.compile(
            r"^\s*(\d+)\s+(75/10/\d{3,5})\s+"
            r"(.+?)\s+"
            r"(" + r"\s+".join([date_pat] * n_dates) + r")\s*$"
        )

    for page in pdf.pages:
        text = page.extract_text()
        if not text:
            continue

        lines = text.split("\n")
        for line in lines:
            m = line_re.match(line)
            if not m:
                continue

            if config["has_serial_and_seniority"]:
                serial_no = int(m.group(1))
                seniority_no = int(m.group(2))
                file_number = m.group(3)
                middle = m.group(4)
                dates_str = m.group(5)
            else:
                serial_no = int(m.group(1))
                seniority_no = serial_no
                file_number = m.group(2)
                middle = m.group(3)
                dates_str = m.group(4)

            # Parse dates
            dates = re.findall(date_pat, dates_str)
            name, post, workplace = split_name_post_workplace(clean_text(middle))

            officer = {
                "serialNo": serial_no,
                "currentSeniorityNo": seniority_no,
                "fileNumber": file_number,
                "name": name,
                "presentPost": post,
                "presentWorkPlace": workplace,
            }

            for i, field in enumerate(config["date_fields"]):
                officer[field] = normalize_date(dates[i]) if i < len(dates) else ""

            officers.append(officer)

    return officers


# ── Shared utilities ─────────────────────────────────────────────────────

def group_words_by_line(words, y_tolerance=3):
    """Group words into lines based on y-position."""
    if not words:
        return []

    sorted_words = sorted(words, key=lambda w: (w["top"], w["x0"]))
    lines = []
    current_line = [sorted_words[0]]

    for w in sorted_words[1:]:
        if abs(w["top"] - current_line[0]["top"]) <= y_tolerance:
            current_line.append(w)
        else:
            lines.append(sorted(current_line, key=lambda w: w["x0"]))
            current_line = [w]

    if current_line:
        lines.append(sorted(current_line, key=lambda w: w["x0"]))

    return lines


def is_header_text(text):
    """Check if text is a header/title line."""
    t = text.strip().upper()
    return (
        t.startswith("LIST OF") or t.startswith("* IF") or t.startswith("** WE")
        or t.startswith("SERIAL") or t.startswith("SENIORITY") or t.startswith("NO.")
        or t.startswith("CURRENT") or t.startswith("DATE OF") or t.startswith("SEN.")
        or t.startswith("FILE") or t.startswith("NAME") or t.startswith("PRESENT")
        or t.startswith("PLACE") or t.startswith("ENTRY") or t.startswith("PROMOTION")
        or t.startswith("GRADE") or t.startswith("BIRTH")
        or "CORRECTIONS" in t or "REGRET" in t or len(t) < 3
    )


def split_name_post_workplace(text):
    """Split combined text into name, post title, and workplace."""
    if not text:
        return "", "", ""

    # Post title patterns (ordered by specificity - longest/most specific first)
    post_patterns = [
        r"District Secretary\s*/\s*Government Agent",
        r"District Secretary\s*/\s*Govt\.?\s*Agent",
        r"Act\.?\s+Addl\.?\s+Commissioner\s+General\s+of\s+Labour",
        r"Acting District Secretary\s*/\s*Government Agent",
        r"Deputy Secretary of the Treasury",
        r"Deputy Post Master General\s*(?:\([^)]+\))?",
        r"Provincial Director of Social Services",
        r"Acting Secretary to the Governor",
        r"(?:Sen\.|Senior)\s+(?:Dy\.|Deputy)\s+(?:Director|Secretary)\s*(?:General)?",
        r"(?:Sen\.|Senior)\s+(?:Assistant Secretary|Asst\.?\s*Secretary)",
        r"Senior Assistant Secretary",
        r"(?:Addl\.|Additional)\s+(?:Secretary|Director\s*(?:General)?|Commissioner(?:\s*General)?|Election Commissioner|District Secretary|Survey(?:or)?\s*General)",
        r"(?:Dy\.|Deputy)\s+(?:Secretary|Director(?:\s*General)?|Commissioner(?:\s*General)?|Chief Secretary|Controller|Registrar(?:\s*General)?|Post Master|Govt\.?\s*Printer|Immigration|Surveyor|Provincial Director)",
        r"Acting (?:Secretary|Director(?:\s*General)?|Commissioner|Divisional Secretary|District Secretary|Registrar|Controller)",
        r"Actingt? (?:Director|Secretary|Commissioner)",
        r"Commissioner General",
        r"Director General",
        r"Additional Director General",
        r"Additional Surveyor General",
        r"Additional Survey General",
        r"Additional Election Commissioner",
        r"Municipal Commissioner",
        r"Provincial Director",
        r"Committee Secretary",
        r"Chief Secretary",
        r"Chief Accountant",
        r"Secretary",
        r"Director\s*\([^)]+\)",
        r"Director\s*(?:\(Combined\s*Service\))?",
        r"Director",
        r"Commissioner",
        r"Controller",
        r"Registrar General",
        r"Registrar",
        r"Divisional Secretary",
        r"Asst\.?\s*/?\s*(?:Dy\.?)?\s*Commissioner",
        r"Asst\.?\s*Secretary",
        r"Asst\.?\s*Director",
        r"Assistant (?:Secretary|Director|Commissioner|Controller|Registrar|Charity Commissioner|Superintendent)",
        r"Attached",
        r"Foreign Mission",
        r"Leave",
        r"Interdicted",
    ]

    combined_pattern = "|".join(f"({p})" for p in post_patterns)

    # Try matching: name (Mr./Ms./Mrs.) followed by post title
    name_then_post = re.match(
        r"((?:Mr\.|Ms\.|Mrs\.)\s+\S+(?:\s+\S+)*?)\s+(" + combined_pattern + r")\s*(.*)",
        text,
        re.IGNORECASE,
    )

    if name_then_post:
        name = clean_text(name_then_post.group(1))
        # The post is captured starting from group(2)
        # Find which group matched for the post
        post_and_rest = text[name_then_post.start(2):]
        post_match = re.match(r"(" + combined_pattern + r")\s*(.*)", post_and_rest, re.IGNORECASE | re.DOTALL)
        if post_match:
            post = clean_text(post_match.group(1))
            workplace = clean_text(post_match.group(0)[len(post_match.group(1)):])
            return name, post, workplace

    # Fallback: split at first recognized post pattern
    for p in post_patterns:
        m = re.search(r"\b(" + p + r")\s+(.*)", text, re.IGNORECASE)
        if m:
            before = text[:m.start()].strip()
            post = clean_text(m.group(1))
            workplace = clean_text(m.group(2))
            # Before should contain name
            name = clean_text(before) if before else ""
            return name, post, workplace

    # Last resort: treat everything as name
    return text, "", ""


def extract_pdf(year, grade_key):
    """Extract a single PDF to JSON."""
    config = GRADE_CONFIG[grade_key]
    pdf_path = RAW_DIR / f"{year}_{grade_key}.pdf"

    if not pdf_path.exists():
        print(f"  ERROR: {pdf_path} not found")
        return None

    pdf = pdfplumber.open(str(pdf_path))

    # Try table extraction first (works for 2025 PDFs with borders)
    first_page_tables = pdf.pages[0].extract_tables()
    has_tables = bool(first_page_tables) and len(first_page_tables[0]) > 5

    if has_tables:
        # Verify it's a real table (check column count)
        ncols = len(first_page_tables[0][0])
        if ncols >= 7:
            print(f"  Using table extraction ({ncols} cols)")
            officers = extract_with_tables(pdf, grade_key, year)
        else:
            print(f"  Table detected but only {ncols} cols, using position extraction")
            officers = extract_with_positions(pdf, grade_key, year)
    else:
        print(f"  Using position-based extraction")
        officers = extract_with_positions(pdf, grade_key, year)

    pdf.close()

    # Deduplicate by file number
    seen = set()
    unique_officers = []
    for o in officers:
        if o["fileNumber"] not in seen:
            seen.add(o["fileNumber"])
            unique_officers.append(o)

    # Sort by original serialNo, then reindex
    unique_officers.sort(key=lambda o: o.get("serialNo", 0))
    for i, o in enumerate(unique_officers, 1):
        o["serialNo"] = i

    result = {
        "title": config["title"],
        "asAt": f"01.01.{year}",
        "grade": config["grade"],
        "contactInfo": CONTACT_INFO,
        "officers": unique_officers,
    }

    return result


def validate_result(result, year, grade_key):
    """Validate extraction result."""
    if not result:
        return False

    officers = result["officers"]
    if not officers:
        print(f"  WARNING: No officers extracted")
        return False

    # Check file numbers
    invalid_fn = [o["fileNumber"] for o in officers if not FILE_NUM_RE.match(o["fileNumber"])]
    if invalid_fn:
        print(f"  WARNING: {len(invalid_fn)} invalid file numbers")

    # Check names
    no_name = sum(1 for o in officers if not o.get("name"))
    if no_name:
        print(f"  WARNING: {no_name}/{len(officers)} missing names")

    # Check dates
    for field in GRADE_CONFIG[grade_key]["date_fields"]:
        missing = sum(1 for o in officers if not o.get(field))
        if missing > len(officers) * 0.1:
            print(f"  WARNING: {missing}/{len(officers)} missing {field}")

    print(f"  OK: {len(officers)} officers")
    return True


def main():
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    years = ["2025", "2024", "2023", "2022", "2021"]
    grades = ["sp_grade", "grade_i", "grade_ii", "grade_iii"]

    if len(sys.argv) > 1:
        arg = sys.argv[1]
        if arg.startswith("--year"):
            year = sys.argv[2] if len(sys.argv) > 2 else arg.split("=")[1]
            years = [year]
        elif "_" in arg:
            parts = arg.split("_", 1)
            years = [parts[0]]
            grades = [parts[1]]

    for year in years:
        print(f"\n{'='*60}")
        print(f"  Year {year}")
        print(f"{'='*60}")

        for grade_key in grades:
            print(f"\n  --- {year}_{grade_key} ---")
            result = extract_pdf(year, grade_key)

            if result and validate_result(result, year, grade_key):
                output_path = DATA_DIR / f"{year}_{grade_key}.json"
                with open(output_path, "w", encoding="utf-8") as f:
                    json.dump(result, f, indent=2, ensure_ascii=False)
                print(f"  Saved: {output_path}")
            else:
                print(f"  FAILED: {year}_{grade_key}")


if __name__ == "__main__":
    main()
