"""
Configuration for the OpenGIN MCP server.
All settings are read from environment variables (optionally loaded from .env).
"""
import os
from dotenv import load_dotenv
from mcp_governance.layer import GovernanceConfig
from client.transport import OpenGINTransportConfig

load_dotenv()

# Base URL of the OpenGIN Read API, e.g. http://localhost:8081/v1
OPENGIN_READ_API_URL: str = os.environ.get("OPENGIN_READ_API_URL", "http://localhost:8081/v1").rstrip("/")

# Add the values you need to override in .env file
OPENGIN_TRANSPORT_CONFIG = OpenGINTransportConfig(
    max_retries          = int(os.environ.get("TRANSPORT_MAX_RETRIES", 3)),
    total_timeout        = float(os.environ.get("TRANSPORT_TOTAL_TIMEOUT", 30.0)),
    connect_timeout      = float(os.environ.get("TRANSPORT_CONNECT_TIMEOUT", 2.0)),
    read_timeout         = float(os.environ.get("TRANSPORT_READ_TIMEOUT", 5.0)),
    max_concurrency      = int(os.environ.get("TRANSPORT_MAX_CONCURRENCY", 10)),
    cb_failure_threshold = int(os.environ.get("TRANSPORT_CB_FAILURE_THRESHOLD", 5)),
    cb_recovery_timeout  = float(os.environ.get("TRANSPORT_CB_RECOVERY_TIMEOUT", 30.0))
)

GOVERNANCE_CONFIG = GovernanceConfig(
    rate_limit_calls  = int(os.environ.get("GOVERNANCE_RATE_LIMIT_CALLS", 30)),
    rate_limit_window = float(os.environ.get("GOVERNANCE_RATE_LIMIT_WINDOW", 60.0)),
    max_concurrency   = int(os.environ.get("GOVERNANCE_MAX_CONCURRENCY", 5)),
    session_budget    = int(os.environ.get("GOVERNANCE_SESSION_BUDGET", 500)),
    max_string_length = int(os.environ.get("GOVERNANCE_MAX_STRING_LENGTH", 1000)),
)