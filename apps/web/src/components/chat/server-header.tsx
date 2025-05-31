import { cn } from "@/lib/utils";
import { Bars3Icon, UserPlusIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import { useChatTheme } from "./chat-theme-provider";
import { InvitePopup } from "./invite-popup";

interface ServerHeaderProps {
	serverName: string;
	serverId: string;
	isCollapsed?: boolean;
	className?: string;
}

export default function ServerHeader({
	serverName,
	serverId,
	isCollapsed = false,
	className,
}: ServerHeaderProps) {
	const { theme } = useChatTheme();
	const [showInvitePopup, setShowInvitePopup] = useState(false);

	// Mock server data - in real app this would come from API
	const serverData = {
		analog: {
			banner: "/images/servers/banner.jpg",
			owner: "Sword",
			ownerHandle: "@sword",
		},
		design: {
			banner:
				"https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=400&h=120&fit=crop",
			owner: "Design Lead",
			ownerHandle: "@designlead",
		},
		dev: {
			banner:
				"https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=120&fit=crop",
			owner: "Dev Team",
			ownerHandle: "@devteam",
		},
		gaming: {
			banner:
				"https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=120&fit=crop",
			owner: "Gaming Squad",
			ownerHandle: "@gamingsquad",
		},
	};

	const currentServer =
		serverData[serverId as keyof typeof serverData] || serverData.analog;

	if (isCollapsed) {
		// Collapsed header - only server name
		return (
			<>
			<div
				className={cn(
					"flex-shrink-0 border-b px-4 py-3",
					theme.channelSidebar.header.background,
					theme.channelSidebar.header.borderBottom,
					"transition-all duration-500 ease-out",
					className,
				)}
			>
				<div className="flex items-center justify-between">
					<h1
						className={cn(
							"truncate font-bold text-lg transition-all duration-500 ease-out",
							theme.channelSidebar.header.color,
						)}
					>
						{serverName}
					</h1>
						<div className="flex items-center gap-1">
							<button
								type="button"
								onClick={() => setShowInvitePopup(true)}
								className={cn(
									"flex h-8 w-8 items-center justify-center rounded-md transition-colors",
									theme.userBar.buttons.background,
									theme.userBar.buttons.hoverBackground,
									theme.userBar.buttons.color,
									theme.userBar.buttons.hoverColor,
								)}
								title="Invite Friends"
							>
								<UserPlusIcon className="h-4 w-4" />
							</button>
					<button
						type="button"
						className={cn(
							"flex h-8 w-8 items-center justify-center rounded-md transition-colors",
							theme.userBar.buttons.background,
							theme.userBar.buttons.hoverBackground,
							theme.userBar.buttons.color,
							theme.userBar.buttons.hoverColor,
						)}
					>
						<Bars3Icon className="h-4 w-4" />
					</button>
				</div>
			</div>
				</div>

				<InvitePopup
					isOpen={showInvitePopup}
					onClose={() => setShowInvitePopup(false)}
					serverId={serverId}
					serverName={serverName}
				/>
			</>
		);
	}

	// Full header with banner
	return (
		<>
		<div
			className={cn(
				"flex-shrink-0",
				theme.channelSidebar.header.background,
				theme.channelSidebar.header.borderBottom,
				"transition-all duration-500 ease-out",
				className,
			)}
		>
			{/* Server Banner */}
			<div className="relative h-32 overflow-hidden transition-all duration-500 ease-out">
				<img
					src={currentServer.banner}
					alt={`${serverName} banner`}
					className="h-full w-full object-cover transition-none duration-500 ease-out"
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-black/30 to-zinc-950/80 transition-all duration-500 ease-out" />

				{/* Server Owner Info */}
				<div className="absolute bottom-3 left-4 text-white transition-all duration-500 ease-out">
					<h2
						className={cn(
							"font-bold text-base tracking-wide transition-all duration-500 ease-out",
							theme.channelSidebar.header.color,
						)}
					>
						{currentServer.owner.toUpperCase()}
					</h2>
				</div>

				{/* Server Actions */}
					<div className="absolute top-3 right-4 flex items-center gap-1 transition-all duration-500 ease-out">
						<button
							type="button"
							onClick={() => setShowInvitePopup(true)}
							className={cn(
								"flex h-8 w-8 items-center justify-center rounded-md transition-colors",
								theme.userBar.buttons.background,
								theme.userBar.buttons.hoverBackground,
								theme.userBar.buttons.color,
								theme.userBar.buttons.hoverColor,
							)}
							title="Invite Friends"
						>
							<UserPlusIcon className="h-4 w-4" />
						</button>
					<button
						type="button"
						className={cn(
							"flex h-8 w-8 items-center justify-center rounded-md transition-colors",
							theme.userBar.buttons.background,
							theme.userBar.buttons.hoverBackground,
							theme.userBar.buttons.color,
							theme.userBar.buttons.hoverColor,
						)}
					>
						<Bars3Icon className="h-4 w-4" />
					</button>
				</div>
			</div>
		</div>

			<InvitePopup
				isOpen={showInvitePopup}
				onClose={() => setShowInvitePopup(false)}
				serverId={serverId}
				serverName={serverName}
			/>
		</>
	);
}
