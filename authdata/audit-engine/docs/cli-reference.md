# CLI Reference

Complete reference for all command-line interface commands provided by the OpenGINXplore Tourism Audit Framework.

## Global Options

```bash
python main.py [OPTIONS] COMMAND [ARGS]...

Options:
  --version  Show version and exit
  --help     Show help message and exit
```

## Commands Overview

| Command | Description |
|---------|-------------|
| `run` | Run complete audit workflow |
| `source-check` | Run only source discovery phase |
| `data-check` | Run only data integrity phase |
| `explore` | Explore UI structure with Selenium |
| `extract-table` | Extract table data from web page |
| `compare` | Compare GitHub vs UI data |
| `verify-ui` | Verify dataset visibility in UI |
| `list-datasets` | List configured datasets |
| `list-runs` | List previous audit runs |
| `show` | Show details of an audit run |

---

## run

Run a complete audit of Tourism datasets across all configured phases.

### Usage

```bash
python main.py run [OPTIONS]
```

### Options

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--datasets` | `-d` | TEXT | all | Specific datasets to audit (repeatable) |
| `--years` | `-y` | INT | config | Years to audit (repeatable) |
| `--phases` | `-p` | CHOICE | all | Phases to run (repeatable) |
| `--config` | `-c` | PATH | ./config/datasets.json | Configuration file path |
| `--output` | `-o` | PATH | ./audit-results | Output directory |
| `--app-url` | | URL | config | Override application URL |
| `--headless/--no-headless` | | FLAG | headless | Browser mode |
| `--run-id` | | TEXT | auto | Custom run ID |

### Phase Choices

- `source_discovery` - Check GitHub sources
- `data_integrity` - Validate data quality
- `app_visibility` - Verify UI display

### Examples

```bash
# Run all datasets with default config
python main.py run

# Run specific dataset
python main.py run -d "Top 10 Source Markets"

# Run multiple datasets
python main.py run -d "Top 10 Source Markets" -d "Tourist Arrivals By Country"

# Run specific years
python main.py run -y 2023 -y 2024

# Run specific phases
python main.py run -p source_discovery -p data_integrity

# Run with visible browser (for debugging)
python main.py run --no-headless

# Custom output directory
python main.py run -o ./my-results

# Complete example
python main.py run \
  -d "Top 10 Source Markets" \
  -y 2023 \
  -p source_discovery \
  -p data_integrity \
  -p app_visibility \
  --no-headless
```

### Output

```
Starting audit run: audit_20260131_093427
Config: ./config/datasets.json
Output: ./audit-results
Datasets: Top 10 Source Markets
Years: 2023
Phases: source_discovery, data_integrity, app_visibility
--------------------------------------------------
Audit Complete!
Run ID: audit_20260131_093427
Total Actions: 16
Successful: 16
Failed: 0
Datasets Passed: 2/2
--------------------------------------------------
[PASS] Top 10 Source Markets (2023)
[PASS] Top 10 Source Markets
--------------------------------------------------
Results saved to: audit-results/audit_20260131_093427
```

---

## source-check

Run only the source discovery phase to verify GitHub sources exist.

### Usage

```bash
python main.py source-check [OPTIONS]
```

### Options

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--datasets` | `-d` | TEXT | all | Specific datasets to check (repeatable) |
| `--years` | `-y` | INT | config | Years to check (repeatable) |
| `--config` | `-c` | PATH | ./config/datasets.json | Configuration file path |
| `--output` | `-o` | PATH | ./audit-results | Output directory |

### Examples

```bash
# Check all datasets
python main.py source-check

# Check specific dataset and year
python main.py source-check -d "Top 10 Source Markets" -y 2023

# Check multiple years
python main.py source-check -y 2020 -y 2021 -y 2023 -y 2024
```

### Output

```
Running source discovery: audit_20260131_094000
[EXISTS] Top 10 Source Markets (2023)
  URL: https://raw.githubusercontent.com/LDFLK/datasets/main/data/statistics/2023/datasets/Top%2010%20source%20markets/data.json
  Columns: Country, Arrivals, Share
```

---

## data-check

Run only the data integrity phase to validate data quality.

### Usage

```bash
python main.py data-check [OPTIONS]
```

### Options

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--datasets` | `-d` | TEXT | all | Specific datasets to check (repeatable) |
| `--years` | `-y` | INT | config | Years to check (repeatable) |
| `--config` | `-c` | PATH | ./config/datasets.json | Configuration file path |
| `--output` | `-o` | PATH | ./audit-results | Output directory |

### Examples

```bash
# Check all datasets
python main.py data-check

