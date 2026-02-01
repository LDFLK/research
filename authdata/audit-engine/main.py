#!/usr/bin/env python3
"""CLI entry point for the OpenGINXplore Audit Framework."""

import json
import sys
from pathlib import Path

import click

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from core.logger import generate_run_id
from workflows.audit_workflow import AuditWorkflow


@click.group()
@click.version_option(version="1.0.0")
def cli():
    """OpenGINXplore Audit Framework.

    A reproducible, observable audit framework for validating datasets
    across the OpenGINXplore ecosystem with full action traceability.
    Supports any topic (tourism, education, health, etc.) via configuration.
    """
    pass


@cli.command()
@click.option(
    "--datasets", "-d",
    multiple=True,
    help="Specific datasets to audit (can be specified multiple times)"
)
@click.option(
    "--years", "-y",
    multiple=True,
    type=int,
    help="Years to audit (can be specified multiple times)"
)
@click.option(
    "--phases", "-p",
    multiple=True,
    type=click.Choice(["source_discovery", "data_integrity", "app_visibility"]),
    help="Phases to run (can be specified multiple times)"
)
@click.option(
    "--config", "-c",
    default="./config/datasets.json",
    help="Path to datasets configuration file"
)
@click.option(
    "--output", "-o",
    default="./audit-results",
    help="Output directory for audit results"
)
@click.option(
    "--app-url",
    help="Override the application URL for visibility checks"
)
@click.option(
    "--headless/--no-headless",
    default=True,
    help="Run browser in headless mode"
)
@click.option(
    "--run-id",
    help="Custom run ID (defaults to timestamp-based ID)"
)
def run(datasets, years, phases, config, output, app_url, headless, run_id):
    """Run a complete audit based on the configuration file.

    The audit topic (tourism, education, etc.) is determined by the config file.

    Examples:
        # Run all datasets with default config
        python main.py run

        # Run specific datasets
        python main.py run -d "Top 10 Source Markets" -d "Dataset Name"

        # Run specific years
        python main.py run -y 2023 -y 2024

        # Run specific phases
        python main.py run -p source_discovery -p data_integrity

        # Skip UI tests (headless disabled)
        python main.py run --no-headless
    """
    # Convert tuples to lists
    datasets_list = list(datasets) if datasets else None
    years_list = list(years) if years else None
    phases_list = list(phases) if phases else None

    # Generate run ID if not provided
    audit_run_id = run_id or generate_run_id()

    click.echo(f"Starting audit run: {audit_run_id}")
    click.echo(f"Config: {config}")
    click.echo(f"Output: {output}")

    if datasets_list:
        click.echo(f"Datasets: {', '.join(datasets_list)}")
    if years_list:
        click.echo(f"Years: {', '.join(map(str, years_list))}")
    if phases_list:
        click.echo(f"Phases: {', '.join(phases_list)}")

    click.echo("-" * 50)

    # Run the workflow
    workflow = AuditWorkflow(
        config_path=config,
        output_dir=output,
        run_id=audit_run_id
    )

    report = workflow.run(
        datasets=datasets_list,
        years=years_list,
        phases=phases_list,
        headless=headless,
        app_url=app_url
    )

    # Print summary
    click.echo("-" * 50)
    click.echo("Audit Complete!")
    click.echo(f"Run ID: {report.run_id}")
    click.echo(f"Total Actions: {report.summary.get('total_actions', 0)}")
    click.echo(f"Successful: {report.summary.get('successful', 0)}")
    click.echo(f"Failed: {report.summary.get('failed', 0)}")
    click.echo(f"Datasets Passed: {report.summary.get('datasets_passed', 0)}/{report.summary.get('datasets_total', 0)}")
    click.echo("-" * 50)

    # Print dataset results
    for dataset in report.datasets:
        status = "PASS" if dataset.passed else "FAIL"
        click.echo(f"[{status}] {dataset.dataset_name}")

    click.echo("-" * 50)
    output_path = Path(output) / audit_run_id
    click.echo(f"Results saved to: {output_path}")


