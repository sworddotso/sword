import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
	CalendarIcon,
	RectangleStackIcon,
	UsersIcon,
} from "@heroicons/react/16/solid";
import { useEffect, useRef, useState } from "react";
import { CallControls } from "./call-controls";
import { ChannelSection } from "./channel-section";
import { useChatTheme } from "./chat-theme-provider";
import ServerHeader from "./server-header";
import { useStore, tables } from '@/lib/livestore'
import { queryDb } from '@livestore/livestore'

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface ChannelSidebarProps {
	selectedChannel: string;
	onChannelSelect: (channel: string) => void;
	onJoinVoice?: (channelName: string) => void;
	serverName: string;
	selectedServer: string;
	userName?: string;
	userAvatar?: string;
	callState?: {
		isInCall: boolean;
		channelName: string;
	};
	onLeaveCall?: () => void;
	className?: string;
}

interface ChannelData {
	id: string;
	name: string;
	notifications?: number;
	userCount?: number;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ChannelSidebar({
	selectedChannel,
	onChannelSelect,
	onJoinVoice,
	serverName,
	selectedServer,
	userName,
	userAvatar,
	callState,
	onLeaveCall,
	className,
}: ChannelSidebarProps) {
	const { theme } = useChatTheme();
	const { store } = useStore()
	const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
	const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);

	// =============================================================================
	// DATABASE QUERIES
	// =============================================================================

	// Query channels for the selected server
	const channelsQuery = queryDb(() => {
		console.log('🔍 ChannelSidebar: Querying channels for server:', selectedServer)
		if (!selectedServer) {
			console.warn('⚠️ ChannelSidebar: No selectedServer provided')
			return tables.channels.where({ id: 'never-matches' })
		}
		return tables.channels.where({ 
			serverId: selectedServer, 
			deletedAt: null 
		})
	})
	
	// Query categories for the selected server
	const categoriesQuery = queryDb(() => {
		if (!selectedServer) {
			return tables.categories.where({ id: 'never-matches' })
		}
		return tables.categories.where({ 
			serverId: selectedServer 
		})
	})
	
	// Get reactive data
	const channels = store.useQuery(channelsQuery)
	const categories = store.useQuery(categoriesQuery)

	console.log('📋 Channel Sidebar Data:', {
		selectedServer,
		selectedChannel,
		channelsCount: channels?.length || 0,
		categoriesCount: categories?.length || 0,
		channels: channels?.map((c: any) => ({ id: c.id, name: c.name, type: c.type, serverId: c.serverId })),
		propsReceived: {
			selectedServer,
			selectedChannel,
			serverName
		}
	})
	
	// Create a map of channel ID to channel name for easy lookup
	const channelMap = new Map(channels.map((channel: any) => [channel.id, channel.name]))
	
	// =============================================================================
	// DATA PROCESSING
	// =============================================================================

	// Process channels data to group by category and type
	const processChannelsData = () => {
		if (!channels || !categories) {
			console.log('⚠️ No channels or categories data available')
			return { textChannels: [], voiceChannels: [] }
		}
		
		// Create category map for easier lookup
		const categoryMap = new Map(categories.map((cat: any) => [cat.id, cat.name]))
		
		// Separate text and voice channels - use IDs consistently
		const textChannels = channels
			.filter((channel: any) => {
				const isTextChannel = channel.type === 'text' || channel.type === 'announcement' || !channel.type
				console.log(`📝 Channel ${channel.name} (${channel.type || 'undefined'}) is text channel:`, isTextChannel)
				return isTextChannel
			})
			.sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
			.map((channel: any) => ({
				id: channel.id,
				name: channel.name,
				notifications: 0, // You can implement real notification counting later
				categoryName: channel.categoryId ? categoryMap.get(channel.categoryId) : 'UNCATEGORIZED'
			}))

		const voiceChannels = channels
			.filter((channel: any) => channel.type === 'voice')
			.sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
			.map((channel: any) => ({
				id: channel.id,
				name: channel.name,
				notifications: 0,
				userCount: 0, // You can implement real user counting later
				categoryName: channel.categoryId ? categoryMap.get(channel.categoryId) : 'UNCATEGORIZED'
			}))
		
		console.log('📊 Processed Channels:', {
			textChannels: textChannels.map(c => ({ id: c.id, name: c.name })),
			voiceChannels: voiceChannels.map(c => ({ id: c.id, name: c.name })),
		})
		
		return { textChannels, voiceChannels }
	}
	
	const { textChannels, voiceChannels } = processChannelsData()

	// Get the name of the selected channel for display
	const selectedChannelName = channelMap.get(selectedChannel) || selectedChannel

	// =============================================================================
	// EVENT HANDLERS
	// =============================================================================

	const handleAddTextChannel = () => {
		console.log("Add text channel");
	};

	const handleAddVoiceChannel = () => {
		console.log("Add voice channel");
	};

	// Handle channel selection - use ID directly
	const handleChannelSelect = (channelId: string) => {
		console.log('🔄 Channel selected:', {
			channelId,
			channelName: channelMap.get(channelId)
		})
		onChannelSelect(channelId)
	}

	// Handle scroll to collapse/expand header
	const handleScroll = (event: Event) => {
		const target = event.target as HTMLElement;
		const scrollTop = target.scrollTop;
		const bannerHeight = 1;

		// Show banner when at top or very close to top
		const shouldCollapse = scrollTop > bannerHeight;

		setIsHeaderCollapsed(shouldCollapse);
	};

	// Callback ref to get the scroll area element
	const scrollAreaCallback = (node: HTMLDivElement | null) => {
		if (node) {
			const viewport = node.querySelector(
				"[data-radix-scroll-area-viewport]",
			) as HTMLElement;
			setScrollElement(viewport);
		}
	};

