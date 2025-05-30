import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { hasKeyPair } from "@/lib/key-manager";
import {
	type Conversation,
	type DecryptedMessage,
	getConversations,
	getMessages,
	sendMessage,
} from "@/lib/messaging-client";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: session, isPending } = authClient.useSession();
	const navigate = Route.useNavigate();

	const [selectedConversation, setSelectedConversation] = useState<
		string | null
	>(null);
	const [messageText, setMessageText] = useState("");
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [messages, setMessages] = useState<DecryptedMessage[]>([]);
	const [hasE2EE, setHasE2EE] = useState(false);

	useEffect(() => {
		if (!session && !isPending) {
			navigate({
				to: "/login",
			});
		}
	}, [session, isPending, navigate]);

	useEffect(() => {
		if (session?.user.id) {
			checkE2EEStatus();
			loadConversations();
		}
	}, [session]);

	useEffect(() => {
		if (selectedConversation) {
			loadMessages();
		}
	}, [selectedConversation]);

	const checkE2EEStatus = async () => {
		if (!session?.user.id) return;

		try {
			const hasKeys = await hasKeyPair(session.user.id);
			setHasE2EE(hasKeys);

			if (!hasKeys) {
				toast.warning(
					"End-to-end encryption is not set up. Please sign out and sign back in to enable secure messaging.",
				);
			}
		} catch (error) {
			console.error("Failed to check E2EE status:", error);
		}
	};

	const loadConversations = async () => {
		try {
			const convs = await getConversations();
			setConversations(convs);
		} catch (error) {
			console.error("Failed to load conversations:", error);
			toast.error("Failed to load conversations");
		}
	};

	const loadMessages = async () => {
		if (!selectedConversation || !session?.user.id) return;

		try {
			const msgs = await getMessages({
				conversationId: selectedConversation,
				limit: 50,
				userId: session.user.id,
			});
			setMessages(msgs.reverse());
		} catch (error) {
			console.error("Failed to load messages:", error);
			toast.error("Failed to load messages");
		}
	};

	const sendMessageHandler = async () => {
		if (!selectedConversation || !messageText.trim()) return;

		try {
			await sendMessage({
				conversationId: selectedConversation,
				content: messageText,
			});

			setMessageText("");
			await loadMessages();
			toast.success("Message sent!");
		} catch (error) {
			console.error("Failed to send message:", error);
			toast.error("Failed to send message");
		}
	};

	if (isPending) {
		return <div className="p-4">Loading...</div>;
	}

	return (
		<div className="container mx-auto p-4">
			<div className="mb-4">
				<h1 className="font-bold text-2xl">Secure Messaging Dashboard</h1>
				<p className="text-gray-600">Welcome {session?.user.name}</p>
				<div className="mt-2">
					<span
						className={`inline-block rounded px-2 py-1 text-sm ${hasE2EE ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
					>
						{hasE2EE
							? "🔒 End-to-End Encryption Active"
							: "⚠️ E2EE Not Available"}
					</span>
				</div>
			</div>

			<div className="grid h-96 grid-cols-1 gap-4 md:grid-cols-3">
				<Card className="col-span-1">
					<CardHeader>
						<CardTitle>Conversations</CardTitle>
					</CardHeader>
					<CardContent>
						{conversations.length === 0 ? (
							<p className="text-gray-500">No conversations yet</p>
						) : (
							<div className="space-y-2">
								{conversations.map((conv) => (
									<button
										key={conv.id}
										type="button"
										className={`w-full cursor-pointer rounded p-2 text-left ${
											selectedConversation === conv.id
												? "bg-blue-100"
												: "hover:bg-gray-100"
										}`}
										onClick={() => setSelectedConversation(conv.id)}
										aria-pressed={selectedConversation === conv.id}
									>
										<div className="font-medium">
											{conv.name || `${conv.type} conversation`}
										</div>
										<div className="text-gray-500 text-sm">
											{conv.updatedAt.toLocaleDateString()}
										</div>
									</button>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="col-span-2">
					<CardHeader>
						<CardTitle>
							{selectedConversation ? "Messages" : "Select a conversation"}
						</CardTitle>
					</CardHeader>
					<CardContent>
						{selectedConversation ? (
							<div className="space-y-4">
								<div className="h-64 space-y-2 overflow-y-auto rounded border p-2">
									{messages.length === 0 ? (
										<p className="text-gray-500">No messages yet</p>
									) : (
										messages.map((message) => (
											<div
												key={message.id}
												className={`max-w-xs rounded p-2 ${
													message.sender.id === session?.user.id
														? "ml-auto bg-blue-100"
														: "bg-gray-100"
												}`}
											>
												<div className="font-medium text-sm">
													{message.sender.name}
												</div>
												<div className="mt-1">{message.content}</div>
												<div className="mt-1 text-gray-500 text-xs">
													{message.createdAt.toLocaleTimeString()}
												</div>
											</div>
										))
									)}
								</div>

								{hasE2EE && (
									<div className="flex space-x-2">
										<Input
											placeholder="Type your message..."
											value={messageText}
											onChange={(e) => setMessageText(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter" && !e.shiftKey) {
													e.preventDefault();
													sendMessageHandler();
												}
											}}
										/>
										<Button
											onClick={sendMessageHandler}
											disabled={!messageText.trim()}
										>
											Send
										</Button>
									</div>
								)}

								{!hasE2EE && (
									<div className="text-center text-gray-500">
										<p>Secure messaging is not available</p>
										<p className="text-sm">
											Please sign out and sign back in to enable E2EE
										</p>
									</div>
								)}
							</div>
						) : (
							<div className="text-center text-gray-500">
								<p>Select a conversation to start messaging</p>
								{!hasE2EE && (
									<p className="mt-2 text-sm">
										Note: You'll need to set up encryption before you can send
										messages
									</p>
								)}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
