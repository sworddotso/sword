import { cn } from "@/lib/utils";
import { ChevronRightIcon, PlusIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import { ChannelItem } from "./channel-item";
import { useChatTheme } from "./chat-theme-provider";

interface Channel {
	id: string;
	name: string;
	notifications?: number;
	userCount?: number;
}

interface ChannelSectionProps {
	title: string;
	type: "text" | "voice";
	channels: Channel[];
	selectedChannel?: string;
	onChannelSelect?: (channelId: string) => void;
	onJoinVoice?: (channelName: string) => void;
	onAddChannel?: () => void;
	defaultOpen?: boolean;
	className?: string;
}

export function ChannelSection({
	title,
	type,
	channels,
	selectedChannel,
	onChannelSelect,
	onJoinVoice,
	onAddChannel,
	defaultOpen = true,
	className,
}: ChannelSectionProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);
	const { theme } = useChatTheme();

	return (
		<div className={cn("mb-4 sm:mb-6", className)}>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className={cn(
					"mb-2 flex w-full items-center justify-between transition-colors",
					theme.channelSidebar.section.titleColor,
					theme.channelSidebar.section.titleHoverColor,
				)}
			>
				<div className="flex items-center space-x-2">
					<ChevronRightIcon
						className={cn(
							"h-3 w-3 transition-transform",
							isOpen ? "rotate-90" : "",
						)}
					/>
					<span
						className={cn(
							"font-semibold uppercase tracking-wide",
							theme.channelSidebar.section.titleSize,
						)}
					>
						{title}
					</span>
				</div>
				{onAddChannel && (
					<div
						onClick={(e) => {
							e.stopPropagation();
							onAddChannel();
						}}
						className="h-4 w-4 text-zinc-500 transition-colors hover:text-zinc-300 cursor-pointer"
						role="button"
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								e.stopPropagation();
								onAddChannel();
							}
						}}
					>
						<PlusIcon className="h-4 w-4" />
					</div>
				)}
			</button>

			{isOpen && (
				<div className="space-y-0.5 sm:space-y-1">
					{channels.map((channel) => (
						<ChannelItem
							key={channel.id}
							name={channel.name}
							type={type}
							isSelected={selectedChannel === channel.id}
							notifications={channel.notifications}
							userCount={channel.userCount}
							onClick={
								type === "text" && onChannelSelect
									? () => onChannelSelect(channel.id)
									: undefined
							}
							onJoinVoice={
								type === "voice" && onJoinVoice ? onJoinVoice : undefined
							}
						/>
					))}
				</div>
			)}
		</div>
	);
}
