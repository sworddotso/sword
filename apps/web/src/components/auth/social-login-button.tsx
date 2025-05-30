import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { useAuthTheme } from "./auth-theme-provider";

interface SocialLoginButtonProps {
	provider: string;
	icon: ReactNode;
	onClick: () => void;
	disabled?: boolean;
	className?: string;
}

export function SocialLoginButton({
	provider,
	icon,
	onClick,
	disabled = false,
	className,
}: SocialLoginButtonProps) {
	const { theme } = useAuthTheme();

	return (
		<Button
			onClick={onClick}
			disabled={disabled}
			variant="outline"
			className={cn(
				"w-full",
				theme.button.primary.height,
				theme.button.secondary.color,
				theme.button.secondary.border,
				theme.button.secondary.hoverBackground,
				className,
			)}
		>
			{icon}
			Continue with {provider}
		</Button>
	);
}
