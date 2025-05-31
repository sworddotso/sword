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
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useStore, tables } from '@/lib/livestore'
import { queryDb } from '@livestore/livestore'

export const Route = createFileRoute("/s/$serverId/$channelId")({
	component: RouteComponent,
});

function DashboardContent() {
	const { data: session, isPending } = authClient.useSession();
	const { serverId, channelId } = Route.useParams();
	const navigate = Route.useNavigate();
	const { store } = useStore()

	const { theme, variant } = useChatTheme();

	// =============================================================================
	// OPTIMIZED DATABASE QUERIES - All loaded once for maximum performance
	// =============================================================================

	// Query all servers for sidebar (minimal data needed)
	const serversQuery = queryDb(() => 
		tables.servers.where({ deletedAt: null })
	)
	const servers = store.useQuery(serversQuery) ?? []
	
	// Query all channels for current server
	const channelsQuery = queryDb(() => {
		if (!serverId) return tables.channels.where({ id: 'never-matches' })
		return tables.channels.where({ 
			serverId: serverId, 
			deletedAt: null 
		})
	})
	const channels = store.useQuery(channelsQuery) ?? []
	
	// Validate that current server and channel exist
	const currentServer = servers.find((s: any) => s.id === serverId)
	const currentChannel = channels.find((c: any) => c.id === channelId)
	
	console.log('🚀 Fast Route Data:', {
		serverId,
		channelId,
		serverExists: !!currentServer,
		channelExists: !!currentChannel,
		serverName: currentServer?.name,
		channelName: currentChannel?.name,
		totalServers: servers.length,
		totalChannels: channels.length
	})

	// =============================================================================
	// FAST NAVIGATION HANDLERS - No page reloads, instant switching
	// =============================================================================

	const handleServerSelect = (newServerId: string) => {
		console.log('⚡ Fast server switch:', newServerId)
		// Find the general channel or first channel of the new server
		const newServerChannels = store.useQuery(
			queryDb(() => tables.channels.where({ serverId: newServerId, deletedAt: null }))
		) ?? []
		
		const defaultChannel = newServerChannels.find((c: any) => c.name === 'general') || newServerChannels[0]
		
		if (defaultChannel) {
			// Instant navigation with no loading
			navigate({
				to: '/s/$serverId/$channelId',
				params: { serverId: newServerId, channelId: defaultChannel.id }
			})
		}
	}

	const handleChannelSelect = (newChannelId: string) => {
		console.log('⚡ Fast channel switch:', newChannelId)
		// Instant navigation with no loading
		navigate({
			to: '/s/$serverId/$channelId',
			params: { serverId: serverId, channelId: newChannelId }
		})
	}

	const handleJoinVoice = (channelName: string) => {
		console.log(`🔊 Joining voice channel: ${channelName}`);
	};

	const handleLeaveCall = () => {
		console.log("🔇 Left voice call");
	};

	const handleLogout = async () => {
		await authClient.signOut();
		navigate({ to: "/login" });
	};

	const handleSettings = () => {
		console.log("⚙️ Open settings");
	};

	// =============================================================================
	// VALIDATION & REDIRECTS
	// =============================================================================

	useEffect(() => {
		if (!session && !isPending) {
			navigate({ to: "/login" });
		}
	}, [session, isPending]);

	// Redirect if server doesn't exist
	if (!currentServer && servers.length > 0) {
		const latestServer = [...servers].sort((a: any, b: any) => 
			new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		)[0]
		return <Navigate to={`/s/${latestServer.id}/${channelId}`} replace />
	}

	// Redirect if channel doesn't exist
	if (!currentChannel && channels.length > 0) {
		const defaultChannel = channels.find((c: any) => c.name === 'general') || channels[0]
		return <Navigate to={`/s/${serverId}/${defaultChannel.id}`} replace />
	}

	// =============================================================================
	// RENDER CONDITIONS
	// =============================================================================

	if (isPending) {
		return (
			<div className={cn("flex h-screen items-center justify-center text-zinc-100", theme.layout.background)}>
				<div className="flex items-center space-x-3">
					<div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
					<span>Loading...</span>
				</div>
			</div>
		);
	}

	// Show error if no servers exist
	if (servers.length === 0) {
		return (
			<div className={cn("flex h-screen items-center justify-center text-zinc-100", theme.layout.background)}>
				<div className="text-center">
					<h2 className="text-xl font-semibold mb-4">Welcome to Sword App!</h2>
					<p className="mb-4">No servers found. Please seed the database first.</p>
					<p className="text-sm text-zinc-400">Go to <code>/test</code> to use the seed button.</p>
				</div>
			</div>
		);
	}

	// Get server name for display
	const getServerName = (serverId: string) => {
		const server = servers.find(s => s.id === serverId)
		return server?.name || "Unknown Server"
	};

	// =============================================================================
	// MAIN RENDER - ULTRA FAST UI
	// =============================================================================

	return (
		<div className={cn("h-screen text-zinc-100", theme.layout.background)} data-theme={variant}>
			<div className="flex h-full">
				{/* Server Sidebar - Fixed Width */}
				<div className="mt-6 flex-shrink-0">
					<ServerSidebar
						selectedServer={serverId}
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
								selectedChannel={channelId}
								onChannelSelect={handleChannelSelect}
								onJoinVoice={handleJoinVoice}
								serverName={getServerName(serverId)}
								selectedServer={serverId}
								userName={session?.user.name || undefined}
								userAvatar={session?.user.image || undefined}
								callState={{ isInCall: false, channelName: "" }}
								onLeaveCall={handleLeaveCall}
							/>
						</ResizablePanel>

						{/* Resize Handle */}
						<ResizableHandle withHandle />

						{/* Chat Area */}
						<ResizablePanel defaultSize={75} minSize={65}>
							<div className="flex h-full flex-col">
								<TopBar selectedChannel={channelId} />
								<div className="min-h-0 flex-1">
									<ChatArea 
										key={channelId} 
										selectedChannel={channelId} 
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