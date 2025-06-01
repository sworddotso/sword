# LiveStore Sync Worker

This is a Cloudflare Worker that provides a sync backend for LiveStore using Durable Objects and D1 database.

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Create a D1 database:
   ```bash
   npx wrangler d1 create livestore-sync
   ```

3. Update the `wrangler.toml` file with your actual database IDs from the previous command.

4. Set up your environment variables in `.dev.vars`:
   - `LIVESTORE_SECRET`: A secret key for LiveStore encryption
   - `AUTH_TOKEN`: Authentication token for client validation
   - `NODE_ENV`: Environment (development/production)
   - `DEBUG`: Debug flag

## Local Development

Run the worker locally:
```bash
bun run dev
```

The worker will be available at `http://localhost:8787` with WebSocket endpoint at `ws://localhost:8787/websocket`.

## Deployment

Deploy to Cloudflare Workers:
```bash
bun run deploy
```

## Usage

To connect from your LiveStore client, use the web adapter:

```typescript
import { makeCfSync } from '@livestore/sync-cf'
import { makeWorker } from '@livestore/adapter-web/worker'
import { schema } from './livestore/schema.js'

const url = 'ws://localhost:8787' // or your deployed worker URL

makeWorker({
  schema,
  sync: { backend: makeCfSync({ url }) },
})
```

## How it Works

- The Cloudflare Worker opens WebSocket connections via Durable Objects
- Events are stored in a D1 SQLite database
- Each store instance gets its own table: `eventlog_${PERSISTENCE_FORMAT_VERSION}_${storeId}`
- The worker handles push/pull requests for event synchronization

## Environment Variables

- `LIVESTORE_SECRET`: Secret key for LiveStore operations
- `AUTH_TOKEN`: Token for client authentication
- `NODE_ENV`: Environment setting
- `DEBUG`: Debug logging flag 