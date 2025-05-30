import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { useChatTheme } from "./chat-theme-provider";
import "katex/dist/katex.min.css";
import {
	ArrowDownTrayIcon,
	DocumentIcon,
	EllipsisVerticalIcon,
	FaceSmileIcon,
	PhotoIcon,
	PlayIcon,
} from "@heroicons/react/16/solid";
import { saveAs } from "file-saver";
import { CustomEmojiPicker } from "./custom-emoji-picker";

interface Reaction {
	emoji: string;
	count: number;
}

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
	reactions: Reaction[];
	attachments?: FileAttachment[];
	isEdited?: boolean;
}

interface MessageItemProps {
	message: Message;
	onAddReaction?: (messageId: number, emoji: string) => void;
	onReactionClick?: (messageId: number, emoji: string) => void;
	className?: string;
}

const formatFileSize = (bytes?: number) => {
	if (!bytes) return "";
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${Math.round((bytes / 1024 ** i) * 100) / 100} ${sizes[i]}`;
};

const FileAttachmentComponent = ({
	attachment,
}: { attachment: FileAttachment }) => {
	const { theme, variant } = useChatTheme();

	const handleDownload = () => {
		saveAs(attachment.url, attachment.name);
	};

	if (attachment.type === "image") {
		return (
			<div className="mt-2">
				<img
					src={attachment.url}
					alt={attachment.name}
					className={cn(
						"max-h-64 max-w-sm cursor-pointer rounded-lg border transition-colors hover:border-opacity-80",
						variant === "light"
							? "border-zinc-300 hover:border-zinc-400"
							: "border-zinc-700 hover:border-zinc-600",
					)}
					onClick={() => window.open(attachment.url, "_blank")}
				/>
			</div>
		);
	}

	if (attachment.type === "video") {
		return (
			<div className="mt-2">
				<video
					controls
					className={cn(
						"max-h-64 max-w-sm rounded-lg border",
						variant === "light" ? "border-zinc-300" : "border-zinc-700",
					)}
					src={attachment.url}
				>
					Your browser does not support the video tag.
				</video>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"mt-2 flex max-w-sm cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-colors",
				variant === "light"
					? "border-zinc-300 bg-zinc-50/50 hover:bg-zinc-100"
					: "border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800",
			)}
			onClick={handleDownload}
		>
			<div className="flex-shrink-0">
				{attachment.type === "document" ? (
					<DocumentIcon className="h-8 w-8 text-blue-400" />
				) : attachment.type === "audio" ? (
					<PlayIcon className="h-8 w-8 text-green-400" />
				) : (
					<PhotoIcon className="h-8 w-8 text-purple-400" />
				)}
			</div>
			<div className="min-w-0 flex-1">
				<p
					className={cn(
						"truncate font-medium text-sm",
						variant === "light" ? "text-zinc-900" : "text-zinc-200",
					)}
				>
					{attachment.name}
				</p>
				{attachment.size && (
					<p
						className={cn(
							"text-xs",
							variant === "light" ? "text-zinc-600" : "text-zinc-400",
						)}
					>
						{formatFileSize(attachment.size)}
					</p>
				)}
			</div>
			<ArrowDownTrayIcon
				className={cn(
					"h-5 w-5 transition-colors",
					variant === "light"
						? "text-zinc-600 hover:text-zinc-800"
						: "text-zinc-400 hover:text-zinc-200",
				)}
			/>
		</div>
	);
};

export default function MessageItem({
	message,
	onAddReaction,
	onReactionClick,
	className,
}: MessageItemProps) {
	const { theme, variant } = useChatTheme();
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);

	const handleReactionClick = (emoji: string) => {
		onReactionClick?.(message.id, emoji);
	};

	const handleAddReaction = (emoji: string) => {
		onAddReaction?.(message.id, emoji);
	};

	return (
		<div
			className={cn(
				"group relative flex space-x-4 transition-all duration-200",
				theme.chatArea.message.padding,
				theme.chatArea.message.hoverBackground,
				theme.chatArea.message.borderRadius,
				className,
			)}
		>
			<img
				src={message.avatar}
				alt={message.user}
				className={cn(
					"flex-shrink-0 border object-cover",
					theme.chatArea.message.avatar.size,
					theme.chatArea.message.avatar.borderRadius,
					variant === "light" ? "border-zinc-300" : "border-zinc-700/50",
				)}
			/>

			<div className="min-w-0 flex-1">
				<div className="mb-1 flex items-baseline space-x-2">
					<span
						className={cn(
							"cursor-pointer font-semibold hover:underline",
							theme.chatArea.message.author.color,
							theme.chatArea.message.author.size,
							theme.chatArea.message.author.weight,
						)}
					>
						{message.user}
					</span>
					<span
						className={cn(
							theme.chatArea.message.timestamp.color,
							theme.chatArea.message.timestamp.size,
						)}
					>
						{message.timestamp}
					</span>
					{message.isEdited && (
						<span
							className={cn(
								"italic",
								theme.chatArea.message.timestamp.color,
								theme.chatArea.message.timestamp.size,
							)}
						>
							(edited)
						</span>
					)}
				</div>

				<div
					className={cn(
						"leading-relaxed",
						theme.chatArea.message.content.color,
						theme.chatArea.message.content.size,
						// Markdown styles - these should also be theme-aware
						variant === "light"
							? [
									"[&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:font-bold [&_h1]:text-xl [&_h1]:text-zinc-900",
									"[&_h2]:mt-3 [&_h2]:mb-2 [&_h2]:font-bold [&_h2]:text-lg [&_h2]:text-zinc-900",
									"[&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:font-bold [&_h3]:text-base [&_h3]:text-zinc-900",
									"[&_p]:my-1 [&_p]:text-zinc-700",
									"[&_strong]:font-semibold [&_strong]:text-zinc-900",
									"[&_em]:text-zinc-700 [&_em]:italic",
									"[&_code]:rounded [&_code]:bg-zinc-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-pink-600 [&_code]:text-xs",
									"[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-zinc-200 [&_pre]:bg-zinc-50 [&_pre]:p-3",
									"[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-sm [&_pre_code]:text-zinc-700",
									"[&_blockquote]:my-2 [&_blockquote]:rounded-r [&_blockquote]:border-zinc-300 [&_blockquote]:border-l-4 [&_blockquote]:bg-zinc-50 [&_blockquote]:py-2 [&_blockquote]:pl-4",
									"[&_a]:text-blue-600 [&_a]:no-underline hover:[&_a]:underline",
									"[&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border [&_img]:border-zinc-200",
									"[&_hr]:my-3 [&_hr]:border-zinc-300",
									"[&_ul]:my-2 [&_ul]:list-inside [&_ul]:list-disc [&_ul]:text-zinc-700",
									"[&_ol]:my-2 [&_ol]:list-inside [&_ol]:list-decimal [&_ol]:text-zinc-700",
									"[&_li]:my-1 [&_li]:text-zinc-700",
									"[&_table]:my-2 [&_table]:rounded [&_table]:border [&_table]:border-zinc-200",
									"[&_th]:border [&_th]:border-zinc-200 [&_th]:bg-zinc-100 [&_th]:px-2 [&_th]:py-1 [&_th]:font-semibold [&_th]:text-zinc-900",
									"[&_td]:border [&_td]:border-zinc-200 [&_td]:px-2 [&_td]:py-1 [&_td]:text-zinc-700",
								]
							: [
									"[&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:font-bold [&_h1]:text-xl [&_h1]:text-zinc-200",
									"[&_h2]:mt-3 [&_h2]:mb-2 [&_h2]:font-bold [&_h2]:text-lg [&_h2]:text-zinc-200",
									"[&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:font-bold [&_h3]:text-base [&_h3]:text-zinc-200",
									"[&_p]:my-1 [&_p]:text-zinc-300",
									"[&_strong]:font-semibold [&_strong]:text-zinc-200",
									"[&_em]:text-zinc-300 [&_em]:italic",
									"[&_code]:rounded [&_code]:bg-zinc-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-pink-300 [&_code]:text-xs",
									"[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-zinc-700 [&_pre]:bg-zinc-900 [&_pre]:p-3",
									"[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-sm [&_pre_code]:text-zinc-300",
									"[&_blockquote]:my-2 [&_blockquote]:rounded-r [&_blockquote]:border-zinc-600 [&_blockquote]:border-l-4 [&_blockquote]:bg-zinc-800/50 [&_blockquote]:py-2 [&_blockquote]:pl-4",
									"[&_a]:text-blue-400 [&_a]:no-underline hover:[&_a]:underline",
									"[&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border [&_img]:border-zinc-700",
									"[&_hr]:my-3 [&_hr]:border-zinc-600",
									"[&_ul]:my-2 [&_ul]:list-inside [&_ul]:list-disc [&_ul]:text-zinc-300",
									"[&_ol]:my-2 [&_ol]:list-inside [&_ol]:list-decimal [&_ol]:text-zinc-300",
									"[&_li]:my-1 [&_li]:text-zinc-300",
									"[&_table]:my-2 [&_table]:rounded [&_table]:border [&_table]:border-zinc-700",
									"[&_th]:border [&_th]:border-zinc-700 [&_th]:bg-zinc-800 [&_th]:px-2 [&_th]:py-1 [&_th]:font-semibold [&_th]:text-zinc-200",
									"[&_td]:border [&_td]:border-zinc-700 [&_td]:px-2 [&_td]:py-1 [&_td]:text-zinc-300",
								],
					)}
				>
					<ReactMarkdown
						remarkPlugins={[remarkMath, remarkGfm]}
						rehypePlugins={[rehypeKatex]}
					>
						{message.content}
					</ReactMarkdown>
				</div>

				{message.attachments && message.attachments.length > 0 && (
					<div className="mt-2 space-y-2">
						{message.attachments.map((attachment) => (
							<FileAttachmentComponent
								key={attachment.id}
								attachment={attachment}
							/>
						))}
					</div>
				)}

				<div className="mt-3 flex flex-wrap items-center gap-1">
					{message.reactions.map((reaction, idx) => (
						<button
							key={idx}
							onClick={() => handleReactionClick(reaction.emoji)}
							className={cn(
								"flex cursor-pointer items-center space-x-1 rounded-md border px-2 py-1 text-xs transition-all duration-200 hover:scale-105",
								variant === "light"
									? "border-zinc-300 bg-zinc-100 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-200"
									: "border-zinc-600 bg-zinc-800 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-700",
							)}
						>
							<span>{reaction.emoji}</span>
							<span
								className={cn(
									"font-medium",
									variant === "light" ? "text-zinc-600" : "text-zinc-400",
								)}
							>
								{reaction.count}
							</span>
						</button>
					))}

					<div className="relative inline-block">
						<button
							onClick={() => setShowEmojiPicker(!showEmojiPicker)}
							className={cn(
								"flex h-7 w-7 items-center justify-center rounded-md border transition-all duration-200 hover:scale-105",
								variant === "light"
									? "border-zinc-300 bg-zinc-100 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-200 hover:text-zinc-800"
									: "border-zinc-600 bg-zinc-800 text-zinc-400 hover:border-zinc-500 hover:bg-zinc-700 hover:text-zinc-200",
								showEmojiPicker
									? "opacity-100"
									: message.reactions.length === 0
										? "opacity-0 group-hover:opacity-100"
										: "opacity-100",
							)}
							title="Add reaction"
						>
							<FaceSmileIcon className="h-4 w-4" />
						</button>

						{showEmojiPicker && (
							<CustomEmojiPicker
								onSelectEmoji={handleAddReaction}
								onClose={() => setShowEmojiPicker(false)}
								position="top"
								closeOnSelect={true}
							/>
						)}
					</div>
				</div>
			</div>

			<div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
				<button
					className={cn(
						"flex h-8 w-8 items-center justify-center rounded-md backdrop-blur-sm transition-all duration-200",
						variant === "light"
							? "bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-800"
							: "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700/80 hover:text-zinc-200",
					)}
					title="More options"
				>
					<EllipsisVerticalIcon className="h-4 w-4" />
				</button>
			</div>
		</div>
	);
}
