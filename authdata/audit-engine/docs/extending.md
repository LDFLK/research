# Extending the Framework

This guide explains how to extend the OpenGINXplore Audit Framework with new datasets, validation rules, navigation steps, and custom phases.

## Adding New Datasets

### Step 1: Explore the Data Source

First, identify where the data lives on GitHub:

```bash
# Example: Find the raw URL
# https://github.com/LDFLK/datasets/tree/main/data/statistics/2023/datasets/New%20Dataset

# Raw URL format:
# https://raw.githubusercontent.com/LDFLK/datasets/main/data/statistics/{year}/datasets/New%20Dataset/data.json
```

### Step 2: Explore the UI Navigation

Use the CLI to discover the navigation path:

```bash
# Explore the main page
python main.py explore "https://openginxplore.opendata.lk/data"

# Test clicking through the UI
python main.py extract-table "https://openginxplore.opendata.lk/data" \
  -k "//*[text()='Category']" \
  -k "//*[text()='Subcategory']" \
  -k "//*[contains(text(), 'Dataset Name')]" \
  --no-headless \
  --wait 5
```

### Step 3: Create the Configuration

Add to `config/datasets.json`:

```json
{
  "name": "New Dataset Name",
  "description": "Description of what this dataset contains",
  "category": "Tourism",
  "github_repo": "LDFLK/datasets",
  "file_path": "data/statistics/{year}/datasets/New Dataset/data.json",
  "branch": "main",
  "data_url": "https://raw.githubusercontent.com/LDFLK/datasets/main/data/statistics/{year}/datasets/New%20Dataset/data.json",
  "data_path": "rows",
  "expected_columns": ["Column1", "Column2", "Column3"],
  "validations": [
    {
      "name": "minimum_rows",
      "type": "min_rows",
      "value": 10
    }
  ],
  "navigation": {
    "tree_path": ["Category", "Subcategory", "Dataset Name"],
    "steps": [
      {
        "type": "click",
        "selector": "//*[text()='Category']",
        "by": "xpath",
        "description": "Click Category"
      },
      {
        "type": "click",
        "selector": "//*[text()='Subcategory']",
        "by": "xpath",
        "description": "Click Subcategory"
      },
      {
        "type": "click",
        "selector": "//*[contains(text(), 'Dataset Name')]",
        "by": "xpath",
        "description": "Click Dataset"
      },
      {
        "type": "wait",
        "selector": "//table",
        "by": "xpath",
        "timeout": 15,
        "description": "Wait for table"
      }
    ]
  },
  "selectors": {
    "data_table": {
      "selector": "//table",
      "by": "xpath"
    }
  }
}
```

### Step 4: Test the Dataset

```bash
# Test source discovery
python main.py source-check -d "New Dataset Name" -y 2023

# Test data integrity
python main.py data-check -d "New Dataset Name" -y 2023

# Test UI visibility
python main.py verify-ui -d "New Dataset Name" --no-headless

# Run complete audit
python main.py run -d "New Dataset Name"
```

## Adding New Validation Types

### Step 1: Understand the Validation Interface

Validations are defined in `phases/data_integrity.py`:

```python
def _run_validation(
    self,
    validation: dict,
    data: list[dict],
    columns: list[str]
) -> tuple[bool, str]:
    """Run a single validation and return (passed, message)."""
    val_type = validation.get("type", "")
    val_name = validation.get("name", "unknown")

    # Add your validation type here
    if val_type == "my_custom_validation":
        return self._validate_custom(validation, data)

    # ... existing validations
```

### Step 2: Implement the Validation

Add a new method to `DataIntegrityPhase`:

```python
def _validate_custom(
    self,
    validation: dict,
    data: list[dict]
) -> tuple[bool, str]:
    """Custom validation example."""
    # Get validation parameters
    column = validation.get("column", "")
    threshold = validation.get("threshold", 0)

    # Perform validation
    values = [row.get(column, 0) for row in data]
    total = sum(float(v) for v in values if v)

    if total >= threshold:
        return True, f"Total {column} ({total}) meets threshold ({threshold})"
    else:
        return False, f"Total {column} ({total}) below threshold ({threshold})"
```

### Step 3: Use in Configuration

