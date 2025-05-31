import { cn } from "@/lib/utils";
import {
	ClipboardDocumentIcon,
	LinkIcon,
	PlusIcon,
	TrashIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { useEffect, useRef, useState } from "react";
import { useChatTheme } from "./chat-theme-provider";
import { useStore, tables, actions, generateId } from '@/lib/livestore'
import { queryDb } from '@livestore/livestore'
import { authClient } from "@/lib/auth-client";

interface InvitePopupProps {
	isOpen: boolean;
	onClose: () => void;
	serverId: string;
	serverName: string;
	className?: string;
}

export function InvitePopup({
	isOpen,
	onClose,
	serverId,
	serverName,
	className,
}: InvitePopupProps) {
	const { theme } = useChatTheme();
	const { store } = useStore()
	const { data: session } = authClient.useSession();
	const popupRef = useRef<HTMLDivElement>(null);
	const [copiedInvite, setCopiedInvite] = useState<string | null>(null);

	// Query for existing invites
	const invitesQuery = queryDb(() => 
		tables.invites.where({ 
			serverId: serverId,
			deletedAt: null 
		})
	)
	const invites = store.useQuery(invitesQuery) ?? []

	// Query for current user
	const usersQuery = queryDb(() => 
		tables.users.where({ deletedAt: null })
	)
	const users = store.useQuery(usersQuery) ?? []
	
	// Ensure current user exists in LiveStore and return it
	const getCurrentUser = () => {
		if (!session?.user) return null
		
		// Create a consistent user ID based on session
		const sessionUserId = `user_${session.user.email?.replace(/[^a-zA-Z0-9]/g, '_')}_${session.user.id || Date.now()}`
		
		// Check if user already exists in LiveStore
		let currentUser = users.find((user: any) => 
			user.email === session.user.email || user.id === sessionUserId
		)
		
		// If user doesn't exist, create them
		if (!currentUser && session.user.email) {
			const userData = {
				id: sessionUserId,
				email: session.user.email,
				name: session.user.name || session.user.email,
				username: session.user.name?.replace(/\s+/g, '') || session.user.email.split('@')[0],
				avatar: session.user.image || undefined,
				status: 'online'
			}
			
			try {
				actions.createUser(store, userData)
				console.log('Created new user in LiveStore for invites:', userData)
				
				// Return the user data immediately (it will be persisted)
				return userData
			} catch (error) {
				console.warn('User might already exist:', error)
				// Try to find the user again after creation attempt
				currentUser = users.find((user: any) => 
					user.email === session.user.email || user.id === sessionUserId
				)
			}
		}
		
		// Update user info if it has changed
		if (currentUser && session.user) {
			const updates: any = {}
			let hasUpdates = false
			
			if (session.user.name && currentUser.name !== session.user.name) {
				updates.name = session.user.name
				hasUpdates = true
			}
			if (session.user.image && currentUser.avatar !== session.user.image) {
				updates.avatar = session.user.image
				hasUpdates = true
			}
			
			if (hasUpdates) {
				actions.updateUser(store, currentUser.id, updates)
				console.log('Updated user info for invites:', updates)
			}
		}
		
		return currentUser || null
	}

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

	const handleCreateInvite = () => {
		const currentUser = getCurrentUser()
		if (!currentUser) {
			alert('Please log in to create invites')
			return
		}

		try {
			const result = actions.createInvite(store, {
				serverId,
				createdBy: currentUser.id,
				maxUses: undefined, // Unlimited uses
				expiresAt: undefined, // Never expires
			})
			
			console.log('Created invite:', result)
		} catch (error) {
			console.error('Error creating invite:', error)
			alert('Failed to create invite')
		}
	}

	const handleCopyInvite = async (inviteCode: string) => {
		const inviteUrl = `${window.location.origin}/invite/${inviteCode}`
		
		try {
			await navigator.clipboard.writeText(inviteUrl)
			setCopiedInvite(inviteCode)
			setTimeout(() => setCopiedInvite(null), 2000)
		} catch (error) {
			console.error('Error copying to clipboard:', error)
			// Fallback for older browsers
			const textArea = document.createElement('textarea')
			textArea.value = inviteUrl
			document.body.appendChild(textArea)
			textArea.select()
			document.execCommand('copy')
			document.body.removeChild(textArea)
			setCopiedInvite(inviteCode)
			setTimeout(() => setCopiedInvite(null), 2000)
		}
	}

	const handleDeleteInvite = (inviteId: string) => {
		if (confirm('Are you sure you want to delete this invite?')) {
			actions.deleteInvite(store, inviteId)
		}
	}

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		})
	}

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div
				ref={popupRef}
				className={cn(
					"w-[480px] max-h-[600px] overflow-hidden rounded-lg border shadow-2xl",
					"slide-in-from-bottom-2 fade-in animate-in duration-200",
					theme.channelSidebar.background,
					theme.channelSidebar.border,
					className,
				)}
			>
				{/* Header */}
				<div className={cn("flex items-center justify-between p-4 border-b", theme.channelSidebar.border)}>
					<div>
						<h2 className={cn("font-semibold text-lg", theme.channelSidebar.header.color)}>
							Invite Friends
						</h2>
						<p className={cn("text-sm", theme.channelSidebar.section.titleColor)}>
							to {serverName}
						</p>
					</div>
					<button
						onClick={onClose}
						className={cn(
							"rounded p-2 transition-colors",
							theme.channelSidebar.channel.hoverBackground,
							theme.channelSidebar.section.titleColor,
						)}
					>
						<XMarkIcon className="h-5 w-5" />
					</button>
				</div>

				{/* Content */}
				<div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
					{/* Create Invite Button */}
					<button
						onClick={handleCreateInvite}
						className={cn(
							"w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed transition-colors",
							"border-blue-500/30 text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10"
						)}
					>
						<PlusIcon className="h-5 w-5" />
						Create Invite Link
					</button>

					{/* Existing Invites */}
					{invites.length > 0 && (
						<div className="space-y-3">
							<h3 className={cn("font-medium text-sm", theme.channelSidebar.section.titleColor)}>
								Active Invites
							</h3>
							
							{invites.map((invite: any) => (
								<div
									key={invite.id}
									className={cn(
										"flex items-center justify-between p-3 rounded-lg border",
										theme.channelSidebar.border,
										theme.channelSidebar.channel.background
									)}
								>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<LinkIcon className="h-4 w-4 text-gray-400" />
											<code className={cn(
												"text-sm font-mono",
												theme.channelSidebar.channel.color
											)}>
												{`${window.location.origin}/invite/${invite.inviteCode}`}
											</code>
										</div>
										<div className={cn(
											"text-xs",
											theme.channelSidebar.section.titleColor
										)}>
											{invite.maxUses ? 
												`${invite.currentUses}/${invite.maxUses} uses` : 
												`${invite.currentUses} uses`
											} • 
											{invite.expiresAt ? 
												` Expires ${formatDate(invite.expiresAt)}` : 
												' Never expires'
											} • 
											Created {formatDate(invite.createdAt)}
										</div>
									</div>
									
									<div className="flex items-center gap-1">
										<button
											onClick={() => handleCopyInvite(invite.inviteCode)}
											className={cn(
												"p-2 rounded transition-colors",
												copiedInvite === invite.inviteCode ? 
													"bg-green-500/20 text-green-400" :
													theme.channelSidebar.channel.hoverBackground,
												theme.channelSidebar.channel.color
											)}
											title="Copy invite link"
										>
											<ClipboardDocumentIcon className="h-4 w-4" />
										</button>
										<button
											onClick={() => handleDeleteInvite(invite.id)}
											className={cn(
												"p-2 rounded transition-colors text-red-400 hover:bg-red-500/20"
											)}
											title="Delete invite"
										>
											<TrashIcon className="h-4 w-4" />
										</button>
									</div>
								</div>
							))}
						</div>
					)}

					{invites.length === 0 && (
						<div className="text-center py-8">
							<LinkIcon className={cn("h-12 w-12 mx-auto mb-3", theme.channelSidebar.section.titleColor)} />
							<p className={cn("text-sm", theme.channelSidebar.section.titleColor)}>
								No invite links yet
							</p>
							<p className={cn("text-xs mt-1", theme.channelSidebar.section.titleColor)}>
								Create your first invite to share this server with friends
							</p>
							<div className={cn("mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20")}>
								<p className={cn("text-xs text-amber-400")}>
									⚠️ <strong>Demo Limitation:</strong> Invites are stored locally per browser. 
									For cross-browser testing, try the pre-seeded invites: 
									<code className="text-xs">/invite/swordapp2024</code>
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
} 