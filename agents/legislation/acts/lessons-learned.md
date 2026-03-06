# Lessons Learned — Act Deep Dives

Pitfalls, fixes, and patterns discovered across 20+ act deep dives.

## Data Quality Issues

### React App — Duplicate Lineage Entries
**Problem**: The original `lineage.json` dataset (831 tracks) frequently contains duplicate amendment entries within a single lineage track.
**Example**: State Printing Corporation had two identical `51/1981` entries.
**Fix**: Always grep for the act first. If an entry exists, read the full versions array and deduplicate before modifying.

### React App — Missing Base Acts
**Problem**: Many lineage tracks only list amendments, with no entry for the principal (base) act.
**Example**: State Printing Corporation lineage had 1981 and 1998 amendments but no 1968 base act.
**Fix**: Add an `is_amendment: false` entry for the principal act as the first version.

### React App — Acts Already Present
**Problem**: The acts.json has ~1,450 entries. Some acts we add as deep dives already exist.
**Example**: UNESCO Scholarship Fund Act was already in acts.json. State Printing Corporation amendments were already there (but not the principal act).
**Fix**: Always `grep` for the act title, number, and doc_number before adding. Only add if missing.

### Source URL Availability
**Problem**: Not all amendment texts are available online. Some require paywalls, some are simply not digitized.
**Pattern**: Set `sourceUrl: ""` in the analysis JSON. In the act-lineage index sources table, use "— | Source not confirmed". Update when the user provides links.
**Example**: The 1978 State Printing Corporation amendment was initially "Text not confirmed" until the user provided the CommonLII link.

## UI Patterns

### Mermaid Diagram Click Links
**Pattern**: Always add `click` directives to Mermaid nodes where source URLs exist. This makes the diagrams interactive — users can click through to the actual act text.
**Caveat**: Not all nodes have URLs. Only add `click` for nodes with confirmed source links.

### Pie Chart Updates
**Gotcha**: When adding a new domain category, the pie chart in `{ministry}-ministry.mdx` needs a new slice. Also update the count for existing categories when adding acts to them.

### "Work in Progress" Note
**Pattern**: Always update the count in the "X acts cataloged so far" note. Keep the wording consistent — "acts" for acts-only, "acts/ordinances" when ordinances are included.

### Act-Lineage Index — Cross-Reference Network
**Pattern**: The Mermaid flowchart in `act-lineage/index.md` shows the entire ministry's legislative network. For acts with amendments, show the principal act with arrows to amendment nodes. For cross-references between acts, use dotted lines (`-.->|"description"|`).
**Gotcha**: The flowchart can get large. Use `flowchart LR` (left-right) for better layout with many acts.

## Architectural Patterns

### Ordinances vs. Acts
Sri Lanka switched from "Ordinances" (British colonial era, pre-1972) to "Acts" (post-1972 republic). The `kind.minor` field distinguishes them:
- `"ordinance"` — for pre-1972 legislation (e.g., Education Ordinance 1939, Medical Ordinance 1927)
- `"act"` — for post-1972 legislation (e.g., Public Examinations Act 1968)

Note: Some transitional-era legislation uses "Law" (e.g., "Education (Change of Designations) Law, No. 35 of 1973"). These are still classified as `kind.minor: "act"` in the ecosystem JSON since they amend existing legislation.

### Cross-Ministry Acts
Some acts appear under multiple ministries. The State Printing Corporation Act (1968) is assigned to Education but its minister is "Minister of Mass Communication". This is normal — gazette assignments don't always align with the act's original ministry. Note the actual minister in meetings registry entries.

### Provincial Devolution (13th Amendment, 1987)
Many education-related bodies and powers were affected by the 13th Constitutional Amendment. This isn't a direct amendment to individual acts but fundamentally changes their operational framework. Represent it as:
- Timeline entry with `type: "related"`
- Dotted line in Mermaid diagrams
- `:caution` admonition in the deep-dive page

### Advisory Bodies — Operational Status
Many advisory bodies established by older ordinances (1939, 1968) have unclear operational status. Later acts may create overlapping bodies. Mark `operationalStatus: "unknown"` and note the overlap in `dataGaps`.
**Example**: The Education Ordinance's School Examinations Advisory Council (Sections 13-15) likely overlaps with the Public Examinations Act's Schools Examinations Advisory Committee (Section 3).

## Git Workflow

### Path Awareness
**Gotcha**: When running `git add` from a subdirectory, paths must be relative to the current working directory, not the repo root. Always `cd` to repo root first or use absolute paths.
**Fix**: Always use `cd /path/to/repo/root && git add docs/...` pattern.

### Commit Message Pattern
Follow the established format:
```
feat: add {Act Name} deep dive ({Ministry} Ministry)

{2-3 line description of what was added/changed}

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### Branch Naming
Ministry deep dives use feature branches: `feat-{ministry}-min-v1` (e.g., `feat-education-min-v1`).

## Performance Notes

### Docusaurus Build
- Build takes ~8-10 seconds
- The `onBrokenMarkdownLinks` deprecation warning is harmless
- Build will fail on broken imports, missing JSON files, or invalid Mermaid syntax — always build before committing

### Large JSON Files
- `acts.json` is ~18,000+ lines — use `grep` to find entries, don't read the whole file
- `lineage.json` is ~17,000+ lines — same approach
- When editing these files, use precise `Edit` operations with enough context for unique matching

### CommonLII Source Links
The user reported that CommonLII links "take a lot of time to load, but the content is there." This is normal — CommonLII servers are slow but reliable. Still worth using as source links.
