import {
	ChannelSidebar,
	ChatArea,
	ChatThemeCustomizer,
	ChatThemeProvider,
	ServerSidebar,
	TopBar,
	useChatTheme,
} from "@/components/chat";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
});

function DashboardContent() {
	const { data: session, isPending } = authClient.useSession();
	const navigate = Route.useNavigate();
	const [selectedServer, setSelectedServer] = useState("analog");
	const [selectedChannel, setSelectedChannel] = useState("dev-discussion");
	const [callState, setCallState] = useState<{
		isInCall: boolean;
		channelName: string;
	}>({ isInCall: false, channelName: "" });

	const { theme, variant } = useChatTheme();

	useEffect(() => {
		if (!session && !isPending) {
			navigate({
				to: "/login",
			});
		}
	}, [session, isPending]);

	const handleJoinVoice = (channelName: string) => {
		setCallState({ isInCall: true, channelName });
		console.log(`Joining voice channel: ${channelName}`);
	};

	const handleLeaveCall = () => {
		setCallState({ isInCall: false, channelName: "" });
		console.log("Left voice call");
	};

	const handleLogout = async () => {
		await authClient.signOut();
		navigate({ to: "/login" });
	};

	const handleSettings = () => {
		console.log("Open settings");
	};

	if (isPending) {
		return (
			<div
				className={cn(
					"flex h-screen items-center justify-center text-zinc-100",
					theme.layout.background,
				)}
			>
				<div className="flex items-center space-x-3">
					<div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
					<span>Loading...</span>
				</div>
			</div>
		);
	}

	// Get server name based on selected server
	const getServerName = (serverId: string) => {
		const serverNames: Record<string, string> = {
			analog: "Sword",
			design: "Design Team",
			dev: "Dev Community",
			gaming: "Gaming",
		};
		return serverNames[serverId] || "Sword";
	};

	return (
		<div
			className={cn("h-screen text-zinc-100", theme.layout.background)}
			data-theme={variant}
		>
			<div className="flex h-full">
				{/* Server Sidebar - Fixed Width */}
				<div className="mt-6 flex-shrink-0">
					<ServerSidebar
						selectedServer={selectedServer}
						onServerSelect={setSelectedServer}
						userName={session?.user.name || undefined}
						userAvatar={session?.user.image || undefined}
						userEmail={session?.user.email || undefined}
						onLogout={handleLogout}
						onSettings={handleSettings}
					/>
				</div>

				{/* Main Resizable Area */}
				<div className="mt-6 flex-1">
					<ResizablePanelGroup direction="horizontal" className="h-full">
						{/* Channel Sidebar */}
						<ResizablePanel defaultSize={25} minSize={15} maxSize={35}>
							<ChannelSidebar
								selectedChannel={selectedChannel}
								onChannelSelect={setSelectedChannel}
								onJoinVoice={handleJoinVoice}
								serverName={getServerName(selectedServer)}
								selectedServer={selectedServer}
								userName={session?.user.name || undefined}
								userAvatar={session?.user.image || undefined}
								callState={callState}
								onLeaveCall={handleLeaveCall}
							/>
						</ResizablePanel>

						{/* Resize Handle */}
						<ResizableHandle withHandle />

						{/* Chat Area */}
						<ResizablePanel defaultSize={75} minSize={65}>
							<div className="flex h-full flex-col">
								<TopBar selectedChannel={selectedChannel} />
								<div className="min-h-0 flex-1">
									<ChatArea selectedChannel={selectedChannel} />
								</div>
							</div>
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			</div>

			{/* Theme Customizer */}
			<ChatThemeCustomizer />
		</div>
	);
}

function RouteComponent() {
	return (
		<ChatThemeProvider>
			<DashboardContent />
		</ChatThemeProvider>
	);
}
