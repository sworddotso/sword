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

interface FloatingCallOverlayProps {
	isInCall: boolean;
	channelName: string;
	userName?: string;
	userAvatar?: string;
	onLeaveCall: () => void;
	className?: string;
}

export function FloatingCallOverlay({
	isInCall,
	channelName,
	userName = "You",
	userAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
	onLeaveCall,
	className,
}: FloatingCallOverlayProps) {
	const { theme } = useChatTheme();
	const [isMuted, setIsMuted] = useState(false);
	const [isDeafened, setIsDeafened] = useState(false);
	const [isVideoOn, setIsVideoOn] = useState(false);
	const [isScreenSharing, setIsScreenSharing] = useState(false);

	if (!isInCall) return null;

	return (
		<div
			className={cn(
				"-translate-x-1/2 fixed top-4 left-1/2 z-50 transform",
				"rounded-lg border border-zinc-700 bg-zinc-800 shadow-2xl",
				"min-w-[400px] max-w-md",
				className,
			)}
		>
			{/* Header Section */}
			<div className="border-zinc-700 border-b p-4">
				<div className="flex items-center space-x-3">
					{/* User Avatar */}
					<img
						src={userAvatar}
						alt={userName}
						className="h-8 w-8 rounded-full object-cover"
					/>

					{/* Voice Status */}
					<div className="flex flex-1 items-center space-x-2">
						<SpeakerWaveIcon className="h-5 w-5 text-green-400" />
						<div>
							<div className="font-semibold text-green-400 text-sm">
								Voice Connected
							</div>
							<div className="text-sm text-zinc-300">{channelName}</div>
						</div>
					</div>
				</div>
			</div>

			{/* Call Controls */}
			<div className="p-4">
				<div className="flex items-center justify-center space-x-3">
					{/* Screen Share */}
					<button
						type="button"
						onClick={() => setIsScreenSharing(!isScreenSharing)}
						className={cn(
							"flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
							isScreenSharing
								? "bg-green-600 text-white hover:bg-green-500"
								: "bg-zinc-700 text-zinc-300 hover:bg-zinc-600",
						)}
					>
						<ComputerDesktopIcon className="h-5 w-5" />
					</button>

					{/* Video */}
					<button
						type="button"
						onClick={() => setIsVideoOn(!isVideoOn)}
						className={cn(
							"flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
							isVideoOn
								? "bg-green-600 text-white hover:bg-green-500"
								: "bg-zinc-700 text-zinc-300 hover:bg-zinc-600",
						)}
					>
						{isVideoOn ? (
							<VideoCameraIcon className="h-5 w-5" />
						) : (
							<VideoCameraSlashIcon className="h-5 w-5" />
						)}
					</button>

					{/* Microphone */}
					<button
						type="button"
						onClick={() => setIsMuted(!isMuted)}
						className={cn(
							"flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
							isMuted
								? "bg-red-600 text-white hover:bg-red-500"
								: "bg-zinc-700 text-zinc-300 hover:bg-zinc-600",
						)}
					>
						<MicrophoneIcon className="h-5 w-5" />
					</button>

					{/* Speakers */}
					<button
						type="button"
						onClick={() => setIsDeafened(!isDeafened)}
						className={cn(
							"flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
							isDeafened
								? "bg-red-600 text-white hover:bg-red-500"
								: "bg-zinc-700 text-zinc-300 hover:bg-zinc-600",
						)}
					>
						<SpeakerWaveIcon className="h-5 w-5" />
					</button>

					{/* Hang Up */}
					<button
						type="button"
						onClick={onLeaveCall}
						className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 text-white transition-colors hover:bg-red-500"
					>
						<PhoneXMarkIcon className="h-5 w-5" />
					</button>
				</div>
			</div>
		</div>
	);
}
