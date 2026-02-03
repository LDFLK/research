# OpenGIN Explorer

An interactive web-based API exploration tool for browsing entity data, relationships, and attributes in the OpenGIN data platform.

## Prerequisites

- Node.js 18.x or higher
- npm (comes with Node.js)

## Installation

Clone the repository and install dependencies:

```bash
cd opengin-x
npm install
```

## Configuration

Copy the example environment file and configure as needed:

```bash
cp .env.local.example .env.local
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_EXTERNAL_API_URL` | Yes | External API URL for the Data Platform entities endpoint |
| `EXTERNAL_API_URL` | No | Server-side API URL (falls back to `NEXT_PUBLIC_EXTERNAL_API_URL`) |

Contact the project maintainers to obtain the API endpoint URL.

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3006](http://localhost:3006).

## Build

Create a production build:

```bash
npm run build
```

## Production

Run the production server (after building):

```bash
npm run start
```

## Linting

Run the linter:

```bash
npm run lint
```

## Features

- **Search**: Find entities by ID, kind, or name
- **Metadata**: View entity metadata
- **Attributes**: Fetch specific attribute values
- **Relations**: Query entity relationships
- **Explore**: Discover entity category hierarchies

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

## License

Part of the Lanka Data Foundation research initiatives.
