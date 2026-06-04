"""
MCP Tool: search_entities
Maps to POST /entities/search
"""
import json
from mcp_governance import governed

def register(mcp, opengin_client, governance):
    @mcp.tool()
    @governed(governance)
    async def search_entities(
        id: str | None = None,
        kind_major: str | None = None,
        kind_minor: str | None = None,
        name: str | None = None,
        created: str | None = None,
        terminated: str | None = None,
    ) -> str:
        """
        Search for entities in the OpenGIN knowledge graph by ID, kind, name, or date.

        Use this as the FIRST step whenever you need to work with a specific entity but only
        have a name or type — it gives you the entity ID required by all other tools.

        You must provide either:
          - `id`: returns that exact entity (all other fields ignored), OR
          - `kind_major`: required if id is not given (e.g. "Organisation", "Person", "Dataset")

        Optional filters (only apply when id is not given):
          - `kind_minor`: sub-type of the entity (e.g. "cabinetMinister", "citizen", "tabular")
          - `name`: partial name match (case-insensitive)
          - `created`: ISO 8601 datetime — filter by creation date
          - `terminated`: ISO 8601 datetime — filter by termination date

        Returns a string consisting of a list of matching entities, each with: id, kind (major/minor), name, created, terminated.
        """
        try:
            result = await opengin_client.search_entities(
                id=id,
                kind_major=kind_major,
                kind_minor=kind_minor,
                name=name,
                created=created,
                terminated=terminated,
            )
            return json.dumps(result, indent=2)
        except ValueError as e:
            return f"Error: {e}"