```json
{
  "validations": [
    {
      "name": "arrivals_threshold",
      "type": "my_custom_validation",
      "column": "Arrivals",
      "threshold": 1000000
    }
  ]
}
```

### Available Validation Types

| Type | Parameters | Description |
|------|------------|-------------|
| `min_rows` | `value` | Minimum row count |
| `value_not_empty` | `column` | Column has no empty values |
| `numeric_column` | `column` | Column contains numeric values |
| `schema_columns` | (uses expected_columns) | Required columns exist |

## Adding New Navigation Step Types

### Step 1: Understand the Navigation Interface

Navigation steps are processed in `phases/app_visibility.py`:

```python
for step in nav_steps:
    step_type = step.get("type", "click")
    selector = step.get("selector", "")
    description = step.get("description", "")

    if step_type == "click":
        # Handle click
    elif step_type == "wait":
        # Handle wait
    elif step_type == "delay":
        # Handle delay
    elif step_type == "my_custom_step":
        # Add your step type here
```

### Step 2: Implement the Step

Add handling for the new step type:

```python
elif step_type == "scroll":
    # Scroll to element
    by = By.XPATH if step.get("by", "xpath") == "xpath" else By.CSS_SELECTOR
    element = browser.driver.find_element(by, selector)
    browser.driver.execute_script("arguments[0].scrollIntoView();", element)
    result.navigation_path.append(f"Scrolled to: {description}")

elif step_type == "input":
    # Enter text into input field
    by = By.XPATH if step.get("by", "xpath") == "xpath" else By.CSS_SELECTOR
    value = step.get("value", "")
    element = browser.driver.find_element(by, selector)
    element.clear()
    element.send_keys(value)
    result.navigation_path.append(f"Entered text: {description}")

elif step_type == "select":
    # Select dropdown option
    by = By.XPATH if step.get("by", "xpath") == "xpath" else By.CSS_SELECTOR
    value = step.get("value", "")
    from selenium.webdriver.support.ui import Select
    element = browser.driver.find_element(by, selector)
    select = Select(element)
    select.select_by_visible_text(value)
    result.navigation_path.append(f"Selected: {description}")
```

### Step 3: Use in Configuration

```json
{
  "navigation": {
    "steps": [
      {
        "type": "scroll",
        "selector": "//div[@id='target']",
        "description": "Scroll to target section"
      },
      {
        "type": "input",
        "selector": "//input[@name='search']",
        "value": "Tourism",
        "description": "Enter search term"
      },
      {
        "type": "select",
        "selector": "//select[@id='year']",
        "value": "2023",
        "description": "Select year"
      }
    ]
  }
}
```

## Adding New Audit Phases

### Step 1: Create the Phase File

Create `phases/my_custom_phase.py`:

```python
"""Custom audit phase."""

from typing import Optional
from dataclasses import dataclass

from core.logger import ActionLogger


@dataclass
class CustomPhaseResult:
    """Result of custom phase check."""
    dataset_name: str
    passed: bool
    details: dict
    error: Optional[str] = None


class CustomPhase:
    """Custom audit phase implementation."""

    PHASE_NAME = "custom_phase"

    def __init__(self, logger: ActionLogger):
        self.logger = logger

    def check_dataset(self, dataset_config: dict) -> CustomPhaseResult:
        """Check a single dataset."""
        dataset_name = dataset_config.get("name", "Unknown")

        try:
            # Implement your check logic here
            result = self._perform_check(dataset_config)

            self.logger.log_action(
                phase=self.PHASE_NAME,
                action_type="custom_check",
                status="success" if result else "failure",
                metadata={"dataset": dataset_name}
            )

            return CustomPhaseResult(
                dataset_name=dataset_name,
                passed=result,
                details={"check": "completed"}
            )

        except Exception as e:
            self.logger.log_action(
                phase=self.PHASE_NAME,
                action_type="custom_check",
                status="failure",
                error=str(e)
            )

            return CustomPhaseResult(
                dataset_name=dataset_name,
                passed=False,
                details={},
                error=str(e)
            )

    def _perform_check(self, dataset_config: dict) -> bool:
        """Perform the actual check logic."""
        # Implement your logic here
        return True

    def run(self, datasets: list[dict]) -> list[CustomPhaseResult]:
        """Run custom phase for all datasets."""
        results = []
        for dataset_config in datasets:
            result = self.check_dataset(dataset_config)
            results.append(result)
        return results
```

