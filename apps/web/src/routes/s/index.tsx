import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useStore, tables } from '@/lib/livestore'
import { queryDb } from '@livestore/livestore'
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/loader";

export const Route = createFileRoute("/s/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: session, isPending } = authClient.useSession();
	const { store } = useStore()

	// Query servers and channels for automatic redirection
	const serversQuery = queryDb(() => 
		tables.servers.where({ deletedAt: null })
	)
	const servers = store.useQuery(serversQuery) ?? []
	
	const channelsQuery = queryDb(() => 
		tables.channels.where({ deletedAt: null })
	)
	const channels = store.useQuery(channelsQuery) ?? []

	// Redirect to login if not authenticated
	if (!session && !isPending) {
		return <Navigate to="/login" />
	}

	// Show minimal loader while checking auth
	if (isPending) {
		return <Loader />
	}

	// If we have servers, redirect to the first server's general channel
	if (servers.length > 0) {
		// Find the most recent server
		const latestServer = [...servers].sort((a: any, b: any) => 
			new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		)[0]
		
		// Find the server's general channel or first channel
		const serverChannels = channels.filter((c: any) => c.serverId === latestServer.id)
		const defaultChannel = serverChannels.find((c: any) => c.name === 'general') || serverChannels[0]
		
		if (defaultChannel) {
			// Use window.location for dynamic URLs that aren't in route tree yet
			window.location.href = `/s/${latestServer.id}/${defaultChannel.id}`
			return <Loader />
		}
	}

	// If no servers exist, show server creation prompt
	return (
		<div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-100">
			<div className="text-center">
				<h2 className="text-xl font-semibold mb-4">Welcome to Sword App!</h2>
				<p className="mb-4">No servers found. Please seed the database first.</p>
				<p className="text-sm text-zinc-400">
					Go to{" "}
					<a href="/test" className="text-blue-400 hover:text-blue-300">
						/test
					</a>{" "}
					to use the seed button.
				</p>
			</div>
		</div>
	);
} 