import {
	ChannelSidebar,
	ChatArea,
	ChatThemeCustomizer,
	ChatThemeProvider,
	ServerSidebar,
	TopBar,
	useChatTheme,
} from "@/components/chat";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore, tables } from '@/lib/livestore'
import { queryDb } from '@livestore/livestore'

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
});

function DashboardContent() {
	const { data: session, isPending } = authClient.useSession();
	const navigate = Route.useNavigate();
	const { store } = useStore()
	const [selectedServer, setSelectedServer] = useState<string>("");
	const [selectedChannel, setSelectedChannel] = useState<string>("");
	const [callState, setCallState] = useState<{
		isInCall: boolean;
		channelName: string;
	}>({ isInCall: false, channelName: "" });

	const { theme, variant } = useChatTheme();

	// =============================================================================
	// DATABASE QUERIES
	// =============================================================================

	// Get available servers and channels to set defaults
	const serversQuery = queryDb(() => 
		tables.servers.where({ deletedAt: null })
	)
	const servers = store.useQuery(serversQuery) ?? []
	
	// Always call useQuery but make the query conditional inside the function
	const channelsQuery = queryDb(() => {
		if (!selectedServer) {
			return tables.channels.where({ id: 'never-matches' }) // Return empty query
		}
		return tables.channels.where({ 
			serverId: selectedServer, 
			deletedAt: null 
		})
	})
	const channels = store.useQuery(channelsQuery) ?? []
	
	// Query all channels for fallback when channel selection fails
	const allChannelsQuery = queryDb(() => tables.channels.where({ deletedAt: null }))
	const allChannels = store.useQuery(allChannelsQuery) ?? []
	
	// Find the most recent server (helpful when multiple seed datasets exist)
	const availableServer = servers.length > 0 ? 
		[...servers].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] :
		undefined
		
	// Find the general channel or most recent channel
	const availableChannel = channels.length > 0 ? 
		(channels.find((c: any) => c.name === 'general') || 
		 [...channels].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]) : 
		undefined

	console.log('🏠 Dashboard State:', {
		selectedServer,
		selectedChannel,
		serversCount: servers.length,
		channelsCount: channels.length,
		availableServers: servers.map((s: any) => ({ id: s.id, name: s.name })),
		availableChannels: channels.map((c: any) => ({ id: c.id, name: c.name, type: c.type })),
		hasAvailableServer: !!availableServer,
		hasAvailableChannel: !!availableChannel,
		autoSelectionStatus: {
			serverSelected: !!selectedServer,
			channelSelected: !!selectedChannel,
			serverAvailable: !!availableServer,
			channelAvailable: !!availableChannel && !!selectedServer
		}
	})
	
	// =============================================================================
	// EFFECTS FOR AUTO-SELECTION
	// =============================================================================

	// Set default server and channel when available
	useEffect(() => {
		if (!selectedServer && availableServer) {
			console.log('🎯 Auto-selecting server:', availableServer.name, availableServer.id)
			setSelectedServer(availableServer.id)
		}
	}, [availableServer, selectedServer])

	useEffect(() => {
		if (!selectedChannel && availableChannel && selectedServer) {
			console.log('🎯 Auto-selecting channel:', availableChannel.name, availableChannel.id)
			setSelectedChannel(availableChannel.id)
		}
	}, [availableChannel, selectedChannel, selectedServer])

	// Reset channel selection when server changes
	useEffect(() => {
		if (selectedServer && selectedChannel) {
			// Only validate if we have channel data loaded for this server
			// Avoid race conditions where channels haven't loaded yet
			if (channels.length > 0) {
				const channelBelongsToServer = channels.some((c: any) => c.id === selectedChannel)
				if (!channelBelongsToServer) {
					console.log('🔄 Channel does not belong to server, resetting selection', {
						selectedChannel,
						selectedServer,
						availableChannels: channels.map((c: any) => c.id)
					})
					setSelectedChannel("")
				} else {
					console.log('✅ Channel belongs to server, keeping selection', {
						selectedChannel,
						selectedServer,
						channelName: channels.find((c: any) => c.id === selectedChannel)?.name
					})
				}
			} else {
				console.log('⏳ Waiting for channels to load before validating selection')
			}
		}
	}, [selectedServer, channels, selectedChannel])

	useEffect(() => {
		if (!session && !isPending) {
			navigate({
				to: "/login",
			});
		}
	}, [session, isPending]);

	// =============================================================================
	// EVENT HANDLERS
	// =============================================================================

	const handleServerSelect = (serverId: string) => {
		console.log('🖥️ Server selected:', serverId)
		setSelectedServer(serverId)
		// Reset channel when server changes
		setSelectedChannel("")
	}

	const handleChannelSelect = (channelId: string) => {
		console.log('📍 Channel selected:', channelId)
		
		// First, try to find the channel in ALL channels
		const anyChannel = allChannels.find((c: any) => c.id === channelId)
		
		if (!anyChannel) {
			console.error('❌ Channel not found anywhere in database!', channelId)
			return
		}
		
		console.log('✅ Found channel:', {
			channelId,
			channelName: anyChannel.name,
			channelServerId: anyChannel.serverId,
			currentSelectedServer: selectedServer
		})
		
		// If channel belongs to a different server, switch to that server first
		if (anyChannel.serverId !== selectedServer) {
			console.log('🔧 Switching server to match channel', {
				from: selectedServer,
				to: anyChannel.serverId,
				reason: 'Channel belongs to different server'
			})
			setSelectedServer(anyChannel.serverId)
		}
		
		// Now select the channel
		setSelectedChannel(channelId)
		console.log('✅ Channel selection completed')
	}

	const handleJoinVoice = (channelName: string) => {
		setCallState({ isInCall: true, channelName });
		console.log(`Joining voice channel: ${channelName}`);
	};

	const handleLeaveCall = () => {
		setCallState({ isInCall: false, channelName: "" });
		console.log("Left voice call");
	};

	const handleLogout = async () => {
		await authClient.signOut();
		navigate({ to: "/login" });
	};

	const handleSettings = () => {
		console.log("Open settings");
	};

	// =============================================================================
	// RENDER CONDITIONS
	// =============================================================================

	if (isPending) {
		return (
			<div
				className={cn(
					"flex h-screen items-center justify-center text-zinc-100",
					theme.layout.background,
				)}
			>
				<div className="flex items-center space-x-3">
					<div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
					<span>Loading...</span>
				</div>
			</div>
		);
	}

	// Show seeding prompt if no servers
	if (!availableServer) {
		return (
			<div
				className={cn(
					"flex h-screen items-center justify-center text-zinc-100",
					theme.layout.background,
				)}
			>
				<div className="text-center">
					<h2 className="text-xl font-semibold mb-4">Welcome to Sword App!</h2>
					<p className="mb-4">No servers found. Please seed the database first.</p>
					<p className="text-sm text-zinc-400">Go to <code>/test</code> to use the seed button.</p>
				</div>
			</div>
		);
	}

	// Get server name based on selected server
	const getServerName = (serverId: string) => {
		const server = servers.find(s => s.id === serverId)
		return server?.name || "Unknown Server"
	};

	// =============================================================================
	// MAIN RENDER
	// =============================================================================

	return (
		<div
			className={cn("h-screen text-zinc-100", theme.layout.background)}
			data-theme={variant}
		>
			<div className="flex h-full">
				{/* Server Sidebar - Fixed Width */}
				<div className="mt-6 flex-shrink-0">
					<ServerSidebar
						selectedServer={selectedServer}
						onServerSelect={handleServerSelect}
						userName={session?.user.name || undefined}
						userAvatar={session?.user.image || undefined}
						userEmail={session?.user.email || undefined}
						onLogout={handleLogout}
						onSettings={handleSettings}
					/>
				</div>

				{/* Main Resizable Area */}
				<div className="mt-6 flex-1">
					<ResizablePanelGroup direction="horizontal" className="h-full">
						{/* Channel Sidebar */}
						<ResizablePanel defaultSize={25} minSize={15} maxSize={35}>
							<ChannelSidebar
								selectedChannel={selectedChannel}
								onChannelSelect={handleChannelSelect}
								onJoinVoice={handleJoinVoice}
								serverName={getServerName(selectedServer)}
								selectedServer={selectedServer}
								userName={session?.user.name || undefined}
								userAvatar={session?.user.image || undefined}
								callState={callState}
								onLeaveCall={handleLeaveCall}
							/>
						</ResizablePanel>

						{/* Resize Handle */}
						<ResizableHandle withHandle />

						{/* Chat Area */}
						<ResizablePanel defaultSize={75} minSize={65}>
							<div className="flex h-full flex-col">
								<TopBar selectedChannel={selectedChannel} />
								<div className="min-h-0 flex-1">
									<ChatArea 
										key={selectedChannel} 
										selectedChannel={selectedChannel} 
									/>
								</div>
							</div>
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			</div>

			{/* Theme Customizer */}
			<ChatThemeCustomizer />
		</div>
	);
}

function RouteComponent() {
	return (
		<ChatThemeProvider>
			<DashboardContent />
		</ChatThemeProvider>
	);
}
