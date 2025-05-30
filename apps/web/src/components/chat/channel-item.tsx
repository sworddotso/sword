import { cn } from "@/lib/utils";
import { MicrophoneIcon, UsersIcon } from "@heroicons/react/16/solid";
import { useChatTheme } from "./chat-theme-provider";

interface ChannelItemProps {
	name: string;
	type: "text" | "voice";
	isSelected?: boolean;
	notifications?: number;
	userCount?: number;
	onClick?: () => void;
	onJoinVoice?: (channelName: string) => void;
	className?: string;
}

export function ChannelItem({
	name,
	type,
	isSelected = false,
	notifications = 0,
	userCount = 0,
	onClick,
	onJoinVoice,
	className,
}: ChannelItemProps) {
	const { theme } = useChatTheme();

	const handleClick = () => {
		if (type === "text" && onClick) {
			onClick();
		} else if (type === "voice" && onJoinVoice) {
			onJoinVoice(name);
		}
	};

	const isClickable =
		(type === "text" && onClick) || (type === "voice" && onJoinVoice);

	return (
		<button
			type="button"
			onClick={isClickable ? handleClick : undefined}
			aria-label={`Switch to ${name} channel`}
			className={cn(
				"group flex w-full items-center justify-between transition-all duration-200",
				theme.channelSidebar.channel.borderRadius,
				theme.channelSidebar.channel.padding,
				isSelected && type === "text"
					? `${theme.channelSidebar.channel.selectedBackground} ${theme.channelSidebar.channel.selectedColor}`
					: `${theme.channelSidebar.channel.background} ${theme.channelSidebar.channel.color}`,
				isClickable
					? `cursor-pointer ${theme.channelSidebar.channel.hoverBackground} ${theme.channelSidebar.channel.hoverColor}`
					: "cursor-pointer",
				className,
			)}
		>
			<div className="flex min-w-0 items-center space-x-2">
				{type === "text" ? (
					<span className="flex-shrink-0 text-zinc-500">#</span>
				) : (
					<MicrophoneIcon className="h-4 w-4 flex-shrink-0 text-zinc-500" />
				)}
				<span className="truncate font-medium text-sm">{name}</span>
			</div>

			{/* Notifications or User count */}
			<div className="flex flex-shrink-0 items-center space-x-1">
				{type === "text" && notifications > 0 && (
					<div
						className={cn(
							"flex items-center justify-center rounded-full",
							theme.channelSidebar.notification.size,
							theme.channelSidebar.notification.background,
							theme.channelSidebar.notification.color,
						)}
					>
						<span className="font-bold text-xs">{notifications}</span>
					</div>
				)}

				{type === "voice" && userCount > 0 && (
					<>
						<span className="text-xs text-zinc-500">{userCount}</span>
						<UsersIcon className="h-3 w-3 text-zinc-500" />
					</>
				)}
			</div>
		</button>
	);
}
