from . import search_entities, get_entity_metadata, get_entity_attribute, get_entity_relations


def register_all(mcp, client):
    search_entities.register(mcp, client)
    get_entity_metadata.register(mcp, client)
    get_entity_attribute.register(mcp, client)
    get_entity_relations.register(mcp, client)
