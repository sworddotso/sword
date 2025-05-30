import { Button } from "@/components/ui/button";
import type { AuthThemeVariant } from "@/lib/theme";
import { useAuthTheme } from "./auth-theme-provider";

export function ThemeCustomizer() {
	const { variant, setVariant, customizeTheme, resetTheme } = useAuthTheme();

	const variants: { key: AuthThemeVariant; label: string }[] = [
		{ key: "default", label: "Default" },
		{ key: "minimal", label: "Minimal" },
		{ key: "colorful", label: "Colorful" },
	];

	const handleCustomize = () => {
		// Example customization - using partial interfaces
		customizeTheme({
			typography: {
				heading: {
					size: "text-3xl",
					weight: "font-extrabold",
					color: "text-blue-600 dark:text-blue-400",
				},
				body: {
					size: "text-base",
					color: "text-zinc-600 dark:text-zinc-400",
				},
				link: {
					color: "text-blue-600 dark:text-blue-400",
					hoverColor: "hover:text-blue-700 dark:hover:text-blue-300",
				},
			},
			button: {
				primary: {
					background: "bg-gradient-to-r from-purple-500 to-pink-500",
					hoverBackground: "hover:from-purple-600 hover:to-pink-600",
					color: "text-white",
					height: "h-12",
				},
				secondary: {
					background: "bg-white dark:bg-zinc-800",
					hoverBackground: "hover:bg-zinc-50 dark:hover:bg-zinc-700",
					color: "text-zinc-700 dark:text-zinc-300",
					border: "border border-zinc-300 dark:border-zinc-600",
				},
			},
		});
	};

	return (
		<div className="fixed top-4 right-4 z-50 rounded-lg border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
			<h3 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">
				Theme Customizer
			</h3>

			<div className="space-y-3">
				<div>
					<label className="mb-2 block font-medium text-sm text-zinc-700 dark:text-zinc-300">
						Theme Variant
					</label>
					<div className="space-y-1">
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
					</div>
				</div>

				<div className="border-zinc-200 border-t pt-2 dark:border-zinc-700">
					<Button
						onClick={handleCustomize}
						variant="outline"
						size="sm"
						className="mb-2 w-full"
					>
						Apply Custom Style
					</Button>

					<Button
						onClick={resetTheme}
						variant="outline"
						size="sm"
						className="w-full"
					>
						Reset Theme
					</Button>
				</div>
			</div>
		</div>
	);
}
