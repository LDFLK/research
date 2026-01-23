---
sidebar_position: 4
---

# API Reference

The GztProcessor provides a FastAPI backend with endpoints for managing gazette data and state.

## Starting the API

```bash
cd gazettes/preprocess
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`

## MinDep Endpoints

### State Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mindep/state/latest` | GET | Get latest saved state (gazette number, date, state) |
| `/mindep/state/{date}` | GET | Get state(s) for a specific date |
| `/mindep/state/{date}/{gazette_number}` | GET | Get specific state by date and gazette number |
| `/mindep/state/reset` | DELETE | Delete all MinDep state files and DB |

### Gazette Processing

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mindep/initial/{date}/{gazette_number}` | GET | Preview contents of initial gazette |
| `/mindep/initial/{date}/{gazette_number}` | POST | Create initial state in DB and save snapshot |
| `/mindep/amendment/{date}/{gazette_number}` | GET | Detect transactions from amendment |
| `/mindep/amendment/{date}/{gazette_number}` | POST | Apply confirmed transactions to DB |

### Example: Create Initial State

**Request:**
```bash
curl -X POST "http://127.0.0.1:8000/mindep/initial/2022-07-22/2289-43" \
  -H "Content-Type: application/json" \
  -d '{
    "ministers": [
      {
        "name": "Ministry of Finance",
        "departments": [
          { "name": "Department of Treasury" },
          { "name": "Inland Revenue" }
        ]
      }
    ]
  }'
```

### Example: Apply Amendment

**Request:**
```bash
curl -X POST "http://127.0.0.1:8000/mindep/amendment/2022-09-16/2297-78" \
  -H "Content-Type: application/json" \
  -d '{
    "transactions": {
      "moves": [],
      "adds": [
        { "ministry": "Ministry of Finance", "department": "New Dept" }
      ],
      "terminates": []
    }
  }'
```

## Person Endpoints

### State Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/person/state/latest` | GET | Get latest saved persons and portfolios |
| `/person/state/{date}` | GET | Get state(s) for a specific date |
| `/person/state/{date}/{gazette_number}` | GET | Get specific person state by date and gazette number |
| `/person/state/reset` | DELETE | Delete all Person state files and DB |

### Gazette Processing

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/person/{date}/{gazette_number}` | GET | Preview predicted transactions from person gazette |
| `/person/{date}/{gazette_number}` | POST | Apply reviewed transactions to DB |

### Example: Apply Person Transactions

**Request:**
```bash
curl -X POST "http://127.0.0.1:8000/person/2022-07-22/2067-09" \
  -H "Content-Type: application/json" \
  -d '{
    "transactions": {
      "moves": [],
      "adds": [
        {
          "person": "Hon. John Doe",
          "ministry": "Ministry of Finance",
          "position": "Minister"
        }
      ],
      "terminates": []
    }
  }'
```

## Transaction Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/transactions/` | GET | Get all transactions |

## Health Check

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check/status message |

## Function Mapping

| Endpoint Type | Main Functions Called | Purpose |
|---------------|----------------------|---------|
| MinDep Initial | `extract_initial_gazette_data`, `load_initial_state_to_db` | Extract/load initial ministry structure |
| MinDep Amendment | `process_amendment_gazette`, `apply_transactions_to_db` | Detect/apply department changes |
| Person Gazette | `process_person_gazette`, `apply_transactions_to_db` | Detect/apply person-portfolio changes |
| State Management | `get_latest_state`, `get_state_by_date`, `load_state`, `clear_all_state_data` | Manage and reset state snapshots |

## Error Handling

The API returns JSON error messages for:
- Missing files
- Invalid requests
- Resources not found

Always check the response for an `error` key if your request fails.

```json
{
  "error": "State file not found for date 2022-01-01"
}
```
