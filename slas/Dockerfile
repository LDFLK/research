# ──────────────────────────────────────────────────────────────────────
# Stage 1: Build the SQLite database from JSON data files
# ──────────────────────────────────────────────────────────────────────
FROM node:20-slim AS db-builder

WORKDIR /build

# Install scripts dependencies
COPY scripts/package.json scripts/package-lock.json* scripts/
RUN cd scripts && npm ci --ignore-scripts && npm rebuild better-sqlite3

# Copy the build script, tsconfig, and all JSON data
COPY scripts/tsconfig.json scripts/build-db.ts scripts/
COPY data/ data/

# Run the database builder
RUN cd scripts && npx tsx build-db.ts

# ──────────────────────────────────────────────────────────────────────
# Stage 2: Build the Next.js application
# ──────────────────────────────────────────────────────────────────────
FROM node:20-slim AS app-builder

WORKDIR /build/app

# Install app dependencies
COPY app/package.json app/package-lock.json* ./
RUN npm ci

# Copy the database from stage 1
COPY --from=db-builder /build/app/data/slas.db data/slas.db

# Copy application source
COPY app/ .

# Build the Next.js app (standalone output)
RUN npm run build

# ──────────────────────────────────────────────────────────────────────
# Stage 3: Production runner
# ──────────────────────────────────────────────────────────────────────
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3007
ENV HOSTNAME=0.0.0.0

# Install better-sqlite3 native binary for runtime
RUN npm init -y > /dev/null 2>&1 && npm install better-sqlite3@11 --ignore-scripts && npm rebuild better-sqlite3 && rm -f package.json package-lock.json

# Copy standalone Next.js output
COPY --from=app-builder /build/app/.next/standalone ./
COPY --from=app-builder /build/app/.next/static ./.next/static
COPY --from=app-builder /build/app/public ./public

# Copy the SQLite database
COPY --from=db-builder /build/app/data/slas.db ./data/slas.db

EXPOSE 3007

CMD ["node", "server.js"]
