import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useChatTheme } from "./chat-theme-provider";
import { MessageInput } from "./message-input";
import MessageItem from "./message-item";

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

const initialMockMessages: Message[] = [
	{
		id: 1,
		user: "Snzhar",
		avatar:
			"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
		content:
			"Check out this **markdown** support! We can now use:\n\n- Lists\n- **Bold text**\n- *Italic text*\n- `code blocks`\n\nAnd even math: $E = mc^2$",
		timestamp: "21:50",
		reactions: [
			{ emoji: "🔥", count: 2 },
			{ emoji: "❤️", count: 1 },
		],
		isEdited: false,
	},
	{
		id: 2,
		user: "dayum",
		avatar:
			"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
		content:
			"Here's a code block example:\n\n```javascript\nconst message = 'Hello World!';\nconsole.log(message);\n```\n\nPretty neat! 🚀",
		timestamp: "21:48",
		reactions: [{ emoji: "💯", count: 3 }],
	},
	{
		id: 3,
		user: "MathWiz",
		avatar:
			"https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=40&h=40&fit=crop&crop=face",
		content:
			"LaTeX math support is amazing! Check this out:\n\n$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$\n\nAnd inline math: $\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$",
		timestamp: "21:45",
		reactions: [
			{ emoji: "🧮", count: 5 },
			{ emoji: "🤯", count: 2 },
		],
	},
	{
		id: 4,
		user: "DesignGuru",
		avatar:
			"https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=40&h=40&fit=crop&crop=face",
		content: "Love the new file upload feature! Here's my latest design:",
		timestamp: "21:40",
		attachments: [
			{
				id: "1",
				name: "new_design_concept.png",
				url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop",
				type: "image",
				size: 2456789,
			},
		],
		reactions: [
			{ emoji: "🎨", count: 4 },
			{ emoji: "👏", count: 6 },
		],
	},
	{
		id: 5,
		user: "DevLead",
		avatar:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
		content:
			"Documentation update attached. Also, here's a useful table:\n\n| Feature | Status | Priority |\n|---------|--------|----------|\n| Markdown | ✅ Done | High |\n| LaTeX | ✅ Done | High |\n| Files | ✅ Done | Medium |\n| Emojis | 🚧 In Progress | Low |",
		timestamp: "21:35",
		attachments: [
			{
				id: "2",
				name: "api_documentation.pdf",
				url: "#",
				type: "document",
				size: 1234567,
			},
		],
		reactions: [{ emoji: "📚", count: 2 }],
		isEdited: true,
	},
];

interface ChatAreaProps {
	selectedChannel: string;
	className?: string;
}

export default function ChatArea({
	selectedChannel,
	className,
}: ChatAreaProps) {
	const { theme, variant } = useChatTheme();
	const [messages, setMessages] = useState<Message[]>(initialMockMessages);

	const getCurrentTimestamp = () => {
		const now = new Date();
		return now.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
	};

	const handleSendMessage = (message: string, files?: File[]) => {
		if (!message.trim() && (!files || files.length === 0)) return;

		const newMessage: Message = {
			id: messages.length + 1,
			user: "You", // Current user
			avatar:
				"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
			content: message,
			timestamp: getCurrentTimestamp(),
			reactions: [],
			attachments: files
				? files.map((file, index) => ({
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
				: undefined,
			isEdited: false,
		};

		setMessages((prev) => [...prev, newMessage]);
	};

	const handleAddReaction = (messageId: number, emoji: string) => {
		setMessages((prev) =>
			prev.map((msg) => {
				if (msg.id === messageId) {
					const existingReaction = msg.reactions.find((r) => r.emoji === emoji);
					if (existingReaction) {
						// Increment count
						return {
							...msg,
							reactions: msg.reactions.map((r) =>
								r.emoji === emoji ? { ...r, count: r.count + 1 } : r,
							),
						};
					}
					// Add new reaction
					return {
						...msg,
						reactions: [...msg.reactions, { emoji, count: 1 }],
					};
				}
				return msg;
			}),
		);
	};

	const handleReactionClick = (messageId: number, emoji: string) => {
		setMessages((prev) =>
			prev.map((msg) => {
				if (msg.id === messageId) {
					const existingReaction = msg.reactions.find((r) => r.emoji === emoji);
					if (existingReaction) {
						if (existingReaction.count > 1) {
							// Decrement count
							return {
								...msg,
								reactions: msg.reactions.map((r) =>
									r.emoji === emoji ? { ...r, count: r.count - 1 } : r,
								),
							};
						}
						// Remove reaction
						return {
							...msg,
							reactions: msg.reactions.filter((r) => r.emoji !== emoji),
						};
					}
				}
				return msg;
			}),
		);
	};

	return (
		<div
			className={cn(
				"flex h-full flex-col",
				theme.chatArea.background,
				className,
			)}
			data-theme={variant}
		>
			{/* Scrollable Messages Area with Shadcn ScrollArea */}
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
					{messages.map((msg) => (
						<MessageItem
							key={msg.id}
							message={msg}
							onAddReaction={handleAddReaction}
							onReactionClick={handleReactionClick}
						/>
					))}
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
