"""Phase B: Application UI visibility checks using Selenium."""

import time
from typing import Optional, Any
from dataclasses import dataclass, field
from selenium.webdriver.common.by import By

from core.logger import ActionLogger, Extraction
from core.browser import LoggedBrowser


@dataclass
class UICheckResult:
    """Result of a UI visibility check."""
    dataset_name: str
    app_url: str
    navigation_path: list[str]
    visible: bool
    elements_found: dict = field(default_factory=dict)
    data_displayed: bool = False
    ui_row_count: int = 0
    ui_data_sample: list[list[str]] = field(default_factory=list)
    data_matches_source: Optional[bool] = None
    match_details: dict = field(default_factory=dict)
    error: Optional[str] = None


class AppVisibilityPhase:
    """Phase B: Verify dataset visibility in the application UI."""

    PHASE_NAME = "app_visibility"

    def __init__(self, logger: ActionLogger, headless: bool = True):
        self.logger = logger
        self.headless = headless

    def check_dataset_visibility(
        self,
        app_url: str,
        dataset_config: dict,
        source_data: Optional[dict] = None,
        year: Optional[int] = None
    ) -> UICheckResult:
        """Check if a dataset is visible in the application UI."""
        dataset_name = dataset_config.get("name", "Unknown")
        navigation = dataset_config.get("navigation", {})
        selectors = dataset_config.get("selectors", {})

        # If year is specified, update the URL with date filters
        if year:
            dataset_name = f"{dataset_name} ({year})"
            # Update URL with year-specific date range
            app_url = self._add_year_to_url(app_url, year)

        result = UICheckResult(
            dataset_name=dataset_name,
            app_url=app_url,
            navigation_path=[],
            visible=False
        )

        browser = LoggedBrowser(self.logger, self.PHASE_NAME, headless=self.headless)

        try:
            browser.start()

            # Navigate to the app
            success, error = browser.navigate(app_url)
            if not success:
                result.error = f"Failed to navigate to app: {error}"
                return result

            result.navigation_path.append(f"Loaded: {app_url}")

            # Follow navigation path if specified
            nav_steps = navigation.get("steps", [])
            for step in nav_steps:
                step_type = step.get("type", "click")
                selector = step.get("selector", "")
                description = step.get("description", "")

                if step_type == "click":
                    by = By.XPATH if step.get("by", "xpath") == "xpath" else By.CSS_SELECTOR
                    success, error = browser.click(selector, by=by)
                    if not success:
                        result.error = f"Navigation step failed: {description} - {error}"
                        return result
                    result.navigation_path.append(f"Clicked: {description}")
                    # Add delay after click if specified
                    delay = step.get("delay", 2)  # Default 2 seconds
                    time.sleep(delay)

                elif step_type == "delay":
                    delay = step.get("seconds", 2)
                    time.sleep(delay)
                    result.navigation_path.append(f"Delayed: {delay}s")

                elif step_type == "wait":
                    by = By.XPATH if step.get("by", "xpath") == "xpath" else By.CSS_SELECTOR
                    timeout = step.get("timeout", 10)
                    success, error = browser.wait_for_element(selector, by=by, timeout=timeout)
                    if not success:
                        result.error = f"Wait failed: {description} - {error}"
                        return result
                    result.navigation_path.append(f"Waited for: {description}")

            # Check for dataset-specific elements
            for element_name, selector_config in selectors.items():
                selector = selector_config.get("selector", "")
                by = By.XPATH if selector_config.get("by", "xpath") == "xpath" else By.CSS_SELECTOR

                if selector_config.get("extract_text", False):
                    text, error = browser.extract_text(selector, by=by)
                    result.elements_found[element_name] = {
                        "found": text is not None,
                        "text": text
                    }
                elif selector_config.get("extract_list", False):
                    elements, error = browser.extract_elements(selector, by=by)
                    result.elements_found[element_name] = {
                        "found": len(elements) > 0,
                        "count": len(elements),
                        "texts": [el.text for el in elements[:5]]  # First 5
                    }
                else:
                    success, error = browser.wait_for_element(selector, by=by, timeout=5)
                    result.elements_found[element_name] = {
                        "found": success
                    }

            # Extract actual table data from UI
            ui_table_data = self._extract_table_data(browser)
            if ui_table_data:
                result.ui_row_count = len(ui_table_data)
                result.ui_data_sample = ui_table_data[:5]  # First 5 rows

                # Log the extraction
                self.logger.log_action(
                    phase=self.PHASE_NAME,
                    action_type="data_extraction",
                    extraction=Extraction(
                        method="ui_table_parse",
                        query="//table//tr",
                        result={"row_count": result.ui_row_count},
                        found=True
                    ),
                    status="success"
                )

            # Compare with source data if provided
            if source_data and ui_table_data:
                result.data_matches_source, result.match_details = self._compare_with_source(
                    ui_table_data, source_data, dataset_config
                )

                # Log the comparison
                self.logger.log_action(
                    phase=self.PHASE_NAME,
                    action_type="data_comparison",
                    extraction=Extraction(
                        method="source_comparison",
                        query="ui_vs_source",
                        result=result.match_details,
                        found=result.data_matches_source
                    ),
                    status="success" if result.data_matches_source else "failure",
                    error=None if result.data_matches_source else "Data mismatch between UI and source"
                )

            # Determine overall visibility
            if result.elements_found:
                result.visible = all(
                    el.get("found", False) for el in result.elements_found.values()
                )
                result.data_displayed = result.visible and result.ui_row_count > 0

        except Exception as e:
            result.error = str(e)

        finally:
            browser.stop()

        return result

    def _extract_table_data(self, browser: LoggedBrowser) -> list[list[str]]:
        """Extract data rows from the visible table in the UI."""
        try:
            # Get all table rows
            rows, _ = browser.extract_elements("//table//tbody//tr", by=By.XPATH)
            if not rows:
                # Try without tbody
                rows, _ = browser.extract_elements("//table//tr", by=By.XPATH)

            table_data = []
            for row in rows:
                cells = row.find_elements(By.TAG_NAME, "td")
                if cells:
                    row_data = [cell.text.strip() for cell in cells]
                    if any(row_data):  # Skip empty rows
                        table_data.append(row_data)

            return table_data
        except Exception:
            return []

    def _compare_with_source(
        self,
        ui_data: list[list[str]],
        source_data: dict,
        config: dict
    ) -> tuple[bool, dict]:
        """Compare UI table data with source data.

        Returns:
            Tuple of (matches: bool, details: dict)
        """
        details = {
            "ui_row_count": len(ui_data),
            "source_row_count": 0,
            "rows_matched": 0,
            "values_matched": [],
            "source_values": [],
            "ui_values": [],
            "sample_comparisons": []
        }

        # Extract source rows and key values
        source_rows = []
        source_key_values = []  # Key identifiers from source
        source_numeric_values = []  # Numeric values from source

        if isinstance(source_data, dict):
            columns = source_data.get("columns", [])
            raw_rows = source_data.get("rows", source_data.get("data", []))
            if raw_rows and columns and isinstance(raw_rows[0], list):
                source_rows = raw_rows
            elif raw_rows and isinstance(raw_rows[0], dict):
                source_rows = [[str(row.get(col, "")) for col in columns] for row in raw_rows]
        elif isinstance(source_data, list) and source_data:
            if isinstance(source_data[0], dict):
                columns = list(source_data[0].keys())
                source_rows = [[str(row.get(col, "")) for col in columns] for row in source_data]

        # Extract key values from source (text identifiers and numbers)
        for row in source_rows:
            for val in row:
                normalized = self._normalize_value(str(val))
                if normalized:
                    source_key_values.append(normalized)
                    # Also track numeric values specifically
                    try:
                        num = float(str(val).replace(",", ""))
                        source_numeric_values.append(num)
                    except (ValueError, TypeError):
                        pass

        details["source_row_count"] = len(source_rows)
        details["source_values"] = [str(v) for row in source_rows[:3] for v in row][:10]

        if not source_rows:
            return False, details

        # Extract all values from UI rows - both full cell text and individual words
        ui_all_values = []
        ui_full_text_values = []  # Full cell text for multi-word matching
        ui_numeric_values = []

        for row in ui_data:
            # Join entire row for substring matching
            row_text = " ".join(row).lower()
            ui_full_text_values.append(row_text)

            for cell in row:
                # Store full cell text
                cell_normalized = self._normalize_value(cell)
                if cell_normalized:
                    ui_all_values.append(cell_normalized)

                # Also store individual words for numeric matching
                parts = cell.split()
                for part in parts:
                    try:
                        num = float(part.replace(",", ""))
                        ui_numeric_values.append(num)
                        ui_all_values.append(self._normalize_value(part))
                    except (ValueError, TypeError):
                        pass

        details["ui_values"] = ui_all_values[:15]

        # Match values between source and UI
        matched_values = []
        for source_val in source_key_values:
            # Check exact match
            if source_val in ui_all_values:
                matched_values.append(source_val)
            else:
                # Check if source value is contained in any UI row text (for multi-word values)
                source_lower = source_val.lower().replace(" ", "")
                for row_text in ui_full_text_values:
                    row_text_normalized = row_text.replace(" ", "")
                    if source_lower in row_text_normalized:
                        matched_values.append(source_val)
                        break

        # Also check numeric matches (important for amounts)
        numeric_matches = 0
        for source_num in source_numeric_values:
            if source_num in ui_numeric_values:
                numeric_matches += 1
                if str(int(source_num)) not in matched_values:
                    matched_values.append(str(int(source_num)))

        details["values_matched"] = matched_values[:10]
        details["rows_matched"] = len(matched_values)

        # Create sample comparisons for reporting
        for i, row in enumerate(source_rows[:3]):
            row_matched = []
            for val in row:
                normalized = self._normalize_value(str(val))
                # Check exact match or substring match for multi-word values
                found_in_ui = normalized in ui_all_values
                if not found_in_ui:
                    val_lower = normalized.lower().replace(" ", "")
                    for row_text in ui_full_text_values:
                        if val_lower in row_text.replace(" ", ""):
                            found_in_ui = True
                            break
                row_matched.append({
                    "value": str(val),
                    "found_in_ui": found_in_ui
                })
            details["sample_comparisons"].append({
                "source_row": i,
                "values": row_matched,
                "all_matched": all(v["found_in_ui"] for v in row_matched)
            })

        # Consider it a match if key values from source are found in UI
        # At least 50% of source values should be found, or at least 2 values
        min_matches = max(2, len(source_key_values) // 2)
        matches = len(matched_values) >= min(min_matches, len(source_key_values))

        return matches, details

    def _normalize_value(self, value: str) -> str:
        """Normalize a value for comparison (handle formatting differences)."""
        if not value:
            return ""
        # Remove commas from numbers, strip whitespace, lowercase
        normalized = value.strip().replace(",", "").replace(" ", "").lower()
        # Remove percentage signs and currency symbols
        normalized = normalized.replace("%", "").replace("rs.", "").replace("rs", "")
        return normalized

    def _add_year_to_url(self, base_url: str, year: int) -> str:
        """Add year-specific date filters to the URL.

        Transforms URL to include startDate and endDate parameters for the year.
        """
        from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

        parsed = urlparse(base_url)
        params = parse_qs(parsed.query)

        # Set year-specific date range
        params['startDate'] = [f'{year}-01-01']
        params['endDate'] = [f'{year}-12-31']

        # Rebuild URL with updated params
        new_query = urlencode(params, doseq=True)
        new_url = urlunparse((
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            parsed.params,
            new_query,
            parsed.fragment
        ))

        return new_url

    def run(
        self,
        app_url: str,
        datasets: list[dict],
        years: Optional[list[int]] = None,
        source_data_map: Optional[dict[str, dict]] = None
    ) -> list[UICheckResult]:
        """Run UI visibility checks for all datasets.

        Args:
            app_url: The application URL
            datasets: List of dataset configurations
            years: Optional list of years to check (creates year-specific URLs)
            source_data_map: Optional dict mapping dataset names to their source data
                             for comparison (from data_integrity phase)
        """
        results = []
        source_data_map = source_data_map or {}

        for dataset_config in datasets:
            dataset_name = dataset_config.get("name", "")

            if years:
                # Run for each year with year-specific URL
                for year in years:
                    year_dataset_name = f"{dataset_name} ({year})"
                    source_data = source_data_map.get(year_dataset_name)
                    result = self.check_dataset_visibility(
                        app_url, dataset_config, source_data, year
                    )
                    results.append(result)
            else:
                # Run without year filter
                source_data = source_data_map.get(dataset_name)
                result = self.check_dataset_visibility(app_url, dataset_config, source_data)
                results.append(result)

        return results
