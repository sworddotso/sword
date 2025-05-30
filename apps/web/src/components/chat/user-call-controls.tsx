import { cn } from "@/lib/utils";
import {
	CogIcon,
	ComputerDesktopIcon,
	MicrophoneIcon,
	PhoneXMarkIcon,
	SpeakerWaveIcon,
	VideoCameraIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { useState } from "react";
import { useChatTheme } from "./chat-theme-provider";

interface UserCallControlsProps {
	userName?: string;
	userAvatar?: string;
	isInCall?: boolean;
	callChannelName?: string;
	onLeaveCall?: () => void;
	className?: string;
}

export function UserCallControls({
	userName = "You",
	userAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
	isInCall = false,
	callChannelName = "general",
	onLeaveCall,
	className,
}: UserCallControlsProps) {
	const { theme } = useChatTheme();
	const [isMuted, setIsMuted] = useState(false);
	const [isDeafened, setIsDeafened] = useState(false);
	const [isVideoOn, setIsVideoOn] = useState(false);
	const [isScreenSharing, setIsScreenSharing] = useState(false);
	const [showSettings, setShowSettings] = useState(false);

	if (!isInCall) {
		// Normal user profile section when not in call
		return (
			<div
				className={cn(
					"flex items-center border-t p-3",
					theme.userBar.background,
					theme.userBar.borderTop,
					className,
				)}
			>
				<div className="flex min-w-0 flex-1 items-center space-x-3">
					<img
						src={userAvatar}
						alt={userName}
						className={cn(
							"object-cover",
							theme.userBar.avatar.size,
							theme.userBar.avatar.borderRadius,
						)}
					/>
					<div className="min-w-0 flex-1">
						<div
							className={cn(
								"truncate font-medium text-xs",
								theme.userBar.username.color,
							)}
						>
							{userName}
						</div>
					</div>
				</div>

				<button
					onClick={() => setShowSettings(!showSettings)}
					className={cn(
						"flex items-center justify-center rounded transition-colors",
						theme.userBar.buttons.size,
						theme.userBar.buttons.background,
						theme.userBar.buttons.hoverBackground,
						theme.userBar.buttons.color,
						theme.userBar.buttons.hoverColor,
					)}
				>
					<CogIcon className="h-4 w-4" />
				</button>
			</div>
		);
	}

	// Call interface when in voice/video call
	return (
		<div className={cn("border-t", theme.userBar.borderTop, className)}>
			{/* Call Status Header */}
			<div
				className={cn("border-b p-3", "border-green-500/30 bg-green-600/20")}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
						<div>
							<div className="font-semibold text-green-400 text-xs">
								Voice Connected
							</div>
							<div className="text-xs text-zinc-300">{callChannelName}</div>
						</div>
					</div>
					<button
						onClick={onLeaveCall}
						className="text-red-400 transition-colors hover:text-red-300"
					>
						<XMarkIcon className="h-4 w-4" />
					</button>
				</div>
			</div>

			{/* User Info */}
			<div className={cn("flex items-center p-3", theme.userBar.background)}>
				<img
					src={userAvatar}
					alt={userName}
					className={cn(
						"object-cover",
						theme.userBar.avatar.size,
						theme.userBar.avatar.borderRadius,
					)}
				/>
				<div className="ml-3 min-w-0 flex-1">
					<div
						className={cn(
							"truncate font-medium text-xs",
							theme.userBar.username.color,
						)}
					>
						{userName}
					</div>
				</div>
			</div>

			{/* Call Controls */}
			<div className={cn("space-y-2 p-3", theme.userBar.background)}>
				<div className="grid grid-cols-2 gap-2">
					{/* Microphone */}
					<button
						onClick={() => setIsMuted(!isMuted)}
						className={cn(
							"flex h-8 items-center justify-center rounded transition-colors",
							isMuted
								? "bg-red-600 text-white hover:bg-red-500"
								: `${theme.userBar.buttons.background} ${theme.userBar.buttons.hoverBackground} ${theme.userBar.buttons.color} ${theme.userBar.buttons.hoverColor}`,
						)}
					>
						<MicrophoneIcon className="h-4 w-4" />
					</button>

					{/* Speakers/Headphones */}
					<button
						onClick={() => setIsDeafened(!isDeafened)}
						className={cn(
							"flex h-8 items-center justify-center rounded transition-colors",
							isDeafened
								? "bg-red-600 text-white hover:bg-red-500"
								: `${theme.userBar.buttons.background} ${theme.userBar.buttons.hoverBackground} ${theme.userBar.buttons.color} ${theme.userBar.buttons.hoverColor}`,
						)}
					>
						<SpeakerWaveIcon className="h-4 w-4" />
					</button>

					{/* Video Camera */}
					<button
						onClick={() => setIsVideoOn(!isVideoOn)}
						className={cn(
							"flex h-8 items-center justify-center rounded transition-colors",
							isVideoOn
								? "bg-blue-600 text-white hover:bg-blue-500"
								: `${theme.userBar.buttons.background} ${theme.userBar.buttons.hoverBackground} ${theme.userBar.buttons.color} ${theme.userBar.buttons.hoverColor}`,
						)}
					>
						<VideoCameraIcon className="h-4 w-4" />
					</button>

					{/* Screen Share */}
					<button
						onClick={() => setIsScreenSharing(!isScreenSharing)}
						className={cn(
							"flex h-8 items-center justify-center rounded transition-colors",
							isScreenSharing
								? "bg-blue-600 text-white hover:bg-blue-500"
								: `${theme.userBar.buttons.background} ${theme.userBar.buttons.hoverBackground} ${theme.userBar.buttons.color} ${theme.userBar.buttons.hoverColor}`,
						)}
					>
						<ComputerDesktopIcon className="h-4 w-4" />
					</button>
				</div>

				{/* Leave Call Button */}
				<button
					onClick={onLeaveCall}
					className="flex h-8 w-full items-center justify-center rounded bg-red-600 font-medium text-white text-xs transition-colors hover:bg-red-500"
				>
					<PhoneXMarkIcon className="mr-2 h-4 w-4" />
					Leave Call
				</button>
			</div>
		</div>
	);
}
