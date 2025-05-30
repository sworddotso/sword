import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ChatTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useChatTheme } from "./chat-theme-provider";

type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface ThemeBuilderProps {
	onClose: () => void;
	onSave: (name: string, theme: DeepPartial<ChatTheme>) => void;
}

export function ThemeBuilder({ onClose, onSave }: ThemeBuilderProps) {
	const { theme: currentTheme, customizeTheme } = useChatTheme();
	const [themeName, setThemeName] = useState("");
	const [activeSection, setActiveSection] = useState<
		"layout" | "server" | "channel" | "chat"
	>("layout");

	// Form state for theme properties
	const [themeData, setThemeData] = useState<DeepPartial<ChatTheme>>({
		layout: {
			background: "bg-zinc-900",
			containerBackground: "bg-zinc-900",
		},
		serverSidebar: {
			background: "bg-zinc-900",
			serverItem: {
				background: "bg-zinc-950",
				selectedRing: "ring-2 ring-white ring-offset-2 ring-offset-zinc-900",
				hoverRing: "ring-2 ring-zinc-400 ring-offset-2 ring-offset-zinc-900",
			},
		},
		channelSidebar: {
			background: "bg-zinc-950",
			channel: {
				selectedBackground: "bg-zinc-800",
				selectedColor: "text-zinc-100",
			},
		},
		chatArea: {
			background: "bg-zinc-900",
			topBar: {
				background: "bg-zinc-950",
				color: "text-zinc-100",
			},
		},
	});

	const handleColorChange = (path: string, value: string) => {
		const updateNestedValue = (obj: any, path: string, value: string) => {
			const keys = path.split(".");
			const newObj = { ...obj };
			let current = newObj;

			for (let i = 0; i < keys.length - 1; i++) {
				if (!current[keys[i]]) current[keys[i]] = {};
				current[keys[i]] = { ...current[keys[i]] };
				current = current[keys[i]];
			}

			current[keys[keys.length - 1]] = value;
			return newObj;
		};

		const newThemeData = updateNestedValue(themeData, path, value);
		setThemeData(newThemeData);
		customizeTheme(newThemeData);
	};

	const handleSave = () => {
		if (themeName.trim()) {
			onSave(themeName, themeData);
			onClose();
		}
	};

	const ColorInput = ({
		label,
		path,
		currentValue,
	}: { label: string; path: string; currentValue: string }) => (
		<div className="space-y-2">
			<Label className="font-medium text-sm">{label}</Label>
			<div className="flex gap-2">
				<Input
					value={currentValue}
					onChange={(e) => handleColorChange(path, e.target.value)}
					placeholder="bg-zinc-900"
					className="font-mono text-sm"
				/>
				<div className="flex gap-1">
					{[
						"bg-black",
						"bg-white",
						"bg-zinc-900",
						"bg-blue-500",
						"bg-purple-500",
						"bg-green-500",
					].map((color) => (
						<button
							key={color}
							onClick={() => handleColorChange(path, color)}
							className={cn("h-6 w-6 rounded border-2 border-zinc-300", color)}
						/>
					))}
				</div>
			</div>
		</div>
	);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl dark:bg-zinc-900">
				{/* Header */}
				<div className="flex items-center justify-between border-zinc-200 border-b p-6 dark:border-zinc-700">
					<h2 className="font-semibold text-xl">Theme Builder</h2>
					<Button variant="outline" onClick={onClose}>
						Close
					</Button>
				</div>

				<div className="flex flex-1 overflow-hidden">
					{/* Sidebar */}
					<div className="scrollbar-thin w-64 overflow-y-auto border-zinc-200 border-r p-4 dark:border-zinc-700">
						<div className="space-y-4">
							{/* Theme Name */}
							<div>
								<Label className="mb-2 block font-medium text-sm">
									Theme Name
								</Label>
								<Input
									value={themeName}
									onChange={(e) => setThemeName(e.target.value)}
									placeholder="My Custom Theme"
								/>
							</div>

							{/* Sections */}
							<div>
								<Label className="mb-2 block font-medium text-sm">
									Edit Section
								</Label>
								<div className="space-y-1">
									{[
										{ key: "layout", label: "Layout & Background" },
										{ key: "server", label: "Server Sidebar" },
										{ key: "channel", label: "Channel Sidebar" },
										{ key: "chat", label: "Chat Area" },
									].map(({ key, label }) => (
										<Button
											key={key}
											variant={activeSection === key ? "default" : "ghost"}
											size="sm"
											onClick={() => setActiveSection(key as any)}
											className="w-full justify-start"
										>
											{label}
										</Button>
									))}
								</div>
							</div>

							{/* Save Button */}
							<Button
								onClick={handleSave}
								disabled={!themeName.trim()}
								className="w-full"
							>
								Save Theme
							</Button>
						</div>
					</div>

					{/* Main Content */}
					<div className="scrollbar-thin flex-1 overflow-y-auto p-6">
						{activeSection === "layout" && (
							<div className="space-y-4">
								<h3 className="mb-4 font-semibold text-lg">
									Layout & Background
								</h3>
								<ColorInput
									label="Main Background"
									path="layout.background"
									currentValue={themeData.layout?.background || ""}
								/>
								<ColorInput
									label="Container Background"
									path="layout.containerBackground"
									currentValue={themeData.layout?.containerBackground || ""}
								/>
							</div>
						)}

						{activeSection === "server" && (
							<div className="space-y-4">
								<h3 className="mb-4 font-semibold text-lg">Server Sidebar</h3>
								<ColorInput
									label="Sidebar Background"
									path="serverSidebar.background"
									currentValue={themeData.serverSidebar?.background || ""}
								/>
								<ColorInput
									label="Server Item Background"
									path="serverSidebar.serverItem.background"
									currentValue={
										themeData.serverSidebar?.serverItem?.background || ""
									}
								/>
								<ColorInput
									label="Selected Ring"
									path="serverSidebar.serverItem.selectedRing"
									currentValue={
										themeData.serverSidebar?.serverItem?.selectedRing || ""
									}
								/>
								<ColorInput
									label="Hover Ring"
									path="serverSidebar.serverItem.hoverRing"
									currentValue={
										themeData.serverSidebar?.serverItem?.hoverRing || ""
									}
								/>
							</div>
						)}

						{activeSection === "channel" && (
							<div className="space-y-4">
								<h3 className="mb-4 font-semibold text-lg">Channel Sidebar</h3>
								<ColorInput
									label="Sidebar Background"
									path="channelSidebar.background"
									currentValue={themeData.channelSidebar?.background || ""}
								/>
								<ColorInput
									label="Selected Channel Background"
									path="channelSidebar.channel.selectedBackground"
									currentValue={
										themeData.channelSidebar?.channel?.selectedBackground || ""
									}
								/>
								<ColorInput
									label="Selected Channel Color"
									path="channelSidebar.channel.selectedColor"
									currentValue={
										themeData.channelSidebar?.channel?.selectedColor || ""
									}
								/>
								<ColorInput
									label="Hover Background"
									path="channelSidebar.channel.hoverBackground"
									currentValue={
										themeData.channelSidebar?.channel?.hoverBackground || ""
									}
								/>
							</div>
						)}

						{activeSection === "chat" && (
							<div className="space-y-4">
								<h3 className="mb-4 font-semibold text-lg">Chat Area</h3>
								<ColorInput
									label="Chat Background"
									path="chatArea.background"
									currentValue={themeData.chatArea?.background || ""}
								/>
								<ColorInput
									label="Top Bar Background"
									path="chatArea.topBar.background"
									currentValue={themeData.chatArea?.topBar?.background || ""}
								/>
								<ColorInput
									label="Top Bar Text Color"
									path="chatArea.topBar.color"
									currentValue={themeData.chatArea?.topBar?.color || ""}
								/>
								<ColorInput
									label="Message Area Background"
									path="chatArea.messageArea.background"
									currentValue={
										themeData.chatArea?.messageArea?.background || ""
									}
								/>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
