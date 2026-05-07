"""
Configuration for the OpenGIN MCP server.
All settings are read from environment variables (optionally loaded from .env).
"""
import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

# Base URL of the OpenGIN Read API, e.g. http://localhost:8081/v1
OPENGIN_READ_API_URL: str = os.environ.get("OPENGIN_READ_API_URL", "http://localhost:8081/v1").rstrip("/")

# Add the values you need to override in .env file
@dataclass
class TransportConfig:
    # ── Retry ──────────────────────────────────────────
    max_retries: int        = int(os.environ.get("TRANSPORT_MAX_RETRIES", 3))

    # ── Timeouts ───────────────────────────────────────
    total_timeout: float    = float(os.environ.get("TRANSPORT_TOTAL_TIMEOUT", 30.0))
    connect_timeout: float  = float(os.environ.get("TRANSPORT_CONNECT_TIMEOUT", 2.0))
    read_timeout: float     = float(os.environ.get("TRANSPORT_READ_TIMEOUT", 5.0))

    # ── Concurrency ────────────────────────────────────
    max_concurrency: int    = int(os.environ.get("TRANSPORT_MAX_CONCURRENCY", 10))

    # ── Circuit Breaker ────────────────────────────────
    cb_failure_threshold: int   = int(os.environ.get("TRANSPORT_CB_FAILURE_THRESHOLD", 5))
    cb_recovery_timeout: float  = float(os.environ.get("TRANSPORT_CB_RECOVERY_TIMEOUT", 30.0))