import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthTheme } from "./auth-theme-provider";

interface AuthSwitchLinkProps {
	text: string;
	linkText: string;
	onClick: () => void;
	className?: string;
}

export function AuthSwitchLink({
	text,
	linkText,
	onClick,
	className,
}: AuthSwitchLinkProps) {
	const { theme } = useAuthTheme();

	return (
		<div className={cn("text-center", className)}>
			<span
				className={cn(theme.typography.body.size, theme.typography.body.color)}
			>
				{text}{" "}
			</span>
			<Button
				variant="link"
				onClick={onClick}
				className={cn(
					"h-auto p-0 font-medium",
					theme.typography.body.size,
					theme.typography.link.color,
					theme.typography.link.hoverColor,
				)}
			>
				{linkText}
			</Button>
		</div>
	);
}