@cli.command()
@click.option(
    "--config", "-c",
    default="./config/datasets.json",
    help="Path to datasets configuration file"
)
def list_datasets(config):
    """List all configured datasets."""
    config_path = Path(config)

    if not config_path.exists():
        click.echo(f"Config file not found: {config}")
        return

    with open(config_path) as f:
        cfg = json.load(f)

    datasets = cfg.get("datasets", [])
    years = cfg.get("years", [])
    app_url = cfg.get("app_url", "")

    click.echo(f"Configuration: {config}")
    click.echo(f"App URL: {app_url}")
    click.echo(f"Years: {', '.join(map(str, years))}")
    click.echo("-" * 50)
    click.echo(f"Datasets ({len(datasets)}):")

    for i, dataset in enumerate(datasets, 1):
        name = dataset.get("name", "Unknown")
        description = dataset.get("description", "")
        columns = dataset.get("expected_columns", [])
        click.echo(f"  {i}. {name}")
        click.echo(f"     {description}")
        click.echo(f"     Columns: {', '.join(columns)}")


@cli.command()
@click.argument("run_id")
@click.option(
    "--output", "-o",
    default="./audit-results",
    help="Output directory for audit results"
)
def show(run_id, output):
    """Show details of a specific audit run."""
    run_path = Path(output) / run_id

    if not run_path.exists():
        click.echo(f"Run not found: {run_id}")
        return

    # Load manifest
    manifest_path = run_path / "manifest.json"
    if manifest_path.exists():
        with open(manifest_path) as f:
            manifest = json.load(f)

        click.echo(f"Run ID: {manifest.get('run_id')}")
        click.echo(f"Started: {manifest.get('started_at')}")
        click.echo(f"Completed: {manifest.get('completed_at')}")
        click.echo(f"Config: {json.dumps(manifest.get('config', {}), indent=2)}")
        click.echo(f"Summary: {json.dumps(manifest.get('summary', {}), indent=2)}")

    # Load report
    report_path = run_path / "report.json"
    if report_path.exists():
        with open(report_path) as f:
            report = json.load(f)

        click.echo("-" * 50)
        click.echo("Dataset Results:")
        for dataset in report.get("datasets", []):
            status = "PASS" if dataset.get("passed") else "FAIL"
            click.echo(f"  [{status}] {dataset.get('dataset_name')}")


@cli.command()
@click.option(
    "--output", "-o",
    default="./audit-results",
    help="Output directory for audit results"
)
def list_runs(output):
    """List all audit runs."""
    output_path = Path(output)

    if not output_path.exists():
        click.echo("No audit runs found.")
        return

    runs = sorted(output_path.iterdir(), reverse=True)

    if not runs:
        click.echo("No audit runs found.")
        return

    click.echo(f"Audit runs in {output}:")
    click.echo("-" * 50)

    for run_dir in runs:
        if not run_dir.is_dir():
            continue

        manifest_path = run_dir / "manifest.json"
        if manifest_path.exists():
            with open(manifest_path) as f:
                manifest = json.load(f)

            run_id = manifest.get("run_id", run_dir.name)
            started = manifest.get("started_at", "Unknown")
            summary = manifest.get("summary", {})
            passed = summary.get("datasets_passed", 0)
            total = summary.get("datasets_total", 0)

            click.echo(f"{run_id}")
            click.echo(f"  Started: {started}")
            click.echo(f"  Datasets: {passed}/{total} passed")
        else:
            click.echo(f"{run_dir.name} (no manifest)")


@cli.command()
@click.option(
    "--datasets", "-d",
    multiple=True,
    help="Specific datasets to check"
)
@click.option(
    "--years", "-y",
    multiple=True,
    type=int,
    help="Years to check (can be specified multiple times)"
)
@click.option(
    "--config", "-c",
    default="./config/datasets.json",
    help="Path to datasets configuration file"
)
@click.option(
    "--output", "-o",
    default="./audit-results",
    help="Output directory for audit results"
)
def source_check(datasets, years, config, output):
    """Run only source discovery phase."""
    datasets_list = list(datasets) if datasets else None
    years_list = list(years) if years else None
    run_id = generate_run_id()

    click.echo(f"Running source discovery: {run_id}")

    workflow = AuditWorkflow(
        config_path=config,
        output_dir=output,
        run_id=run_id
    )

    results = workflow.run_source_discovery_only(datasets=datasets_list, years=years_list)

    for result in results:
        status = "EXISTS" if result.exists else "MISSING"
        click.echo(f"[{status}] {result.dataset_name}")
        if result.exists:
            click.echo(f"  URL: {result.raw_url}")
            click.echo(f"  Columns: {', '.join(result.columns)}")
        else:
            click.echo(f"  Error: {result.error}")


