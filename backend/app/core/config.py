from pydantic_settings import BaseSettings
from typing import List, Dict, Optional

class Settings(BaseSettings):
    read_api_url: str
    groq_api_key: str
    llm_model: str = "openai/gpt-oss-safeguard-20b"
    max_tokens: int = 3000

    entity_kinds: List[Dict[str, str]] = [
        {"major": "Document", "minor": "extgztorg"},
        {"major": "Document", "minor": "extgztperson"},
        {"major": "Person", "minor": "citizen"},
        {"major": "Organisation", "minor": "department"},
        {"major": "Organisation", "minor": "minister"},
        {"major": "Category", "minor": "parentCategory"},
        {"major": "Dataset", "minor": "tabular"}
    ]

    relationship_types: List[str] = [
        "AS_PRESIDENT",
        "AS_MINISTER",
        "AS_DEPARTMENT",
        "AS_APPOINTED",
        "RENAMED_TO",
        "AS_CATEGORY",
        "IS_ATTRIBUTE"
    ]

    special_entities: Dict[str, str] = {
        "governmentRoot": "gov_01"
    }

    graph_hierarchy: str = """
    Graph Hierarchy Rules:
    1. 'gov_01' is the Government Root entity.
    2. Root ('gov_01') connects to Presidents via 'AS_PRESIDENT' relationship.
    3. Presidents issue Ministers via 'AS_MINISTER' relationship.
    4. Ministers connect to Departments via 'AS_DEPARTMENT'.
    5. Ministers have specific appointments via 'AS_APPOINTED'.
    """

    class Config:
        env_file = ".env"

settings = Settings()
