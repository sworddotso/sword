import { cn } from "@/lib/utils";
import { PlusIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import { useChatTheme } from "./chat-theme-provider";

interface AddServerButtonProps {
	onClick?: () => void;
	className?: string;
}

export function AddServerButton({ onClick, className }: AddServerButtonProps) {
	const [isHovered, setIsHovered] = useState(false);
	const { theme } = useChatTheme();

	return (
		<div className={cn("relative", className)}>
			<button
				type="button"
				onClick={onClick}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				className={cn(
					theme.serverSidebar.serverItem.size,
					theme.serverSidebar.serverItem.borderRadius,
					"flex items-center justify-center transition-colors duration-200",
					theme.serverSidebar.addButton.background,
					theme.serverSidebar.addButton.color,
					isHovered
						? `${theme.serverSidebar.addButton.hoverBackground} ${theme.serverSidebar.addButton.hoverColor} ${theme.serverSidebar.serverItem.hoverRing}`
						: `${theme.serverSidebar.serverItem.border} ${theme.serverSidebar.serverItem.hoverBackground}`,
				)}
			>
				<PlusIcon className="h-6 w-6" />
			</button>

			{/* Tooltip for add button */}
			{isHovered && (
				<div
					className={cn(
						"-translate-y-1/2 absolute top-1/2 left-20 z-50 transform whitespace-nowrap rounded-lg px-3 py-2 font-medium text-sm shadow-2xl",
						theme.serverSidebar.tooltip.background,
						theme.serverSidebar.tooltip.color,
						theme.serverSidebar.tooltip.border,
					)}
				>
					Add a Server
					<div
						className={cn(
							"-translate-y-1/2 -translate-x-1 absolute top-1/2 left-0 h-2 w-2 rotate-45 transform border-b border-l",
							theme.serverSidebar.tooltip.background,
							theme.serverSidebar.tooltip.border,
						)}
					/>
				</div>
			)}
		</div>
	);
}
