# Configuration Guide

This guide explains the dataset configuration schema and how to configure datasets for auditing.

## Configuration File

The main configuration file is `config/datasets.json`. It defines:

- Application URL for UI testing
- Years to audit
- Dataset definitions with validation rules and navigation paths

## Schema Overview

```json
{
  "app_url": "string",
  "years": [2020, 2021, 2023, 2024],
  "datasets": [
    {
      "name": "string",
      "description": "string",
      "category": "string",
      "github_repo": "string",
      "file_path": "string",
      "branch": "string",
      "data_url": "string",
      "data_path": "string",
      "expected_columns": ["string"],
      "validations": [...],
      "navigation": {...},
      "selectors": {...}
    }
  ]
}
```

## Top-Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `platform` | string | Yes | Platform name (e.g., "OpenGINXplore") |
| `name` | string | Yes | Human-readable audit name |
| `description` | string | No | Description of the audit purpose |
| `app_url` | string | Yes | Base URL of the web application |
| `years` | array[int] | Yes | Years to audit by default |
| `datasets` | array[object] | Yes | Dataset definitions |

### Example

```json
{
  "platform": "OpenGINXplore",
  "name": "Sri Lanka Open Data Audit",
  "description": "Audit of datasets from the OpenGINXplore open data platform",
  "app_url": "https://openginxplore.opendata.lk/data?startDate=2020-01-01&endDate=2025-12-31",
  "years": [2020, 2021, 2023, 2024],
  "datasets": [...]
}
```

## Dataset Fields

### Basic Information

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Unique dataset name |
| `description` | string | No | Human-readable description |
| `category` | string | Yes | UI category (e.g., "Tourism") |

### GitHub Source

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `github_repo` | string | Yes | Repository in format `owner/repo` |
| `file_path` | string | Yes | Path to data file (supports `{year}` placeholder) |
| `branch` | string | No | Git branch (default: "main") |
| `data_url` | string | Yes | Raw URL to data (supports `{year}` placeholder) |

### Data Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `data_path` | string | No | JSON path to data rows (e.g., "rows", "data") |
| `expected_columns` | array[string] | Yes | Required column names |
| `data_transform` | string | No | Transform to apply (e.g., "aggregate_monthly") |

### Example Dataset

```json
{
  "name": "Top 10 Source Markets",
  "description": "Top 10 tourism source markets with arrivals and market share",
  "category": "Tourism",
  "github_repo": "LDFLK/datasets",
  "file_path": "data/statistics/{year}/datasets/Top 10 source markets/data.json",
  "branch": "main",
  "data_url": "https://raw.githubusercontent.com/LDFLK/datasets/main/data/statistics/{year}/datasets/Top%2010%20source%20markets/data.json",
  "data_path": "rows",
  "expected_columns": ["Country", "Arrivals", "Share"]
}
```

## Validations

Validations define data quality rules to check during the data integrity phase.

### Validation Schema

```json
{
  "validations": [
    {
      "name": "string",
      "type": "string",
      "column": "string",
      "value": "any"
    }
  ]
}
```

### Validation Types

#### `min_rows`

Verify minimum number of data rows.

```json
{
  "name": "minimum_rows",
  "type": "min_rows",
  "value": 10
}
```

#### `value_not_empty`

Verify a column has no empty values.

```json
{
  "name": "country_not_empty",
  "type": "value_not_empty",
  "column": "Country"
}
```

#### `numeric_column`

Verify a column contains numeric values.

```json
{
  "name": "arrivals_numeric",
  "type": "numeric_column",
  "column": "Arrivals"
}
```

### Complete Validations Example

```json
{
  "validations": [
    {
      "name": "minimum_rows",
      "type": "min_rows",
      "value": 10
    },
    {
      "name": "country_not_empty",
      "type": "value_not_empty",
      "column": "Country"
    },
    {
      "name": "arrivals_numeric",
      "type": "numeric_column",
      "column": "Arrivals"
    }
  ]
}
```

## Navigation

Navigation defines how to reach the dataset in the web UI using Selenium.

### Navigation Schema

```json
{
  "navigation": {
    "tree_path": ["string", "string", ...],
    "steps": [
      {
        "type": "click|wait|delay",
        "selector": "string",
        "by": "xpath|css",
        "description": "string",
        "timeout": 10,
        "delay": 2,
        "seconds": 2
      }
    ]
  }
}
```