@cli.command()
@click.option(
    "--datasets", "-d",
    multiple=True,
    help="Specific datasets to validate"
)
@click.option(
    "--years", "-y",
    multiple=True,
    type=int,
    help="Years to validate"
)
@click.option(
    "--config", "-c",
    default="./config/datasets.json",
    help="Path to datasets configuration file"
)
@click.option(
    "--output", "-o",
    default="./audit-results",
    help="Output directory for audit results"
)
def data_check(datasets, years, config, output):
    """Run only data integrity phase."""
    datasets_list = list(datasets) if datasets else None
    years_list = list(years) if years else None
    run_id = generate_run_id()

    click.echo(f"Running data integrity check: {run_id}")

    workflow = AuditWorkflow(
        config_path=config,
        output_dir=output,
        run_id=run_id
    )

    results = workflow.run_data_integrity_only(
        datasets=datasets_list,
        years=years_list
    )

    for result in results:
        status = "PASS" if result.passed else "FAIL"
        click.echo(f"[{status}] {result.dataset_name}")
        click.echo(f"  Accessible: {result.accessible}")
        click.echo(f"  Valid JSON: {result.valid_json}")
        click.echo(f"  Schema Valid: {result.schema_valid}")
        if result.validations:
            for v in result.validations:
                v_status = "PASS" if v.passed else "FAIL"
                click.echo(f"    [{v_status}] {v.check_name}")


# =============================================================================
# UI EXPLORATION AND COMPARISON TOOLS
# =============================================================================

@cli.command()
@click.argument("url")
@click.option(
    "--click-selector", "-k",
    multiple=True,
    help="XPath selectors to click before exploring (in order)"
)
@click.option(
    "--wait", "-w",
    default=3,
    type=int,
    help="Seconds to wait after page load"
)
@click.option(
    "--screenshot", "-s",
    help="Save screenshot to this path"
)
@click.option(
    "--headless/--no-headless",
    default=True,
    help="Run browser in headless mode"
)
@click.option(
    "--json-output", "-j",
    is_flag=True,
    help="Output as JSON"
)
def explore(url, click_selector, wait, screenshot, headless, json_output):
    """Explore UI structure of a web page using Selenium.

    Examples:
        # Basic exploration
        python main.py explore https://openginxplore.opendata.lk/data

        # Click elements before exploring
        python main.py explore https://example.com -k "//*[text()='Tourism']"

        # Save screenshot
        python main.py explore https://example.com -s ./screenshot.png

        # Get JSON output
        python main.py explore https://example.com --json-output
    """
    from tools.ui_explorer import UIExplorer

    with UIExplorer(headless=headless) as explorer:
        # Navigate to URL
        explorer.driver.get(url)
        import time
        time.sleep(wait)

        # Click any specified elements
        for selector in click_selector:
            try:
                from selenium.webdriver.common.by import By
                from selenium.webdriver.support.ui import WebDriverWait
                from selenium.webdriver.support import expected_conditions as EC

                el = WebDriverWait(explorer.driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH, selector))
                )
                el.click()
                print(f"Clicked: {selector}")
                time.sleep(2)
            except Exception as e:
                print(f"Failed to click {selector}: {e}")

        # Explore the page
        structure = explorer.explore_page(explorer.driver.current_url, wait_time=1)

        # Save screenshot if requested
        if screenshot:
            explorer.take_screenshot(screenshot)
            click.echo(f"Screenshot saved: {screenshot}")

        # Output results
        if json_output:
            click.echo(json.dumps(structure.to_dict(), indent=2))
        else:
            click.echo(f"\n{'='*60}")
            click.echo(f"URL: {structure.url}")
            click.echo(f"Title: {structure.title}")

            click.echo(f"\n--- Links ({len(structure.links)}) ---")
            for link in structure.links[:15]:
                click.echo(f"  [{link.text[:40]}] -> {link.href or 'no href'}")

            click.echo(f"\n--- Buttons ({len(structure.buttons)}) ---")
            for btn in structure.buttons[:10]:
                click.echo(f"  <button> {btn.text[:50]}")

            click.echo(f"\n--- Headings ({len(structure.headings)}) ---")
            for h in structure.headings[:10]:
                click.echo(f"  <{h.tag}> {h.text[:60]}")

            click.echo(f"\n--- Tables ({len(structure.tables)}) ---")
            for t in structure.tables:
                click.echo(f"  Table {t['index']}: {t['row_count']} rows, headers={t['headers']}")

            click.echo(f"\n--- Text Content (first 20 lines) ---")
            for line in structure.text_content[:20]:
                click.echo(f"  {line[:70]}")


