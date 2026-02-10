# Source Acquisition — Repeatable Task Guideline

This guideline documents the process for locating, classifying, and storing legislative source documents (PDF, HTML, or unavailable) for the Lanka Data Foundation research repository.

## Table of Contents

1. [Overview](#overview)
2. [Source Scenarios](#source-scenarios)
3. [Decision Tree](#decision-tree)
4. [URL Classification](#url-classification)
5. [Known Source Sites](#known-source-sites)
6. [Storage Conventions](#storage-conventions)
7. [Adding to the TSV](#adding-to-the-tsv)
8. [Adding a Missing Source](#adding-a-missing-source)
9. [Data Gaps](#data-gaps)

---

## Overview

Legislative source documents exist in various forms: downloadable PDFs, HTML pages, paywall-protected files, or simply not digitized. This guideline provides a repeatable process for acquiring and cataloging these documents consistently.

### Priority Order

When multiple source formats exist for the same document:

```
1. PDF (free download)         — best: portable, archivable, citable
2. HTML snapshot (free)        — good: readable, can be saved locally
3. Paywall reference           — acceptable: document the URL for future access
4. Unavailable                 — last resort: leave empty, document the gap
```

---

## Source Scenarios

| Scenario | Source Type | Action | Storage Location |
|----------|-----------|--------|------------------|
| Direct PDF available | PDF (free) | Download, store locally | `ui/public/pdfs/{doc_id}.pdf` |
| HTML page available | HTML (free) | Save as HTML, store locally | `ui/public/pdfs/{doc_id}.html` |
| Behind paywall | PDF/HTML (paid) | Document the URL, leave `url_pdf` pointing to paywall page | `url_pdf` field in TSV |
| Not found online | Unavailable | Leave `url_pdf` empty, document in data gaps | Empty field |

---

## Decision Tree

```
Start: Do you have the doc_id?
  │
  ├─ YES → Search known source sites (see below)
  │   │
  │   ├─ Found free PDF? → Download to ui/public/pdfs/{doc_id}.pdf
  │   │                     Set url_pdf to the download URL
  │   │
  │   ├─ Found free HTML? → Save to ui/public/pdfs/{doc_id}.html
  │   │                      Set url_pdf to the HTML page URL
  │   │
  │   ├─ Found behind paywall? → Set url_pdf to the paywall URL
  │   │                           Add note to data gaps
  │   │
  │   └─ Not found? → Leave url_pdf empty
  │                    Add note to data gaps
  │
  └─ NO → Construct doc_id first (see Storage Conventions)
```

---

## URL Classification

Before downloading, determine what type of resource a URL points to.

### Quick checks

1. **File extension**: `.pdf` → PDF; `.html` or `.htm` → HTML page
2. **Content-Type header** (when extension is ambiguous):
   ```bash
   curl -sI "https://example.com/document" | grep -i content-type
   # application/pdf → PDF
   # text/html       → HTML page
   ```
3. **wget spider** (check without downloading):
   ```bash
   wget --spider "https://example.com/document.pdf" 2>&1 | head -5
   # 200 OK → available; 403/404 → not available
   ```

### Common traps

- **lawnet.gov.lk** URLs ending in `.html` serve actual HTML content, not PDFs in an iframe
- **srilankalaw.lk** may return a login page even for URLs that look like direct PDF links
- **documents.gov.lk** usually serves genuine PDFs at their URLs

---

## Known Source Sites

### documents.gov.lk (Government Printing Dept.)

- **Coverage**: Post-1990s acts, good coverage from ~2000 onward
- **Format**: Direct PDF downloads
- **URL pattern**: `https://documents.gov.lk/view/acts/{year}/{month}/{number}-{year}_E.pdf`
- **Access**: Free, no login required
- **Reliability**: High — official government source

### lawnet.gov.lk (Legal Information Institute)

- **Coverage**: Some pre-independence and post-independence acts
- **Format**: HTML pages (not PDFs)
- **URL pattern**: `https://www.lawnet.gov.lk/wp-content/uploads/Legislative_html/{code}.html`
- **Access**: Free, no login required
- **Reliability**: Medium — some pages are incomplete or have encoding issues
- **Note**: URLs with `/Law%20Site/` paths also serve HTML content

### srilankalaw.lk

- **Coverage**: Wide historical range
- **Format**: PDF behind paywall
- **URL pattern**: `https://www.srilankalaw.lk/YearWisePdf/{year}/{title}.pdf`
- **Access**: Paid subscription required
- **Reliability**: N/A — treat as inaccessible unless subscription is available
- **Action**: Document URL in `url_pdf` field but note as paywall in data gaps

### commonlii.org (CommonLII)

- **Coverage**: Some consolidated acts
- **Format**: Free PDFs
- **URL pattern**: varies
- **Access**: Free
- **Reliability**: Medium — not always up to date

### Other sources

- **natlib.lk** (National Library digital collection): Some gazette PDFs
- **Parliament website**: Occasional act texts
- **Ministry websites**: Some acts hosted on relevant ministry sites (e.g., `eohfs.health.gov.lk`)

---

## Storage Conventions

### File naming

```
ui/public/pdfs/{doc_id}.pdf    — for PDF files
ui/public/pdfs/{doc_id}.html   — for HTML snapshots
```

The `{doc_id}` must exactly match the `doc_id` column in `v2_docs.tsv`.

### doc_id patterns

For acts from the government digital archive (post-~2000):
```
{date}-{date}-{number}-{year}-en
Example: 2024-06-19-2024-06-19-35-2024-en
```

For manually-added historical acts not in the archive:
```
lk_acts-{slugified-title}-{number}-{year}
Example: lk_acts-health-services-act-12-1952
```

### Slugification rules

- Lowercase the title
- Replace spaces with hyphens
- Remove parentheses and their content (e.g., "(Amendment)" becomes just the slug portion)
- Keep act number and year at the end

---

## Adding to the TSV

When adding a new document to `v2_docs.tsv`, use this field order:

```
doc_type	doc_id	num	date_str	description	url_metadata	lang	url_pdf	doc_number	domain
```

| Field | Required | Notes |
|-------|----------|-------|
| `doc_type` | Yes | Always `lk_acts` for acts |
| `doc_id` | Yes | See doc_id patterns above |
| `num` | Yes | `{number}/{year}` — e.g., `12/1952` |
| `date_str` | Yes | Year only for historical acts — e.g., `1952` |
| `description` | Yes | Official short title — e.g., `Health Services Act, No. 12 of 1952` |
| `url_metadata` | No | URL to the metadata/index page (leave empty if none) |
| `lang` | Yes | `en` for English, `si` for Sinhala, `ta` for Tamil |
| `url_pdf` | No | Direct URL to PDF or HTML source; empty if unavailable |
| `doc_number` | Yes | Same as `num` field |
| `domain` | Yes | Domain category — e.g., `Health & Safety` |

### Amendment naming convention

For amendments, include `(Amendment)` in the description so the lineage system auto-groups them:

```
Health Services (Amendment), No. 10 of 1956
```

The lineage system (`lineage.py`) strips `(Amendment)` to find the parent family name.

---

## Adding a Missing Source

Quick procedure when you have a URL for an act that currently shows "Source not available" in the UI.

### Steps

```
1. Verify the URL returns real content:
     curl -sL -o /dev/null -w "%{http_code} %{size_download} %{content_type}" "URL"
   Expect: 200, size > 0, content_type = application/pdf or text/html

2. Find the row in v2_docs.tsv:
     grep "doc-id-slug" legislation/reports/research/versions/v2_docs.tsv

3. Edit the url_pdf field (column 8) to the new URL.

4. Regenerate:
     cd legislation
     python -m pylegislation.cli research lineage
     python -m pylegislation.cli research process

5. Verify:
     python3 -c "
     import json
     with open('ui/public/data/lineage.json') as f:
         data = json.load(f)
     for fam in data:
         for v in fam['versions']:
             if v['doc_id'] == 'TARGET_DOC_ID':
                 print(v['url_pdf'])
     "
```

### Choosing the right URL

| Available formats | Use |
|---|---|
| PDF only | PDF URL |
| HTML only | HTML URL |
| Both PDF and HTML | PDF URL (preferred) |
| Multiple PDFs (e.g. lankalaw.net + commonlii) | Pick the more stable host |

### Known URL patterns by site

| Site | Pattern | Format |
|------|---------|--------|
| lankalaw.net | `/wp-content/uploads/{date}/{code}.pdf` or `.html` | PDF or HTML |
| lawnet.gov.lk | `/wp-content/uploads/Law%20Site/4-stats_1956_2006/set4/{year}Y0V0C{num}A.html` | HTML |
| lawnet.gov.lk | `/wp-content/uploads/Legislative_html/{code}.html` | HTML |
| documents.gov.lk | `/view/acts/{year}/{month}/{number}-{year}_E.pdf` | PDF |
| commonlii.org | `/lk/legis/num_act/{slug}.html` or `/consol_act/{slug}.pdf` | HTML or PDF |

### Gotcha: ghost pages

Some lawnet.gov.lk URLs return HTTP 200 but 0 bytes. Always check `size_download > 0`.

---

## Data Gaps

When a source document cannot be obtained, record the gap. This helps track what's missing and prioritize future acquisition efforts.

### Where to document gaps

1. **TSV**: Leave `url_pdf` empty
2. **Analysis JSON**: Add to the `dataGaps` array in the relevant analysis file
3. **Commit message**: Note which documents are unavailable and why

### Common gap reasons

- Pre-digital era (before ~1990): Many acts were never digitized
- Paywall: srilankalaw.lk requires paid subscription
- Physical-only: Some documents exist only in physical archives (National Archives, Parliamentary Library)
- Encoding issues: Some lawnet.gov.lk HTML pages have character encoding problems making them unreliable

### Gap template

```
Document: {title}, No. {number} of {year}
Status: Not available online
Reason: [Pre-digital / Paywall / Physical-only / Other]
Searched: [List of sites checked]
Date searched: YYYY-MM-DD
```
