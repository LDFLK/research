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

## Agent Knowledge Base

For AI agents resuming work on this codebase, the `agents/` directory contains persistent context:

| What | Where |
|------|-------|
| Agent KB overview | `agents/README.md` |
| Act deep-dive context (current state) | `agents/legislation/acts/context.md` |
| Per-act UI update checklist (11 files) | `agents/legislation/acts/ui-update-checklist.md` |
| Research extraction workflow | `agents/legislation/acts/extraction-workflow.md` |
| JSON data model schemas | `agents/legislation/acts/data-model-reference.md` |
| Pitfalls and learned patterns | `agents/legislation/acts/lessons-learned.md` |

> **On session start**: Read `agents/legislation/acts/context.md` first to understand current project state.

## Local Development

For full setup instructions (environment creation, starting services, database migration, data pipeline), see the **[Local Development Setup](guidelines/ministry-deep-dive/README.md#local-development-setup)** section in the Ministry Deep Dive guideline. Quick reference:

| Service | Port | Start Command |
|---------|------|---------------|
| FastAPI Backend | 8000 | `cd legislation && uvicorn pylegislation.research.api.main:app --port 8000 --reload` |
| Next.js React App | 3000 | `cd legislation/ui && npm run dev` |
| Docusaurus Docs | 3001 | `cd docs && npx docusaurus start --port 3001` |

**Critical**: Run `legislation research migrate` from the `legislation/` directory (not the repo root) to seed the database.

## Key Paths

| What | Where |
|------|-------|
| Docusaurus site | `docs/` |
| Components | `docs/src/components/` |
| Data files (JSON — Docusaurus) | `docs/src/data/` |
| Data files (JSON — React app) | `legislation/ui/public/data/` |
| SQLite database | `legislation/database/research.db` |
| CSS | `docs/src/css/custom.css` |
| Sidebar config | `docs/sidebars.ts` |
| Docusaurus config | `docs/docusaurus.config.ts` |
| Legislation app | `legislation/` |
| Backend API | `legislation/pylegislation/research/api/` |
| CLI commands | `legislation/pylegislation/cli.py` |
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

## Key Paths (SLAS)

| What | Where |
|------|-------|
| SLAS Next.js app | `slas/app/` |
| SLAS app source | `slas/app/src/` |
| SLAS components | `slas/app/src/components/` |
| SLAS DB queries & types | `slas/app/src/lib/db.ts`, `slas/app/src/lib/types.ts` |
| SLAS SQLite database | `slas/app/data/slas.db` |
| SLAS data (yearly JSON) | `slas/data/` (2021-2026, 4 grades per year) |
| SLAS master geocoded file | `slas/data/institutions-geocoded.json` |
| SLAS coordinate fallbacks | `slas/data/institution-coordinates.json` |
| SLAS build script | `slas/scripts/build-db.ts` |
| SLAS extraction scripts | `slas/scripts/extract_pdf.py`, `slas/scripts/extract_xlsx.py` |
| SLAS raw data (PDFs/XLSX) | `slas/raw_data/` (not in git) |
| SLAS Docusaurus section | `docs/docs/slas-admin/` |
| SLAS Docusaurus components | `docs/src/components/SLAS*.tsx` |
| SLAS Docusaurus data | `docs/src/data/slas-*.json` |

---

## Current State

### Project 1: Legislation Analysis

#### React App (`legislation/ui/`, port 3000)
- **1,439 acts** in browsable database (2010-2026, 12 domain categories)
- **AI analysis pipeline** — Google Gemini 2.0 Flash with caching, history, custom prompts
- **Key pages**: Dashboard (`/acts`), Analysis (`/acts/analyze/[id]`), Lineage Editor (`/acts/editor`), Analytics (`/analytics`), Add Acts (`/acts/add`)
- **Lineage visualization** — React Flow-based amendment dependency graph
- **Act addition** — single + batch import with duplicate detection
- **Analytics dashboard** — token usage, latency, cost tracking
- **DB state**: 4 cached analyses, 13 history entries, 46 telemetry records
- **Tech**: Next.js 16, React 19, Tailwind 4, Shadcn UI, Recharts
- **Data files**: `legislation/ui/public/data/acts.json` (1,439 acts), `lineage.json` (amendment relationships)

#### Backend API (`legislation/pylegislation/`, port 8000)
- **FastAPI** + SQLite (SQLModel) at `legislation/data/research.db`
- **Endpoints**: `POST /analyze`, `GET /acts`, `GET /acts/{id}`, `POST /acts/add`, `POST /acts/batch`, `POST /acts/check-duplicate`, `GET /acts/{id}/pdf` (proxy), `GET /acts/{id}/history`, `GET /analytics`
- **Analysis output**: summary, sections, entities, amendments, categorization, meeting_details, board_members, referenced_acts
- **CLI**: `legislation research analyze|categorize|lineage|process|migrate|dump-analysis|load-analysis`

#### Docusaurus — Ministry Deep Dive (Health)
- **18 acts** cataloged in `docs/src/data/ministry-health-ecosystem.json`
- **12 acts with full lineage + deep-dive pages** (24 pages total in `docs/docs/ministry-deep-dive/act-lineage/`)
- **Deep-dive analysis JSON files** (12 files in `docs/src/data/`):
  - `health-services-act-analysis.json`, `medical-ordinance-analysis.json`, `medical-wants-ordinance-analysis.json`
  - `mental-disease-ordinance-analysis.json`, `national-health-dev-fund-analysis.json`, `nursing-homes-act-analysis.json`
  - `poisons-opium-drugs-analysis.json`, `private-medical-inst-analysis.json`, `nurses-council-analysis.json`
  - `transplantation-tissues-analysis.json`, `food-act-analysis.json`, `sjgh-board-analysis.json`
- **Meetings Registry**: 8+ statutory bodies in `docs/src/data/ministry-health-meetings.json`
- **6 reusable components**: `MinistryOverview`, `StatutoryBodiesExplorer`, `AmendmentTimeline`, `EntityRelationshipView`, `MeetingsRegistry`, `StatusIndicator`
- **6 acts cataloged but NOT deep-dived**: NMRA Act (2015), Ayurveda Act (1961), Homoeopathy Act (1970), Vijaya Kumaratunga Memorial Hospital (1999), National Authority on Tobacco & Alcohol (2006), Suwaseriya Foundation (2018)

#### Docusaurus — Act Summaries
- Reusable `ActSlideshow` component (CSS Modules, dark mode, keyboard nav, auto-play, full-width)
- **1 completed**: Telecommunications Act lineage slideshow (7 slides, 1991-2026) in `docs/src/data/telecom-act-slideshow.json`
- Section landing page + 1 act page in `docs/docs/act-summaries/`

#### Legislation — What's Next
- Deep-dive the remaining 6 Health acts (NMRA, Ayurveda, Homoeopathy, etc.)
- Add more ministries using the same pattern (Education, Finance, Defence, etc.)
- Refactor components to accept data as props (currently hardcoded imports) for multi-ministry scaling
- Build more Act Summary slideshows for other act lineages
- Sync deep-dive lineage data back to `legislation/ui/public/data/lineage.json`

---

### Project 2: SLAS Officer Tracking

#### SLAS Next.js App (`slas/app/`, port 3007)
- **2,953 officers** tracked across **6 years** (2021-2026), **4 grades** (SP, GI, GII, GIII)
- **2,149 institutions**, **15,138 yearly snapshots**
- **Key pages**: Dashboard (`/`), Officer Search (`/officers`), Officer Detail (`/officers/[fileNumber]`), Institution Search (`/institutions`), Institution Roster (`/institutions/[id]`), Mobility Analytics (`/mobility`)
- **Geographic Career Profile** on officer detail page:
  - `GeoJourneyMap` — interactive Leaflet map with year slider, play/pause animation
  - `PostingHistory` — chronological posting stint cards with duration, grade, distance
  - `DistrictBreakdown` — CSS bar chart of years per district + field vs. HQ ratio
  - `TransferSummary` — 4 stat cards (transfers, total/avg/max distance)
- **Tech**: Next.js (App Router), Tailwind CSS, SQLite (better-sqlite3), Leaflet maps, Lucide icons
- **Alpha banner** on every page warning about AI-extracted data and approximate geographic locations

#### SLAS Data Pipeline
- **Source**: Official PDF seniority lists from pubad.gov.lk → extracted via `extract_pdf.py` / `extract_xlsx.py`
- **Build**: `cd slas/scripts && npx tsx build-db.ts` → generates `slas/app/data/slas.db`
- **Geocoding pipeline** (in `build-db.ts`): master file → overrides → location matching → provincial regex → embedded name matching → Colombo default
- **Master geocoded file**: `slas/data/institutions-geocoded.json` (2,149 entries, 977 verified, 939 default_colombo, 233 missing)
- **Coordinate fallbacks**: `slas/data/institution-coordinates.json` (395 locations, 72 overrides)

#### SLAS Docusaurus Section (`docs/docs/slas-admin/`)
- **9 pages**: intro, people-finder, special-grade, grade-i, grade-ii, grade-iii, post-classification, demographics, promotion-analysis, ministry-analysis
- **6 components**: `SLASSeniorityTable`, `SLASPeopleFinder`, `SLASDemographics`, `SLASMinistryAnalysis`, `SLASPromotionAnalysis`, `SLASPostCatalog`
- **Alpha warning** in intro.md about AI-extracted data and approximate geographic locations

#### SLAS — What's Next
- Improve geocoding accuracy (currently ~45% verified distinct coordinates)
- Geographic data needs manual verification for ministries/departments defaulting to Colombo
- Clean up unused `OfficerMovementMap.tsx` (replaced by `GeoJourneyMap`)
- Remove stale utility scripts that reference deleted files (`audit_institutions.py`, `export_pending_review.ts`, etc.)
