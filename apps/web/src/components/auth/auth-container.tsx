import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { useAuthTheme } from "./auth-theme-provider";

interface AuthContainerProps {
	children: ReactNode;
	className?: string;
}

export function AuthContainer({ children, className }: AuthContainerProps) {
	const { theme } = useAuthTheme();

	return (
		<div
			className={cn(
				"flex min-h-screen items-center justify-center",
				theme.container.background,
				theme.container.padding,
				className,
			)}
		>
			<div className={cn("w-full", theme.card.maxWidth)}>
				<div
					className={cn(
						theme.card.background,
						theme.card.borderRadius,
						theme.card.shadow,
						theme.card.border,
						theme.card.padding,
					)}
				>
					{children}
				</div>
			</div>
		</div>
	);
}
