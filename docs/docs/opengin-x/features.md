---
sidebar_position: 2
---

# Features

OpenGIN-X is a query UI for exploring polyglot data in the OpenGIN Data Catalog. It supports viewing data in multiple formats depending on the underlying data structure:

- **JSON**: Raw API responses displayed as expandable trees
- **Tabular**: Structured data displayed as interactive tables
- **Graph**: Entity relationships visualized as hierarchical trees

## Query Types

OpenGIN-X provides five query types for interacting with the OpenGIN Data Platform API.

### 1. Search Entity

Search for entities by ID, kind (major/minor), or name.

**Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| Entity ID | No | Exact entity ID match |
| Kind (Major) | No | Entity type (e.g., "Organisation") |
| Kind (Minor) | No | Entity subtype (e.g., "department") |
| Name | No | Partial name match |

At least one search criteria must be provided.

**Example Request:**
```json
{
  "kind": {
    "major": "Organisation",
    "minor": "department"
  },
  "name": "Budget"
}
```

---

### 2. Metadata

Retrieve metadata for a specific entity.

**Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| Entity ID | Yes | The entity ID to fetch metadata for |

**Response includes:**
- Entity ID, name, kind
- Creation and termination timestamps
- Additional metadata fields

---

### 3. Attributes

Fetch specific attribute values for an entity.

**Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| Entity ID | Yes | The entity to fetch attributes from |
| Attribute Name | Yes | Name of the attribute to retrieve |
| Start Time | No | Filter by time range start |
| End Time | No | Filter by time range end |
| Fields | No | Specific fields to return |

**Response:**
Returns tabular data with columns and rows that can be displayed as a table.

---

### 4. Relations

Query relationships between entities.

**Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| Entity ID | Yes | The entity to query relations for |
| Direction | No | Filter by direction (OUTGOING, INCOMING, or All) |
| Relation Name | No | Filter by relationship name |
| Related Entity ID | No | Filter by specific related entity |
| Active At | No | Point-in-time filter |
| Start/End Time | No | Time range filter (mutually exclusive with Active At) |

**Example Response:**
```json
[
  {
    "id": "6e887f6d-7ce0-4c4d-b7ad-c43bbb26deec",
    "relatedEntityId": "0b7b13ca-8ad9-47ef-a112-4a689e79ae11",
    "name": "AS_CATEGORY",
    "startTime": "2020-08-09T00:00:00Z",
    "endTime": "2022-05-27T00:00:00Z",
    "direction": "OUTGOING"
  }
]
```

---

### 5. Explore Attributes

Discover all attributes by traversing the category hierarchy of an entity.

**Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| Entity ID | Yes | The entity to explore |

**Features:**
- Automatically traverses category relationships
- Displays hierarchical tree structure
- Shows category and dataset counts
- Click on datasets to view tabular data
- Resizable split-pane UI

## Additional Features

### API Request Logging

All API requests are logged with:
- Full cURL commands for debugging
- Request/response timing
- Status codes and error messages

### Polyglot Data Visualization

OpenGIN-X automatically adapts its display based on the data format:

| Data Type | View | Description |
|-----------|------|-------------|
| JSON | Tree View | Expandable JSON tree for complex nested responses |
| JSON | Text View | Raw JSON text for copying/debugging |
| Tabular | Table View | Interactive table with columns and rows |
| Graph | Hierarchy View | Tree structure showing entity relationships |

**Additional features:**
- **Protobuf Decoding**: Automatic decoding of protobuf-encoded values to human-readable format
- **Raw/Decoded Toggle**: Switch between raw API response and decoded view

### Request Inspection

Click "Open" to view the full external API URL, or copy the cURL command to reproduce requests.
