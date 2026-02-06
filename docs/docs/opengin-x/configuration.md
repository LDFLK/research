---
sidebar_position: 3
---

# Configuration

This guide covers how to configure OpenGIN-X for your environment.

## Environment Variables

OpenGIN-X uses environment variables for configuration. Copy the example file to get started:

```bash
cp .env.local.example .env.local
```

### Available Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_EXTERNAL_API_URL` | Yes | External API URL for the Data Platform entities endpoint |
| `EXTERNAL_API_URL` | No | Server-side API URL (falls back to `NEXT_PUBLIC_EXTERNAL_API_URL`) |

### Example Configuration

```bash
# .env.local

# External API URL for the Data Platform
NEXT_PUBLIC_EXTERNAL_API_URL=https://your-api-service-url/v1/entities

# Optional: Server-side only API URL
# EXTERNAL_API_URL=https://internal-api-url/v1/entities
```

:::note
Contact the project maintainers to obtain the API endpoint URL for your environment.
:::

## Application Port

The application runs on **port 3006** by default. This is configured in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev -p 3006",
    "start": "next start -p 3006"
  }
}
```

To use a different port, modify these scripts or run with the `-p` flag:

```bash
npm run dev -- -p 3007
```

## API Proxy

OpenGIN-X includes a built-in API proxy (`/api/proxy/...`) that forwards requests to the external API. This:

- Avoids CORS issues when calling external APIs from the browser
- Adds consistent headers to all requests
- Enables request logging and debugging

### Proxy Architecture

```
Browser → /api/proxy/{path} → External API
                ↓
        Next.js API Route
        (adds headers, logs)
```

### Proxy Configuration

The proxy reads the API URL from environment variables:

1. `EXTERNAL_API_URL` (server-side only)
2. `NEXT_PUBLIC_EXTERNAL_API_URL` (fallback)

## Development vs Production

### Development

```bash
npm run dev
```

- Hot reloading enabled
- Debug logging in console
- Source maps available

### Production

```bash
npm run build
npm run start
```

- Optimized bundle
- Minimal logging
- Better performance

## Troubleshooting

### "Empty JSON document" Error

If you see a 400 error with "empty JSON document", ensure the API endpoint is correctly configured in `.env.local`.

### CORS Errors

All API requests should go through the `/api/proxy/` endpoint. If you see CORS errors, check that:

1. The proxy is being used (requests should not go directly to the external API)
2. The `EXTERNAL_API_URL` or `NEXT_PUBLIC_EXTERNAL_API_URL` is set correctly

### Port Already in Use

If port 3006 is busy:

```bash
# Find and kill the process
lsof -ti:3006 | xargs kill -9

# Or use a different port
npm run dev -- -p 3007
```
