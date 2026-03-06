# Data Model Reference — Act Analysis JSON

The analysis JSON is the single source of truth for each act deep dive. It feeds the interactive components on the deep-dive page.

## Top-Level Schema

```json
{
  "act": { ... },
  "statutoryBodies": [ ... ],
  "amendments": [ ... ],
  "timeline": [ ... ],
  "governanceHierarchy": { ... },
  "dataConfidence": { ... }
}
```

## `act` — Act Metadata

```json
{
  "id": "education-ordinance-31-1939",
  "title": "Education Ordinance",
  "number": "No. 31 of 1939",
  "year": 1939,
  "kind": { "major": "Legislation", "minor": "ordinance" }
}
```

**OpenGIN `kind` values**:
- `{ "major": "Legislation", "minor": "act" }` — for acts (post-1972)
- `{ "major": "Legislation", "minor": "ordinance" }` — for ordinances (pre-1972 British-era)
- `{ "major": "Organisation", "minor": "statutory-body" }` — for bodies established by acts

**ID format**: `{kebab-title}-{number}-{year}` (e.g., `public-examinations-act-25-1968`)

## `statutoryBodies[]` — Entities Established by the Act

```json
{
  "id": "department-of-education",
  "name": "Department of Education",
  "kind": { "major": "Organisation", "minor": "statutory-body" },
  "sections": "Section 2",
  "currentStatus": "legally-active",
  "operationalStatus": "active | unknown | inactive",
  "statusNote": "Free text explaining current status...",

  "composition": {
    "maxMembers": 8,
    "exOfficio": [
      { "role": "Chairman", "note": "Appointed by Minister (Section X)", "count": 1 }
    ],
    "nominated": [
      { "role": "Directors", "note": "Appointed to the Board (Section X)", "maxCount": null }
    ],
    "termLength": "As defined in appointment terms",
    "reNomination": null
  },

  "meetings": {
    "frequency": "As determined by the Board (Section X)",
    "convenedBy": "Chairman",
    "chairperson": "Chairman (Section X)",
    "quorum": "Three members (Section X)",
    "location": "Not specified in Act",
    "reporting": "Annual report to the Minister (Section X)",
    "dissentMechanism": "Chairman has casting vote (Section X)"
  },

  "powers": [
    "Description of power (Section X)"
  ],

  "dataGaps": [
    "What's unknown or needs further research"
  ]
}
```

**Notes**:
- `meetings` can be `null` if the body doesn't have explicit meeting procedures
- `maxMembers` can be `null` if the act doesn't specify a fixed number
- `operationalStatus`: `"active"` = confirmed operating, `"unknown"` = legally exists but unclear if operational, `"inactive"` = not currently functioning

## `amendments[]`

```json
{
  "id": "amendment-26-1947",
  "actNumber": "No. 26 of 1947",
  "year": 1947,
  "type": "Free Education / Advisory Bodies",
  "sectionsAmended": ["5-8", "13-18", "47"],
  "summary": "One-line summary",
  "impactOnMeetings": "none | established | modified | abolished",
  "impactRating": "low | medium | high",
  "details": "Multi-sentence description",
  "sourceUrl": "https://... or empty string"
}
```

**`impactRating` guide**:
- `"low"`: Minor structural/administrative changes
- `"medium"`: Expanded powers, refined procedures, financial changes
- `"high"`: Fundamental transformation (e.g., Free Education, commercial expansion, repeal-and-replace)

## `timeline[]`

```json
{
  "year": 1939,
  "event": "Education Ordinance enacted",
  "type": "enactment | amendment | related",
  "details": "Description of what happened"
}
```

**`type` values**:
- `"enactment"`: The principal act/ordinance being enacted
- `"amendment"`: A direct amendment to the act
- `"related"`: An external event that significantly affects the act (e.g., 13th Constitutional Amendment)

## `governanceHierarchy`

```json
{
  "tiers": [
    {
      "level": 1,
      "name": "Minister of Education",
      "scope": "National | Regional | Local | Per-school",
      "status": "legally-active",
      "relationship": "Description with section references"
    }
  ],
  "currentReplacement": {
    "national": "Description of current operational arrangement"
  }
}
```

## `dataConfidence`

```json
{
  "legislativeFramework": "high | medium | low",
  "historicalDetails": "high | medium | low",
  "currentOperationalStatus": "high | medium | low"
}
```

Typically: legislative framework = high, historical details = high, current operational status = low (because we research from act text, not from current operations).

## Ecosystem JSON — Ministry-Level Catalog

Each ministry has a `ministry-{name}-ecosystem.json` containing:

```json
{
  "ministry": { "name": "...", "gazetteReference": "...", "gazetteDate": "...", "country": "..." },
  "domainCategories": [
    { "id": "general-education", "label": "General Education", "color": "#1565C0" }
  ],
  "acts": [
    {
      "id": "...", "title": "...", "number": "...", "year": ...,
      "kind": { "major": "...", "minor": "..." },
      "status": "active | repealed",
      "analysisDepth": "deep | catalog",
      "pdfUrl": "...",
      "domainCategory": "general-education",
      "summary": "...",
      "crossReferences": ["other-act-id"],
      "amendments": [{ "actNumber": "...", "year": ... }]
    }
  ]
}
```

**Domain category colors** (Education Ministry):

| ID | Label | Color |
|----|-------|-------|
| exam-assessment | Examination & Assessment | `#E65100` (orange) |
| general-education | General Education | `#1565C0` (blue) |
| higher-education | Higher Education | `#6A1B9A` (purple) |
| teacher-training | Teacher Training & Development | `#2E7D32` (green) |
| technical-vocational | Technical & Vocational Education | `#00838F` (teal) |
| library-documentation | Library & Documentation Services | `#5D4037` (brown) |
| foundational-framework | Foundational Framework | `#4E342E` (dark brown) |

## Meetings Registry JSON

Flat array in `ministry-{name}-meetings.json`:

```json
{
  "body": "Display name",
  "act": "Act title",
  "actNumber": "No. X of YYYY",
  "actYear": YYYY,
  "minister": "Minister of ...",
  "sections": "Sections X-Y",
  "status": "legally-active",
  "operationalStatus": "active | unknown",
  "frequency": "...",
  "convenedBy": "...",
  "chairperson": "...",
  "quorum": "...",
  "reporting": "...",
  "dissentMechanism": "...",
  "maxMembers": N | null
}
```
