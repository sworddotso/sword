import { cn } from "@/lib/utils";
import { useState } from "react";
import { useChatTheme } from "./chat-theme-provider";

interface ServerItemProps {
	id: string;
	name: string;
	image: string;
	color?: string;
	isSelected: boolean;
	onClick: () => void;
	className?: string;
}

export function ServerItem({
	id,
	name,
	image,
	color,
	isSelected,
	onClick,
	className,
}: ServerItemProps) {
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
					"overflow-hidden shadow-lg transition-colors duration-200",
					isSelected
						? theme.serverSidebar.serverItem.selectedRing
						: isHovered
							? theme.serverSidebar.serverItem.hoverRing
							: theme.serverSidebar.serverItem.border,
				)}
			>
				<img
					src={image}
					alt={name}
					className="h-full w-full object-cover"
					onError={(e) => {
						// Fallback to colored background with first letter if image fails to load
						const target = e.target as HTMLImageElement;
						target.style.display = "none";
						const parent = target.parentElement;
						if (parent && color) {
							parent.innerHTML = `<div class="w-full h-full ${color} flex items-center justify-center text-white font-bold text-lg">${name.charAt(0)}</div>`;
						}
					}}
				/>
			</button>

			{/* Tooltip */}
			{isHovered && (
				<div
					className={cn(
						"-translate-y-1/2 absolute top-1/2 left-20 z-50 transform whitespace-nowrap rounded-lg px-3 py-2 font-medium text-sm shadow-2xl",
						theme.serverSidebar.tooltip.background,
						theme.serverSidebar.tooltip.color,
						theme.serverSidebar.tooltip.border,
					)}
				>
					{name}
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
