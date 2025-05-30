import { cn } from "@/lib/utils";
import { EnvelopeIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import { AddServerButton } from "./add-server-button";
import { useChatTheme } from "./chat-theme-provider";
import { ServerItem } from "./server-item";
import { UserProfilePopup } from "./user-profile-popup";

// Import types from user profile popup
type UserStatus = "online" | "away" | "busy" | "invisible";

interface CustomStatus {
	emoji: string;
	text: string;
	expiresAt?: Date;
}

interface Server {
	id: string;
	name: string;
	image: string;
	color?: string;
}

const mockServers: Server[] = [
	{
		id: "sword",
		name: "Sword",
		image: "/images/servers/sword.png",
		color: "bg-blue-500",
	},
	{
		id: "design",
		name: "Design Team",
		image: "/images/servers/sword.png",
		color: "bg-purple-500",
	},
	{
		id: "dev",
		name: "Dev Community",
		image: "/images/servers/sword.png",
		color: "bg-yellow-500",
	},
	{
		id: "gaming",
		name: "Gaming",
		image: "/images/servers/sword.png",
		color: "bg-green-500",
	},
];

interface ServerSidebarProps {
	selectedServer: string;
	onServerSelect: (serverId: string) => void;
	onAddServer?: () => void;
	userName?: string;
	userAvatar?: string;
	userEmail?: string;
	onLogout?: () => void;
	onSettings?: () => void;
	className?: string;
}

export default function ServerSidebar({
	selectedServer,
	onServerSelect,
	onAddServer,
	userName,
	userAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face",
	userEmail,
	onLogout,
	onSettings,
	className,
}: ServerSidebarProps) {
	const { theme } = useChatTheme();
	const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
	const [userStatus, setUserStatus] = useState<UserStatus>("online");
	const [customStatus, setCustomStatus] = useState<CustomStatus | undefined>(
		undefined,
	);

	// Debug: Track status changes
	useEffect(() => {
		console.log("User status changed to:", userStatus);
	}, [userStatus]);

	// Status color mapping
	const getStatusColor = (status: UserStatus) => {
		console.log("Getting status color for:", status);
		const color = (() => {
			switch (status) {
				case "online":
					return "#22c55e"; // green-500
				case "away":
					return "#eab308"; // yellow-500
				case "busy":
					return "#ef4444"; // red-500
				case "invisible":
					return "#6b7280"; // zinc-500
				default:
					return "#22c55e"; // green-500
			}
		})();
		console.log("Returning color:", color);
		return color;
	};

	const handleStatusChange = (newStatus: UserStatus) => {
		console.log("Status change requested:", newStatus);
		console.log("Current status before change:", userStatus);
		setUserStatus(newStatus);
		console.log("Status should now be:", newStatus);
		// Here you would typically sync with your backend/state management
		console.log("Status changed to:", newStatus);
	};

	const handleCustomStatusChange = (newCustomStatus: CustomStatus | null) => {
		setCustomStatus(newCustomStatus || undefined);
		// Here you would typically sync with your backend/state management
		console.log("Custom status changed to:", newCustomStatus);
	};

	return (
		<>
			<div
				className={cn(
					"flex h-full flex-col items-center",
					theme.serverSidebar.width,
					theme.serverSidebar.background,
					className,
				)}
			>
				{/* DMs Header */}
				<div className="w-full p-3">
					<div className="relative">
						<div
							className={cn(
								"flex cursor-pointer items-center justify-center shadow-lg transition-colors duration-200",
								theme.serverSidebar.serverItem.size,
								theme.serverSidebar.serverItem.borderRadius,
								theme.serverSidebar.serverItem.background,
								theme.serverSidebar.serverItem.hoverBackground,
								selectedServer === "dms"
									? theme.serverSidebar.serverItem.selectedRing
									: theme.serverSidebar.serverItem.border,
							)}
						>
							<EnvelopeIcon className="h-6 w-6 text-zinc-300" />
						</div>
					</div>
				</div>

				{/* Server List */}
				<div className="flex-1 space-y-3 py-3">
					{mockServers.map((server) => (
						<ServerItem
							key={server.id}
							id={server.id}
							name={server.name}
							image={server.image}
							color={server.color}
							isSelected={selectedServer === server.id}
							onClick={() => onServerSelect(server.id)}
						/>
					))}

					{/* Add Server Button */}
					<AddServerButton onClick={onAddServer} />
				</div>

				{/* User Profile Button */}
				<div className="w-full p-3">
					<div className="relative">
						<button
							onClick={() => setIsProfilePopupOpen(true)}
							className={cn(
								"group relative shadow-lg transition-all duration-200",
								theme.serverSidebar.serverItem.size,
								theme.serverSidebar.serverItem.borderRadius,
								theme.serverSidebar.serverItem.hoverBackground,
								"overflow-hidden",
							)}
						>
							<img
								src={userAvatar}
								alt={userName || "User"}
								className="h-full w-full rounded-inherit object-cover"
							/>

							{/* Hover effect */}
							<div className="absolute inset-0 rounded-inherit bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
						</button>

						{/* Online Status Indicator - positioned outside button with dynamic color */}
						<div
							className={cn(
								"-bottom-0.5 -right-0.5 absolute h-4 w-4 rounded-full border-2",
								userStatus === "invisible" ? "opacity-0" : "opacity-100",
							)}
							style={{
								backgroundColor: getStatusColor(userStatus),
								borderColor: theme.serverSidebar.background.includes("zinc-900")
									? "#18181b"
									: theme.serverSidebar.background.includes("[#202225]")
										? "#202225"
										: theme.serverSidebar.background.includes("[#")
											? theme.serverSidebar.background.match(
													/\[#([^\]]+)\]/,
												)?.[1]
											: "#18181b",
							}}
						/>
					</div>
				</div>
			</div>

			{/* User Profile Popup */}
			<UserProfilePopup
				isOpen={isProfilePopupOpen}
				onClose={() => setIsProfilePopupOpen(false)}
				userName={userName}
				userAvatar={userAvatar}
				userEmail={userEmail}
				userStatus={userStatus}
				customStatus={customStatus}
				onStatusChange={handleStatusChange}
				onCustomStatusChange={handleCustomStatusChange}
				onLogout={onLogout}
				onSettings={onSettings}
			/>
		</>
	);
}
