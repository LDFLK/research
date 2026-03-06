# UI Update Checklist — Per-Act Deep Dive

Every time a new act is added to a ministry deep dive, **11 files** must be created or modified. This checklist is the definitive reference.

## Files to CREATE (3 new files)

### 1. Analysis JSON
- **Path**: `docs/src/data/{act-slug}-analysis.json`
- **Naming**: kebab-case slug derived from act title (e.g., `education-ordinance-analysis.json`)
- **Content**: Full analysis data — see `data-model-reference.md` for schema
- **Used by**: Imported into the deep-dive.mdx page and passed to components as props

### 2. Lineage Page
- **Path**: `docs/docs/ministry-deep-dive/{ministry}/act-lineage/{act-slug}/lineage.md`
- **Frontmatter**: `sidebar_position: 1`, `title: Lineage & Amendments`
- **Content**: Mermaid diagrams — amendment flowchart, governance hierarchy, act structure, key section evolution, entity-relationship diagram
- **Diagrams**: Typically 4-5 Mermaid blocks per page

### 3. Deep Dive Page
- **Path**: `docs/docs/ministry-deep-dive/{ministry}/act-lineage/{act-slug}/deep-dive.mdx`
- **Frontmatter**: `sidebar_position: 2`, `title: Deep Dive`
- **Imports**: `StatutoryBodiesExplorer`, `AmendmentTimeline`, `EntityRelationshipView`, analysis JSON
- **Content**: Structured analysis with tables, admonitions, and embedded interactive components

## Files to MODIFY (8 existing files)

### 4. Ecosystem JSON
- **Path**: `docs/src/data/ministry-{ministry}-ecosystem.json`
- **Action**: Add new act entry to the `acts` array. If a new domain category is needed, add it to `domainCategories` too.
- **Required fields**: id, title, number, year, kind, status, analysisDepth (`"deep"`), pdfUrl, domainCategory, summary, crossReferences, amendments

### 5. Sidebar Config
- **Path**: `docs/sidebars.ts`
- **Action**: Add a new category under the ministry's Act Lineage section:
```typescript
{
  type: 'category',
  label: '{Act Display Name}',
  collapsible: true,
  items: [
    'ministry-deep-dive/{ministry}/act-lineage/{act-slug}/lineage',
    'ministry-deep-dive/{ministry}/act-lineage/{act-slug}/deep-dive',
  ],
},
```

### 6. Ministry Deep Dive Intro
- **Path**: `docs/docs/ministry-deep-dive/intro.md`
- **Action**: Add a row to the ministry's table:
```markdown
| {Act Name} | [Lineage](./...) | [Deep Dive](./...) | {Key topics} |
```

### 7. Ministry Overview Page
- **Path**: `docs/docs/ministry-deep-dive/{ministry}/{ministry}-ministry.mdx`
- **Action**:
  - Update the Mermaid pie chart counts
  - Update the "Work in Progress" note with new count
  - Add a Key Observation bullet point for the new act

### 8. Act Lineage Index
- **Path**: `docs/docs/ministry-deep-dive/{ministry}/act-lineage/index.md`
- **Action**:
  - Add nodes to the cross-reference Mermaid network (principal act + amendment nodes)
  - Add `click` links for source URLs
  - Add `style` entries with appropriate colors
  - Add dotted-line cross-references if applicable (e.g., `-.->|"repeals"|`)
  - Update the "X acts cataloged" count in the note
  - Add rows to the Act Sources table (principal + all amendments)

### 9. Meetings Registry JSON
- **Path**: `docs/src/data/ministry-{ministry}-meetings.json`
- **Action**: Add entries for any statutory bodies that have meeting details (boards, councils, committees). Each entry needs: body, act, actNumber, actYear, minister, sections, status, operationalStatus, frequency, convenedBy, chairperson, quorum, reporting, dissentMechanism, maxMembers.
- **Skip if**: The act doesn't establish any bodies with meeting procedures.

### 10. React App — acts.json
- **Path**: `legislation/ui/public/data/acts.json`
- **Action**: Add entries for the principal act and any amendments not already present.
- **Check first**: `grep` for the act title/number — some acts already exist from the original 1,439-act dataset.
- **Entry format**:
```json
{
  "doc_type": "lk_acts",
  "doc_id": "{act-slug}",
  "num": "{number}-{year}-en",
  "date_str": "{YYYY-MM-DD or YYYY-XX-XX}",
  "description": "{Full act title with number}",
  "url_metadata": "manual_entry",
  "lang": "en",
  "url_pdf": "{source URL or empty string}",
  "doc_number": "{number}/{year}",
  "domain": "{domain}",
  "year": "{year}"
}
```

### 11. React App — lineage.json
- **Path**: `legislation/ui/public/data/lineage.json`
- **Action**: Add or fix the lineage track entry. If an entry exists (from the original dataset), fix issues (missing base act, duplicate amendments). If none exists, create a new entry.
- **Check first**: `grep` for the act slug or title.
- **Common issues with existing entries**:
  - Missing base act (only amendments listed)
  - Duplicate amendment entries
  - No `is_amendment: false` entry for the principal act
- **Entry format**:
```json
{
  "base_title": "{Base Title}",
  "slug": "{slug}",
  "domain": "{Domain}",
  "versions": [
    { "doc_id": "...", "year": ..., "date": "...", "title": "...", "doc_number": "...", "is_amendment": false, "url_pdf": "..." },
    { "doc_id": "...", "year": ..., "date": "...", "title": "... (Amendment)", "doc_number": "...", "is_amendment": true, "url_pdf": "..." }
  ]
}
```

## Post-Update Verification

After all 11 files are updated:

1. **Build Docusaurus**: `cd docs && npx docusaurus build` — must succeed with no errors
2. **Commit**: Stage all 11 files, commit with descriptive message

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Act slug (folder/file) | kebab-case, short | `education-ordinance`, `public-examinations-act` |
| Analysis JSON filename | `{slug}-analysis.json` | `education-ordinance-analysis.json` |
| Entity ID | kebab-case with act number | `education-ordinance-31-1939` |
| Statutory body ID | kebab-case descriptive | `central-advisory-council-education` |
| Amendment ID | `amendment-{number}-{year}` | `amendment-26-1947` |
| Domain category ID | kebab-case | `foundational-framework` |
