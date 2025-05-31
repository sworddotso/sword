import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	server: {
		port: process.env.PORT ? Number(process.env.PORT) : 3001,
	},
	worker: { format: 'es' },
	optimizeDeps: {
		exclude: [
			'@livestore/adapter-web',
			'@livestore/livestore', 
			'@livestore/react'
		]
	},
	plugins: [
		tailwindcss(), 
		TanStackRouterVite({}), 
		react(),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
