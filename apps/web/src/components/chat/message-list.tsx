import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { useChatTheme } from "./chat-theme-provider";
import MessageItem from "./message-item";

interface Message {
	id: number;
	user: string;
	avatar: string;
	content: string;
	timestamp: string;
	reactions: { emoji: string; count: number }[];
	attachments?: {
		id: string;
		name: string;
		url: string;
		type: "image" | "video" | "document" | "audio";
		size?: number;
	}[];
	isEdited?: boolean;
}

interface MessageListProps {
	messages: Message[];
	onAddReaction?: (messageId: number, emoji: string) => void;
	onReactionClick?: (messageId: number, emoji: string) => void;
	className?: string;
}

export function MessageList({
	messages,
	onAddReaction,
	onReactionClick,
	className,
}: MessageListProps) {
	const { theme } = useChatTheme();
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		// Use a timeout to ensure the DOM has updated
		const timer = setTimeout(() => {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}, 100);

		return () => clearTimeout(timer);
	}, [messages]);

	return (
		<div className={cn("space-y-1 p-4", className)}>
			{messages.map((msg) => (
				<MessageItem
					key={msg.id}
					message={msg}
					onAddReaction={onAddReaction}
					onReactionClick={onReactionClick}
				/>
			))}
			{/* Invisible div to scroll to */}
			<div ref={messagesEndRef} className="h-px" />
		</div>
	);
}
