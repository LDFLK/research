# OpenGINXplore Audit Framework

A reproducible, observable audit framework for validating Tourism datasets across the OpenGINXplore ecosystem with full action traceability and a NextJS visualization dashboard.

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Quick Start](#quick-start)
4. [Documentation](#documentation)
5. [Project Structure](#project-structure)
6. [License](#license)

## Introduction

The OpenGINXplore Tourism Audit Framework is designed to validate data integrity and visibility across the tourism data pipeline. It ensures that:

- **Source data** on GitHub is accessible and properly formatted
- **Data integrity** rules are satisfied (schema validation, row counts, value checks)
- **Application visibility** confirms data is correctly displayed in the web UI

The framework provides complete observability by logging every action (HTTP requests, Selenium interactions, data extractions) with full request/response details, making audits fully reproducible and debuggable.

### Why This Tool?

When managing open data platforms, it's critical to ensure:

1. **Data Availability**: Source files exist and are accessible
2. **Data Quality**: Data meets schema and validation requirements
3. **Data Visibility**: End users can see the correct data in the UI

Manual verification is error-prone and time-consuming. This framework automates the entire verification process with detailed logging for complete transparency.

## Features

- **Three-Phase Auditing**:
  - Source Discovery: Verify GitHub data sources exist and have correct structure
  - Data Integrity: Validate JSON schema, row counts, and data quality rules
  - App Visibility: Use Selenium to verify data is displayed correctly in the web UI

- **Full Observability**:
  - Every HTTP request/response logged with headers and body
  - Every Selenium action logged with selectors and results
  - Every data extraction logged with queries and outcomes

- **Tree Navigation Support**:
  - Navigate complex UI hierarchies (e.g., Tourism → Arrivals → By Country)
  - Configurable click sequences with delays and waits

- **CLI Tools**:
  - Run full audits or individual phases
  - Explore UI structure interactively
  - Extract and compare data between sources

- **NextJS Dashboard**:
  - Visual timeline of all audit actions
  - Syntax-highlighted request/response viewer
  - Pass/fail summary reports

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+ (for dashboard)
- Chrome browser (for Selenium)
- ChromeDriver (matching Chrome version)

### Installation

```bash
# Clone the repository
cd audit-engine

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Verify installation
python main.py --version
```

### Run Your First Audit

```bash
# Run a complete audit for all datasets
python main.py run

# Run audit for a specific dataset and year
python main.py run -d "Top 10 Source Markets" -y 2023

# View the results
python main.py show <run_id>
```

### Start the Dashboard

```bash
cd ../audit-dashboard
npm install
npm run dev -- -p 3002
# Open http://localhost:3002
```

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](./architecture.md) | System design, components, and data flow |
| [Installation](./installation.md) | Detailed setup instructions |
| [CLI Reference](./cli-reference.md) | Complete command-line interface guide |
| [Configuration](./configuration.md) | Dataset configuration schema and examples |
| [Dashboard](./dashboard.md) | Using the NextJS visualization UI |
| [Extending](./extending.md) | Adding new datasets and validations |

## Project Structure

```
openginxplore-audit/
├── audit-engine/                 # Python automation engine
│   ├── main.py                   # CLI entry point
│   ├── config/
│   │   └── datasets.json         # Dataset configurations
│   ├── core/
│   │   ├── logger.py             # Action logging system
│   │   ├── http_client.py        # Logged HTTP client
│   │   └── browser.py            # Logged Selenium wrapper
│   ├── phases/
│   │   ├── source_discovery.py   # GitHub source checks
│   │   ├── data_integrity.py     # JSON validation
│   │   └── app_visibility.py     # Selenium UI checks
│   ├── workflows/
│   │   └── audit_workflow.py     # Main orchestrator
│   ├── tools/
│   │   ├── ui_explorer.py        # UI exploration utilities
│   │   └── data_comparator.py    # Data comparison utilities
│   ├── audit-results/            # Generated audit outputs
│   │   └── {run_id}/
│   │       ├── manifest.json     # Run metadata
│   │       ├── actions.json      # All logged actions
│   │       └── report.json       # Audit report
│   └── docs/                     # Documentation
│
└── audit-dashboard/              # NextJS visualization
    ├── app/
    │   ├── page.tsx              # Dashboard home
    │   └── runs/[id]/page.tsx    # Individual run view
    ├── components/
    │   ├── ActionTimeline.tsx    # Action viewer
    │   ├── AuditReport.tsx       # Summary report
    │   └── DataViewer.tsx        # JSON viewer
    └── lib/
        └── data.ts               # Data loading utilities
```

## License

This project is part of the OpenGINXplore ecosystem for Sri Lanka's open data initiative.
