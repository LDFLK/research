"""
OpenGIN MCP Server — entry point.
Creates the FastMCP instance and registers all tools, resources, and prompts.
"""
from fastmcp import FastMCP

from client import OpenGINTransport, OpenGINClient, configure_logging
from mcp_governance import GovernanceLayer

import tools
import prompts
import resources
from config import OPENGIN_READ_API_URL, GOVERNANCE_CONFIG, OPENGIN_TRANSPORT_CONFIG

mcp = FastMCP("OpenGIN")

# configure_logging(log_level="INFO", json_output=True) 
configure_logging(log_level="DEBUG", json_output=False) 

transport = OpenGINTransport(OPENGIN_READ_API_URL, OPENGIN_TRANSPORT_CONFIG)
opengin_client = OpenGINClient(transport)
governance = GovernanceLayer(GOVERNANCE_CONFIG)

tools.register_all(mcp, opengin_client, governance)
prompts.register_all(mcp)
resources.register_all(mcp)


def main():
    print(f"Starting OpenGIN MCP server (API: {OPENGIN_READ_API_URL})")
    mcp.run()


if __name__ == "__main__":
    main()
