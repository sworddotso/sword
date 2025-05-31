import { makeWorker } from '@livestore/sync-cf/cf-worker'
import { WebSocketServer } from './websocket-server'

export default makeWorker({
  validatePayload: (payload) => {
    // Simple auth validation - in production, use proper JWT validation
    if (typeof payload === 'object' && payload !== null && 'authToken' in payload) {
      if (payload.authToken !== 'dev-token-change-me') {
        throw new Error('Invalid auth token')
      }
    } else {
      throw new Error('Missing auth token')
    }
  },
})

export { WebSocketServer } 