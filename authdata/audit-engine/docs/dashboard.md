# Dashboard Guide

The OpenGINXplore Audit Dashboard is a NextJS application that provides visual exploration of audit results, including action timelines, request/response viewers, and summary reports.

## Overview

The dashboard reads JSON output files from the audit engine and presents them in an interactive web interface.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Audit Dashboard                                  │
├─────────────────┬───────────────────────────────────────────────────────┤
│                 │                                                       │
│   Run List      │              Run Details                              │
│                 │                                                       │
│ ┌─────────────┐ │  ┌─────────────────────────────────────────────────┐  │
│ │ Run 1 [PASS]│ │  │  Summary: 83 actions, 10/10 passed             │  │
│ ├─────────────┤ │  └─────────────────────────────────────────────────┘  │
│ │ Run 2 [FAIL]│ │                                                       │
│ ├─────────────┤ │  ┌─────────────────────────────────────────────────┐  │
│ │ Run 3 [PASS]│ │  │  Action Timeline                                │  │
│ └─────────────┘ │  │  ├─ action_0001: http_fetch [SUCCESS]           │  │
│                 │  │  ├─ action_0002: selenium_navigate [SUCCESS]    │  │
│                 │  │  └─ action_0003: selenium_click [SUCCESS]       │  │
│                 │  └─────────────────────────────────────────────────┘  │
│                 │                                                       │
│                 │  ┌─────────────────────────────────────────────────┐  │
│                 │  │  Request/Response Viewer                        │  │
│                 │  │  GET https://raw.githubusercontent.com/...      │  │
│                 │  │  Status: 200 OK                                 │  │
│                 │  │  Body: {"columns": [...], "rows": [...]}        │  │
│                 │  └─────────────────────────────────────────────────┘  │
│                 │                                                       │
└─────────────────┴───────────────────────────────────────────────────────┘
```

## Starting the Dashboard

### Development Mode

```bash
cd audit-dashboard

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Or on a specific port
npm run dev -- -p 3002
```

### Production Build

```bash
cd audit-dashboard

# Build for production
npm run build

# Start production server
npm run start

# Or on a specific port
npm run start -- -p 3002
```

### Accessing the Dashboard

Open your browser to:
- http://localhost:3000 (default port)
- http://localhost:3002 (if using alternate port)

## Dashboard Pages

### Home Page (`/`)

The home page displays a list of all audit runs.

**Features:**
- List of audit runs sorted by date (newest first)
- Pass/fail status indicator
- Quick summary (actions, datasets passed)
- Click to view run details

**Information Displayed:**
| Field | Description |
|-------|-------------|
| Run ID | Unique identifier (e.g., `audit_20260131_093427`) |
| Started | Timestamp when audit began |
| Status | Overall pass/fail status |
| Actions | Total actions (successful/failed) |
| Datasets | Datasets passed/total |

### Run Details Page (`/runs/[id]`)

Detailed view of a specific audit run.

**Sections:**

#### Summary Panel
- Run ID and timestamps
- Configuration (datasets, years, phases)
- Overall statistics

#### Dataset Results
- List of all datasets with pass/fail status
- Click to expand dataset details

#### Action Timeline
- Chronological list of all actions
- Color-coded by status (green=success, red=failure)
- Click to expand action details

#### Action Details (Expanded)
- Full request information (method, URL, headers)
- Full response information (status, headers, body)
- Extraction results (query, result)
- Duration and error messages

## Dashboard Components

### ActionTimeline

Displays a chronological timeline of all audit actions.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Action Timeline                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ ● action_0001 | source_discovery | http_fetch         | 456ms | SUCCESS │
│   Target: https://raw.githubusercontent.com/LDFLK/datasets/...          │
│   [Expand]                                                              │
├─────────────────────────────────────────────────────────────────────────┤
│ ● action_0002 | data_integrity   | validation         | 12ms  | SUCCESS │
│   Validation: schema_columns                                            │
│   [Expand]                                                              │
├─────────────────────────────────────────────────────────────────────────┤
│ ● action_0003 | app_visibility   | selenium_navigate  | 2341ms| SUCCESS │
│   Target: https://openginxplore.opendata.lk/data                        │
│   [Expand]                                                              │
└─────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Phase filtering (source_discovery, data_integrity, app_visibility)
- Status filtering (success, failure)
- Search by action ID or target
- Expandable action details

### AuditReport

Displays the summary report with pass/fail indicators.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Audit Report                                                            │
├─────────────────────────────────────────────────────────────────────────┤
│ Run ID: audit_20260131_093427                                           │
│ Duration: 45 seconds                                                    │
│                                                                         │
│ Summary:                                                                │
│   Total Actions: 83                                                     │
│   Successful: 83 (100%)                                                 │
│   Failed: 0 (0%)                                                        │
│                                                                         │
│ Datasets:                                                               │
│   ✓ Top 10 Source Markets (2020)                                        │
│   ✓ Top 10 Source Markets (2021)                                        │
│   ✓ Top 10 Source Markets (2023)                                        │
│   ✓ Top 10 Source Markets (2024)                                        │
│   ✓ Top 10 Source Markets                                               │
│   ✓ Tourist Arrivals By Country (2020)                                  │
│   ...                                                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### DataViewer

Syntax-highlighted JSON viewer for request/response data.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Response Body                                                    [Copy] │
├─────────────────────────────────────────────────────────────────────────┤
│ {                                                                       │
│   "columns": [                                                          │
│     "Country",                                                          │
│     "Arrivals",                                                         │
│     "Share"                                                             │
│   ],                                                                    │
│   "rows": [                                                             │
│     ["India", 416974, 20.3],                                            │
│     ["Russian Federation", 201920, 9.8],                                │
│     ...                                                                 │
│   ]                                                                     │
│ }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Syntax highlighting for JSON
- Copy to clipboard button
- Collapsible sections for large data
- Search within JSON

## Data Flow

```
audit-engine/audit-results/
├── audit_20260131_093427/
│   ├── manifest.json      ──┐
│   ├── actions.json       ──┼──▶ Dashboard reads these files
│   └── report.json        ──┘
│
└── audit_20260131_092517/
    ├── manifest.json
    ├── actions.json
    └── report.json

                    ▼

