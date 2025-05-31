import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useChatTheme } from "./chat-theme-provider";
import { MessageInput } from "./message-input";
import MessageItem from "./message-item";
import { useStore, tables, actions, generateId } from '@/lib/livestore'
import { queryDb } from '@livestore/livestore'
import { authClient } from "@/lib/auth-client";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface FileAttachment {
	id: string;
	name: string;
	url: string;
	type: "image" | "video" | "document" | "audio";
	size?: number;
}

interface Message {
	id: number;
	user: string;
	avatar: string;
	content: string;
	timestamp: string;
	reactions: { emoji: string; count: number }[];
	attachments?: FileAttachment[];
	isEdited?: boolean;
}

interface ChatAreaProps {
	selectedChannel: string;
	className?: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ChatArea({
	selectedChannel,
	className,
}: ChatAreaProps) {
	const { theme, variant } = useChatTheme();
	const { store } = useStore()
	const { data: session } = authClient.useSession();

	// Add state to track when channel changes
	const [currentChannelId, setCurrentChannelId] = useState<string>(selectedChannel)

	// Update current channel ID when selected channel changes
	useEffect(() => {
		if (selectedChannel !== currentChannelId) {
			console.log('🔄 Channel changed from', currentChannelId, 'to', selectedChannel)
			setCurrentChannelId(selectedChannel)
		}
	}, [selectedChannel, currentChannelId])

	// =============================================================================
	// DATABASE QUERIES
	// =============================================================================

	// Query messages for the selected channel - ensure proper reactivity
	// Try a simpler approach: query all messages and filter in memory for better reactivity
	const messagesQuery = queryDb(() => {
		console.log('🔍 Querying ALL messages (will filter by channel in memory)')
		return tables.messages
	})
	
	// Query ALL messages for debugging
	const allMessagesQuery = queryDb(() => tables.messages)
	const allMessages = store.useQuery(allMessagesQuery)
	
	// Query all users
	const usersQuery = queryDb(() => 
		tables.users.where({ deletedAt: null })
	)
	
	// Query all reactions
	const reactionsQuery = queryDb(() => 
		tables.reactions
	)
	
	// Get reactive data
	const allMessagesFromQuery = store.useQuery(messagesQuery)
	
	// Filter messages in memory for the selected channel
	const messages = allMessagesFromQuery?.filter((msg: any) => 
		msg.channelId === selectedChannel && !msg.deletedAt
	)
	
	const users = store.useQuery(usersQuery)
	const reactions = store.useQuery(reactionsQuery)

	// Log detailed debugging info
	useEffect(() => {
		console.log('📊 Chat Area Data Update:', {
			selectedChannel,
			currentChannelId,
			messagesCount: messages?.length || 0,
			usersCount: users?.length || 0,
			reactionsCount: reactions?.length || 0,
			totalMessagesInDb: allMessages?.length || 0,
			messagesForThisChannel: allMessages?.filter((m: any) => m.channelId === selectedChannel).length || 0,
			allChannelIds: [...new Set(allMessages?.map((m: any) => m.channelId) || [])],
			firstFewMessages: messages?.slice(0, 3).map((m: any) => ({
				id: m.id,
				channelId: m.channelId,
				content: m.content.substring(0, 30) + '...',
				createdAt: m.createdAt
			})),
		})
	}, [selectedChannel, currentChannelId, messages, users, reactions, allMessages])
	
	// Create user lookup map for performance
	const userMap = new Map(users?.map((user: any) => [user.id, user]) || [])
	
	// =============================================================================
	// USER MANAGEMENT
	// =============================================================================

	// Ensure current user exists in LiveStore and return it
	const getCurrentUser = () => {
		if (!session?.user) {
			console.warn('⚠️ No session user found')
			return null
		}
		
		// Create a consistent user ID based on session
		const sessionUserId = `user_${session.user.email?.replace(/[^a-zA-Z0-9]/g, '_')}_${session.user.id || Date.now()}`
		
		// Check if user already exists in LiveStore
		let currentUser = users?.find((user: any) => 
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
				console.log('✅ Created new user in LiveStore:', userData.name)
				
				// Return the user data immediately (it will be persisted)
				return userData
			} catch (error) {
				console.warn('User might already exist:', error)
				// Try to find the user again after creation attempt
				currentUser = users?.find((user: any) => 
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
				console.log('✅ Updated user info:', updates)
			}
		}
		
		return currentUser || null
	}
	
	// =============================================================================
	// MESSAGE PROCESSING
	// =============================================================================

	// Create message ID mapping between string (LiveStore) and number (MessageItem)
	const messageIdMap = new Map<number, string>()
	const reverseMessageIdMap = new Map<string, number>()
	
	// Process messages data to match component interface
	const processedMessages: Message[] = [...(messages || [])]
		.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
		.map((msg: any, index: number) => {
			const numberId = index + 1
			messageIdMap.set(numberId, msg.id)
			reverseMessageIdMap.set(msg.id, numberId)
			
			const user = userMap.get(msg.userId)
			const messageReactions = (reactions || [])
				.filter((reaction: any) => reaction.messageId === msg.id)
				.reduce((acc: any, reaction: any) => {
					const existing = acc.find((r: any) => r.emoji === reaction.emoji)
					if (existing) {
						existing.count++
					} else {
						acc.push({ emoji: reaction.emoji, count: 1 })
					}
					return acc
				}, [])
			
			return {
				id: numberId,
				user: user?.username || user?.name || 'Unknown User',
				avatar: user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
				content: msg.content,
				timestamp: new Date(msg.createdAt).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
				}),
				reactions: messageReactions,
				attachments: msg.attachments ? JSON.parse(msg.attachments) : undefined,
				isEdited: !!msg.editedAt,
			}
		})

	console.log('📝 Processed Messages Summary:', {
		rawCount: messages?.length || 0,
		processedCount: processedMessages.length,
		channelId: selectedChannel,
		hasMessages: processedMessages.length > 0,
		latestMessage: processedMessages[processedMessages.length - 1]?.content?.substring(0, 30) + '...'
	})

	// =============================================================================
	// EVENT HANDLERS
	// =============================================================================

	const handleSendMessage = (message: string, files?: File[]) => {
		if (!message.trim() && (!files || files.length === 0)) return;

		const currentUser = getCurrentUser()
		if (!currentUser) {
			console.error('❌ No user found to send message. Please seed the database first.')
			alert('No user found. Please make sure the database is seeded with sample data.')
			return
		}

		if (!selectedChannel) {
			console.error('❌ No channel selected')
			alert('No channel selected. Please select a channel first.')
			return
		}

		// Handle file attachments
		let attachments: FileAttachment[] | undefined
		if (files && files.length > 0) {
			attachments = files.map((file, index) => ({
						id: `${Date.now()}-${index}`,
						name: file.name,
						url: URL.createObjectURL(file), // Create temporary URL for preview
						type: file.type.startsWith("image/")
							? "image"
							: file.type.startsWith("video/")
								? "video"
								: file.type.startsWith("audio/")
									? "audio"
									: "document",
						size: file.size,
					}))
		}

		// Create message using LiveStore action
		console.log('💬 Sending message:', {
			channelId: selectedChannel,
			userId: currentUser.id,
			content: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
			hasAttachments: !!attachments
		})

		try {
			actions.createMessage(store, {
				channelId: selectedChannel,
				userId: currentUser.id,
				content: message,
				type: 'text',
				attachments: attachments ? JSON.stringify(attachments) : undefined,
			})
			console.log('✅ Message sent successfully!')
		} catch (error) {
			console.error('❌ Failed to send message:', error)
			alert('Failed to send message. Please try again.')
		}
	};

	const handleAddReaction = (messageId: number, emoji: string) => {
		// Convert number ID back to string ID
		const realMessageId = messageIdMap.get(messageId)
		if (!realMessageId) {
			console.error('❌ Message ID not found:', messageId)
			return
		}
		
		const currentUser = getCurrentUser()
		if (!currentUser) {
			console.error('❌ No user found to add reaction')
			return
		}
		
		// Check if user already reacted with this emoji
		const existingReaction = (reactions || []).find((reaction: any) => 
			reaction.messageId === realMessageId && 
			reaction.userId === currentUser.id && 
			reaction.emoji === emoji
		)
		
		try {
					if (existingReaction) {
				// Remove reaction if it already exists
				actions.removeReaction(store, existingReaction.id)
				console.log('➖ Removed reaction:', emoji)
			} else {
				// Add new reaction
				actions.addReaction(store, realMessageId, currentUser.id, emoji)
				console.log('➕ Added reaction:', emoji)
			}
		} catch (error) {
			console.error('❌ Failed to handle reaction:', error)
		}
	};

	const handleReactionClick = (messageId: number, emoji: string) => {
		handleAddReaction(messageId, emoji)
	};

	// =============================================================================
	// RENDER CONDITIONS
	// =============================================================================

	// Show loading or no data state
	if (!users?.length) {
		return (
			<div
				className={cn(
					"flex h-full flex-col items-center justify-center",
					theme.chatArea.background,
					className,
				)}
			>
				<div className="text-center">
					<p className="text-zinc-400 text-lg">No data found</p>
					<p className="text-zinc-500 text-sm mt-2">
						Please seed the database first to see messages and users.
					</p>
					<p className="text-zinc-600 text-xs mt-1">
						Go to /test and use the seed button
					</p>
				</div>
			</div>
		)
	}

	if (!selectedChannel) {
		return (
			<div
				className={cn(
					"flex h-full flex-col items-center justify-center",
					theme.chatArea.background,
					className,
				)}
			>
				<div className="text-center">
					<p className="text-zinc-400 text-lg">No channel selected</p>
					<p className="text-zinc-500 text-sm mt-2">
						Select a channel from the sidebar to start chatting.
					</p>
				</div>
			</div>
		)
	}

	// =============================================================================
	// MAIN RENDER
	// =============================================================================

	return (
		<div
			className={cn(
				"flex h-full flex-col",
				theme.chatArea.background,
				className,
			)}
			data-theme={variant}
		>
			{/* Scrollable Messages Area */}
			<ScrollArea
				className={cn(
					"min-h-0 flex-1",
					theme.scrollbar.track,
					theme.scrollbar.thumb,
					theme.scrollbar.thumbHover,
					"scrollbar-thin",
				)}
			>
				<div
					className={cn(
						"space-y-1",
						theme.chatArea.messageArea.background,
						theme.chatArea.messageArea.padding,
					)}
				>
					{processedMessages.length === 0 ? (
						<div className="flex items-center justify-center h-full min-h-[200px]">
							<div className="text-center">
								<p className="text-zinc-400 text-sm">No messages in this channel yet</p>
								<p className="text-zinc-500 text-xs mt-1">
									Be the first to send a message!
								</p>
							</div>
						</div>
					) : (
						processedMessages.map((msg) => (
						<MessageItem
								key={`${selectedChannel}-${msg.id}`}
							message={msg}
							onAddReaction={handleAddReaction}
							onReactionClick={handleReactionClick}
						/>
						))
					)}
				</div>
			</ScrollArea>

			{/* Fixed Message Input */}
			<MessageInput
				selectedChannel={selectedChannel}
				onSendMessage={handleSendMessage}
				className="flex-shrink-0"
			/>
		</div>
	);
}
