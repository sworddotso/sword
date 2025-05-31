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
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ArrowRightIcon, MessageCircleIcon, ZapIcon } from "lucide-react";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

const waitlistSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	honeypot: z.string().optional(),
});

type WaitlistForm = z.infer<typeof waitlistSchema>;

const features = [
	{
		icon: MessageCircleIcon,
		title: "Real-time Chat",
		description: "Lightning-fast messaging with LiveStore sync",
	},
	{
		icon: UsersIcon,
		title: "Communities",
		description: "Create and join servers with organized channels",
	},
	{
		icon: ZapIcon,
		title: "Performance",
		description: "Built for speed with optimized data structures",
	},
];

function RouteComponent() {
	const { data: session, isPending } = authClient.useSession();

	// Redirect to chat if already logged in
	if (session && !isPending) {
		return <Navigate to="/s" />;
	}

	return (
		<div className="flex min-h-screen flex-col bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
			{/* Header */}
			<header className="flex items-center justify-between p-6">
				<div className="flex items-center space-x-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
						S
					</div>
					<span className="text-xl font-bold text-white">Sword App</span>
				</div>
				<nav className="hidden md:flex items-center space-x-6">
					<a href="#features" className="text-zinc-300 hover:text-white transition-colors">
						Features
					</a>
					<a href="#about" className="text-zinc-300 hover:text-white transition-colors">
						About
					</a>
					<Button variant="outline" className="text-zinc-300 border-zinc-600 hover:bg-zinc-800" asChild>
						<a href="/login">Sign In</a>
					</Button>
				</nav>
			</header>

			{/* Hero Section */}
			<main className="flex-1 flex items-center justify-center px-6">
				<div className="max-w-4xl mx-auto text-center">
					<h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
						The Future of{" "}
						<span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
							Communication
						</span>
					</h1>
					
					<p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto leading-relaxed">
						Experience lightning-fast real-time messaging with Sword App. 
						Built on modern infrastructure for teams that demand performance.
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
						<Button 
							size="lg" 
							className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold"
							asChild
						>
							<a href="/login" className="flex items-center space-x-2">
								<span>Get Started</span>
								<ArrowRightIcon className="h-5 w-5" />
							</a>
						</Button>
						
						<Button 
							size="lg" 
							variant="outline" 
							className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 px-8 py-3 text-lg font-semibold"
							asChild
						>
							<a href="/test">Try Demo</a>
						</Button>
					</div>

					{/* Features Grid */}
					<div id="features" className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
						{features.map((feature, index) => (
							<div
								key={index}
								className={cn(
									"p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm",
									"hover:border-zinc-700 transition-all duration-300 hover:scale-105"
								)}
							>
								<feature.icon className="h-8 w-8 text-blue-400 mb-4 mx-auto" />
								<h3 className="text-lg font-semibold text-white mb-2">
									{feature.title}
								</h3>
								<p className="text-zinc-400 text-sm">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="p-6 text-center text-zinc-500 text-sm">
				<p>© 2024 Sword App. Built with modern web technologies.</p>
			</footer>
		</div>
	);
}
