# Claude Context — LDF Research Repository

## Repository Overview

Multi-project research repository for the **Lanka Data Foundation**. Contains legislation analysis tools, OCR experiments, gazette processing, and a Docusaurus documentation site.

## Key Paths

| What | Where |
|------|-------|
| Docusaurus site | `docs/` |
| Components | `docs/src/components/` |
| Data files (JSON) | `docs/src/data/` |
| CSS | `docs/src/css/custom.css` |
| Sidebar config | `docs/sidebars.ts` |
| Docusaurus config | `docs/docusaurus.config.ts` |
| Legislation app | `legislation/` |
| Task guidelines | `guidelines/` |

## Docusaurus Patterns

- **Import pattern**: `import Component from '@site/src/components/ComponentName';`
- **Data pattern**: Static JSON in `src/data/`, imported directly into components
- **Styling**: Infima CSS classes (`badge`, `card`, `table`, `alert`, `button`) + custom CSS
- **Diagrams**: Mermaid is enabled in `docusaurus.config.ts` — use fenced code blocks
- **Components**: Functional React + TypeScript, hooks for state, no external UI libraries
- **Build**: `cd docs && npx docusaurus build` (Node 20+, Docusaurus 3.9.2, React 19)

## Guidelines for Repeatable Tasks

Detailed guidelines for specific repeatable tasks live in `guidelines/`:

- **`guidelines/ministry-deep-dive/README.md`** — Full process for creating Ministry Deep Dive documentation sections. Covers research requirements, data model (OpenGIN-aligned JSON), implementation checklist, component reference, file naming, and quality checklist. **Use this when adding any new ministry analysis.**

## OpenGIN Entity Model

Entities use `kind: { major, minor }` pairs:
- `Legislation/act`, `Legislation/ordinance` — for acts and ordinances
- `Organisation/statutory-body` — for bodies established by acts

Relationships are string ID references between entities.

## Current State

### Ministry Deep Dive (Health)
- 18 acts cataloged in `docs/src/data/ministry-health-ecosystem.json`
- Health Services Act deep analysis in `docs/src/data/health-services-act-analysis.json`
- 5 pages in `docs/docs/ministry-deep-dive/`
- 5 components: `StatusIndicator`, `MinistryOverview`, `StatutoryBodiesExplorer`, `AmendmentTimeline`, `EntityRelationshipView`

### What's Next
- Deep dive into more acts (NMRA, Nurses' Council, etc.)
- Add more ministries using the same pattern
- Refactor components to accept data as props (currently hardcoded imports)
