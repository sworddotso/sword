import { cn } from "@/lib/utils";
import { useAuthTheme } from "./auth-theme-provider";

interface AuthDividerProps {
	text?: string;
	className?: string;
}

export function AuthDivider({ text = "Or", className }: AuthDividerProps) {
	const { theme } = useAuthTheme();

	return (
		<div className={cn("flex items-center", className)}>
			<div className={cn("flex-1 border-t", theme.divider.color)} />
			<span
				className={cn(
					"px-3",
					theme.typography.body.size,
					theme.typography.body.color,
				)}
			>
				{text}
			</span>
			<div className={cn("flex-1 border-t", theme.divider.color)} />
		</div>
	);
}