# Check specific dataset and year
python main.py data-check -d "Top 10 Source Markets" -y 2023
```

### Output

```
Running data integrity check: audit_20260131_094500
[PASS] Top 10 Source Markets (2023)
  Accessible: True
  Valid JSON: True
  Schema Valid: True
    [PASS] schema_columns
    [PASS] minimum_rows
    [PASS] country_not_empty
    [PASS] arrivals_numeric
```

---

## explore

Explore the UI structure of a web page using Selenium. Useful for discovering element selectors.

### Usage

```bash
python main.py explore [OPTIONS] URL
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `URL` | Yes | Web page URL to explore |

### Options

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--wait` | `-w` | INT | 3 | Seconds to wait after page load |
| `--headless/--no-headless` | | FLAG | headless | Browser mode |

### Examples

```bash
# Explore a page
python main.py explore "https://openginxplore.opendata.lk/data"

# Wait longer for dynamic content
python main.py explore "https://openginxplore.opendata.lk/data" --wait 5

# Run with visible browser
python main.py explore "https://openginxplore.opendata.lk/data" --no-headless
```

### Output

```
Page Title: OpenGINXplore - Data Portal
URL: https://openginxplore.opendata.lk/data
--------------------------------------------------
Links (15):
  - Home: //*[text()='Home']
  - Tourism: //*[text()='Tourism']
  - About: //*[text()='About']
  ...

Buttons (3):
  - Search: //button[contains(text(), 'Search')]
  - Filter: //button[contains(text(), 'Filter')]
  ...

Headings (5):
  - h1: Welcome to OpenGINXplore
  - h2: Data Categories
  ...

Tables (0):
  (none found)
```

---

## extract-table

Extract table data from a web page. Supports clicking navigation elements first.

### Usage

```bash
python main.py extract-table [OPTIONS] URL
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `URL` | Yes | Web page URL |

### Options

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--table-selector` | `-t` | TEXT | //table | XPath for table |
| `--click-selector` | `-k` | TEXT | | XPath selectors to click first (repeatable, in order) |
| `--wait` | `-w` | INT | 3 | Seconds to wait after each action |
| `--headless/--no-headless` | | FLAG | headless | Browser mode |

### Examples

```bash
# Extract first table from page
python main.py extract-table "https://example.com/data"

# Click navigation first, then extract
python main.py extract-table "https://openginxplore.opendata.lk/data" \
  -k "//*[text()='Tourism']" \
  -k "//*[contains(text(), 'Top 10 Source Markets')]" \
  -k "//p[contains(text(), 'Top 10 Source Markets')]"

# Deep tree navigation
python main.py extract-table "https://openginxplore.opendata.lk/data" \
  -k "//*[text()='Tourism']" \
  -k "//*[text()='Arrivals']" \
  -k "//*[text()='By Country']" \
  -k "//*[contains(text(), 'Tourist Arrivals By Country')]" \
  --wait 5

# Custom table selector
python main.py extract-table "https://example.com" \
  -t "//table[@id='data-table']"
```

### Output

```
Clicked: //*[text()='Tourism']
Clicked: //*[contains(text(), 'Top 10 Source Markets')]
Clicked: //p[contains(text(), 'Top 10 Source Markets')]

Extracted 10 rows:
--------------------------------------------------
1. {'Id': '1', 'Arrivals': '416974', 'Share': '20.3', 'Country': 'India'}
2. {'Id': '2', 'Arrivals': '201920', 'Share': '9.8', 'Country': 'Russian Federation'}
3. {'Id': '3', 'Arrivals': '178339', 'Share': '8.6', 'Country': 'United Kingdom'}
...
```

---

## compare

Compare data between GitHub source and web UI display.

### Usage

```bash
python main.py compare [OPTIONS]
```

### Options

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--datasets` | `-d` | TEXT | all | Datasets to compare (repeatable) |
| `--years` | `-y` | INT | config | Years to compare (repeatable) |
| `--config` | `-c` | PATH | ./config/datasets.json | Configuration file |
| `--headless/--no-headless` | | FLAG | headless | Browser mode |

### Examples

```bash
# Compare all datasets
python main.py compare

# Compare specific dataset
python main.py compare -d "Top 10 Source Markets" -y 2023

# Compare with visible browser
python main.py compare -d "Top 10 Source Markets" --no-headless
```

### Output

```
Comparing: Top 10 Source Markets (2023)
GitHub: https://raw.githubusercontent.com/LDFLK/datasets/.../data.json
UI: https://openginxplore.opendata.lk/data...
--------------------------------------------------
Result: MATCH
GitHub rows: 10
UI rows: 10
Matching rows: 10/10
```

