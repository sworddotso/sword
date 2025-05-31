import { createFileRoute, Navigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { useStore, tables, actions } from '@/lib/livestore'
import { queryDb } from '@livestore/livestore'
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
	UsersIcon, 
	ShieldCheckIcon, 
	UserMinusIcon
} from "@heroicons/react/24/outline";
import { CogIcon as SettingsIcon } from "@heroicons/react/24/solid";

// Simple Badge component since it doesn't exist
const Badge = ({ children, className, style, variant }: { 
	children: React.ReactNode, 
	className?: string, 
	style?: React.CSSProperties,
	variant?: string 
}) => (
	<span 
		className={cn("inline-flex items-center px-2 py-1 rounded-full text-xs font-medium", className)}
		style={style}
	>
		{children}
	</span>
);

// Crown icon as a simple component since it's not available
const CrownIcon = ({ className }: { className?: string }) => (
	<svg className={className} fill="currentColor" viewBox="0 0 24 24">
		<path d="M12 6L9 9l3 3 3-3-3-3zm0 10.5c-3.5 0-6.5-2.5-6.5-6s3-6.5 6.5-6.5 6.5 3 6.5 6.5-3 6-6.5 6z"/>
	</svg>
);

export const Route = createFileRoute("/s/$serverId/members")({
	component: MembersPage,
});