audit-dashboard/lib/data.ts
├── getAuditRuns()         ──▶ Lists all run directories
├── getAuditRun(id)        ──▶ Reads manifest + report
└── getAuditActions(id)    ──▶ Reads actions.json
```

## Configuration

### Audit Results Path

The dashboard looks for audit results in a relative path. Configure in `lib/data.ts`:

```typescript
// Default configuration
const AUDIT_RESULTS_DIR = path.join(
  process.cwd(),
  '..',
  'audit-engine',
  'audit-results'
);
```

### Customizing the Path

To use a different results directory:

```typescript
// Custom path
const AUDIT_RESULTS_DIR = process.env.AUDIT_RESULTS_DIR ||
  path.join(process.cwd(), '..', 'audit-engine', 'audit-results');
```

Then set the environment variable:

```bash
export AUDIT_RESULTS_DIR="/path/to/audit-results"
npm run dev
```

## Styling

The dashboard uses Tailwind CSS for styling. Key files:

- `app/globals.css` - Global styles
- `tailwind.config.js` - Tailwind configuration

### Color Scheme

| Element | Color | Purpose |
|---------|-------|---------|
| Success | Green (`text-green-600`) | Passed actions/datasets |
| Failure | Red (`text-red-600`) | Failed actions/datasets |
| Info | Blue (`text-blue-600`) | Informational elements |
| Warning | Yellow (`text-yellow-600`) | Warnings |
| Background | Gray (`bg-gray-50`) | Page background |

## Extending the Dashboard

### Adding a New Page

1. Create a new file in `app/`:

```typescript
// app/analytics/page.tsx
export default function AnalyticsPage() {
  return (
    <div>
      <h1>Analytics</h1>
      {/* Your content */}
    </div>
  );
}
```

2. Link from navigation (if applicable)

### Adding a New Component

1. Create component in `components/`:

```typescript
// components/MyComponent.tsx
interface MyComponentProps {
  data: any;
}

export function MyComponent({ data }: MyComponentProps) {
  return (
    <div className="border rounded p-4">
      {/* Component content */}
    </div>
  );
}
```

2. Import and use in pages:

```typescript
import { MyComponent } from '@/components/MyComponent';

export default function Page() {
  return <MyComponent data={...} />;
}
```

### Adding Data Utilities

Add to `lib/data.ts`:

```typescript
export async function getCustomData(runId: string) {
  const filePath = path.join(AUDIT_RESULTS_DIR, runId, 'custom.json');
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}
```

## Troubleshooting

### Dashboard Shows "No Audit Runs Found"

1. Verify audit results exist:
```bash
ls -la audit-engine/audit-results/
```

2. Run at least one audit:
```bash
cd audit-engine
python main.py run -d "Top 10 Source Markets" -y 2023
```

3. Check path configuration in `lib/data.ts`

### Dashboard Won't Start

1. Verify Node.js version:
```bash
node --version  # Should be 18+
```

2. Reinstall dependencies:
```bash
rm -rf node_modules
npm install
```

3. Check for port conflicts:
```bash
# Use different port
npm run dev -- -p 3002
```

### Actions Not Loading

1. Check actions.json exists:
```bash
cat audit-engine/audit-results/<run_id>/actions.json
```

2. Verify JSON is valid:
```bash
python -m json.tool audit-engine/audit-results/<run_id>/actions.json
```

### Styling Issues

1. Clear Next.js cache:
```bash
rm -rf .next
npm run dev
```

2. Rebuild Tailwind:
```bash
npm run build
```
