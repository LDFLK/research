# OpenGIN Bot Backend

FastAPI service for querying temporal graph databases using LangGraph orchestration.

## Implementation Details

- **Graph Engine**: Uses LangGraph to manage agent state and conditional routing between nodes.
- **Persistence**: Implements `MemorySaver` for session-based conversation history.
- **Tools**: Includes specialized tools for entity search, temporal relation retrieval, and attribute fetching.
- **State Management**: Orchestrates topic shift detection, state purging using `RemoveMessage`, and fact distillation to manage context.
- **Context Optimization**: Implements tiered tool response truncation and a sliding message window.
- **Protocol**: Exposes a POST `/chat` endpoint for processing user questions.

## Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Configuration**:
   Configure the `.env` file with required API keys and connection strings.

3. **Execution**:
   ```bash
   python -m app.main
   ```
   The service listens on port `9000`.

## API Reference

### POST `/chat`
Request body:
```json
{
  "question": "string",
  "session_id": "string"
}
```
Returns a JSON object with the agent's answer and the session context.
