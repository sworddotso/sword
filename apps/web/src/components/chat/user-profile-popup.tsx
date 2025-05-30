import { cn } from "@/lib/utils";
import {
	ArrowRightStartOnRectangleIcon,
	CheckIcon,
	CogIcon,
	FaceSmileIcon,
	MoonIcon,
	SunIcon,
	UserIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { useEffect, useRef, useState } from "react";
import { useChatTheme } from "./chat-theme-provider";

// User status types
type UserStatus = "online" | "away" | "busy" | "invisible";

interface CustomStatus {
	emoji: string;
	text: string;
	expiresAt?: Date;
}

interface UserProfilePopupProps {
	isOpen: boolean;
	onClose: () => void;
	userName?: string;
	userAvatar?: string;
	userEmail?: string;
	userStatus?: UserStatus;
	customStatus?: CustomStatus;
	onLogout?: () => void;
	onSettings?: () => void;
	onStatusChange?: (status: UserStatus) => void;
	onCustomStatusChange?: (customStatus: CustomStatus | null) => void;
	className?: string;
}

const STATUS_OPTIONS: {
	status: UserStatus;
	label: string;
	color: string;
	description: string;
}[] = [
	{
		status: "online",
		label: "Online",
		color: "#22c55e",
		description: "Let others know you're around",
	},
	{
		status: "away",
		label: "Away",
		color: "#eab308",
		description: "Let others know you're away",
	},
	{
		status: "busy",
		label: "Do Not Disturb",
		color: "#ef4444",
		description: "Only urgent notifications will reach you",
	},
	{
		status: "invisible",
		label: "Invisible",
		color: "#6b7280",
		description: "You won't appear online, but can still use Discord normally",
	},
];

const PRESET_STATUSES = [
	{ emoji: "🍕", text: "Out to lunch" },
	{ emoji: "🏠", text: "Working from home" },
	{ emoji: "🎉", text: "Celebrating" },
	{ emoji: "🌴", text: "On vacation" },
	{ emoji: "😷", text: "Out sick" },
	{ emoji: "🎮", text: "Gaming" },
	{ emoji: "📚", text: "Studying" },
	{ emoji: "☕", text: "On a coffee break" },
];

export function UserProfilePopup({
	isOpen,
	onClose,
	userName = "User",
	userAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
	userEmail = "user@example.com",
	userStatus = "online",
	customStatus,
	onLogout,
	onSettings,
	onStatusChange,
	onCustomStatusChange,
	className,
}: UserProfilePopupProps) {
	const { theme } = useChatTheme();
	const popupRef = useRef<HTMLDivElement>(null);
	const [showStatusMenu, setShowStatusMenu] = useState(false);
	const [showCustomStatusInput, setShowCustomStatusInput] = useState(false);
	const [customStatusText, setCustomStatusText] = useState("");
	const [customStatusEmoji, setCustomStatusEmoji] = useState("😊");

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				popupRef.current &&
				!popupRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [isOpen, onClose]);

	const currentStatusColor =
		STATUS_OPTIONS.find((s) => s.status === userStatus)?.color || "#22c55e";

	const handleSetCustomStatus = () => {
		if (customStatusText.trim()) {
			onCustomStatusChange?.({
				emoji: customStatusEmoji,
				text: customStatusText.trim(),
			});
		}
		setShowCustomStatusInput(false);
		setCustomStatusText("");
		setCustomStatusEmoji("😊");
	};

	const handleClearCustomStatus = () => {
		onCustomStatusChange?.(null);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-start">
			<div
				ref={popupRef}
				className={cn(
					"mb-4 ml-20 overflow-hidden rounded-lg border shadow-2xl",
					"w-[320px]",
					"slide-in-from-left-2 fade-in animate-in duration-200",
					theme.channelSidebar.background,
					theme.channelSidebar.border,
					className,
				)}
			>
				{/* Compact User Info Header */}
				<div className={cn("p-3", theme.channelSidebar.header.background)}>
					<div className="flex items-center space-x-3">
						<div className="relative">
							<img
								src={userAvatar}
								alt={userName}
								className="h-10 w-10 rounded-full object-cover"
							/>
							<div
								className={cn(
									"-bottom-0.5 -right-0.5 absolute h-3.5 w-3.5 rounded-full border-2",
									theme.channelSidebar.background,
								)}
								style={{
									backgroundColor: currentStatusColor,
									borderColor: theme.channelSidebar.background.includes(
										"zinc-950",
									)
										? "#0c0a09"
										: theme.channelSidebar.background.includes("[#")
											? theme.channelSidebar.background.match(
													/\[#([^\]]+)\]/,
												)?.[1]
											: "#0c0a09",
								}}
							/>
						</div>
						<div className="min-w-0 flex-1">
							<h3
								className={cn(
									"truncate font-semibold text-sm",
									theme.channelSidebar.header.color,
								)}
							>
								{userName}
							</h3>
							<button
								onClick={() => setShowStatusMenu(!showStatusMenu)}
								className={cn(
									"truncate text-left text-xs hover:underline",
									theme.channelSidebar.section.titleColor,
									theme.channelSidebar.section.titleHoverColor,
								)}
							>
								{STATUS_OPTIONS.find((s) => s.status === userStatus)?.label ||
									`Unknown: ${userStatus}`}
							</button>
						</div>
					</div>

					{/* Custom Status */}
					{customStatus ? (
						<div className="mt-2 flex items-center justify-between">
							<div className="flex items-center space-x-1">
								<span className="text-sm">{customStatus.emoji}</span>
								<span
									className={cn(
										"truncate text-xs",
										theme.channelSidebar.section.titleColor,
									)}
								>
									{customStatus.text}
								</span>
							</div>
							<button
								onClick={handleClearCustomStatus}
								className={cn(
									"rounded p-1 text-red-400 hover:bg-red-500/20",
									theme.channelSidebar.channel.hoverBackground,
								)}
							>
								<XMarkIcon className="h-3 w-3" />
							</button>
						</div>
					) : (
						<button
							onClick={() => setShowCustomStatusInput(true)}
							className={cn(
								"mt-2 w-full rounded p-1 text-left text-xs transition-colors",
								theme.channelSidebar.channel.color,
								theme.channelSidebar.channel.hoverColor,
								theme.channelSidebar.channel.hoverBackground,
							)}
						>
							<FaceSmileIcon className="mr-1 inline h-3 w-3" />
							Set a status
						</button>
					)}

					{/* Status Menu */}
					{showStatusMenu && (
						<div
							className={cn(
								"mt-2 space-y-1 rounded-md border p-2",
								theme.channelSidebar.background,
								theme.channelSidebar.border,
							)}
						>
							{STATUS_OPTIONS.map((option) => (
								<button
									key={option.status}
									onClick={() => {
										onStatusChange?.(option.status);
										setShowStatusMenu(false);
									}}
									className={cn(
										"flex w-full items-center space-x-2 rounded p-2 text-xs transition-colors",
										theme.channelSidebar.channel.background,
										theme.channelSidebar.channel.hoverBackground,
										theme.channelSidebar.channel.color,
										userStatus === option.status &&
											theme.channelSidebar.channel.selectedBackground,
									)}
								>
									<div
										className="h-3 w-3 rounded-full"
										style={{ backgroundColor: option.color }}
									/>
									<div className="flex-1 text-left">
										<div className="font-medium">{option.label}</div>
									</div>
									{userStatus === option.status && (
										<CheckIcon className="h-3 w-3 text-green-400" />
									)}
								</button>
							))}
						</div>
					)}

					{/* Custom Status Input */}
					{showCustomStatusInput && (
						<div
							className={cn(
								"mt-2 space-y-2 rounded-md border p-2",
								theme.channelSidebar.background,
								theme.channelSidebar.border,
							)}
						>
							<div className="flex items-center space-x-2">
								<input
									type="text"
									value={customStatusEmoji}
									onChange={(e) => setCustomStatusEmoji(e.target.value)}
									className="w-8 bg-transparent text-center text-sm"
									maxLength={2}
								/>
								<input
									type="text"
									value={customStatusText}
									onChange={(e) => setCustomStatusText(e.target.value)}
									placeholder="What's your status?"
									className={cn(
										"flex-1 border-none bg-transparent text-xs outline-none",
										theme.channelSidebar.channel.color,
									)}
									maxLength={100}
								/>
							</div>

							{/* Preset Statuses */}
							<div className="grid grid-cols-2 gap-1">
								{PRESET_STATUSES.map((preset, index) => (
									<button
										key={index}
										onClick={() => {
											setCustomStatusEmoji(preset.emoji);
											setCustomStatusText(preset.text);
										}}
										className={cn(
											"rounded p-1 text-left text-xs transition-colors",
											theme.channelSidebar.channel.hoverBackground,
											theme.channelSidebar.channel.color,
										)}
									>
										{preset.emoji} {preset.text}
									</button>
								))}
							</div>

							<div className="flex justify-end space-x-1">
								<button
									onClick={() => setShowCustomStatusInput(false)}
									className={cn(
										"rounded px-2 py-1 text-xs transition-colors",
										theme.channelSidebar.channel.hoverBackground,
										theme.channelSidebar.channel.color,
									)}
								>
									Cancel
								</button>
								<button
									onClick={handleSetCustomStatus}
									disabled={!customStatusText.trim()}
									className="rounded bg-blue-600 px-2 py-1 text-white text-xs transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
								>
									Set Status
								</button>
							</div>
						</div>
					)}
				</div>

				{/* Compact Menu Items */}
				<div className="space-y-1 p-2">
					<button
						onClick={() => {
							onSettings?.();
							onClose();
						}}
						className={cn(
							"flex w-full items-center space-x-2 rounded p-2 text-sm transition-colors",
							theme.channelSidebar.channel.background,
							theme.channelSidebar.channel.hoverBackground,
							theme.channelSidebar.channel.color,
							theme.channelSidebar.channel.hoverColor,
						)}
					>
						<CogIcon className="h-4 w-4" />
						<span>Settings</span>
					</button>

					<button
						onClick={() => {
							// Toggle theme or other preferences
							onClose();
						}}
						className={cn(
							"flex w-full items-center space-x-2 rounded p-2 text-sm transition-colors",
							theme.channelSidebar.channel.background,
							theme.channelSidebar.channel.hoverBackground,
							theme.channelSidebar.channel.color,
							theme.channelSidebar.channel.hoverColor,
						)}
					>
						<MoonIcon className="h-4 w-4" />
						<span>Appearance</span>
					</button>

					<div className={cn("my-1 border-t", theme.channelSidebar.border)} />

					<button
						onClick={() => {
							onLogout?.();
							onClose();
						}}
						className="flex w-full items-center space-x-2 rounded p-2 text-red-400 text-sm transition-colors hover:bg-red-500/10 hover:text-red-300"
					>
						<ArrowRightStartOnRectangleIcon className="h-4 w-4" />
						<span>Log Out</span>
					</button>
				</div>
			</div>
		</div>
	);
}
