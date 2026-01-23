INITIAL_PROMPT = """
You are an assistant extracting structured data from an official Sri Lankan Government Gazette.

### PAGE FILTERING RULES:

- If the input page contains only preamble, boilerplate text, or notification headers (e.g., constitutional powers, gazette publication notice, or names of officials like “Anura Kumara Dissanayake”), DO NOT extract anything.

- Only extract data if the page includes **structured amendment information** such as:
  - A heading like: `No. XX. Minister of ...`
  - A sentence starting with: `With reference to the Heading, “No. XX. Minister of ...”`
  - Specific column change indicators like: `(a) In Column I thereof...`

Each ministry includes three columns:
- Column I: "Subjects and Functions"
- Column II: "Departments, Statutory Institutions and Public Corporations"
- Column III: "Laws, Acts and Ordinances to be Implemented"

### STRICT RULES:
1. DO NOT paraphrase, summarize, reword, rename or interpret anything. Copy each line **exactly** as shown.
2. DO NOT mix values between columns. Each item must go into the correct array according to where it is **visually listed** in the gazette.
3. DO NOT include values like "Tourism", "Finance", "Planning", etc. in departments unless they are explicitly written as individual items in Column II.
4. DO NOT include the same item in more than one column. Each value belongs to **only one** column.
5. REMOVE only numbering (e.g., "1.", "•").
6. INCLUDE continuation pages. If a ministry’s data spans multiple pages, combine all columns under the correct minister.
7. **if one value in one column mentioned another column, ignore that.**
8. DO NOT include items from "Laws, Acts and Ordinances to be Implemented" (any item containing “Act No.”, "Act" “Ordinance”, “Law”, “Code”, “Regulation”, etc.) in the "departments" or "subjects_and_functions" lists. These must ONLY go into "laws_and_ordinances".
9. Likewise, DO NOT include organizations, institutions, departments, commissions, or authorities under "laws_and_ordinances".
10. Classify each item ONLY based on which column it physically appears in the gazette, NOT by association or similarity of terms.
11. DO NOT treat people’s names as ministries.
12. Include CONTINUATION PAGES for each ministry
13. Maintain original department names exactly 
14. DO NOT INCLUDE values from Column I into "departments" or "laws_and_ordinances"
15. DO NOT INCLUDE values from Column II into "subjects_and_functions" or "laws_and_ordinances"
16. DO NOT INCLUDE values from Column III into "departments" or "subjects_and_functions"
17. Output valid, clean JSON only — no markdown, comments, or natural language.

Your task is to extract the data **exactly as it appears** under each column for every ministry and return the output in the following JSON format:

{{
  "ministers": [
    {{
      "name": "Exact full name of the minister (from heading)",
      "subjects_and_functions": [
        "Line 1 from Column I",
        "Line 2 from Column I",
        ...
      ],
      "departments": [
        "Line 1 from Column II",
        "Line 2 from Column II",
        ...
      ],
      "laws_and_ordinances": [
        "Line 1 from Column III",
        "Line 2 from Column III",
        ...
      ]
    }}
  ]
}}

Start extracting from the following document content:
{docs}
"""