### Step Types

#### `click`

Click an element.

```json
{
  "type": "click",
  "selector": "//*[text()='Tourism']",
  "by": "xpath",
  "description": "Click Tourism category",
  "delay": 2
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `type` | string | Yes | | Must be "click" |
| `selector` | string | Yes | | XPath or CSS selector |
| `by` | string | No | "xpath" | Selector type |
| `description` | string | No | | Human-readable description |
| `delay` | int | No | 2 | Seconds to wait after click |

#### `wait`

Wait for an element to appear.

```json
{
  "type": "wait",
  "selector": "//table",
  "by": "xpath",
  "timeout": 15,
  "description": "Wait for data table to load"
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `type` | string | Yes | | Must be "wait" |
| `selector` | string | Yes | | XPath or CSS selector |
| `by` | string | No | "xpath" | Selector type |
| `timeout` | int | No | 10 | Maximum seconds to wait |
| `description` | string | No | | Human-readable description |

#### `delay`

Pause execution for a fixed time.

```json
{
  "type": "delay",
  "seconds": 3,
  "description": "Wait for dynamic content"
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `type` | string | Yes | | Must be "delay" |
| `seconds` | int | No | 2 | Seconds to pause |
| `description` | string | No | | Human-readable description |

### Navigation Examples

#### Simple Navigation (2 levels)

```json
{
  "navigation": {
    "tree_path": ["Tourism", "Top 10 Source Markets"],
    "steps": [
      {
        "type": "click",
        "selector": "//*[text()='Tourism']",
        "by": "xpath",
        "description": "Click Tourism category"
      },
      {
        "type": "click",
        "selector": "//*[contains(text(), 'Top 10 Source Markets')]",
        "by": "xpath",
        "description": "Click Top 10 Source Markets"
      },
      {
        "type": "click",
        "selector": "//p[contains(text(), 'Top 10 Source Markets')]",
        "by": "xpath",
        "description": "Click dataset card"
      },
      {
        "type": "wait",
        "selector": "//table",
        "by": "xpath",
        "timeout": 15,
        "description": "Wait for data table to load"
      }
    ]
  }
}
```

#### Deep Tree Navigation (4 levels)

```json
{
  "navigation": {
    "tree_path": ["Tourism", "Arrivals", "By Country", "Tourist Arrivals By Country"],
    "steps": [
      {
        "type": "click",
        "selector": "//*[text()='Tourism']",
        "by": "xpath",
        "description": "Click Tourism"
      },
      {
        "type": "click",
        "selector": "//*[text()='Arrivals']",
        "by": "xpath",
        "description": "Click Arrivals"
      },
      {
        "type": "click",
        "selector": "//*[text()='By Country']",
        "by": "xpath",
        "description": "Click By Country"
      },
      {
        "type": "click",
        "selector": "//*[contains(text(), 'Tourist Arrivals By Country')]",
        "by": "xpath",
        "description": "Click Tourist Arrivals By Country"
      },
      {
        "type": "wait",
        "selector": "//table",
        "by": "xpath",
        "timeout": 15,
        "description": "Wait for data table to load"
      }
    ]
  }
}
```

## Selectors

Selectors define elements to check after navigation completes.

### Selectors Schema

```json
{
  "selectors": {
    "element_name": {
      "selector": "string",
      "by": "xpath|css",
      "extract_text": true|false,
      "extract_list": true|false
    }
  }
}
```

### Selector Options

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `selector` | string | Yes | | XPath or CSS selector |
| `by` | string | No | "xpath" | Selector type |
| `extract_text` | bool | No | false | Extract text content |
| `extract_list` | bool | No | false | Extract multiple elements |

### Example

```json
{
  "selectors": {
    "data_table": {
      "selector": "//table",
      "by": "xpath"
    },
    "table_rows": {
      "selector": "//table//tr",
      "by": "xpath",
      "extract_list": true
    }
  }
}
```

## Complete Dataset Configuration Example

```json
{
  "name": "Top 10 Source Markets",
  "description": "Top 10 tourism source markets with arrivals and market share",
  "category": "Tourism",
  "github_repo": "LDFLK/datasets",
  "file_path": "data/statistics/{year}/datasets/Top 10 source markets/data.json",
  "branch": "main",
  "data_url": "https://raw.githubusercontent.com/LDFLK/datasets/main/data/statistics/{year}/datasets/Top%2010%20source%20markets/data.json",
  "data_path": "rows",
  "expected_columns": ["Country", "Arrivals", "Share"],
  "validations": [
    {
      "name": "minimum_rows",
      "type": "min_rows",
      "value": 10
    },
    {
      "name": "country_not_empty",
      "type": "value_not_empty",
      "column": "Country"
    },
    {
      "name": "arrivals_numeric",
      "type": "numeric_column",
      "column": "Arrivals"
    }
  ],
  "navigation": {
    "tree_path": ["Tourism", "Top 10 Source Markets"],
    "steps": [
      {
        "type": "click",
        "selector": "//*[text()='Tourism']",
        "by": "xpath",
        "description": "Click Tourism category"
      },
      {
        "type": "click",
        "selector": "//*[contains(text(), 'Top 10 Source Markets')]",
        "by": "xpath",
        "description": "Click Top 10 Source Markets"
      },
      {
        "type": "click",
        "selector": "//p[contains(text(), 'Top 10 Source Markets')]",
        "by": "xpath",
        "description": "Click dataset card"
      },
      {
        "type": "wait",
        "selector": "//table",
        "by": "xpath",
        "timeout": 15,
        "description": "Wait for data table to load"
      }
    ]
  },
  "selectors": {
    "data_table": {
      "selector": "//table",
      "by": "xpath"
    },
    "table_rows": {
      "selector": "//table//tr",
      "by": "xpath",
      "extract_list": true
    }
  }
}
```

## Data Formats

The framework supports two JSON data formats:

### Columnar Format

```json
{
  "columns": ["Country", "Arrivals", "Share"],
  "rows": [
    ["India", 416974, 20.3],
    ["Russia", 201920, 9.8]
  ]
}
```

### Object Array Format

```json
[
  {"Country": "India", "Arrivals": 416974, "Share": 20.3},
  {"Country": "Russia", "Arrivals": 201920, "Share": 9.8}
]
```

The framework automatically detects and handles both formats.

## XPath Selector Tips

### Text Matching

```xpath
//*[text()='Exact Text']           # Exact match
//*[contains(text(), 'Partial')]   # Contains
//*[starts-with(text(), 'Start')]  # Starts with
```

### Element Types

```xpath
//button[text()='Click']           # Button
//a[text()='Link']                 # Anchor
//p[contains(text(), 'Para')]      # Paragraph
//table                            # Table
//table//tr                        # Table rows
//table//th                        # Table headers
//table//td                        # Table cells
```

### Attributes

```xpath
//*[@id='myId']                    # By ID
//*[@class='myClass']              # By class
//*[contains(@class, 'partial')]   # Contains class
//input[@type='text']              # By attribute
```

### Combining Conditions

```xpath
//button[text()='Submit' and @type='submit']
//div[@class='card' and contains(text(), 'Tourism')]
```

## Discovering Selectors

Use the `explore` command to discover available selectors:

```bash
# Explore page structure
python main.py explore "https://openginxplore.opendata.lk/data"

# Test navigation with extract-table
python main.py extract-table "https://openginxplore.opendata.lk/data" \
  -k "//*[text()='Tourism']" \
  --wait 3 \
  --no-headless
```

Watch the browser to verify each click reaches the expected element.

## Adding a New Dataset

1. **Explore the UI** to understand navigation
2. **Identify the GitHub source** URL
3. **Create the configuration**:

```json
{
  "name": "My New Dataset",
  "description": "Description here",
  "category": "Tourism",
  "github_repo": "LDFLK/datasets",
  "file_path": "path/to/{year}/data.json",
  "branch": "main",
  "data_url": "https://raw.githubusercontent.com/LDFLK/datasets/main/path/to/{year}/data.json",
  "data_path": "rows",
  "expected_columns": ["Column1", "Column2"],
  "validations": [...],
  "navigation": {...},
  "selectors": {...}
}
```

4. **Test with source-check**:
```bash
python main.py source-check -d "My New Dataset" -y 2023
```

5. **Test with data-check**:
```bash
python main.py data-check -d "My New Dataset" -y 2023
```

6. **Test with verify-ui**:
```bash
python main.py verify-ui -d "My New Dataset" --no-headless
```

7. **Run full audit**:
```bash
python main.py run -d "My New Dataset"
```
