import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChatTheme, ChatThemeVariant } from "@/lib/theme";
import {
	BookmarkIcon,
	PlusIcon,
	SwatchIcon,
	TrashIcon,
	WrenchScrewdriverIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { useState } from "react";
import { useChatTheme } from "./chat-theme-provider";
import { ThemeBuilder } from "./theme-builder";

type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export function ChatThemeCustomizer() {
	const {
		variant,
		setVariant,
		customizeTheme,
		resetTheme,
		saveCustomTheme,
		loadCustomTheme,
		getCustomThemes,
		deleteCustomTheme,
	} = useChatTheme();

	const [isOpen, setIsOpen] = useState(false);
	const [showThemeBuilder, setShowThemeBuilder] = useState(false);
	const [newThemeName, setNewThemeName] = useState("");
	const [selectedTab, setSelectedTab] = useState<
		"presets" | "custom" | "create"
	>("presets");

	const variants: { key: ChatThemeVariant; label: string }[] = [
		{ key: "default", label: "Default Dark" },
		{ key: "light", label: "Light Mode" },
		{ key: "discord", label: "Discord" },
	];

	const customThemes = getCustomThemes();

	const handleSaveCurrentTheme = () => {
		if (newThemeName.trim()) {
			// Get current customizations by comparing with base variant
			saveCustomTheme(newThemeName, {});
			setNewThemeName("");
			setSelectedTab("custom");
		}
	};

	const handleThemeBuilderSave = (
		name: string,
		theme: DeepPartial<ChatTheme>,
	) => {
		saveCustomTheme(name, theme);
		setSelectedTab("custom");
		setShowThemeBuilder(false);
	};

	const handleCreateGameTheme = () => {
		const gameTheme = {
			layout: {
				background:
					"bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900",
			},
			serverSidebar: {
				background: "bg-black/50 backdrop-blur-sm",
				serverItem: {
					selectedRing:
						"ring-2 ring-purple-400 ring-offset-2 ring-offset-black shadow-lg shadow-purple-400/50",
					hoverRing: "ring-2 ring-purple-300 ring-offset-2 ring-offset-black",
				},
			},
			channelSidebar: {
				background: "bg-purple-950/30 backdrop-blur-sm",
				border: "border-r border-purple-500/30",
				channel: {
					selectedBackground: "bg-purple-800/50",
					selectedColor: "text-purple-100",
					hoverBackground: "hover:bg-purple-900/30",
				},
			},
			chatArea: {
				background: "bg-black/30 backdrop-blur-sm",
				topBar: {
					background: "bg-purple-950/50 backdrop-blur-sm",
					borderBottom: "border-b border-purple-500/30",
					color: "text-purple-100",
				},
			},
		};

		customizeTheme(gameTheme);
		if (newThemeName.trim()) {
			saveCustomTheme(newThemeName, gameTheme);
			setNewThemeName("");
			setSelectedTab("custom");
		}
	};

	const handleCreateNeonTheme = () => {
		const neonTheme = {
			layout: {
				background: "bg-black",
				containerBackground: "bg-black",
			},
			serverSidebar: {
				background: "bg-black",
				serverItem: {
					background: "bg-zinc-900",
					selectedRing:
						"ring-2 ring-cyan-400 ring-offset-2 ring-offset-black shadow-lg shadow-cyan-400/50",
					hoverRing: "ring-2 ring-cyan-300 ring-offset-2 ring-offset-black",
				},
			},
			channelSidebar: {
				background: "bg-zinc-950",
				border: "border-r border-cyan-500/30",
				channel: {
					selectedBackground: "bg-cyan-900/30",
					selectedColor: "text-cyan-300",
					hoverBackground: "hover:bg-cyan-950/30",
				},
			},
			chatArea: {
				background: "bg-black",
				topBar: {
					background: "bg-zinc-950",
					borderBottom: "border-b border-cyan-500/30",
					color: "text-cyan-300",
				},
			},
		};

		customizeTheme(neonTheme);
		if (newThemeName.trim()) {
			saveCustomTheme(newThemeName, neonTheme);
			setNewThemeName("");
			setSelectedTab("custom");
		}
	};

	const handleCreateMinimalTheme = () => {
		const minimalTheme = {
			layout: {
				background: "bg-white",
				containerBackground: "bg-white",
			},
			serverSidebar: {
				background: "bg-white",
				serverItem: {
					background: "bg-zinc-100",
					selectedRing: "ring-2 ring-zinc-400 ring-offset-2 ring-offset-white",
					hoverRing: "ring-2 ring-zinc-300 ring-offset-2 ring-offset-white",
					border: "border border-zinc-200",
				},
			},
			channelSidebar: {
				background: "bg-zinc-50",
				border: "border-r border-zinc-200",
				channel: {
					selectedBackground: "bg-zinc-200",
					selectedColor: "text-zinc-900",
					hoverBackground: "hover:bg-zinc-100",
					color: "text-zinc-700",
				},
			},
			chatArea: {
				background: "bg-white",
				topBar: {
					background: "bg-zinc-50",
					borderBottom: "border-b border-zinc-200",
					color: "text-zinc-900",
				},
			},
		};

		customizeTheme(minimalTheme);
		if (newThemeName.trim()) {
			saveCustomTheme(newThemeName, minimalTheme);
			setNewThemeName("");
			setSelectedTab("custom");
		}
	};

	if (!isOpen) {
		return (
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="fixed right-4 bottom-4 z-50 rounded-full border border-zinc-200 bg-white p-3 shadow-lg transition-shadow hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
			>
				<SwatchIcon className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
			</button>
		);
	}

	return (
		<>
			<div className="fixed right-4 bottom-4 z-50 flex max-h-96 w-80 flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
				{/* Header */}
				<div className="flex items-center justify-between border-zinc-200 border-b p-4 dark:border-zinc-700">
					<h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
						<SwatchIcon className="h-5 w-5" />
						Theme Customizer
					</h3>
					<button
						type="button"
						onClick={() => setIsOpen(false)}
						className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
					>
						<XMarkIcon className="h-5 w-5" />
					</button>
				</div>

				{/* Tabs */}
				<div className="flex border-zinc-200 border-b dark:border-zinc-700">
					<button
						type="button"
						onClick={() => setSelectedTab("presets")}
						className={`flex-1 px-3 py-2 font-medium text-sm transition-colors ${
							selectedTab === "presets"
								? "border-blue-600 border-b-2 text-blue-600"
								: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
						}`}
					>
						Presets
					</button>
					<button
						type="button"
						onClick={() => setSelectedTab("custom")}
						className={`flex-1 px-3 py-2 font-medium text-sm transition-colors ${
							selectedTab === "custom"
								? "border-blue-600 border-b-2 text-blue-600"
								: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
						}`}
					>
						Custom
					</button>
					<button
						type="button"
						onClick={() => setSelectedTab("create")}
						className={`flex-1 px-3 py-2 font-medium text-sm transition-colors ${
							selectedTab === "create"
								? "border-blue-600 border-b-2 text-blue-600"
								: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
						}`}
					>
						Create
					</button>
				</div>

				{/* Content */}
				<div
					className="scrollbar-thin flex-1 overflow-y-auto p-4"
					data-theme={variant}
				>
					{selectedTab === "presets" && (
						<div className="space-y-2">
							{variants.map(({ key, label }) => (
								<Button
									key={key}
									variant={variant === key ? "default" : "outline"}
									size="sm"
									onClick={() => setVariant(key)}
									className="w-full justify-start"
								>
									{label}
								</Button>
							))}

							<div className="mt-4 border-zinc-200 border-t pt-2 dark:border-zinc-700">
								<Button
									onClick={resetTheme}
									variant="outline"
									size="sm"
									className="w-full"
								>
									Reset to Default
								</Button>
							</div>
						</div>
					)}

					{selectedTab === "custom" && (
						<div className="space-y-2">
							{Object.keys(customThemes).length === 0 ? (
								<p className="py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
									No custom themes yet. Create one in the Create tab!
								</p>
							) : (
								Object.keys(customThemes).map((themeName) => (
									<div key={themeName} className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => loadCustomTheme(themeName)}
											className="flex-1 justify-start"
										>
											{themeName}
										</Button>
										<button
											type="button"
											onClick={() => deleteCustomTheme(themeName)}
											className="p-1 text-red-500 hover:text-red-700"
										>
											<TrashIcon className="h-4 w-4" />
										</button>
									</div>
								))
							)}
						</div>
					)}

					{selectedTab === "create" && (
						<div className="space-y-3">
							<div>
								<label className="mb-2 block font-medium text-sm text-zinc-700 dark:text-zinc-300">
									Theme Name
								</label>
								<Input
									value={newThemeName}
									onChange={(e) => setNewThemeName(e.target.value)}
									placeholder="My Custom Theme"
									className="w-full"
								/>
							</div>

							<div>
								<label className="mb-2 block font-medium text-sm text-zinc-700 dark:text-zinc-300">
									Advanced Builder
								</label>
								<Button
									onClick={() => setShowThemeBuilder(true)}
									variant="outline"
									size="sm"
									className="mb-3 w-full justify-start"
								>
									<WrenchScrewdriverIcon className="mr-2 h-4 w-4" />
									Open Theme Builder
								</Button>
							</div>

							<div>
								<label className="mb-2 block font-medium text-sm text-zinc-700 dark:text-zinc-300">
									Quick Templates
								</label>
								<div className="space-y-2">
									<Button
										onClick={handleCreateGameTheme}
										variant="outline"
										size="sm"
										className="w-full justify-start"
										disabled={!newThemeName.trim()}
									>
										<PlusIcon className="mr-2 h-4 w-4" />
										Gaming Theme
									</Button>

									<Button
										onClick={handleCreateNeonTheme}
										variant="outline"
										size="sm"
										className="w-full justify-start"
										disabled={!newThemeName.trim()}
									>
										<PlusIcon className="mr-2 h-4 w-4" />
										Neon Theme
									</Button>

									<Button
										onClick={handleCreateMinimalTheme}
										variant="outline"
										size="sm"
										className="w-full justify-start"
										disabled={!newThemeName.trim()}
									>
										<PlusIcon className="mr-2 h-4 w-4" />
										Minimal Theme
									</Button>

									<Button
										onClick={handleSaveCurrentTheme}
										variant="outline"
										size="sm"
										className="w-full justify-start"
										disabled={!newThemeName.trim()}
									>
										<BookmarkIcon className="mr-2 h-4 w-4" />
										Save Current
									</Button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Theme Builder Modal */}
			{showThemeBuilder && (
				<ThemeBuilder
					onClose={() => setShowThemeBuilder(false)}
					onSave={handleThemeBuilderSave}
				/>
			)}
		</>
	);
}
