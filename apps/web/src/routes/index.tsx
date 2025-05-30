import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { trpcClient } from "@/utils/trpc";
import {
	ChatBubbleLeftRightIcon,
	CheckCircleIcon,
	CodeBracketIcon,
	LockClosedIcon,
	UsersIcon,
} from "@heroicons/react/16/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

const waitlistSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	honeypot: z.string().optional(),
});

type WaitlistForm = z.infer<typeof waitlistSchema>;

function HomeComponent() {
	const [hasJoinedWaitlist, setHasJoinedWaitlist] = useState(false);
	const [userEmail, setUserEmail] = useState("");

	// Check localStorage on component mount
	useEffect(() => {
		const joinedWaitlist = localStorage.getItem("sword-waitlist-joined");
		const storedEmail = localStorage.getItem("sword-waitlist-email");

		if (joinedWaitlist === "true" && storedEmail) {
			setHasJoinedWaitlist(true);
			setUserEmail(storedEmail);
		}
	}, []);

	const joinWaitlistMutation = useMutation({
		mutationFn: (data: { email: string; honeypot?: string }) =>
			trpcClient.joinWaitlist.mutate(data),
		onSuccess: (data: { success: boolean; message: string }) => {
			if (data.success) {
				// Store in localStorage that user has joined
				localStorage.setItem("sword-waitlist-joined", "true");
				localStorage.setItem("sword-waitlist-email", form.getValues("email"));

				// Update state to show success message
				setHasJoinedWaitlist(true);
				setUserEmail(form.getValues("email"));

				toast.success(data.message);
				form.reset();
			} else {
				toast.error(data.message);
			}
		},
		onError: () => {
			toast.error("Something went wrong. Please try again.");
		},
	});

	const form = useForm<WaitlistForm>({
		resolver: zodResolver(waitlistSchema),
		defaultValues: {
			email: "",
			honeypot: "",
		},
	});

	const onSubmit = (data: WaitlistForm) => {
		joinWaitlistMutation.mutate(data);
	};

	const handleTryAgain = () => {
		// Clear localStorage and reset state
		localStorage.removeItem("sword-waitlist-joined");
		localStorage.removeItem("sword-waitlist-email");
		setHasJoinedWaitlist(false);
		setUserEmail("");
	};

	return (
		<div className="h-full overflow-hidden bg-zinc-950 text-zinc-100">
			<div className="container mx-auto h-full px-8">
				<div className="grid h-full grid-cols-1 items-center gap-12 lg:grid-cols-2">
					{/* Left Side - Hero */}
					<div className="space-y-8">
						<div className="space-y-6">
							<div className="flex items-center gap-3">
								<ChatBubbleLeftRightIcon className="h-8 w-8 text-zinc-100" />
								<h1 className="font-medium text-4xl text-zinc-100">Sword</h1>
							</div>
							<h2 className="text-2xl text-zinc-300 leading-tight">
								Open-source communication platform.
								<br />
								Privacy-focused. Community-driven.
							</h2>
						</div>

						{/* Features */}
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
							<div className="flex items-center gap-3">
								<LockClosedIcon className="h-5 w-5 text-zinc-500" />
								<span className="text-sm text-zinc-500">
									End-to-end encrypted
								</span>
							</div>
							<div className="flex items-center gap-3">
								<CodeBracketIcon className="h-5 w-5 text-zinc-500" />
								<span className="text-sm text-zinc-500">Open source</span>
							</div>
						</div>

						{/* Footer */}
						<div className="flex items-center gap-6 pt-8">
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									window.open("https://github.com/sworddotso/sword", "_blank")
								}
								className="h-auto p-0 text-zinc-600 hover:text-zinc-400"
							>
								{/* GitHub icon - keeping as SVG since it's the official GitHub icon */}
								<svg
									className="mr-2 h-4 w-4"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
										clipRule="evenodd"
									/>
								</svg>
								GitHub
							</Button>
							<span className="text-xs text-zinc-700">
								Made with care by the community
							</span>
						</div>
					</div>

					{/* Right Side - Waitlist Form or Success Message */}
					<div className="flex justify-center lg:justify-end">
						<div className="w-full max-w-sm">
							<Card className="rounded-[16px] border-zinc-800 bg-zinc-900 p-0 shadow-none">
								{hasJoinedWaitlist ? (
									// Success state - user has already joined
									<>
										<CardHeader className="px-4 py-6 text-center">
											<div className="mb-3 flex justify-center">
												<CheckCircleIcon className="h-12 w-12 text-green-500" />
											</div>
											<CardTitle className="font-medium text-xl text-zinc-100">
												You're on the list!
											</CardTitle>
											<CardDescription className="text-zinc-500">
												We'll notify you at{" "}
												<span className="text-zinc-300">{userEmail}</span> when
												we launch
											</CardDescription>
										</CardHeader>
										<CardContent className="px-4 py-4">
											<div className="space-y-3 text-center">
												<p className="text-sm text-zinc-600">
													Thanks for joining the Sword community. We're excited
													to have you aboard!
												</p>
												<Button
													onClick={handleTryAgain}
													variant="ghost"
													size="sm"
													className="text-xs text-zinc-500 hover:text-zinc-300"
												>
													Sign up with different email?
												</Button>
											</div>
										</CardContent>
									</>
								) : (
									// Form state - user hasn't joined yet
									<>
										<CardHeader className="px-4 py-6 text-center">
											<CardTitle className="font-medium text-xl text-zinc-100">
												Join the waitlist
											</CardTitle>
											<CardDescription className="text-zinc-500">
												Get early access when we launch
											</CardDescription>
										</CardHeader>
										<CardContent className="px-4 py-4">
											<Form {...form}>
												<form
													onSubmit={form.handleSubmit(onSubmit)}
													className="space-y-4"
												>
													{/* Honeypot field - hidden from users, visible to bots */}
													<FormField
														control={form.control}
														name="honeypot"
														render={({ field }) => (
															<div className="pointer-events-none absolute left-[-9999px] opacity-0">
																<Input
																	{...field}
																	tabIndex={-1}
																	autoComplete="off"
																	placeholder="Leave this field empty"
																/>
															</div>
														)}
													/>

													<FormField
														control={form.control}
														name="email"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="font-medium text-sm text-zinc-400">
																	Email
																</FormLabel>
																<FormControl>
																	<Input
																		placeholder="your@0.email"
																		{...field}
																		className="h-11 rounded-lg border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600"
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<Button
														type="submit"
														className="h-11 w-full rounded-lg bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
														disabled={joinWaitlistMutation.isPending}
													>
														{joinWaitlistMutation.isPending
															? "Joining..."
															: "Join waitlist"}
													</Button>
												</form>
											</Form>
										</CardContent>
									</>
								)}
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
