import { makeWorker } from '@livestore/adapter-web/worker'
import { makeCfSync } from '@livestore/sync-cf'
import { schema } from '@goated/livestore'

// Use your deployed Cloudflare Worker URL
// For development: 'ws://localhost:8787' 
// For production: 'wss://livestore-sync-worker.onydabs.workers.dev'
const syncUrl = import.meta.env.PROD 
  ? 'wss://livestore-sync-worker.onydabs.workers.dev' 
  : 'ws://localhost:8787'

makeWorker({
  schema,
  sync: { 
    backend: makeCfSync({ url: syncUrl }),
    onSyncError: 'ignore' // Ignore sync errors instead of shutting down
  },
}) 