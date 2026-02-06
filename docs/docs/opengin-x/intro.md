---
sidebar_position: 1
---

# Introduction

<span className="status-badge status-badge--alpha">ALPHA</span><span className="status-text">Early Development</span>

**OpenGIN-X** is an interactive query UI for exploring the OpenGIN Data Catalog. It provides a unified interface to browse, query, and visualize polyglot data in multiple formats — JSON, tabular, or graph — depending on the underlying data structure.

:::note
OpenGIN-X is distinct from the "OpenGINXplore" project. While OpenGINXplore is a data visualization platform for end users, OpenGIN-X is a developer/analyst tool for exploring raw data in the OpenGIN Data Catalog.
:::

## Overview

OpenGIN-X serves as a query interface to the OpenGIN Data Platform, enabling users to:

- **Search** the data catalog for entities by ID, kind, or name
- **View metadata** and raw entity information
- **Fetch attribute values** displayed as tabular data or raw JSON
- **Query relationships** between entities in the knowledge graph
- **Explore category hierarchies** and discover available datasets

## What is OpenGIN-X?

OpenGIN-X is designed for developers, data analysts, and administrators who need to:

1. **Explore the Data Catalog**: Understand what data exists in OpenGIN
2. **Debug Data Issues**: Inspect raw API responses and entity relationships
3. **Query the Knowledge Graph**: Navigate entity relationships visually
4. **View Polyglot Data**: See data in its native format (JSON, tables, graphs)

## Why OpenGIN-X?

Working with complex data platforms often requires direct API interaction, which can be cumbersome. OpenGIN-X simplifies this by providing:

1. **Visual Query Builder**: Select query types and fill in parameters through an intuitive UI
2. **Request Inspection**: See the exact API requests being made with cURL commands
3. **Response Visualization**: View responses as formatted JSON trees or tables
4. **Protobuf Decoding**: Automatically decode protobuf-encoded values for human readability

## Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm (comes with Node.js)
- Access to the OpenGIN Data Platform API

### Installation

```bash
# Navigate to the project
cd opengin-x

# Install dependencies
npm install

# Copy environment configuration
cp .env.local.example .env.local

# Configure the API URL in .env.local
# NEXT_PUBLIC_EXTERNAL_API_URL=https://your-api-url/v1/entities
```

### Run the Application

```bash
npm run dev
```

The application will be available at [http://localhost:3006](http://localhost:3006).

## Project Structure

```
opengin-x/
├── app/                    # Next.js app directory
│   ├── page.tsx            # Main page component
│   └── api/proxy/          # API proxy routes
├── components/             # React components
│   ├── QueryPanel.tsx      # Query type selection & parameters
│   ├── ResultsPanel.tsx    # Response display
│   └── ApiLogPanel.tsx     # API call logging
├── lib/                    # Utilities
│   ├── api.ts              # API client functions
│   ├── types.ts            # TypeScript types
│   └── protobuf.ts         # Protobuf decoding
└── .env.local.example      # Environment configuration template
```

## Next Steps

- [Features](./features) - Explore all query types and capabilities
- [Configuration](./configuration) - Configure the application for your environment
- [Usage Guide](./usage) - Learn how to use each feature with examples