### Step 2: Register the Phase

Update `phases/__init__.py`:

```python
from .source_discovery import SourceDiscoveryPhase
from .data_integrity import DataIntegrityPhase
from .app_visibility import AppVisibilityPhase
from .my_custom_phase import CustomPhase

__all__ = [
    "SourceDiscoveryPhase",
    "DataIntegrityPhase",
    "AppVisibilityPhase",
    "CustomPhase"
]
```

### Step 3: Add to Workflow

Update `workflows/audit_workflow.py`:

```python
from phases.my_custom_phase import CustomPhase, CustomPhaseResult

# In the run() method:
custom_results = {}
if "custom_phase" in run_phases:
    phase = CustomPhase(self.logger)
    for result in phase.run(all_datasets):
        custom_results[result.dataset_name] = result
```

### Step 4: Update CLI

Add to `main.py`:

```python
@click.option(
    "--phases", "-p",
    multiple=True,
    type=click.Choice([
        "source_discovery",
        "data_integrity",
        "app_visibility",
        "custom_phase"  # Add new phase
    ]),
    help="Phases to run"
)
```

## Adding New CLI Commands

### Step 1: Define the Command

Add to `main.py`:

```python
@cli.command()
@click.argument("dataset_name")
@click.option("--year", "-y", type=int, required=True)
@click.option("--output", "-o", default="./output.json")
def export_data(dataset_name, year, output):
    """Export dataset data to a JSON file.

    Example:
        python main.py export-data "Top 10 Source Markets" -y 2023
    """
    # Load config
    with open("./config/datasets.json") as f:
        config = json.load(f)

    # Find dataset
    dataset = next(
        (d for d in config["datasets"] if d["name"] == dataset_name),
        None
    )

    if not dataset:
        click.echo(f"Dataset not found: {dataset_name}")
        return

    # Fetch data
    url = dataset["data_url"].replace("{year}", str(year))
    response = requests.get(url)
    data = response.json()

    # Save to file
    with open(output, "w") as f:
        json.dump(data, f, indent=2)

    click.echo(f"Exported to: {output}")
```

### Step 2: Test the Command

```bash
python main.py export-data "Top 10 Source Markets" -y 2023 -o ./data.json
```

## Adding Dashboard Components

### Step 1: Create the Component

Create `audit-dashboard/components/MyChart.tsx`:

```typescript
'use client';

import { useMemo } from 'react';

interface ChartData {
  label: string;
  value: number;
}

interface MyChartProps {
  data: ChartData[];
  title: string;
}

export function MyChart({ data, title }: MyChartProps) {
  const maxValue = useMemo(
    () => Math.max(...data.map(d => d.value)),
    [data]
  );

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-24 text-sm">{item.label}</span>
            <div className="flex-1 bg-gray-200 rounded h-4">
              <div
                className="bg-blue-500 h-4 rounded"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
            <span className="w-12 text-sm text-right">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Step 2: Use in Pages

```typescript
import { MyChart } from '@/components/MyChart';

export default function AnalyticsPage() {
  const chartData = [
    { label: 'Success', value: 83 },
    { label: 'Failed', value: 2 },
  ];

  return (
    <div className="container mx-auto p-4">
      <MyChart data={chartData} title="Action Results" />
    </div>
  );
}
```

## Best Practices

### Configuration
- Use descriptive names for datasets
- Include clear descriptions
- Test navigation paths before adding to config
- Use appropriate timeouts for dynamic content

### Validations
- Keep validation logic simple and focused
- Provide meaningful error messages
- Log all validation attempts for debugging

### Navigation
- Add delays after clicks for dynamic content
- Use specific selectors to avoid ambiguity
- Test with `--no-headless` to verify navigation

### Phases
- Follow the existing phase interface pattern
- Log all actions with appropriate detail
- Handle errors gracefully
- Return structured results

### CLI Commands
- Use consistent option naming
- Provide helpful descriptions
- Include usage examples in docstrings

### Dashboard
- Use TypeScript for type safety
- Follow existing component patterns
- Test with various data scenarios
