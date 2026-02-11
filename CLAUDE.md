# Claude Context — LDF Research Repository

## Repository Overview

Multi-project research repository for the **Lanka Data Foundation**. Contains legislation analysis tools, OCR experiments, gazette processing, and a Docusaurus documentation site.

## Task Guidelines Catalog

Before starting any repeatable task, check this table first. If a guideline exists, **read it before doing anything**.

| Task Name | Type | Description | Guideline |
|-----------|------|-------------|-----------|
| Ministry Deep Dive | Documentation / Visualization | Create interactive Docusaurus pages for a ministry's legislative ecosystem — act catalog, Mermaid diagrams, statutory body analysis, amendment timelines. Reusable across any ministry. | `guidelines/ministry-deep-dive/README.md` |
| Source Acquisition | Research / Data | Locate, classify, and store legislative source documents (PDF, HTML, paywall). | `guidelines/source-acquisition/README.md` |

> **How to invoke**: Tell Claude the task name (e.g., *"Let's do a Ministry Deep Dive for Ministry of Education"*) and it will follow the corresponding guideline for research, data modeling, implementation, and verification.

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

All guidelines live in `guidelines/`. See the **Task Guidelines Catalog** table above for the full index. When adding a new repeatable task, always add a row to that table so it stays discoverable.

## OpenGIN Entity Model

Entities use `kind: { major, minor }` pairs:
- `Legislation/act`, `Legislation/ordinance` — for acts and ordinances
- `Organisation/statutory-body` — for bodies established by acts

Relationships are string ID references between entities.

## Current State

### Ministry Deep Dive (Health)
- 18 acts cataloged in `docs/src/data/ministry-health-ecosystem.json`
- Health Services Act deep analysis in `docs/src/data/health-services-act-analysis.json`
- Medical Ordinance deep analysis in `docs/src/data/medical-ordinance-analysis.json`
- Medical Wants Ordinance deep analysis in `docs/src/data/medical-wants-ordinance-analysis.json`
- Meetings Registry: 6 statutory bodies aggregated in `docs/src/data/ministry-health-meetings.json`
- 8 pages in `docs/docs/ministry-deep-dive/` (including meetings registry)
- 6 components: `StatusIndicator`, `MinistryOverview`, `StatutoryBodiesExplorer`, `AmendmentTimeline`, `EntityRelationshipView`, `MeetingsRegistry`

### What's Next
- Deep dive into more acts (NMRA, Nurses' Council, etc.)
- Add more ministries using the same pattern
- Refactor components to accept data as props (currently hardcoded imports)
