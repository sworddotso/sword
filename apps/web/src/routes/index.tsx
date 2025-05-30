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
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Code, Github, Lock, MessageCircle, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

const waitlistSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
});

type WaitlistForm = z.infer<typeof waitlistSchema>;

function HomeComponent() {
	const joinWaitlistMutation = useMutation({
		mutationFn: (data: { email: string }) =>
			trpcClient.joinWaitlist.mutate(data),
		onSuccess: (data: { success: boolean; message: string }) => {
			if (data.success) {
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
		},
	});

	const onSubmit = (data: WaitlistForm) => {
		joinWaitlistMutation.mutate(data);
	};

	return (
		<div className="h-full overflow-hidden bg-zinc-950 text-zinc-100">
			<div className="container mx-auto h-full px-8">
				<div className="grid h-full grid-cols-1 items-center gap-12 lg:grid-cols-2">
					{/* Left Side - Hero */}
					<div className="space-y-8">
						<div className="space-y-6">
							<div className="flex items-center gap-3">
								<MessageCircle className="h-8 w-8 text-zinc-100" />
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
								<Lock className="h-5 w-5 text-zinc-500" />
								<span className="text-sm text-zinc-500">
									End-to-end encrypted
								</span>
							</div>
							<div className="flex items-center gap-3">
								<Code className="h-5 w-5 text-zinc-500" />
								<span className="text-sm text-zinc-500">Open source</span>
							</div>
							<div className="flex items-center gap-3">
								<Users className="h-5 w-5 text-zinc-500" />
								<span className="text-sm text-zinc-500">Community owned</span>
							</div>
						</div>

						{/* Footer */}
						<div className="flex items-center gap-6 pt-8">
							<Button
								variant="ghost"
								size="sm"
								className="h-auto p-0 text-zinc-600 hover:text-zinc-400"
							>
								<Github className="mr-2 h-4 w-4" />
								GitHub
							</Button>
							<span className="text-xs text-zinc-700">
								Made with care by the community
							</span>
						</div>
					</div>

					{/* Right Side - Waitlist Form */}
					<div className="flex justify-center lg:justify-end">
						<div className="w-full max-w-sm">
							<Card className="rounded-[32px] border-zinc-800 bg-zinc-900 shadow-none">
								<CardHeader className="px-6 pb-6 text-center">
									<CardTitle className="font-medium text-xl text-zinc-100">
										Join the waitlist
									</CardTitle>
									<CardDescription className="text-zinc-500">
										Get early access when we launch
									</CardDescription>
								</CardHeader>
								<CardContent className="px-6">
									<Form {...form}>
										<form
											onSubmit={form.handleSubmit(onSubmit)}
											className="space-y-4"
										>
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
																placeholder="your@email.com"
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
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