@cli.command()
@click.option(
    "--dataset", "-d",
    required=True,
    help="Dataset name to compare"
)
@click.option(
    "--year", "-y",
    required=True,
    type=int,
    help="Year to compare"
)
@click.option(
    "--config", "-c",
    default="./config/datasets.json",
    help="Path to datasets configuration file"
)
@click.option(
    "--headless/--no-headless",
    default=True,
    help="Run browser in headless mode"
)
@click.option(
    "--json-output", "-j",
    is_flag=True,
    help="Output as JSON"
)
def compare(dataset, year, config, headless, json_output):
    """Compare data between GitHub source and web UI.

    Examples:
        # Compare Top 10 Source Markets for 2024
        python main.py compare -d "Top 10 Source Markets" -y 2024

        # Get JSON output
        python main.py compare -d "Top 10 Source Markets" -y 2024 --json-output
    """
    from tools.data_comparator import DataComparator

    # Load config
    config_path = Path(config)
    if not config_path.exists():
        click.echo(f"Config not found: {config}")
        return

    with open(config_path) as f:
        cfg = json.load(f)

    # Find dataset config
    dataset_config = None
    for ds in cfg.get("datasets", []):
        if ds.get("name") == dataset:
            dataset_config = ds
            break

    if not dataset_config:
        click.echo(f"Dataset not found in config: {dataset}")
        click.echo(f"Available datasets: {[d.get('name') for d in cfg.get('datasets', [])]}")
        return

    app_url = cfg.get("app_url", "")
    github_url = dataset_config.get("data_url", "").replace("{year}", str(year))

    click.echo(f"Comparing: {dataset} ({year})")
    click.echo(f"GitHub: {github_url}")
    click.echo(f"App: {app_url}")
    click.echo("-" * 50)

    comparator = DataComparator(headless=headless)
    result = comparator.compare(
        dataset_name=dataset,
        github_url=github_url,
        app_url=app_url,
        category="Tourism",
        year=year,
        key_column=dataset_config.get("expected_columns", [""])[0]
    )

    if json_output:
        click.echo(json.dumps(result.to_dict(), indent=2))
    else:
        status = "MATCH" if result.match else "MISMATCH"
        click.echo(f"\nResult: [{status}]")
        click.echo(f"  GitHub rows: {result.github_row_count}")
        click.echo(f"  UI rows: {result.ui_row_count}")
        click.echo(f"  Matching rows: {result.matching_rows}")

        if result.mismatched_rows:
            click.echo(f"\n  Mismatched rows ({len(result.mismatched_rows)}):")
            for m in result.mismatched_rows[:5]:
                click.echo(f"    Key: {m.get('key', m.get('position'))}")
                for diff in m.get("differences", []):
                    click.echo(f"      {diff['column']}: GitHub={diff['github']} vs UI={diff['ui']}")

        if result.missing_in_ui:
            click.echo(f"\n  Missing in UI ({len(result.missing_in_ui)}):")
            for m in result.missing_in_ui[:5]:
                click.echo(f"    {m}")

        if result.errors:
            click.echo(f"\n  Errors:")
            for e in result.errors:
                click.echo(f"    {e}")


