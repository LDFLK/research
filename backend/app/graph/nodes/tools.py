from typing import Optional, Dict, Any, List
from langchain_core.tools import tool
from pydantic import BaseModel, Field
from app.services.graph_api import graph_client
import json

@tool
async def search_entities(
    id: Optional[str] = None,
    major: Optional[str] = None,
    minor: Optional[str] = None,
    name: Optional[str] = None,
    kind: Optional[Dict[str, str]] = None,
    created: Optional[str] = None,
    terminated: Optional[str] = None
) -> str:
    """Search for entities in the temporal graph database.
    STRICT RULES:
    1. EXCLUSIVELY use 'name' and 'major/minor' kinds for entity search. 
    2. NEVER use 'active_at' here; that parameter is ONLY for relations.
    3. DO NOT search by Category (Major/Minor) alone; always provide a 'name'.
    """
    # Extract from 'kind' dict if agent nested them (common hallucination)
    if kind:
        major = major or kind.get("major")
        minor = minor or kind.get("minor")

    # Fail fast before calling the API
    if not id and not major:
        return json.dumps({
            "error": "Invalid search criteria",
            "details": "The API requires either an 'id' or a 'major' category. Please specify 'major' (e.g., 'Person', 'Organisation')."
        })

    params = {}
    if id: params["id"] = id
    
    # Auto-fix dots: 'Organisation.minister' -> major='Organisation', minor='minister'
    if major and "." in major:
        parts = major.split(".", 1)
        major = parts[0]
        minor = minor or parts[1]

    kind_params = {}
    if major: kind_params["major"] = major
    if minor: kind_params["minor"] = minor
    if kind_params: params["kind"] = kind_params

    if name: params["name"] = name
    if created: params["created"] = created
    if terminated: params["terminated"] = terminated
    
    try:
        result = await graph_client.search_entities(params)
    except Exception as e:
        return json.dumps({
            "error": "API search failed",
            "details": str(e),
            "params": params
        })
    
    # Limit results to 20 to prevent 413 Payload Too Large errors
    if isinstance(result, list) and len(result) > 20:
        truncated_result = result[:20]
        return json.dumps({
            "warning": f"Truncated results: Showing 20 of {len(result)} entities found.",
            "results": [{"id": item.get("id"), "name": graph_client.decode_protobuf_name(item.get("name")), "kind": item.get("kind")} for item in truncated_result]
        })
    
    # Ensure ID and Name are easy to find for extraction logic
    if isinstance(result, list):
        formatted = [{"id": item.get("id"), "name": graph_client.decode_protobuf_name(item.get("name")), "kind": item.get("kind")} for item in result]
        return json.dumps(formatted)
        
    return json.dumps(result)

@tool
async def get_entity_relations(
    entity_id: str,
    relationship_name: Optional[str] = None,
    related_entity_id: Optional[str] = None,
    active_at: Optional[str] = None,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    direction: Optional[str] = None
) -> str:
    """Get relationships for a specific entity with temporal information (startTime, endTime)."""
    body = {}
    if relationship_name: body["name"] = relationship_name
    if related_entity_id: body["relatedEntityId"] = related_entity_id
    if active_at: body["activeAt"] = active_at
    if start_time: body["startTime"] = start_time
    if end_time: body["endTime"] = end_time
    if direction: body["direction"] = direction
    
    try:
        result = await graph_client.get_relations(entity_id, body if body else None)
    except Exception as e:
        return json.dumps({
            "error": "Failed to get relations",
            "details": str(e),
            "entity_id": entity_id,
            "body": body
        })
    
    # Hint for the agent if many IDs are found
    if isinstance(result, list) and len(result) > 0:
        return json.dumps({
            "count": len(result),
            "results": result
        })
        
    return json.dumps(result)

@tool
async def get_entity_attributes(
    category_id: str,
    dataset_name: str
) -> str:
    """Get the specific value for an attribute from a dataset."""
    try:
        result = await graph_client.get_attributes(category_id, dataset_name)
        return json.dumps(result)
    except Exception as e:
        return json.dumps({
            "error": "Attribute not found or API error",
            "details": str(e),
            "category_id": category_id,
            "dataset_name": dataset_name
        })

@tool
async def batch_search_entities(
    queries: List[Dict[str, Any]]
) -> str:
    """Resolve or search for multiple entities in parallel. 
    Each query dict can contain: 'id', 'major', 'minor', 'name', 'kind', 'created', 'terminated'.
    STRICT RULE: Do NOT use 'active_at' in entity search queries.
    """
    import asyncio
    
    tasks = [search_entities.ainvoke(q) for q in queries]
    results = await asyncio.gather(*tasks)
    
    combined = []
    for q, res in zip(queries, results):
        try:
            data = json.loads(res)
            combined.append({
                "query": q,
                "results": data
            })
        except:
            combined.append({"query": q, "error": "Search failed"})
            
    return json.dumps(combined)

# Note: batch_search_entities_by_name is now redundant but kept for back-compat if needed.
# However, batch_search_entities is now the preferred multi-query tool.

@tool
async def batch_get_entity_relations(
    queries: List[Dict[str, Any]]
) -> str:
    """Fetch relations for multiple entities in parallel. 
    Each query dict can contain: 'entity_id', 'relationship_name', 'related_entity_id', 'active_at', 'start_time', 'end_time', 'direction'.
    """
    import asyncio
    
    tasks = [get_entity_relations.ainvoke(q) for q in queries]
    results = await asyncio.gather(*tasks)
    
    combined = {}
    for q, res in zip(queries, results):
        eid = q.get("entity_id", "unknown")
        try:
            combined[eid] = json.loads(res)
        except:
            combined[eid] = {"error": "Failed to parse"}
            
    return json.dumps(combined)

@tool
async def batch_get_entity_attributes(
    queries: List[Dict[str, str]]
) -> str:
    """Fetch attribute values for multiple entities in parallel.
    Each query dict must contain 'category_id' and 'dataset_name'.
    Use this when you have multiple metadata nodes and need to fetch their actual data values at once.
    """
    import asyncio
    
    async def safe_get_attributes(category_id, dataset_name):
        try:
            return await graph_client.get_attributes(category_id, dataset_name)
        except Exception as e:
            return {"error": str(e)}

    tasks = [safe_get_attributes(q.get("category_id"), q.get("dataset_name")) for q in queries]
    results = await asyncio.gather(*tasks)
    
    combined = []
    for q, res in zip(queries, results):
        combined.append({
            "category_id": q.get("category_id"),
            "dataset_name": q.get("dataset_name"),
            "data": res
        })
            
    return json.dumps(combined)

# List of tools to be used in the graph
tools = [
    search_entities, 
    get_entity_relations, 
    get_entity_attributes, 
    batch_search_entities, 
    batch_get_entity_relations,
    batch_get_entity_attributes
]
