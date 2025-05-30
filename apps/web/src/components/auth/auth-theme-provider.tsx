import {
	type AuthTheme,
	type AuthThemeVariant,
	authThemeVariants,
	defaultAuthTheme,
} from "@/lib/theme";
import { type ReactNode, createContext, useContext, useState } from "react";

interface AuthThemeContextType {
	theme: AuthTheme;
	variant: AuthThemeVariant;
	setVariant: (variant: AuthThemeVariant) => void;
	customizeTheme: (customizations: Partial<AuthTheme>) => void;
	resetTheme: () => void;
}

const AuthThemeContext = createContext<AuthThemeContextType | undefined>(
	undefined,
);

interface AuthThemeProviderProps {
	children: ReactNode;
	initialVariant?: AuthThemeVariant;
	customizations?: Partial<AuthTheme>;
}

export function AuthThemeProvider({
	children,
	initialVariant = "default",
	customizations = {},
}: AuthThemeProviderProps) {
	const [variant, setVariant] = useState<AuthThemeVariant>(initialVariant);
	const [themeCustomizations, setThemeCustomizations] =
		useState<Partial<AuthTheme>>(customizations);

	// Merge base theme with customizations
	const theme: AuthTheme = {
		...authThemeVariants[variant],
		...themeCustomizations,
		container: {
			...authThemeVariants[variant].container,
			...(themeCustomizations.container || {}),
		},
		card: {
			...authThemeVariants[variant].card,
			...(themeCustomizations.card || {}),
		},
		typography: {
			...authThemeVariants[variant].typography,
			...(themeCustomizations.typography || {}),
			heading: {
				...authThemeVariants[variant].typography.heading,
				...(themeCustomizations.typography?.heading || {}),
			},
			body: {
				...authThemeVariants[variant].typography.body,
				...(themeCustomizations.typography?.body || {}),
			},
			link: {
				...authThemeVariants[variant].typography.link,
				...(themeCustomizations.typography?.link || {}),
			},
		},
		button: {
			...authThemeVariants[variant].button,
			...(themeCustomizations.button || {}),
			primary: {
				...authThemeVariants[variant].button.primary,
				...(themeCustomizations.button?.primary || {}),
			},
			secondary: {
				...authThemeVariants[variant].button.secondary,
				...(themeCustomizations.button?.secondary || {}),
			},
		},
		input: {
			...authThemeVariants[variant].input,
			...(themeCustomizations.input || {}),
		},
		divider: {
			...authThemeVariants[variant].divider,
			...(themeCustomizations.divider || {}),
		},
		error: {
			...authThemeVariants[variant].error,
			...(themeCustomizations.error || {}),
		},
	};

	const customizeTheme = (customizations: Partial<AuthTheme>) => {
		setThemeCustomizations((prev) => ({
			...prev,
			...customizations,
		}));
	};

	const resetTheme = () => {
		setThemeCustomizations({});
		setVariant("default");
	};

	return (
		<AuthThemeContext.Provider
			value={{
				theme,
				variant,
				setVariant,
				customizeTheme,
				resetTheme,
			}}
		>
			{children}
		</AuthThemeContext.Provider>
	);
}

export function useAuthTheme() {
	const context = useContext(AuthThemeContext);
	if (context === undefined) {
		throw new Error("useAuthTheme must be used within an AuthThemeProvider");
	}
	return context;
}