@cli.command()
@click.option(
    "--dataset", "-d",
    required=True,
    help="Dataset name to verify"
)
@click.option(
    "--year", "-y",
    type=int,
    help="Specific year (default: all configured years)"
)
@click.option(
    "--config", "-c",
    default="./config/datasets.json",
    help="Path to datasets configuration file"
)
@click.option(
    "--headless/--no-headless",
    default=True,
    help="Run browser in headless mode"
)
@click.option(
    "--screenshot", "-s",
    is_flag=True,
    help="Save screenshots during verification"
)
def verify_ui(dataset, year, config, headless, screenshot):
    """Verify dataset is visible and correct in the web UI.

    Uses the navigation steps from the dataset configuration to navigate
    through the UI tree structure.

    Examples:
        # Verify all years for a dataset
        python main.py verify-ui -d "Top 10 Source Markets"

        # Verify specific year
        python main.py verify-ui -d "Top 10 Source Markets" -y 2024

        # With screenshots
        python main.py verify-ui -d "Top 10 Source Markets" -y 2024 --screenshot
    """
    import time
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from tools.ui_explorer import UIExplorer

    # Load config
    config_path = Path(config)
    if not config_path.exists():
        click.echo(f"Config not found: {config}")
        return

    with open(config_path) as f:
        cfg = json.load(f)

    # Find dataset config
    dataset_config = None
    for ds in cfg.get("datasets", []):
        if ds.get("name") == dataset:
            dataset_config = ds
            break

    if not dataset_config:
        click.echo(f"Dataset not found: {dataset}")
        return

    app_url = cfg.get("app_url", "")
    years_to_check = [year] if year else cfg.get("years", [])
    category = dataset_config.get("category", "Unknown")
    navigation = dataset_config.get("navigation", {})
    nav_steps = navigation.get("steps", [])
    tree_path = navigation.get("tree_path", [])

    click.echo(f"Verifying UI: {dataset}")
    click.echo(f"Category: {category}")
    click.echo(f"Tree Path: {' >> '.join(tree_path)}")
    click.echo(f"App URL: {app_url}")
    click.echo(f"Years: {years_to_check}")
    click.echo("=" * 60)

    with UIExplorer(headless=headless) as explorer:
        for y in years_to_check:
            click.echo(f"\n--- Year {y} ---")

            # Navigate to app
            explorer.driver.get(app_url)
            time.sleep(3)

            navigation_steps = []
            success = True
            error = None

            # Execute navigation steps from config
            for step in nav_steps:
                step_type = step.get("type", "click")
                selector = step.get("selector", "")
                description = step.get("description", "")
                by = By.XPATH if step.get("by", "xpath") == "xpath" else By.CSS_SELECTOR

                try:
                    if step_type == "click":
                        element = WebDriverWait(explorer.driver, 10).until(
                            EC.element_to_be_clickable((by, selector))
                        )
                        element.click()
                        navigation_steps.append(f"Clicked: {description}")
                        time.sleep(step.get("delay", 2))

                    elif step_type == "wait":
                        timeout = step.get("timeout", 10)
                        WebDriverWait(explorer.driver, timeout).until(
                            EC.presence_of_element_located((by, selector))
                        )
                        navigation_steps.append(f"Found: {description}")

                    elif step_type == "delay":
                        time.sleep(step.get("seconds", 2))
                        navigation_steps.append(f"Waited: {step.get('seconds', 2)}s")

                except Exception as e:
                    success = False
                    error = f"Step '{description}' failed: {str(e)}"
                    break

            if success:
                click.echo(f"  Navigation: SUCCESS")
                for step in navigation_steps:
                    click.echo(f"    {step}")

                # Extract table data
                data = explorer.extract_table_data()
                click.echo(f"  Data extracted: {len(data)} rows")

                if data and not data[0].get("error"):
                    click.echo(f"  Sample row: {data[0]}")

                if screenshot:
                    ss_path = f"./verify_{dataset.replace(' ', '_')}_{y}.png"
                    explorer.take_screenshot(ss_path)
                    click.echo(f"  Screenshot: {ss_path}")
            else:
                click.echo(f"  Navigation: FAILED")
                click.echo(f"  Error: {error}")
                for step in navigation_steps:
                    click.echo(f"    {step}")


@cli.command()
@click.argument("url")
@click.option(
    "--table-selector", "-t",
    default="//table",
    help="XPath selector for the table"
)
@click.option(
    "--click-selector", "-k",
    multiple=True,
    help="XPath selectors to click before extracting (in order)"
)
@click.option(
    "--wait", "-w",
    default=3,
    type=int,
    help="Seconds to wait after each action"
)
@click.option(
    "--headless/--no-headless",
    default=True,
    help="Run browser in headless mode"
)
def extract_table(url, table_selector, click_selector, wait, headless):
    """Extract table data from a web page.

    Examples:
        # Extract first table from page
        python main.py extract-table https://example.com/data

        # Click navigation first, then extract
        python main.py extract-table https://example.com \\
            -k "//*[text()='Tourism']" \\
            -k "//*[text()='Top 10 Source Markets']"
    """
    from tools.ui_explorer import UIExplorer
    import time

    with UIExplorer(headless=headless) as explorer:
        explorer.driver.get(url)
        time.sleep(wait)

        # Click specified elements
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC

        for selector in click_selector:
            try:
                el = WebDriverWait(explorer.driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH, selector))
                )
                el.click()
                print(f"Clicked: {selector}")
                time.sleep(wait)
            except Exception as e:
                print(f"Failed to click {selector}: {e}")

        # Extract table data
        data = explorer.extract_table_data(table_selector)

        print(f"\nExtracted {len(data)} rows:")
        print("-" * 50)

        for i, row in enumerate(data[:20]):  # Limit output
            print(f"{i+1}. {row}")

        if len(data) > 20:
            print(f"... and {len(data) - 20} more rows")


