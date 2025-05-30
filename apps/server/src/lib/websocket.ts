import type { IncomingMessage } from "node:http";
import { parse } from "node:url";
import type { User } from "better-auth/types";
import { type RawData, WebSocket, WebSocketServer } from "ws";
import { auth } from "./auth";

interface AuthenticatedWebSocket extends WebSocket {
	userId?: string;
	user?: User;
}

interface WebSocketMessage {
	type:
		| "join_conversation"
		| "leave_conversation"
		| "new_message"
		| "message_read"
		| "typing"
		| "stop_typing";
	conversationId?: string;
	messageId?: string;
	content?: string;
	metadata?: unknown;
}

interface BroadcastMessage {
	type:
		| "new_message"
		| "message_read"
		| "user_typing"
		| "user_stopped_typing"
		| "user_joined"
		| "user_left";
	conversationId: string;
	messageId?: string;
	userId?: string;
	message?: unknown;
	metadata?: unknown;
}

class WebSocketManager {
	private wss: WebSocketServer;
	private connections = new Map<string, Set<AuthenticatedWebSocket>>();
	private conversationMembers = new Map<string, Set<string>>();

	constructor(port: number) {
		this.wss = new WebSocketServer({
			port,
			verifyClient: this.verifyClient.bind(this),
		});

		this.wss.on("connection", this.handleConnection.bind(this));
		console.log(`WebSocket server running on port ${port}`);
	}

	private async verifyClient(info: {
		origin: string;
		secure: boolean;
		req: IncomingMessage;
	}): Promise<boolean> {
		try {
			// For now, allow all connections and verify in handleConnection
			// We can implement proper auth verification here later
			return true;
		} catch (error) {
			console.error("WebSocket auth error:", error);
			return false;
		}
	}

	private async handleConnection(
		ws: AuthenticatedWebSocket,
		req: IncomingMessage,
	) {
		console.log("New WebSocket connection");

		try {
			// Try to get session from headers (cookies)
			const session = await auth.api.getSession({
				headers: new Headers(
					Object.entries(req.headers as Record<string, string | string[]>).map(
						([key, value]) => [
							key,
							Array.isArray(value) ? value.join(", ") : value,
						],
					),
				),
			});

			if (session) {
				ws.userId = session.user.id;
				ws.user = session.user;

				if (!this.connections.has(session.user.id)) {
					this.connections.set(session.user.id, new Set());
				}
				this.connections.get(session.user.id)?.add(ws);
				console.log(`User ${session.user.id} connected via WebSocket`);
			} else {
				console.log("WebSocket connection without valid session");
				ws.close();
				return;
			}
		} catch (error) {
			console.error("WebSocket connection setup error:", error);
			ws.close();
			return;
		}

		ws.on("message", (data) => this.handleMessage(ws, data));
		ws.on("close", () => this.handleDisconnect(ws));
		ws.on("error", (error) => console.error("WebSocket error:", error));
	}

	private handleMessage(ws: AuthenticatedWebSocket, data: RawData) {
		try {
			const message: WebSocketMessage = JSON.parse(data.toString());

			if (!ws.userId) {
				return;
			}

			switch (message.type) {
				case "join_conversation":
					this.handleJoinConversation(ws, message);
					break;
				case "leave_conversation":
					this.handleLeaveConversation(ws, message);
					break;
				case "typing":
					this.handleTyping(ws, message);
					break;
				case "stop_typing":
					this.handleStopTyping(ws, message);
					break;
			}
		} catch (error) {
			console.error("WebSocket message handling error:", error);
		}
	}

	private handleJoinConversation(
		ws: AuthenticatedWebSocket,
		message: WebSocketMessage,
	) {
		if (!message.conversationId || !ws.userId) return;

		const conversationId = message.conversationId;

		if (!this.conversationMembers.has(conversationId)) {
			this.conversationMembers.set(conversationId, new Set());
		}

		this.conversationMembers.get(conversationId)?.add(ws.userId);

		this.broadcastToConversation(
			conversationId,
			{
				type: "user_joined",
				conversationId,
				userId: ws.userId,
			},
			ws.userId,
		);
	}

	private handleLeaveConversation(
		ws: AuthenticatedWebSocket,
		message: WebSocketMessage,
	) {
		if (!message.conversationId || !ws.userId) return;

		const conversationId = message.conversationId;
		this.conversationMembers.get(conversationId)?.delete(ws.userId);

		this.broadcastToConversation(
			conversationId,
			{
				type: "user_left",
				conversationId,
				userId: ws.userId,
			},
			ws.userId,
		);
	}

	private handleTyping(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
		if (!message.conversationId || !ws.userId) return;

		this.broadcastToConversation(
			message.conversationId,
			{
				type: "user_typing",
				conversationId: message.conversationId,
				userId: ws.userId,
			},
			ws.userId,
		);
	}

	private handleStopTyping(
		ws: AuthenticatedWebSocket,
		message: WebSocketMessage,
	) {
		if (!message.conversationId || !ws.userId) return;

		this.broadcastToConversation(
			message.conversationId,
			{
				type: "user_stopped_typing",
				conversationId: message.conversationId,
				userId: ws.userId,
			},
			ws.userId,
		);
	}

	private handleDisconnect(ws: AuthenticatedWebSocket) {
		if (!ws.userId) return;

		const userConnections = this.connections.get(ws.userId);
		if (userConnections) {
			userConnections.delete(ws);
			if (userConnections.size === 0) {
				this.connections.delete(ws.userId);
			}
		}

		// Remove from all conversations
		for (const [
			conversationId,
			members,
		] of this.conversationMembers.entries()) {
			if (members.has(ws.userId)) {
				members.delete(ws.userId);
				this.broadcastToConversation(
					conversationId,
					{
						type: "user_left",
						conversationId,
						userId: ws.userId,
					},
					ws.userId,
				);
			}
		}
	}

	// Public methods for broadcasting from API endpoints
	public broadcastNewMessage(conversationId: string, message: unknown) {
		this.broadcastToConversation(conversationId, {
			type: "new_message",
			conversationId,
			message,
		});
	}

	public broadcastMessageRead(
		conversationId: string,
		messageId: string,
		userId: string,
	) {
		this.broadcastToConversation(conversationId, {
			type: "message_read",
			conversationId,
			messageId,
			userId,
		});
	}

	private broadcastToConversation(
		conversationId: string,
		message: BroadcastMessage,
		excludeUserId?: string,
	) {
		const conversationMembers = this.conversationMembers.get(conversationId);
		if (!conversationMembers) return;

		for (const userId of conversationMembers) {
			if (excludeUserId && userId === excludeUserId) continue;

			const userConnections = this.connections.get(userId);
			if (userConnections) {
				for (const ws of userConnections) {
					if (ws.readyState === WebSocket.OPEN) {
						ws.send(JSON.stringify(message));
					}
				}
			}
		}
	}

	public getConnectedUsers(): string[] {
		return Array.from(this.connections.keys());
	}

	public isUserConnected(userId: string): boolean {
		const connections = this.connections.get(userId);
		return connections ? connections.size > 0 : false;
	}
}

export let wsManager: WebSocketManager | null = null;

export function initializeWebSocket(port = 3001) {
	if (!wsManager) {
		wsManager = new WebSocketManager(port);
	}
	return wsManager;
}

export function getWebSocketManager(): WebSocketManager | null {
	return wsManager;
}
