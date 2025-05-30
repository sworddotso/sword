import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
	DocumentIcon,
	FaceSmileIcon,
	PaperAirplaneIcon,
	PaperClipIcon,
	PhotoIcon,
	PlayIcon,
	SpeakerWaveIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useChatTheme } from "./chat-theme-provider";
import { CustomEmojiPicker } from "./custom-emoji-picker";

interface FilePreview {
	file: File;
	preview?: string;
	type: "image" | "video" | "document" | "audio";
}

interface MessageInputProps {
	selectedChannel: string;
	onSendMessage?: (message: string, files?: File[]) => void;
	placeholder?: string;
	className?: string;
}

const getFileType = (file: File): "image" | "video" | "document" | "audio" => {
	if (file.type.startsWith("image/")) return "image";
	if (file.type.startsWith("video/")) return "video";
	if (file.type.startsWith("audio/")) return "audio";
	return "document";
};

const formatFileSize = (bytes: number) => {
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${Math.round((bytes / 1024 ** i) * 100) / 100} ${sizes[i]}`;
};

const FilePreviewComponent = ({
	filePreview,
	onRemove,
}: {
	filePreview: FilePreview;
	onRemove: () => void;
}) => {
	const { variant } = useChatTheme();
	const iconClass = "w-6 h-6";

	const getFileIcon = () => {
		switch (filePreview.type) {
			case "image":
				return <PhotoIcon className={`${iconClass} text-green-400`} />;
			case "video":
				return <PlayIcon className={`${iconClass} text-blue-400`} />;
			case "audio":
				return <SpeakerWaveIcon className={`${iconClass} text-purple-400`} />;
			default:
				return <DocumentIcon className={`${iconClass} text-zinc-400`} />;
		}
	};

	return (
		<div className="group relative">
			{filePreview.type === "image" && filePreview.preview ? (
				<div className="relative">
					<img
						src={filePreview.preview}
						alt={filePreview.file.name}
						className={cn(
							"h-20 w-20 rounded-lg border object-cover",
							variant === "light" ? "border-zinc-300" : "border-zinc-600",
						)}
					/>
					<button
						type="button"
						onClick={onRemove}
						className="-top-2 -right-2 absolute flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs transition-colors hover:bg-red-600"
					>
						<XMarkIcon className="h-3 w-3" />
					</button>
				</div>
			) : (
				<div
					className={cn(
						"flex max-w-xs items-center space-x-2 rounded-lg border p-2",
						variant === "light"
							? "border-zinc-300 bg-zinc-100"
							: "border-zinc-600 bg-zinc-800",
					)}
				>
					{getFileIcon()}
					<div className="min-w-0 flex-1">
						<p
							className={cn(
								"truncate font-medium text-sm",
								variant === "light" ? "text-zinc-900" : "text-zinc-200",
							)}
						>
							{filePreview.file.name}
						</p>
						<p
							className={cn(
								"text-xs",
								variant === "light" ? "text-zinc-600" : "text-zinc-400",
							)}
						>
							{formatFileSize(filePreview.file.size)}
						</p>
					</div>
					<button
						type="button"
						onClick={onRemove}
						className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs transition-colors hover:bg-red-600"
					>
						<XMarkIcon className="h-3 w-3" />
					</button>
				</div>
			)}
		</div>
	);
};

export function MessageInput({
	selectedChannel,
	onSendMessage,
	placeholder,
	className,
}: MessageInputProps) {
	const [message, setMessage] = useState("");
	const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const { theme, variant } = useChatTheme();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Auto-resize textarea
	const adjustTextareaHeight = useCallback(() => {
		const textarea = textareaRef.current;
		if (textarea) {
			// Reset height to auto to get the correct scrollHeight
			textarea.style.height = "auto";
			// Set height based on content, with min and max constraints
			const newHeight = Math.max(44, Math.min(textarea.scrollHeight, 128));
			textarea.style.height = `${newHeight}px`;
		}
	}, []);

	// Adjust height when message changes
	useEffect(() => {
		adjustTextareaHeight();
	}, [message, adjustTextareaHeight]);

	const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
		onDrop: (acceptedFiles) => {
			const newPreviews = acceptedFiles.map((file) => {
				const filePreview: FilePreview = {
					file,
					type: getFileType(file),
				};

				// Create preview for images
				if (file.type.startsWith("image/")) {
					filePreview.preview = URL.createObjectURL(file);
				}

				return filePreview;
			});

			setFilePreviews((prev) => [...prev, ...newPreviews]);
		},
		noClick: false, // Enable click to open file dialog
		noKeyboard: true, // Disable keyboard interaction for simplicity
		multiple: true,
		maxSize: 50 * 1024 * 1024, // 50MB
		accept: {
			"image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
			"video/*": [".mp4", ".mov", ".avi", ".webm"],
			"audio/*": [".mp3", ".wav", ".ogg"],
			"application/pdf": [".pdf"],
			"text/plain": [".txt"],
		},
	});

	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault();
		if (message.trim() || filePreviews.length > 0) {
			const files = filePreviews.map((fp) => fp.file);
			onSendMessage?.(message, files);
			setMessage("");
			setFilePreviews([]);
			// Cleanup object URLs
			filePreviews.forEach((fp) => {
				if (fp.preview) {
					URL.revokeObjectURL(fp.preview);
				}
			});
		}
	};

	const removeFile = (index: number) => {
		setFilePreviews((prev) => {
			const newPreviews = [...prev];
			const removed = newPreviews.splice(index, 1)[0];
			if (removed.preview) {
				URL.revokeObjectURL(removed.preview);
			}
			return newPreviews;
		});
	};

	const handleFileSelect = () => {
		fileInputRef.current?.click();
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length > 0) {
			const newPreviews = files.map((file) => {
				const filePreview: FilePreview = {
					file,
					type: getFileType(file),
				};

				if (file.type.startsWith("image/")) {
					filePreview.preview = URL.createObjectURL(file);
				}

				return filePreview;
			});

			setFilePreviews((prev) => [...prev, ...newPreviews]);
		}
		// Reset the input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setMessage(e.target.value);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage(e);
		}
	};

	const handleEmojiInsert = (emoji: string) => {
		const textarea = textareaRef.current;
		if (textarea) {
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const text = textarea.value;
			const newText = text.substring(0, start) + emoji + text.substring(end);
			setMessage(newText);

			// After state update, set cursor position
			// Use a timeout to ensure DOM has updated after setMessage
			setTimeout(() => {
				textarea.focus();
				textarea.setSelectionRange(start + emoji.length, start + emoji.length);
			}, 0);
		}
	};

	return (
		<div
			className={cn(
				"relative flex-shrink-0 backdrop-blur-sm transition-all duration-200",
				theme.chatArea.inputArea.background,
				theme.chatArea.inputArea.border,
				className,
			)}
			data-theme={variant}
		>
			{/* Drop Zone Overlay - Spans entire input area for better UX */}
			<div
				{...getRootProps({ className: "dropzone" })}
				className={cn(
					"absolute inset-0 z-0", // Lower z-index than previews/input
					isDragActive
						? "rounded-lg border-2 border-blue-500/30 border-dashed bg-blue-500/10"
						: "",
				)}
			>
				<input {...getInputProps()} />
				{isDragActive && (
					<div className="flex h-full items-center justify-center">
						<div className="pointer-events-none text-center text-blue-400">
							<PaperClipIcon className="mx-auto mb-1 h-8 w-8" />
							<p className="font-medium">Drop files to attach</p>
						</div>
					</div>
				)}
			</div>

			{/* File Previews and Input Area (Higher z-index) */}
			<div className="relative z-10">
				{/* File Previews */}
				{filePreviews.length > 0 && (
					<div
						className={cn(
							"border-b px-4 py-3",
							variant === "light" ? "border-zinc-200" : "border-zinc-700",
						)}
					>
						<div className="flex flex-wrap gap-2">
							{filePreviews.map((filePreview, index) => (
								<FilePreviewComponent
									key={index}
									filePreview={filePreview}
									onRemove={() => removeFile(index)}
								/>
							))}
						</div>
					</div>
				)}

				{/* Input Area */}
				<div className={cn(theme.chatArea.inputArea.padding)}>
					<form
						onSubmit={handleSendMessage}
						className="flex items-end space-x-3"
					>
						{/* Hidden File Input */}
						<input
							ref={fileInputRef}
							type="file"
							multiple
							onChange={handleFileInputChange}
							className="hidden"
						/>

						{/* File Upload Button (Now part of Dropzone) */}
						<button
							type="button"
							onClick={open} // Use react-dropzone's open function
							className={cn(
								"flex h-11 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200",
								variant === "light"
									? "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800"
									: "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200",
							)}
							title="Attach file"
						>
							<PaperClipIcon className="h-5 w-5" />
						</button>

						{/* Message Input */}
						<div className="relative flex-1">
							<textarea
								ref={textareaRef}
								value={message}
								onChange={handleTextareaChange}
								onKeyDown={handleKeyDown}
								placeholder={placeholder || `Message #${selectedChannel}`}
								className={cn(
									"scrollbar-thin max-h-32 min-h-[44px] w-full resize-none overflow-y-auto rounded-lg border pr-12 text-sm outline-none transition-all duration-200 focus:ring-1 focus:ring-blue-500",
									theme.chatArea.inputArea.input.background,
									theme.chatArea.inputArea.input.color,
									theme.chatArea.inputArea.input.placeholderColor,
									theme.chatArea.inputArea.input.padding,
									theme.chatArea.inputArea.input.borderRadius,
									variant === "light"
										? "border-zinc-300 focus:border-blue-500"
										: "border-zinc-600 focus:border-blue-500",
								)}
								rows={1}
							/>

							{/* Emoji button & Picker */}
							<div className="absolute right-3 bottom-3">
								<button
									type="button"
									onClick={() => setShowEmojiPicker(!showEmojiPicker)}
									className={cn(
										"flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
										variant === "light"
											? "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
											: "text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300",
									)}
									title="Add emoji"
								>
									<FaceSmileIcon className="h-5 w-5" />
								</button>
								{showEmojiPicker && (
									<CustomEmojiPicker
										onSelectEmoji={handleEmojiInsert}
										onClose={() => setShowEmojiPicker(false)}
										position="top"
										closeOnSelect={false} // Explicitly set to false to prevent closing after each selection
									/>
								)}
							</div>
						</div>

						{/* Send Button */}
						<Button
							type="submit"
							disabled={!message.trim() && filePreviews.length === 0}
							className={cn(
								"flex-shrink-0 rounded-lg px-6 py-3 font-medium shadow-lg transition-all duration-200",
								"bg-blue-600 text-white hover:bg-blue-500",
								"disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600",
								"hover:scale-105 hover:shadow-xl",
							)}
							title="Send message"
						>
							<PaperAirplaneIcon className="h-5 w-5" />
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}
