import { makeDurableObject, makeWorker } from '@livestore/sync-cf/cf-worker'

// Define the durable object class for WebSocket connections
export class WebSocketServer extends makeDurableObject({
	onPush: async (message) => {
		console.log('onPush', message.batch)
		// Here you can add custom logic for when events are pushed to the store
		// For example, you could trigger notifications, webhooks, etc.
	},
	onPull: async (message) => {
		console.log('onPull', message)
		// Here you can add custom logic for when events are pulled from the store
		// For example, you could log analytics, perform validation, etc.
	},
}) {}

// Create and export the worker
export default makeWorker({
	validatePayload: (payload: any) => {
		// Validate authentication token
		if (payload?.authToken !== 'insecure-token-change-me') {
			throw new Error('Invalid auth token')
		}
		
		// Add additional payload validation here as needed
		// For example, validate user permissions, rate limiting, etc.
	},
}) 