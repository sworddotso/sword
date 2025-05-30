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
	const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
	const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);

	const textChannels = [
		{ name: "dev-discussion", notifications: 3 },
		{ name: "general", notifications: 0 },
		{ name: "random", notifications: 0 },
		{ name: "random", notifications: 0 },
		{ name: "random", notifications: 0 },
		{ name: "random", notifications: 0 },
		{ name: "random", notifications: 1 },
		{ name: "announcements", notifications: 0 },
	];

	const voiceChannels = [
		{ name: "General Voice", notifications: 0, userCount: 3 },
		{ name: "Dev Talk", notifications: 0, userCount: 0 },
		{ name: "Music Room", notifications: 0, userCount: 7 },
	];

	const handleAddTextChannel = () => {
		console.log("Add text channel");
	};

	const handleAddVoiceChannel = () => {
		console.log("Add voice channel");
	};

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

	useEffect(() => {
		if (scrollElement) {
			scrollElement.addEventListener("scroll", handleScroll);

			// Check initial scroll position
			const initialScrollTop = scrollElement.scrollTop;
			setIsHeaderCollapsed(initialScrollTop > 1);

			return () => scrollElement.removeEventListener("scroll", handleScroll);
		}
	}, [scrollElement]);

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
						onChannelSelect={onChannelSelect}
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
