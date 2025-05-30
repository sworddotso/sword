import {
	type ChatTheme,
	type ChatThemeVariant,
	chatThemeVariants,
	defaultChatTheme,
} from "@/lib/theme";
import { type ReactNode, createContext, useContext, useState } from "react";

// Deep partial type for nested customizations
type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface ChatThemeContextType {
	theme: ChatTheme;
	variant: ChatThemeVariant;
	setVariant: (variant: ChatThemeVariant) => void;
	customizeTheme: (customizations: DeepPartial<ChatTheme>) => void;
	resetTheme: () => void;
	saveCustomTheme: (name: string, theme: DeepPartial<ChatTheme>) => void;
	loadCustomTheme: (name: string) => void;
	getCustomThemes: () => Record<string, DeepPartial<ChatTheme>>;
	deleteCustomTheme: (name: string) => void;
}

const ChatThemeContext = createContext<ChatThemeContextType | undefined>(
	undefined,
);

interface ChatThemeProviderProps {
	children: ReactNode;
	initialVariant?: ChatThemeVariant;
	customizations?: DeepPartial<ChatTheme>;
}

export function ChatThemeProvider({
	children,
	initialVariant = "default",
	customizations = {},
}: ChatThemeProviderProps) {
	const [variant, setVariant] = useState<ChatThemeVariant>(initialVariant);
	const [themeCustomizations, setThemeCustomizations] =
		useState<DeepPartial<ChatTheme>>(customizations);
	const [customThemes, setCustomThemes] = useState<
		Record<string, DeepPartial<ChatTheme>>
	>(() => {
		// Load custom themes from localStorage
		if (typeof window !== "undefined") {
			try {
				const saved = localStorage.getItem("chat-custom-themes");
				return saved ? JSON.parse(saved) : {};
			} catch {
				return {};
			}
		}
		return {};
	});

	// Improved deep merge function that handles undefined values safely
	const deepMerge = (target: any, source: any): any => {
		// Handle null or undefined values
		if (!target || typeof target !== "object") {
			target = {};
		}
		if (!source || typeof source !== "object" || Array.isArray(source)) {
			return source !== undefined ? source : target;
		}

		const output = { ...target };

		Object.keys(source).forEach((key) => {
			const sourceValue = source[key];
			const targetValue = target[key];

			if (sourceValue !== undefined) {
				if (
					sourceValue &&
					typeof sourceValue === "object" &&
					!Array.isArray(sourceValue)
				) {
					// Ensure target has the property initialized as an object
					if (
						!targetValue ||
						typeof targetValue !== "object" ||
						Array.isArray(targetValue)
					) {
						output[key] = {};
					}
					output[key] = deepMerge(output[key] || {}, sourceValue);
				} else {
					output[key] = sourceValue;
				}
			}
		});

		return output;
	};

	// Merge base theme with customizations
	const theme: ChatTheme = deepMerge(
		chatThemeVariants[variant],
		themeCustomizations,
	);

	const customizeTheme = (customizations: DeepPartial<ChatTheme>) => {
		setThemeCustomizations((prev) => deepMerge(prev, customizations));
	};

	const resetTheme = () => {
		setThemeCustomizations({});
		setVariant("default");
	};

	const saveCustomTheme = (name: string, theme: DeepPartial<ChatTheme>) => {
		const newCustomThemes = { ...customThemes, [name]: theme };
		setCustomThemes(newCustomThemes);

		// Save to localStorage
		if (typeof window !== "undefined") {
			try {
				localStorage.setItem(
					"chat-custom-themes",
					JSON.stringify(newCustomThemes),
				);
			} catch (error) {
				console.warn("Failed to save custom theme to localStorage:", error);
			}
		}
	};

	const loadCustomTheme = (name: string) => {
		const customTheme = customThemes[name];
		if (customTheme) {
			setThemeCustomizations(customTheme);
		}
	};

	const getCustomThemes = () => customThemes;

	const deleteCustomTheme = (name: string) => {
		const newCustomThemes = { ...customThemes };
		delete newCustomThemes[name];
		setCustomThemes(newCustomThemes);

		// Update localStorage
		if (typeof window !== "undefined") {
			try {
				localStorage.setItem(
					"chat-custom-themes",
					JSON.stringify(newCustomThemes),
				);
			} catch (error) {
				console.warn("Failed to update localStorage:", error);
			}
		}
	};

	return (
		<ChatThemeContext.Provider
			value={{
				theme,
				variant,
				setVariant,
				customizeTheme,
				resetTheme,
				saveCustomTheme,
				loadCustomTheme,
				getCustomThemes,
				deleteCustomTheme,
			}}
		>
			{children}
		</ChatThemeContext.Provider>
	);
}

export function useChatTheme() {
	const context = useContext(ChatThemeContext);
	if (context === undefined) {
		throw new Error("useChatTheme must be used within a ChatThemeProvider");
	}
	return context;
}
