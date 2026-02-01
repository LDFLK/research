"""Action logger with full observability for audit operations."""

import json
import os
import uuid
from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Any, Optional, Literal
from pathlib import Path


@dataclass
class Target:
    """Target of an action."""
    url: Optional[str] = None
    selector: Optional[str] = None

    def to_dict(self) -> dict:
        return {k: v for k, v in asdict(self).items() if v is not None}


@dataclass
class Request:
    """HTTP request details."""
    method: str = "GET"
    headers: dict = field(default_factory=dict)
    body: Optional[str] = None

    def to_dict(self) -> dict:
        result = {"method": self.method, "headers": self.headers}
        if self.body:
            result["body"] = self.body
        return result


@dataclass
class Response:
    """HTTP response details."""
    status_code: int
    headers: dict = field(default_factory=dict)
    body_preview: str = ""
    body_full: str = ""
    body_size: int = 0

    def to_dict(self) -> dict:
        return {
            "status_code": self.status_code,
            "headers": self.headers,
            "body_preview": self.body_preview[:500] if self.body_preview else "",
            "body_full": self.body_full,
            "body_size": self.body_size
        }


@dataclass
class Extraction:
    """Data extraction details."""
    method: Literal["json_parse", "text_search", "element_list", "xpath", "css_selector"]
    query: str
    result: Any = None
    found: bool = False

    def to_dict(self) -> dict:
        return {
            "method": self.method,
            "query": self.query,
            "result": self.result,
            "found": self.found
        }


@dataclass
class Action:
    """A single logged action in the audit process."""
    id: str
    timestamp: str
    phase: str
    action_type: Literal["http_fetch", "selenium_navigate", "selenium_click",
                         "selenium_extract", "selenium_wait", "validation"]
    target: Optional[Target] = None
    request: Optional[Request] = None
    response: Optional[Response] = None
    extraction: Optional[Extraction] = None
    duration_ms: int = 0
    status: Literal["success", "failure"] = "success"
    error: Optional[str] = None
    metadata: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        result = {
            "id": self.id,
            "timestamp": self.timestamp,
            "phase": self.phase,
            "action_type": self.action_type,
            "duration_ms": self.duration_ms,
            "status": self.status,
        }
        if self.target:
            result["target"] = self.target.to_dict()
        if self.request:
            result["request"] = self.request.to_dict()
        if self.response:
            result["response"] = self.response.to_dict()
        if self.extraction:
            result["extraction"] = self.extraction.to_dict()
        if self.error:
            result["error"] = self.error
        if self.metadata:
            result["metadata"] = self.metadata
        return result


class ActionLogger:
    """Logger that records all audit actions with full observability."""

    def __init__(self, run_id: str, output_dir: str = "./audit-results"):
        self.run_id = run_id
        self.output_dir = Path(output_dir) / run_id
        self.actions: list[Action] = []
        self.action_counter = 0
        self.started_at = datetime.utcnow().isoformat() + "Z"

        # Create output directory
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def _generate_action_id(self) -> str:
        self.action_counter += 1
        return f"action_{self.action_counter:04d}"

    def log_action(
        self,
        phase: str,
        action_type: str,
        target: Optional[Target] = None,
        request: Optional[Request] = None,
        response: Optional[Response] = None,
        extraction: Optional[Extraction] = None,
        duration_ms: int = 0,
        status: str = "success",
        error: Optional[str] = None,
        metadata: Optional[dict] = None
    ) -> Action:
        """Log a single action with all details."""
        action = Action(
            id=self._generate_action_id(),
            timestamp=datetime.utcnow().isoformat() + "Z",
            phase=phase,
            action_type=action_type,
            target=target,
            request=request,
            response=response,
            extraction=extraction,
            duration_ms=duration_ms,
            status=status,
            error=error,
            metadata=metadata or {}
        )
        self.actions.append(action)
        return action

    def save_actions(self) -> Path:
        """Save all actions to JSON file."""
        actions_file = self.output_dir / "actions.json"
        with open(actions_file, "w") as f:
            json.dump([a.to_dict() for a in self.actions], f, indent=2)
        return actions_file

    def save_manifest(self, config: dict, summary: dict) -> Path:
        """Save run manifest with metadata."""
        manifest = {
            "run_id": self.run_id,
            "started_at": self.started_at,
            "completed_at": datetime.utcnow().isoformat() + "Z",
            "config": config,
            "summary": summary
        }
        manifest_file = self.output_dir / "manifest.json"
        with open(manifest_file, "w") as f:
            json.dump(manifest, f, indent=2)
        return manifest_file

    def save_report(self, report: dict) -> Path:
        """Save final audit report."""
        report_file = self.output_dir / "report.json"
        with open(report_file, "w") as f:
            json.dump(report, f, indent=2)
        return report_file

    def get_summary(self) -> dict:
        """Get summary statistics of logged actions."""
        successful = sum(1 for a in self.actions if a.status == "success")
        failed = sum(1 for a in self.actions if a.status == "failure")
        return {
            "total_actions": len(self.actions),
            "successful": successful,
            "failed": failed
        }


def generate_run_id() -> str:
    """Generate a unique run ID based on timestamp."""
    return f"audit_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
