# OpenGIN Bot

OpenGIN (Open General Information Network) Bot is a system for querying temporal graph databases through a chat interface. It consists of a Next.js frontend and a FastAPI backend using LangGraph for agent orchestration.

## Functionality

The bot processes natural language queries by executing a multi-step workflow defined in LangGraph. It uses specific tools to interact with a temporal graph API:

- **Entity Search**: Resolves entities by name, ID, or category (Major/Minor).
- **Temporal Relations**: Retrieves relationships with filters for `active_at`, `start_time`, and `end_time`.
- **Attribute Retrieval**: Fetches dataset values for specific entity categories.
- **Batch Processing**: Parallel execution of entity, relation, and attribute searches to optimize performance.

## Context and Memory Management

The backend implements several logic-driven strategies to manage AI context and token efficiency:

- **Topic Shift Detection**: Uses a secondary LLM to detect if a new question is a follow-up or a new subject.
- **State Purging**: Automatically resets the knowledge pool, entity cache, and message history when a topic shift is detected using `RemoveMessage`.
- **Fact Distillation**: Converts raw JSON tool outputs into concise, multi-part "facts" stored in a synthesized knowledge pool (limited to the 15 most recent facts).
- **Entity Cache**: Maintains a mapping of internal graph IDs to human-readable names to reduce redundancy in prompts.
- **Tiered Truncation**: Dynamically truncates older tool results in the message history while keeping fresh data intact for the current reasoning step.
- **Sliding Context Window**: Limits active conversation history to the most recent 10 messages for non-shifting queries.

## Technology Stack

### Backend
- **Framework**: FastAPI
- **Orchestration**: LangGraph and LangChain
- **Validation**: Pydantic
- **Runtime**: Python 3.10+

### Frontend
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Markdown**: React Markdown with GFM support
- **Language**: TypeScript

## Project Structure

```text
.
├── app/                # Next.js frontend
│   ├── page.tsx        # Chat interface logic and UI
│   └── globals.css     # CSS and Tailwind configuration
├── backend/            # Python FastAPI backend
│   ├── app/
│   │   ├── main.py     # API entry point and CORS configuration
│   │   ├── graph/      # LangGraph state and node definitions
│   │   │   ├── nodes/  # Agent and Tool implementations
│   │   │   └── state.py# Persistence and message state
│   │   └── services/   # Graph API client integration
│   └── requirements.txt
└── README.md
```

## Setup and Installation

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   python -m app.main
   ```
   The backend runs on `http://localhost:9000`.

### Frontend

1. Navigate to the root directory:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend runs on `http://localhost:3000`.
