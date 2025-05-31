import React from "react"
import { createRoot } from "react-dom/client"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { QueryClientProvider } from "@tanstack/react-query"
import { routeTree } from "./routeTree.gen"
import { queryClient, trpc } from "./utils/trpc"
import Loader from "./components/loader"
import { AppLiveStoreProvider } from "./lib/livestore"

// Create a new router instance
const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	defaultPendingComponent: () => <Loader />,
	context: { trpc, queryClient },
	Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>
				<AppLiveStoreProvider>
					{children}
				</AppLiveStoreProvider>
			</QueryClientProvider>
		)
	},
})

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
	}
}

// Render the app
const rootElement = document.getElementById("app")
if (!rootElement) {
	throw new Error("Root element not found")
}
if (!rootElement.innerHTML) {
	const root = createRoot(rootElement)
	root.render(<RouterProvider router={router} />)
}
