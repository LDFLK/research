INITIAL_PROMPT = """
You are analyzing a Sri Lankan Government Gazette notification that contains two types of content:

1. **Structured ministry sections** listing duties, departments, and laws.
2. **Amendments** describing changes to existing ministerial content (such as insertions, omissions, renumberings, or replacements).

Your task is to extract **both types of information** and return them in a single structured JSON object with two top-level keys: `"ministers"` and `"changes"`.

---

### PART 1 — Extract Ministries (Structured Table Format)

Each ministry includes three columns:

- Column I: "Subjects and Functions"  
- Column II: "Departments, Statutory Institutions and Public Corporations"  
- Column III: "Laws, Acts and Ordinances to be Implemented"

Extract content from each valid table using this format:

{
  "ministers": [
    {
      "name": "Exact full name of the minister (from heading)",
      "subjects_and_functions": ["... from Column I ..."],
      "departments": ["... from Column II ..."],
      "laws_and_ordinances": ["... from Column III ..."]
    }
  ]
}

#### STRICT RULES FOR MINISTRY EXTRACTION:

1. Only extract if a heading like `No. XX. Minister of ...` or `With reference to the Heading, "No. XX. Minister of ..."` is present.
2. Combine all parts if the table continues across multiple pages.
3. DO NOT paraphrase, interpret, or reword — copy all content **exactly as written**.
4. REMOVE only leading numbering (e.g., "1.", "•") — keep the rest unchanged.
5. Assign items strictly based on visual placement under each column.
6. DO NOT include:
   - Laws, Acts, Ordinances, Codes, or Regulations in Columns I or II.
   - Departments, Institutions, or Authorities in Column III.
   - Header/footer content, signatures, or publication notices.
7. DO NOT duplicate entries across columns.
8. If a ministry name has changed or merged, use the **new full name** from the most recent insertion (e.g., "Minister of Agriculture and Plantation Industries").

---

### PART 2 — Extract Amendments (Sentence Format)

Extract all sentence-based **amendments** (insertions, omissions, renumberings, or replacements) using the format below:

{
  "changes": [
    {
      "ministry_name": "string",
      "change_type": "ADD" | "OMIT" | "RENUMBER",
      "affected_column": "I" | "II" | "III",
      "details": ["string", ...]
    }
  ]
}

#### FORMAT RULES FOR `details`:

- **ADD**:
  - If number and name: `Inserted: item <number> — <name>`
  - If only name: `Inserted: <name>`
  - If only number: `Inserted: item <number>`
  - If inserted after another item in Column III:  
    - `after: <existing item>`  
    - `Inserted: <name>`

- **OMIT**:
  - If name only: `Omitted: <name>`
  - If number only: `Omitted: item <number>`
  - If entire column or heading is removed: `Omitted: all subjects and functions` / `Omitted: all departments` / `Omitted: all laws and ordinances`

- **RENUMBER**:
  - Format: `Renumbered: items <old_range> as <new_range>`

#### STRICT RULES FOR CHANGES:

1. Each change must be grouped by **one unique combination** of:
   - `ministry_name`
   - `change_type`
   - `affected_column`
2. Do NOT combine different change types in one object.
3. Do NOT infer or invent any values — copy from source only.
4. If a ministry is replaced or renamed, reflect the update in `ministry_name`.

---

### FINAL OUTPUT FORMAT

Return a single valid JSON object with two keys:

{
  "ministers": [...],  
  "changes": [...]
}

Start extracting from the following document content:

{docs}
"""
