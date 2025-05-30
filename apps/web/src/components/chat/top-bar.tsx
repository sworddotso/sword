import { cn } from "@/lib/utils";
import {
	Bars3Icon,
	MagnifyingGlassIcon,
	QuestionMarkCircleIcon,
} from "@heroicons/react/16/solid";
import { useChatTheme } from "./chat-theme-provider";

interface TopBarProps {
	selectedChannel: string;
	className?: string;
}

export default function TopBar({ selectedChannel, className }: TopBarProps) {
	const { theme } = useChatTheme();

	return (
		<div
			className={cn(
				"z-20 flex h-12 items-center justify-between border-zinc-700 border-b bg-zinc-900/95 px-4 shadow-lg backdrop-blur-md sm:h-14 sm:px-6",
				theme.chatArea.topBar.background,
				theme.chatArea.topBar.borderBottom,
				className,
			)}
		>
			{/* Channel Info */}
			<div className="flex min-w-0 items-center space-x-2 sm:space-x-3">
				<span className="text-xl text-zinc-500">#</span>
				<h2
					className={cn("font-semibold text-xl", theme.chatArea.topBar.color)}
				>
					{selectedChannel}
				</h2>
			</div>

			{/* Top Bar Actions */}
			<div className="flex flex-shrink-0 items-center space-x-2 sm:space-x-4">
				<button type="button" className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition-all duration-200 hover:bg-zinc-800 hover:text-zinc-100 sm:h-7 sm:w-7">
					<MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5" />
				</button>
				<button type="button" className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition-all duration-200 hover:bg-zinc-800 hover:text-zinc-100 sm:h-7 sm:w-7">
					<QuestionMarkCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
				</button>
				<button type="button" className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition-all duration-200 hover:bg-zinc-800 hover:text-zinc-100 sm:h-7 sm:w-7">
					<Bars3Icon className="h-4 w-4 sm:h-5 sm:w-5" />
				</button>
			</div>
		</div>
	);
}