---

## verify-ui

Verify that a dataset is visible and correctly displayed in the web UI.

### Usage

```bash
python main.py verify-ui [OPTIONS]
```

### Options

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--datasets` | `-d` | TEXT | all | Datasets to verify (repeatable) |
| `--app-url` | | URL | config | Application URL |
| `--config` | `-c` | PATH | ./config/datasets.json | Configuration file |
| `--headless/--no-headless` | | FLAG | headless | Browser mode |

### Examples

```bash
# Verify all datasets
python main.py verify-ui

# Verify specific dataset
python main.py verify-ui -d "Top 10 Source Markets"

# Verify with custom URL
python main.py verify-ui --app-url "https://staging.openginxplore.opendata.lk/data"
```

### Output

```
Verifying UI visibility: audit_20260131_095000
[VISIBLE] Top 10 Source Markets
  Navigation: Tourism → Top 10 Source Markets → dataset card
  Table found: Yes
  Rows: 10
```

---

## list-datasets

List all configured datasets with their details.

### Usage

```bash
python main.py list-datasets [OPTIONS]
```

### Options

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--config` | `-c` | PATH | ./config/datasets.json | Configuration file |

### Examples

```bash
python main.py list-datasets
```

### Output

```
Configured Datasets:
--------------------------------------------------
1. Top 10 Source Markets
   Category: Tourism
   GitHub: LDFLK/datasets
   File: data/statistics/{year}/datasets/Top 10 source markets/data.json
   Expected columns: Country, Arrivals, Share
   Validations: minimum_rows, country_not_empty, arrivals_numeric

2. Tourist Arrivals By Country
   Category: Tourism
   GitHub: LDFLK/datasets
   File: data/statistics/{year}/datasets/Tourist Arrivals by Country and Month/data.json
   Expected columns: Country
   Validations: minimum_rows, country_not_empty
--------------------------------------------------
Total: 2 datasets
Years: 2020, 2021, 2023, 2024
```

---

## list-runs

List all previous audit runs.

### Usage

```bash
python main.py list-runs [OPTIONS]
```

### Options

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--output` | `-o` | PATH | ./audit-results | Output directory |

### Examples

```bash
python main.py list-runs
```

### Output

```
Audit Runs:
--------------------------------------------------
audit_20260131_093427
  Started: 2026-01-31T09:34:27Z
  Actions: 83 (83 successful, 0 failed)
  Datasets: 10/10 passed

audit_20260131_092517
  Started: 2026-01-31T09:25:17Z
  Actions: 14 (13 successful, 1 failed)
  Datasets: 1/2 passed
--------------------------------------------------
Total: 2 runs
```

---

## show

Show details of a specific audit run.

### Usage

```bash
python main.py show [OPTIONS] RUN_ID
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `RUN_ID` | Yes | Audit run ID to display |

### Options

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--output` | `-o` | PATH | ./audit-results | Output directory |

### Examples

```bash
# Show run details
python main.py show audit_20260131_093427
```

### Output

```
Run ID: audit_20260131_093427
Started: 2026-01-31T09:34:27Z
Completed: 2026-01-31T09:35:12Z
Config: {
  "datasets": ["Top 10 Source Markets", "Tourist Arrivals By Country"],
  "years": [2020, 2021, 2023, 2024],
  "phases": ["source_discovery", "data_integrity", "app_visibility"],
  "app_url": "https://openginxplore.opendata.lk/data?startDate=2020-01-01&endDate=2025-12-31"
}
Summary: {
  "total_actions": 83,
  "successful": 83,
  "failed": 0,
  "datasets_total": 10,
  "datasets_passed": 10,
  "datasets_failed": 0
}
--------------------------------------------------
Dataset Results:
  [PASS] Top 10 Source Markets (2020)
  [PASS] Top 10 Source Markets (2021)
  [PASS] Top 10 Source Markets (2023)
  [PASS] Top 10 Source Markets (2024)
  [PASS] Top 10 Source Markets
  [PASS] Tourist Arrivals By Country (2020)
  [PASS] Tourist Arrivals By Country (2021)
  [PASS] Tourist Arrivals By Country (2023)
  [PASS] Tourist Arrivals By Country (2024)
  [PASS] Tourist Arrivals By Country
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `AUDIT_CONFIG_PATH` | Default configuration file path |
| `AUDIT_OUTPUT_DIR` | Default output directory |
| `AUDIT_HEADLESS` | Default headless mode (true/false) |
