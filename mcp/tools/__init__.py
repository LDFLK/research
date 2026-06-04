from . import search_entities, get_entity_metadata, get_entity_attribute, get_entity_relations


def register_all(mcp, client, governance):
    search_entities.register(mcp, client, governance)
    get_entity_metadata.register(mcp, client, governance)
    get_entity_attribute.register(mcp, client, governance)
    get_entity_relations.register(mcp, client, governance)
