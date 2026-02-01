"""Generic audit workflow orchestrating all phases for any topic."""

import json
from typing import Optional
from dataclasses import dataclass, field, asdict
from pathlib import Path

from core.logger import ActionLogger, generate_run_id
from phases.source_discovery import SourceDiscoveryPhase, DatasetSourceInfo
from phases.app_visibility import AppVisibilityPhase, UICheckResult
from phases.data_integrity import DataIntegrityPhase, DataIntegrityResult


@dataclass
class DatasetAuditResult:
    """Complete audit result for a single dataset."""
    dataset_name: str
    source_discovery: Optional[DatasetSourceInfo] = None
    app_visibility: Optional[UICheckResult] = None
    data_integrity: Optional[DataIntegrityResult] = None

    @property
    def passed(self) -> bool:
        """Check if all phases passed for this dataset."""
        passed = True
        if self.source_discovery:
            passed = passed and self.source_discovery.exists
        if self.data_integrity:
            passed = passed and self.data_integrity.passed
        if self.app_visibility:
            passed = passed and self.app_visibility.visible
        return passed


@dataclass
class AuditReport:
    """Complete audit report."""
    run_id: str
    platform: str
    name: str
    description: str
    config: dict
    datasets: list[DatasetAuditResult] = field(default_factory=list)
    summary: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        """Convert report to dictionary."""
        return {
            "run_id": self.run_id,
            "platform": self.platform,
            "name": self.name,
            "description": self.description,
            "config": self.config,
            "summary": self.summary,
            "datasets": [
                {
                    "dataset_name": d.dataset_name,
                    "passed": d.passed,
                    "source_discovery": asdict(d.source_discovery) if d.source_discovery else None,
                    "app_visibility": asdict(d.app_visibility) if d.app_visibility else None,
                    "data_integrity": asdict(d.data_integrity) if d.data_integrity else None
                }
                for d in self.datasets
            ]
        }