@cli.command()
@click.argument("category")
@click.option(
    "--app-url",
    default="https://openginxplore.opendata.lk/data?startDate=2020-01-01&endDate=2025-12-31",
    help="Application URL"
)
@click.option(
    "--headless/--no-headless",
    default=True,
    help="Run browser in headless mode"
)
def discover(category, app_url, headless):
    """Discover all datasets under a category.

    Recursively explores the UI tree to find all datasets under the given category.

    Examples:
        # Discover all datasets under Immigration And Emigration
        python main.py discover "Immigration And Emigration"

        # Discover Tourism datasets
        python main.py discover "Tourism"

        # With visible browser
        python main.py discover "Tourism" --no-headless
    """
    import time
    from tools.ui_explorer import UIExplorer
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC

    def get_page_structure(driver):
        """Parse page to find categories and datasets."""
        body = driver.find_element(By.TAG_NAME, 'body')
        text = body.text
        lines = [l.strip() for l in text.split('\n') if l.strip()]

        categories = []
        datasets = []
        in_categories = False
        in_datasets = False

        skip_items = ['1Y', '2Y', '3Y', '5Y', 'All', 'By President Term', 'By Date',
                      '→', 'Sri Lanka', 'Learn', 'Share', 'Select a Date range',
                      'Home', 'OpenGINXploreALPHA', 'Organization', 'Data', 'Share feedback']

        for line in lines:
            if line == 'Categories':
                in_categories = True
                in_datasets = False
                continue
            elif line == 'Datasets':
                in_categories = False
                in_datasets = True
                continue
            elif line in skip_items:
                continue

            # Skip years and dates
            if line.startswith('20') and len(line) == 4:
                continue
            if line.startswith('01 ') or line.startswith('31 '):
                continue

            if in_categories and len(line) > 2:
                categories.append(line)
            elif in_datasets and len(line) > 2:
                datasets.append(line)

        return categories, datasets

    def explore_path(explorer, path, app_url):
        """Navigate to a path and return categories/datasets there."""
        explorer.driver.get(app_url)
        time.sleep(2)

        for item in path:
            try:
                elem = WebDriverWait(explorer.driver, 5).until(
                    EC.element_to_be_clickable((By.XPATH, f"//*[text()='{item}']"))
                )
                elem.click()
                time.sleep(1.5)
            except Exception as e:
                return None, None, str(e)

        categories, datasets = get_page_structure(explorer.driver)
        return categories, datasets, None

    def discover_recursive(explorer, path, app_url, results, indent=0):
        """Recursively discover all datasets."""
        prefix = '  ' * indent
        path_str = ' >> '.join(path)

        categories, datasets, error = explore_path(explorer, path, app_url)

        if error:
            click.echo(f'{prefix}ERROR at {path_str}: {error}')
            return

        if datasets:
            click.echo(f'{prefix}{path_str}:')
            for ds in datasets:
                click.echo(f'{prefix}  [DATASET] {ds}')
                results.append({
                    'path': path.copy(),
                    'dataset': ds,
                    'tree_path': path + [ds]
                })

        if categories:
            for cat in categories:
                discover_recursive(explorer, path + [cat], app_url, results, indent)

    click.echo(f'Discovering datasets under: {category}')
    click.echo(f'App URL: {app_url}')
    click.echo('=' * 60)

    results = []

    with UIExplorer(headless=headless) as explorer:
        discover_recursive(explorer, [category], app_url, results)

    click.echo()
    click.echo('=' * 60)
    click.echo(f'Total datasets found: {len(results)}')
    click.echo()

    # Print summary
    for r in results:
        click.echo(f"Dataset: {r['dataset']}")
        click.echo(f"  Path: {' >> '.join(r['path'])}")
        click.echo(f"  Tree: {r['tree_path']}")
        click.echo()


if __name__ == "__main__":
    cli()
