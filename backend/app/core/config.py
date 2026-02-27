from pydantic_settings import BaseSettings
from typing import List, Dict, Optional

class Settings(BaseSettings):
    read_api_url: str
    groq_api_key: str
    llm_model: str = "openai/gpt-oss-120b"
    max_tokens: int = 3000

    entity_kinds: List[Dict[str, str]] = [
        {"major": "Document", "minor": "extgztorg"},
        {"major": "Document", "minor": "extgztperson"},
        {"major": "Person", "minor": "citizen"},
        {"major": "Organisation", "minor": "cabinetMinister"},
        {"major": "Organisation", "minor": "stateMinister"},
        {"major": "Organisation", "minor": "department"},
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
    4. Both 'Organisation.cabinetMinister' and 'Organisation.stateMinister' roles coexist and connect to Departments ('Organisation.department') via 'AS_DEPARTMENT'.
    5. Ministers have specific appointments via 'AS_APPOINTED' pointing to Persons ('Person.citizen').
    6. Minister roles may have 'RENAMED_TO' relationships to indicate office continuity or succession.
    7. Departments may have multiple incoming 'AS_DEPARTMENT' relations reflecting shifts between ministries over time.
    """

    class Config:
        env_file = ".env"

settings = Settings()