	// =============================================================================
	// EFFECTS
	// =============================================================================

	useEffect(() => {
		if (scrollElement) {
			scrollElement.addEventListener("scroll", handleScroll);

			// Check initial scroll position
			const initialScrollTop = scrollElement.scrollTop;
			setIsHeaderCollapsed(initialScrollTop > 1);

			return () => scrollElement.removeEventListener("scroll", handleScroll);
		}
	}, [scrollElement]);

	// =============================================================================
	// RENDER CONDITIONS
	// =============================================================================

	// Show a message if no data is available
	if (!channels?.length && selectedServer !== 'dms') {
		console.warn('⚠️ No channels found for server:', selectedServer)
		return (
			<div
				className={cn(
					"flex h-full flex-col overflow-hidden",
					theme.channelSidebar.background,
					theme.channelSidebar.border,
					theme.channelSidebar.borderRadius,
					className,
				)}
			>
				<ServerHeader
					serverName={serverName}
					serverId={selectedServer}
					isCollapsed={isHeaderCollapsed}
				/>
				<div className="flex flex-1 items-center justify-center p-4">
					<div className="text-center">
						<p className="text-zinc-400 text-lg font-semibold">⚠️ No channels found</p>
						<p className="text-zinc-500 text-sm mt-2">
							Server ID: {selectedServer}
						</p>
						<p className="text-zinc-500 text-sm mt-1">
							Please seed the database first at <a href="/test" className="text-blue-400 underline">/test</a>
						</p>
						<button 
							onClick={() => window.location.href = '/test'}
							className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
						>
							🌱 Go to Seed Page
						</button>
					</div>
				</div>
			</div>
		)
	}

	// Show warning if we have channels but they're empty
	if (channels?.length && textChannels.length === 0 && voiceChannels.length === 0) {
		console.warn('⚠️ Channels found but none processed properly:', {
			rawChannels: channels.map((c: any) => ({ id: c.id, name: c.name, type: c.type, serverId: c.serverId })),
			selectedServer
		})
		return (
			<div
				className={cn(
					"flex h-full flex-col overflow-hidden",
					theme.channelSidebar.background,
					theme.channelSidebar.border,
					theme.channelSidebar.borderRadius,
					className,
				)}
			>
				<ServerHeader
					serverName={serverName}
					serverId={selectedServer}
					isCollapsed={isHeaderCollapsed}
				/>
				<div className="flex flex-1 items-center justify-center p-4">
					<div className="text-center">
						<p className="text-zinc-400 text-lg font-semibold">🔧 Channel processing issue</p>
						<p className="text-zinc-500 text-sm mt-2">
							Found {channels.length} channels but none were processed correctly
						</p>
						<p className="text-zinc-500 text-sm mt-1">
							Check console logs for details
						</p>
					</div>
				</div>
			</div>
		)
	}

	// =============================================================================
	// MAIN RENDER
	// =============================================================================

	return (
		<div
			className={cn(
				"flex h-full flex-col overflow-hidden",
				theme.channelSidebar.background,
				theme.channelSidebar.border,
				theme.channelSidebar.borderRadius,
				className,
			)}
		>
			{/* Server Header */}
			<ServerHeader
				serverName={serverName}
				serverId={selectedServer}
				isCollapsed={isHeaderCollapsed}
			/>

			{/* Channels Content with Custom ScrollArea */}
			<ScrollArea className="flex-1" ref={scrollAreaCallback}>
				<div className="p-4">
					{/* Navigation Menu */}
					<div className="mb-6 space-y-1">
						<button
							type="button"
							className={cn(
								"flex w-full items-center space-x-3 rounded-md px-3 py-2 text-sm transition-colors",
								theme.channelSidebar.channel.background,
								theme.channelSidebar.channel.hoverBackground,
								theme.channelSidebar.channel.color,
								theme.channelSidebar.channel.hoverColor,
							)}
						>
							<CalendarIcon className="h-4 w-4" />
							<span>Events</span>
						</button>
						<button
							type="button"
							className={cn(
								"flex w-full items-center space-x-3 rounded-md px-3 py-2 text-sm transition-colors",
								theme.channelSidebar.channel.background,
								theme.channelSidebar.channel.hoverBackground,
								theme.channelSidebar.channel.color,
								theme.channelSidebar.channel.hoverColor,
							)}
						>
							<RectangleStackIcon className="h-4 w-4" />
							<span>Browse Channels</span>
						</button>
						<button
							type="button"
							className={cn(
								"flex w-full items-center space-x-3 rounded-md px-3 py-2 text-sm transition-colors",
								theme.channelSidebar.channel.background,
								theme.channelSidebar.channel.hoverBackground,
								theme.channelSidebar.channel.color,
								theme.channelSidebar.channel.hoverColor,
							)}
						>
							<UsersIcon className="h-4 w-4" />
							<span>Members</span>
						</button>
					</div>

					{/* Text Channels */}
					<ChannelSection
						title="Text Channels"
						type="text"
						channels={textChannels}
						selectedChannel={selectedChannel}
						onChannelSelect={handleChannelSelect}
						onAddChannel={handleAddTextChannel}
					/>

					{/* Voice Channels */}
					<ChannelSection
						title="Voice Channels"
						type="voice"
						channels={voiceChannels}
						onJoinVoice={onJoinVoice}
						onAddChannel={handleAddVoiceChannel}
					/>
				</div>
			</ScrollArea>

			{/* Call Controls - shown when in call */}
			{callState?.isInCall && onLeaveCall && (
				<CallControls
					isInCall={callState.isInCall}
					channelName={callState.channelName}
					userName={userName}
					userAvatar={userAvatar}
					onLeaveCall={onLeaveCall}
				/>
			)}
		</div>
	);
}
