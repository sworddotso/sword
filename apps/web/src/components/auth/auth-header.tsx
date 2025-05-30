import { cn } from "@/lib/utils";
import { useAuthTheme } from "./auth-theme-provider";

interface AuthHeaderProps {
	title: string;
	subtitle?: string;
	className?: string;
}

export function AuthHeader({ title, subtitle, className }: AuthHeaderProps) {
	const { theme } = useAuthTheme();

	return (
		<div className={cn("space-y-2 text-center", className)}>
			<h1
				className={cn(
					theme.typography.heading.size,
					theme.typography.heading.weight,
					theme.typography.heading.color,
				)}
			>
				{title}
			</h1>
			{subtitle && (
				<p
					className={cn(
						theme.typography.body.size,
						theme.typography.body.color,
					)}
				>
					{subtitle}
				</p>
			)}
		</div>
	);
}