function MembersPage() {
	const { serverId } = Route.useParams();
	const navigate = Route.useNavigate();
	const { data: session, isPending } = authClient.useSession();
	const { store } = useStore();
	const [kickingMember, setKickingMember] = useState<string | null>(null);

	// =============================================================================
	// DATABASE QUERIES - Get real server data
	// =============================================================================

	// Get server info
	const serverQuery = queryDb(() => 
		tables.servers.where({ id: serverId, deletedAt: null })
	);
	const servers = store.useQuery(serverQuery) ?? [];
	const server = servers[0];

	// Get all server members (real members)
	const membersQuery = queryDb(() => 
		tables.serverMembers.where({ serverId: serverId })
	);
	const serverMembers = store.useQuery(membersQuery) ?? [];

	// Get all users to display member info
	const usersQuery = queryDb(() => 
		tables.users.where({ deletedAt: null })
	);
	const allUsers = store.useQuery(usersQuery) ?? [];

	// Get all roles for this server
	const rolesQuery = queryDb(() => 
		tables.roles.where({ serverId: serverId })
	);
	const serverRoles = store.useQuery(rolesQuery) ?? [];

	// =============================================================================
	// MEMBER DATA PROCESSING
	// =============================================================================

	// Get current user
	const getCurrentUser = () => {
		if (!session?.user?.email) return null;
		return allUsers.find((user: any) => user.email === session.user.email);
	};

	const currentUser = getCurrentUser();
	
	// Check if current user is admin of this server
	const currentMember = serverMembers.find((member: any) => member.userId === currentUser?.id);
	const currentUserRoles = currentMember?.roles ? JSON.parse(currentMember.roles) : [];
	const ownerRole = serverRoles.find((role: any) => role.name === 'Owner');
	const moderatorRole = serverRoles.find((role: any) => role.name === 'Moderator');
	const isAdmin = server?.ownerId === currentUser?.id || 
	                currentUserRoles.includes(ownerRole?.id) || 
	                currentUserRoles.includes(moderatorRole?.id);

	// Process members with user info and roles
	const membersWithInfo = serverMembers.map((member: any) => {
		const user = allUsers.find((u: any) => u.id === member.userId);
		const memberRoles = member.roles ? JSON.parse(member.roles) : [];
		const roleObjects = memberRoles.map((roleId: string) => 
			serverRoles.find((role: any) => role.id === roleId)
		).filter(Boolean);

		return {
			...member,
			user,
			roleObjects,
			isOwner: server?.ownerId === user?.id,
			isModerator: roleObjects.some((role: any) => role.name === 'Moderator'),
			joinedDate: new Date(member.joinedAt).toLocaleDateString(),
		};
	}).filter((member: any) => member.user); // Only show members with valid user data

	// =============================================================================
	// ACTIONS
	// =============================================================================

	const handleKickMember = async (memberId: string, userName: string) => {
		if (!isAdmin) {
			alert("You don't have permission to kick members.");
			return;
		}

		if (confirm(`Are you sure you want to kick ${userName} from the server?`)) {
			setKickingMember(memberId);
			try {
				actions.leaveServer(store, memberId);
				console.log(`✅ Kicked member ${userName}`);
			} catch (error) {
				console.error('❌ Failed to kick member:', error);
				alert('Failed to kick member. Please try again.');
			} finally {
				setKickingMember(null);
			}
		}
	};

	// =============================================================================
	// RENDER CONDITIONS
	// =============================================================================

	if (isPending) {
		return (
			<div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-100">
				<div className="flex items-center space-x-3">
					<div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
					<span>Loading members...</span>
				</div>
			</div>
		);
	}

	if (!session) {
		return <Navigate to="/login" />;
	}

	if (!server) {
		return (
			<div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-100">
				<div className="text-center">
					<h2 className="text-xl font-semibold mb-4">Server Not Found</h2>
					<p className="mb-4">The server you're looking for doesn't exist.</p>
					<Button onClick={() => navigate({ to: '/s' })}>
						Go Back to Servers
					</Button>
				</div>
			</div>
		);
	}

	// =============================================================================
	// MAIN RENDER
	// =============================================================================

	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100">
			{/* Header */}
			<div className="bg-zinc-900 border-b border-zinc-800 p-6">
				<div className="max-w-4xl mx-auto">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<Button
								variant="ghost"
								onClick={() => navigate({ to: '/s' })}
								className="text-zinc-400 hover:text-zinc-100"
							>
								← Back to Chat
							</Button>
							<div>
								<h1 className="text-2xl font-bold flex items-center space-x-2">
									<UsersIcon className="h-6 w-6" />
									<span>{server.name} Members</span>
								</h1>
								<p className="text-zinc-400 text-sm">
									{membersWithInfo.length} member{membersWithInfo.length !== 1 ? 's' : ''}
								</p>
							</div>
						</div>
						
						{isAdmin && (
							<Badge variant="secondary" className="bg-blue-900 text-blue-100">
								<SettingsIcon className="h-3 w-3 mr-1" />
								Admin
							</Badge>
						)}
					</div>
				</div>
			</div>

			{/* Members List */}
			<div className="max-w-4xl mx-auto p-6">
				<div className="space-y-4">
					{membersWithInfo.length === 0 ? (
						<div className="text-center py-12">
							<UsersIcon className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-zinc-400 mb-2">No members found</h3>
							<p className="text-zinc-500">This server doesn't have any members yet.</p>
						</div>
					) : (
						membersWithInfo.map((member: any) => (
							<div
								key={member.id}
								className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-zinc-700 transition-colors"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-4">
										{/* Avatar */}
										<div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center">
											{member.user.avatar ? (
												<img
													src={member.user.avatar}
													alt={member.user.name}
													className="w-full h-full rounded-full object-cover"
												/>
											) : (
												<span className="text-lg font-medium text-zinc-300">
													{member.user.name?.charAt(0).toUpperCase()}
												</span>
											)}
										</div>

										{/* User Info */}
										<div>
											<div className="flex items-center space-x-2">
												<h3 className="font-medium text-zinc-100">
													{member.user.name || member.user.username}
												</h3>
												
												{/* Role Badges */}
												{member.isOwner && (
													<Badge className="bg-yellow-900 text-yellow-100">
														<CrownIcon className="h-3 w-3 mr-1" />
														Owner
													</Badge>
												)}
												{member.isModerator && !member.isOwner && (
													<Badge className="bg-blue-900 text-blue-100">
														<ShieldCheckIcon className="h-3 w-3 mr-1" />
														Moderator
													</Badge>
												)}
												{member.roleObjects.filter((role: any) => 
													role.name !== 'Owner' && role.name !== 'Moderator' && role.name !== '@everyone'
												).map((role: any) => (
													<Badge
														key={role.id}
														style={{ backgroundColor: role.color + '20', color: role.color }}
														className="text-xs"
													>
														{role.name}
													</Badge>
												))}
											</div>
											
											<div className="text-sm text-zinc-400 space-y-1">
												<p>@{member.user.username || member.user.email}</p>
												<p>Joined {member.joinedDate}</p>
												{member.user.status && (
													<p className="flex items-center space-x-1">
														<div className={cn(
															"w-2 h-2 rounded-full",
															member.user.status === 'online' && "bg-green-500",
															member.user.status === 'away' && "bg-yellow-500",
															member.user.status === 'busy' && "bg-red-500",
															member.user.status === 'offline' && "bg-zinc-500"
														)} />
														<span className="capitalize">{member.user.status}</span>
													</p>
												)}
											</div>
										</div>
									</div>

									{/* Actions */}
									{isAdmin && !member.isOwner && member.user.id !== currentUser?.id && (
										<div className="flex items-center space-x-2">
											<Button
												variant="destructive"
												size="sm"
												onClick={() => handleKickMember(member.id, member.user.name)}
												disabled={kickingMember === member.id}
												className="text-xs"
											>
												{kickingMember === member.id ? (
													<div className="flex items-center space-x-1">
														<div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
														<span>Kicking...</span>
													</div>
												) : (
													<>
														<UserMinusIcon className="h-3 w-3 mr-1" />
														Kick
													</>
												)}
											</Button>
										</div>
									)}
								</div>
							</div>
						))
					)}
				</div>

				{/* Footer Info */}
				{isAdmin && (
					<div className="mt-8 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
						<h4 className="font-medium text-zinc-100 mb-2">Admin Controls</h4>
						<p className="text-sm text-zinc-400">
							As an admin, you can kick members from this server. The server owner cannot be kicked.
						</p>
					</div>
				)}
			</div>
		</div>
	);
} 