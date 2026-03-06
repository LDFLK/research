# Current Context — Act Deep Dives

**Last updated**: 2026-03-06
**Current branch**: `feat-education-min-v1`

## Project State

### Health Ministry — COMPLETE (12 deep dives)
- 18 acts cataloged in ecosystem JSON
- 12 acts with full lineage + deep-dive pages
- 6 acts cataloged but NOT deep-dived: NMRA Act (2015), Ayurveda Act (1961), Homoeopathy Act (1970), Vijaya Kumaratunga Memorial Hospital (1999), National Authority on Tobacco & Alcohol (2006), Suwaseriya Foundation (2018)
- 8+ statutory bodies in meetings registry

### Education Ministry — IN PROGRESS (7 deep dives)

| # | Act / Ordinance | Year | Status | Commit |
|---|----------------|------|--------|--------|
| 1 | Public Examinations Act, No. 25 of 1968 | 1968 | Complete | `ab31e96` |
| 2 | Assisted Schools & Training Colleges Act, No. 5 of 1960 | 1960 | Complete | `9b26d43` |
| 3 | National Library & Documentation Services Board Act, No. 51 of 1998 | 1998 | Complete | `fb26c2c` |
| 4 | School Development Boards Act, No. 8 of 1993 | 1993 | Complete | `7f3e789` |
| 5 | UNESCO Scholarship Fund Act, No. 44 of 1999 | 1999 | Complete | `4487136` |
| 6 | State Printing Corporation Act, No. 24 of 1968 | 1968 | Complete | `85545e3` |
| 7 | Education Ordinance, No. 31 of 1939 | 1939 | Complete | `dc33267` |

### Education Ministry — Remaining Acts (Known)

From the gazette assignment and cross-references, these acts are known but not yet deep-dived:

- Universities Act (higher education)
- Pirivena Education Act (religious education)
- Education Ordinance amendments source texts (1947, 1951, 1958, 1973 — sources not yet confirmed)
- Potentially more acts from the gazette assignment

### Domain Categories (Education)

| ID | Label | Count |
|----|-------|-------|
| exam-assessment | Examination & Assessment | 1 |
| general-education | General Education | 4 |
| library-documentation | Library & Documentation Services | 1 |
| foundational-framework | Foundational Framework | 1 |

### React App Data State

- **acts.json**: ~1,450+ entries. Manual entries added for Education acts not in the original dataset.
- **lineage.json**: ~831+ lineage tracks. Fixed duplicate entries for Assisted Schools and State Printing Corporation. Added missing base acts.
- **Common issues found**: Pre-existing lineage entries often have duplicate amendments and missing base acts. Always grep before adding.

## Infrastructure Notes

### Services

| Service | Port | Start Command | Notes |
|---------|------|---------------|-------|
| FastAPI Backend | 8000 | `cd legislation && uvicorn pylegislation.research.api.main:app --port 8000 --reload` | Needs `legislation/.env` with `TEMP_USER_NAME` and `TEMP_USER_PASS` |
| Next.js React App | 3000 | `cd legislation/ui && npm run dev` | Needs `legislation/ui/.env.local` with `BACKEND_URL=http://localhost:8000` |
| Docusaurus Docs | 3001 | `cd docs && npx docusaurus start --port 3001` | No env vars needed |

### Auth Flow (React App)

- Backend uses `TEMP_USER_NAME` / `TEMP_USER_PASS` env vars for in-memory auth
- Frontend `apiFetch` wrapper auto-redirects to `/login` on missing token or 403
- Home page `/` is in `PUBLIC_PATHS` (fixed in commit `c49586b`)

### Database

- SQLite at `legislation/database/research.db`
- Seed with: `cd legislation && legislation research migrate` (reads from `legislation/ui/public/data/acts.json`)

## Docusaurus Build

Always verify with `cd docs && npx docusaurus build` before committing. Expected warnings (safe to ignore):
- `siteConfig.onBrokenMarkdownLinks` deprecation warning (Docusaurus v4 migration pending)

## Components Used in Deep Dives

All accept `data` prop (refactored for multi-ministry support):

| Component | Import | Purpose |
|-----------|--------|---------|
| `MinistryOverview` | `@site/src/components/MinistryOverview` | Ministry-level act catalog with filtering |
| `MeetingsRegistry` | `@site/src/components/MeetingsRegistry` | Statutory body meeting details |
| `StatutoryBodiesExplorer` | `@site/src/components/StatutoryBodiesExplorer` | Interactive body explorer |
| `AmendmentTimeline` | `@site/src/components/AmendmentTimeline` | Visual amendment timeline |
| `EntityRelationshipView` | `@site/src/components/EntityRelationshipView` | Governance relationship viewer |
| `StatusIndicator` | `@site/src/components/StatusIndicator` | Active/inactive status badges |
