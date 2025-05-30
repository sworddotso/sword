import { cn } from "@/lib/utils";
import {
	ComputerDesktopIcon,
	MicrophoneIcon,
	PhoneXMarkIcon,
	SpeakerWaveIcon,
	VideoCameraIcon,
	VideoCameraSlashIcon,
} from "@heroicons/react/16/solid";
import { useState } from "react";
import { useChatTheme } from "./chat-theme-provider";

interface CallControlsProps {
	isInCall: boolean;
	channelName: string;
	userName?: string;
	userAvatar?: string;
	onLeaveCall: () => void;
	className?: string;
}

export function CallControls({
	isInCall,
	channelName,
	userName = "You",
	userAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
	onLeaveCall,
	className,
}: CallControlsProps) {
	const { theme } = useChatTheme();
	const [isMuted, setIsMuted] = useState(false);
	const [isDeafened, setIsDeafened] = useState(false);
	const [isVideoOn, setIsVideoOn] = useState(false);
	const [isScreenSharing, setIsScreenSharing] = useState(false);

	if (!isInCall) return null;

	return (
		<div className={cn("mx-3 mb-3", className)}>
			{/* Main Container */}
			<div
				className={cn(
					"overflow-hidden rounded-lg border",
					theme.callControls.container.background,
					theme.callControls.container.border,
				)}
			>
				{/* Top Layer - Voice Status */}
				<div
					className={cn(
						"px-3 py-1.5",
						theme.callControls.statusSection.background,
					)}
				>
					<div className="flex items-center space-x-1.5">
						<SpeakerWaveIcon
							className={cn(
								"h-3.5 w-3.5",
								theme.callControls.statusSection.color,
							)}
						/>
						<span
							className={cn(
								"font-medium text-xs",
								theme.callControls.statusSection.color,
							)}
						>
							Voice Connected
						</span>
					</div>
					<div
						className={cn(
							"mt-0.5 text-xs",
							theme.callControls.statusSection.channelNameColor,
						)}
					>
						{channelName}
					</div>
				</div>

				{/* Bottom Layer - Control Buttons */}
				<div
					className={cn(
						"px-3 py-1.5",
						theme.callControls.controlsSection.background,
						theme.callControls.controlsSection.border,
					)}
				>
					<div className="flex items-center justify-between">
						{/* Video/Screen Controls - Left Side */}
						<div className="flex items-center space-x-2">
							{/* Screen Share */}
							<button
								type="button"
								onClick={() => setIsScreenSharing(!isScreenSharing)}
								className={cn(
									"flex h-7 w-7 items-center justify-center rounded transition-colors",
									isScreenSharing
										? cn(
												theme.callControls.buttons.activeBackground,
												theme.callControls.buttons.activeColor,
											)
										: cn(
												theme.callControls.buttons.background,
												theme.callControls.buttons.hoverBackground,
												theme.callControls.buttons.color,
												theme.callControls.buttons.hoverColor,
											),
								)}
								title="Screen Share"
							>
								<ComputerDesktopIcon className="h-3.5 w-3.5" />
							</button>

							{/* Video */}
							<button
								type="button"
								onClick={() => setIsVideoOn(!isVideoOn)}
								className={cn(
									"flex h-7 w-7 items-center justify-center rounded transition-colors",
									isVideoOn
										? cn(
												theme.callControls.buttons.activeBackground,
												theme.callControls.buttons.activeColor,
											)
										: cn(
												theme.callControls.buttons.background,
												theme.callControls.buttons.hoverBackground,
												theme.callControls.buttons.color,
												theme.callControls.buttons.hoverColor,
											),
								)}
								title="Camera"
							>
								{isVideoOn ? (
									<VideoCameraIcon className="h-3.5 w-3.5" />
								) : (
									<VideoCameraSlashIcon className="h-3.5 w-3.5" />
								)}
							</button>
						</div>

						{/* Voice Controls - Right Side */}
						<div className="flex items-center space-x-2">
							{/* Microphone */}
							<button
								type="button"
								onClick={() => setIsMuted(!isMuted)}
								className={cn(
									"flex h-7 w-7 items-center justify-center rounded transition-colors",
									isMuted
										? cn(
												theme.callControls.buttons.mutedBackground,
												theme.callControls.buttons.mutedColor,
											)
										: cn(
												theme.callControls.buttons.background,
												theme.callControls.buttons.hoverBackground,
												theme.callControls.buttons.color,
												theme.callControls.buttons.hoverColor,
											),
								)}
								title="Microphone"
							>
								<MicrophoneIcon className="h-3.5 w-3.5" />
							</button>

							{/* Speakers */}
							<button
								type="button"
								onClick={() => setIsDeafened(!isDeafened)}
								className={cn(
									"flex h-7 w-7 items-center justify-center rounded transition-colors",
									isDeafened
										? cn(
												theme.callControls.buttons.mutedBackground,
												theme.callControls.buttons.mutedColor,
											)
										: cn(
												theme.callControls.buttons.background,
												theme.callControls.buttons.hoverBackground,
												theme.callControls.buttons.color,
												theme.callControls.buttons.hoverColor,
											),
								)}
								title="Speakers"
							>
								<SpeakerWaveIcon className="h-3.5 w-3.5" />
							</button>

							{/* Hang Up */}
							<button
								type="button"
								onClick={onLeaveCall}
								className={cn(
									"flex h-7 w-7 items-center justify-center rounded transition-colors",
									theme.callControls.buttons.mutedBackground,
									theme.callControls.buttons.mutedColor,
								)}
								title="Leave Call"
							>
								<PhoneXMarkIcon className="h-3.5 w-3.5" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
