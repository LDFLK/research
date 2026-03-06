# Extraction Workflow — Act Deep Dives

How to research, extract, and structure legislative act information for deep dive pages.

## 1. Input: User-Provided Research

The user typically provides an "Antigravity-generated" research summary containing:

- Act title, number, and year
- Section-by-section breakdown (grouped by Part)
- Amendment history with dates and impact descriptions
- Source URLs (LawNet, srilankalaw.lk, CommonLII, Parliament, natlib.lk, etc.)
- Current legal status notes

**Key insight**: The user does the primary research. The agent's job is to *structure* it into the established data model, create consistent pages, and update all supporting files.

## 2. Source Verification

Before creating files, verify and classify sources:

| Source | URL Pattern | Reliability |
|--------|-------------|-------------|
| LawNet | `lawnet.gov.lk/wp-content/uploads/Law%20Site/...` | Official — full text |
| srilankalaw.lk | `srilankalaw.lk/...` | Official — section outlines, sometimes paywalled |
| CommonLII | `commonlii.org/lk/legis/...` | Reliable — slow to load but full text |
| Parliament | `parliament.lk/en/business-of-parliament/acts-listing` | Official — metadata only |
| natlib.lk | `natlib.lk/pdf/...` | Official — PDF downloads |
| lawlanka.com | `lawlanka.com/...` | Reference only — limited detail |

**Pattern**: When a source URL is missing, set `sourceUrl: ""` in the analysis JSON and mark it as "Source not confirmed" in the act-lineage index table. Update it later when the user provides the link.

## 3. Data Extraction Process

### Step 1: Identify Statutory Bodies

From the research, extract every entity that the act **establishes, constitutes, or creates**:

- Government departments (e.g., Department of Education)
- Bodies corporate (e.g., State Printing Corporation, UNESCO Scholarship Fund)
- Boards (e.g., Board of Directors, Board of Management, School Development Board)
- Advisory councils/committees (e.g., Central Advisory Council, Examinations Advisory Committee)
- Funds (as legal entities)

For each body, extract:
- Composition (ex-officio members, nominated members, max count)
- Meeting details (frequency, convenedBy, chairperson, quorum, reporting, dissent mechanism)
- Powers (list of statutory powers with section references)
- Data gaps (what's unknown/unclear)

### Step 2: Map Amendments

For each amendment, determine:
- `id`: `amendment-{number}-{year}` (e.g., `amendment-26-1947`)
- `actNumber`: Full format (e.g., "No. 26 of 1947")
- `type`: Categorize (Structural, Commercial, Administrative, Financial, etc.)
- `sectionsAmended`: Array of section numbers affected
- `impactRating`: `"low"` / `"medium"` / `"high"` based on scope of changes
- `impactOnMeetings`: `"none"` / `"established"` / `"modified"` / `"abolished"`

### Step 3: Build Timeline

Include:
- Enactment event (type: `"enactment"`)
- Each amendment (type: `"amendment"`)
- Related constitutional/legislative changes (type: `"related"`) — e.g., 13th Amendment

### Step 4: Map Governance Hierarchy

Identify tiers from Minister down to operational level. Each tier needs:
- Level number (1 = top)
- Name, scope (National/Regional/Local/Per-school)
- Status and relationship description with section references

### Step 5: Cross-References

Identify acts that reference or are referenced by this act:
- Direct cross-references (e.g., Bribery Act scheduling, Penal Code classifications)
- Functional relationships (e.g., Education Ordinance exam functions → Public Examinations Act)
- Repealed predecessor acts

## 4. Intermediate Data → Final Output

The extraction produces one JSON file (analysis data) which feeds three outputs:

```
User Research
     ↓
[Extract & Structure]
     ↓
analysis JSON ──→ deep-dive.mdx (interactive page with components)
     │          ──→ lineage.md (Mermaid diagrams)
     │          ──→ meetings registry entries
     ↓
Supporting file updates (ecosystem, sidebar, intro, etc.)
```

The analysis JSON is the **single source of truth**. The deep-dive.mdx page imports it and passes it to reusable components (`StatutoryBodiesExplorer`, `AmendmentTimeline`, `EntityRelationshipView`). The lineage.md page uses Mermaid diagrams that are manually authored but consistent with the JSON data.

## 5. Mermaid Diagram Patterns

### Amendment Flowchart
- Principal act as root node (deep orange `#E65100`)
- Amendments as child nodes with impact-based colors:
  - Low: Light blue `#90CAF9`
  - Medium: Amber `#FFA726`
  - High: Red `#EF5350`
- Related non-amendments (e.g., constitutional changes): Gray `#78909C`, dotted lines (`-.->`)
- Add `click` links to source URLs where available

### Governance Hierarchy
- Minister/oversight: Gray `#78909C`
- Executive/operational: Green `#4CAF50`
- Advisory bodies: Amber `#FFA726`
- Corporate entities: Deep orange `#E65100`

### Entity-Relationship Diagrams
- Use `erDiagram` type
- `||--|{` for "establishes" (strong)
- `||--o{` for "amended by" (optional)
- `}|--||` for external references (e.g., Bribery Act)
- Include entity attributes (id, number, year, kind fields)