class AuditWorkflow:
    """Generic audit workflow orchestrating all phases.

    This workflow audits datasets from a platform based on the configuration
    file provided. Each dataset has its own category and navigation tree path.

    The config file defines:
    - platform: The platform name (e.g., "OpenGINXplore")
    - name: Human-readable name for the audit
    - app_url: Web application URL for UI verification
    - years: Years to audit
    - datasets: Dataset definitions with:
        - category: The category in the UI (e.g., "Tourism", "Immigration And Emigration")
        - navigation.tree_path: The tree path to reach the dataset
        - validations: Data quality rules
    """

    def __init__(
        self,
        config_path: str = "./config/datasets.json",
        output_dir: str = "./audit-results",
        run_id: Optional[str] = None
    ):
        self.config_path = Path(config_path)
        self.output_dir = output_dir
        self.run_id = run_id or generate_run_id()
        self.logger = ActionLogger(self.run_id, output_dir)
        self.config = self._load_config()

    def _load_config(self) -> dict:
        """Load configuration from JSON file."""
        if self.config_path.exists():
            with open(self.config_path) as f:
                return json.load(f)
        return {
            "platform": "unknown",
            "name": "Unknown Audit",
            "datasets": [],
            "app_url": "",
            "years": []
        }

    @property
    def platform(self) -> str:
        """Get the platform being audited."""
        return self.config.get("platform", "unknown")

    @property
    def description(self) -> str:
        """Get the description of this audit."""
        return self.config.get("description", "")

    @property
    def name(self) -> str:
        """Get the human-readable name for this audit."""
        return self.config.get("name", "Audit")

    def run(
        self,
        datasets: Optional[list[str]] = None,
        years: Optional[list[int]] = None,
        phases: Optional[list[str]] = None,
        headless: bool = True,
        app_url: Optional[str] = None
    ) -> AuditReport:
        """Run the complete audit workflow."""
        # Filter datasets if specified
        all_datasets = self.config.get("datasets", [])
        if datasets:
            all_datasets = [d for d in all_datasets if d.get("name") in datasets]

        # Use specified years or config years
        audit_years = years or self.config.get("years", [])

        # Use specified app URL or config app URL
        audit_app_url = app_url or self.config.get("app_url", "")

        # Determine which phases to run
        run_phases = phases or ["source_discovery", "data_integrity", "app_visibility"]

        # Build config for logging
        audit_config = {
            "datasets": [d.get("name") for d in all_datasets],
            "years": audit_years,
            "phases": run_phases,
            "app_url": audit_app_url
        }

        report = AuditReport(
            run_id=self.run_id,
            platform=self.platform,
            name=self.name,
            description=self.description,
            config=audit_config
        )

        # Run phases
        source_results = {}
        if "source_discovery" in run_phases:
            phase = SourceDiscoveryPhase(self.logger)
            for result in phase.run(all_datasets, audit_years):
                source_results[result.dataset_name] = result

        integrity_results = {}
        if "data_integrity" in run_phases:
            phase = DataIntegrityPhase(self.logger)
            for result in phase.run(all_datasets, audit_years):
                integrity_results[result.dataset_name] = result

        visibility_results = {}
        if "app_visibility" in run_phases and audit_app_url:
            # Build source data map from integrity results for comparison
            source_data_map = {}
            for name, result in integrity_results.items():
                if result.sample_data:
                    # Use sample_data for comparison
                    source_data_map[name] = {
                        "columns": result.columns,
                        "rows": result.sample_data
                    }

            phase = AppVisibilityPhase(self.logger, headless=headless)
            for result in phase.run(audit_app_url, all_datasets, audit_years, source_data_map):
                visibility_results[result.dataset_name] = result

        # Combine results by dataset
        # All phases now have year suffixes like "Dataset (2023)"
        dataset_names = set(
            list(source_results.keys()) +
            list(integrity_results.keys()) +
            list(visibility_results.keys())
        )

        for name in dataset_names:
            audit_result = DatasetAuditResult(
                dataset_name=name,
                source_discovery=source_results.get(name),
                data_integrity=integrity_results.get(name),
                app_visibility=visibility_results.get(name)
            )
            report.datasets.append(audit_result)

        # Calculate summary
        action_summary = self.logger.get_summary()
        report.summary = {
            **action_summary,
            "datasets_total": len(report.datasets),
            "datasets_passed": sum(1 for d in report.datasets if d.passed),
            "datasets_failed": sum(1 for d in report.datasets if not d.passed)
        }

        # Save results
        self.logger.save_actions()
        self.logger.save_manifest(
            {
                **audit_config,
                "platform": self.platform,
                "name": self.name,
                "description": self.description
            },
            report.summary
        )
        self.logger.save_report(report.to_dict())

        return report

    def run_source_discovery_only(
        self,
        datasets: Optional[list[str]] = None,
        years: Optional[list[int]] = None
    ) -> list[DatasetSourceInfo]:
        """Run only source discovery phase."""
        all_datasets = self.config.get("datasets", [])
        if datasets:
            all_datasets = [d for d in all_datasets if d.get("name") in datasets]

        audit_years = years or self.config.get("years", [])

        phase = SourceDiscoveryPhase(self.logger)
        results = phase.run(all_datasets, audit_years)

        self.logger.save_actions()
        return results

    def run_data_integrity_only(
        self,
        datasets: Optional[list[str]] = None,
        years: Optional[list[int]] = None
    ) -> list[DataIntegrityResult]:
        """Run only data integrity phase."""
        all_datasets = self.config.get("datasets", [])
        if datasets:
            all_datasets = [d for d in all_datasets if d.get("name") in datasets]

        audit_years = years or self.config.get("years", [])

        phase = DataIntegrityPhase(self.logger)
        results = phase.run(all_datasets, audit_years)

        self.logger.save_actions()
        return results

    def run_app_visibility_only(
        self,
        datasets: Optional[list[str]] = None,
        app_url: Optional[str] = None,
        headless: bool = True
    ) -> list[UICheckResult]:
        """Run only app visibility phase."""
        all_datasets = self.config.get("datasets", [])
        if datasets:
            all_datasets = [d for d in all_datasets if d.get("name") in datasets]

        audit_app_url = app_url or self.config.get("app_url", "")

        phase = AppVisibilityPhase(self.logger, headless=headless)
        results = phase.run(audit_app_url, all_datasets)

        self.logger.save_actions()
        return results


# Backward compatibility alias
TourismAuditWorkflow = AuditWorkflow
