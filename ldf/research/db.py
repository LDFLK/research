from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, create_engine, Session

import os

# Database Setup
sqlite_file_name = "research.db"
# Ensure we map this to a persistent volume in Docker
base_dir = os.getcwd()
db_path = os.path.join(base_dir, "data", sqlite_file_name)
sqlite_url = f"sqlite:///{db_path}"

engine = create_engine(sqlite_url, echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

# Models

class TelemetryLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    doc_id: str = Field(index=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    model: str
    input_tokens: int
    output_tokens: int
    latency_ms: int
    status: str # "SUCCESS" or "FAIL"
    cost_usd: Optional[float] = None

class ActMetadata(SQLModel, table=True):
    doc_id: str = Field(primary_key=True)
    doc_type: str
    num: str
    date_str: str
    description: str
    url_metadata: Optional[str] = None
    lang: str
    url_pdf: Optional[str] = None
    doc_number: Optional[str] = None
    domain: Optional[str] = None
    year: str
