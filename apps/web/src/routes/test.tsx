import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { seedDatabase } from "@/utils/seed-database";
import { useStore, tables, actions } from '@/lib/livestore';
import { queryDb } from '@livestore/livestore'

export const Route = createFileRoute("/test")({
	component: TestPage,
});

function TestPage() {
	const { store } = useStore();
	const [isSeeding, setIsSeeding] = useState(false);
	const [seedResult, setSeedResult] = useState<any>(null);

	// Queries for debugging
	const serversQuery = queryDb(() => tables.servers.where({ deletedAt: null }))
	const channelsQuery = queryDb(() => tables.channels.where({ deletedAt: null }))
	const messagesQuery = queryDb(() => tables.messages.where({ deletedAt: null }))
	const usersQuery = queryDb(() => tables.users.where({ deletedAt: null }))

	const servers = store.useQuery(serversQuery) ?? []
	const channels = store.useQuery(channelsQuery) ?? []
	const messages = store.useQuery(messagesQuery) ?? []
	const users = store.useQuery(usersQuery) ?? []

	const handleSeedDatabase = async () => {
		setIsSeeding(true);
		try {
			const result = await seedDatabase(store);
			setSeedResult(result);
			console.log("✅ Database seeded successfully:", result);
		} catch (error) {
			console.error("❌ Failed to seed database:", error);
		} finally {
			setIsSeeding(false);
		}
	};

	const handleClearCache = () => {
		// Clear all relevant caches
		localStorage.clear();
		sessionStorage.clear();
		
		// Force reload
		window.location.reload();
	};

	const clearDatabase = async () => {
		console.log("🗑️ Clearing all data...");
		
		// Delete all data
		try {
			// Delete all messages first (they reference other entities)
			for (const message of messages) {
				actions.deleteMessage(store, message.id);
			}
			
			// Delete all channels
			for (const channel of channels) {
				actions.deleteChannel(store, channel.id);
			}
			
			// Delete all servers  
			for (const server of servers) {
				actions.deleteServer(store, server.id);
			}
			
			// Note: Users don't have a delete action, they will remain
			console.log("ℹ️ Users are not deleted as they don't have a delete action");
			
			console.log("✅ Database cleared");
		} catch (error) {
			console.error("❌ Error clearing database:", error);
		}
	};

	// Debug channel-message relationships
	const debugChannelMessages = () => {
		console.log("🔍 DEBUGGING CHANNEL-MESSAGE RELATIONSHIPS:");
		
		channels.forEach((channel: any) => {
			const channelMessages = messages.filter((msg: any) => msg.channelId === channel.id);
			console.log(`📋 Channel: ${channel.name} (${channel.id})`);
			console.log(`   Server: ${channel.serverId}`);
			console.log(`   Type: ${channel.type || 'text'}`);
			console.log(`   Messages: ${channelMessages.length}`);
			channelMessages.forEach((msg: any, idx: number) => {
				console.log(`   ${idx + 1}. "${msg.content.substring(0, 50)}..." by ${msg.userId}`);
			});
		});

		console.log("\n🖥️ SERVERS:");
		servers.forEach((server: any) => {
			const serverChannels = channels.filter((c: any) => c.serverId === server.id);
			console.log(`📺 Server: ${server.name} (${server.id})`);
			console.log(`   Channels: ${serverChannels.length}`);
			serverChannels.forEach((channel: any) => {
				console.log(`   - #${channel.name} (${channel.id}) [${channel.type || 'text'}]`);
			});
		});
	};

	return (
		<div className="container mx-auto p-8 max-w-4xl">
			<h1 className="text-3xl font-bold mb-8">🗡️ Sword App Test Page</h1>
			
			<div className="space-y-6">
				{/* Seeding Section */}
				<div className="bg-zinc-900 p-6 rounded-lg">
					<h2 className="text-xl font-semibold mb-4">Database Management</h2>
					<div className="flex gap-4 mb-4">
						<Button
							onClick={handleSeedDatabase}
							disabled={isSeeding}
							className="bg-blue-600 hover:bg-blue-700"
						>
							{isSeeding ? "Seeding..." : "🌱 Seed Database"}
						</Button>
						
						<Button
							onClick={clearDatabase}
							variant="destructive"
						>
							🗑️ Clear Database
						</Button>
						
						<Button
							onClick={handleClearCache}
							variant="outline"
						>
							🧹 Clear Cache & Reload
						</Button>
					</div>
					
					{seedResult && (
						<div className="mt-4 p-4 bg-green-900/50 rounded">
							<p className="text-green-300">
								✅ Database seeded successfully!
							</p>
							<p className="text-sm text-gray-400 mt-1">
								Server ID: {seedResult.serverId}
							</p>
							<p className="text-sm text-gray-400">
								Your role: {seedResult.userRole}
							</p>
						</div>
					)}
				</div>

				{/* Debug Information */}
				<div className="bg-zinc-900 p-6 rounded-lg">
					<h2 className="text-xl font-semibold mb-4">Database State</h2>
					
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
						<div className="bg-zinc-800 p-3 rounded">
							<div className="text-2xl font-bold text-blue-400">{servers.length}</div>
							<div className="text-sm text-gray-400">Servers</div>
						</div>
						<div className="bg-zinc-800 p-3 rounded">
							<div className="text-2xl font-bold text-green-400">{channels.length}</div>
							<div className="text-sm text-gray-400">Channels</div>
						</div>
						<div className="bg-zinc-800 p-3 rounded">
							<div className="text-2xl font-bold text-yellow-400">{messages.length}</div>
							<div className="text-sm text-gray-400">Messages</div>
						</div>
						<div className="bg-zinc-800 p-3 rounded">
							<div className="text-2xl font-bold text-purple-400">{users.length}</div>
							<div className="text-sm text-gray-400">Users</div>
						</div>
					</div>

					<Button 
						onClick={debugChannelMessages}
						variant="outline"
						className="mb-4"
					>
						🔍 Debug Channel-Message Relationships
					</Button>

					<Button 
						onClick={() => {
							console.log("🧪 TESTING CHANNEL SELECTION FLOW:");
							if (channels.length > 0) {
								const testChannel = channels[0];
								console.log("1. Selecting channel:", testChannel.name, testChannel.id);
								
								// Test the same query that TopBar uses
								const topBarQuery = tables.channels.where({ id: testChannel.id });
								const topBarResult = store.query(topBarQuery);
								console.log("2. TopBar query result:", topBarResult);
								
								// Test if channel is found
								const foundChannel = topBarResult.find((c: any) => c.id === testChannel.id);
								console.log("3. Found channel:", foundChannel ? foundChannel.name : "NOT FOUND");
								
								if (!foundChannel) {
									console.error("❌ Channel not found by TopBar query!");
									console.log("Available channels in query:", topBarResult.map((c: any) => ({ id: c.id, name: c.name })));
								} else {
									console.log("✅ Channel found successfully!");
								}
							} else {
								console.log("❌ No channels available to test");
							}
						}}
						variant="outline"
						className="mb-4 ml-2"
					>
						🧪 Test Channel Selection Flow
					</Button>

					{/* Servers */}
					{servers.length > 0 && (
						<div className="mb-4">
							<h3 className="font-semibold mb-2">📺 Servers:</h3>
							<div className="space-y-2">
								{servers.map((server: any) => (
									<div key={server.id} className="bg-zinc-800 p-2 rounded text-sm">
										<strong>{server.name}</strong> ({server.id})
									</div>
								))}
							</div>
						</div>
					)}

					{/* Channels */}
					{channels.length > 0 && (
						<div className="mb-4">
							<h3 className="font-semibold mb-2">📋 Channels:</h3>
							<div className="space-y-2">
								{channels.map((channel: any) => {
									const channelMessages = messages.filter((msg: any) => msg.channelId === channel.id);
									return (
										<div key={channel.id} className="bg-zinc-800 p-2 rounded text-sm">
											<strong>#{channel.name}</strong> ({channel.type || 'text'}) - {channelMessages.length} messages
											<br />
											<span className="text-gray-400 text-xs">ID: {channel.id}</span>
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* Messages */}
					{messages.length > 0 && (
						<div className="mb-4">
							<h3 className="font-semibold mb-2">💬 Recent Messages:</h3>
							<div className="space-y-2 max-h-64 overflow-y-auto">
								{messages.slice(-10).map((message: any) => {
									const channel = channels.find((c: any) => c.id === message.channelId);
									const user = users.find((u: any) => u.id === message.userId);
									return (
										<div key={message.id} className="bg-zinc-800 p-2 rounded text-sm">
											<div className="flex justify-between text-xs text-gray-400 mb-1">
												<span>#{channel?.name || 'unknown'}</span>
												<span>{user?.username || 'unknown'}</span>
											</div>
											<div>{message.content.substring(0, 100)}...</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>

				{/* Navigation */}
				<div className="bg-zinc-900 p-6 rounded-lg">
					<h2 className="text-xl font-semibold mb-4">Navigation & Development</h2>
					<div className="grid grid-cols-2 gap-4">
						<Button
							onClick={() => window.location.href = '/s'}
							className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
						>
							🏠 Go to Chat
						</Button>
						
						<Button
							onClick={() => window.location.href = '/'}
							variant="outline"
						>
							🏡 Go to Home
						</Button>

						<Button
							onClick={() => {
								window.location.href = window.location.pathname + '?reset'
							}}
							variant="destructive"
							className="col-span-2"
						>
							🔄 Reset LiveStore (Fix Worker Issues)
						</Button>
					</div>
					
					<div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded text-sm text-yellow-200">
						<p><strong>Development tip:</strong> If you see LiveStore worker errors, click "Reset LiveStore" to clear the shared worker state and restart fresh.</p>
					</div>
				</div>
			</div>
		</div>
	);
} 