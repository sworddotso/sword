import { cn } from "@/lib/utils";
import {
	Bars3Icon,
	MagnifyingGlassIcon,
	QuestionMarkCircleIcon,
} from "@heroicons/react/16/solid";
import { useChatTheme } from "./chat-theme-provider";
import { useStore, tables } from '@/lib/livestore'
import { queryDb } from '@livestore/livestore'

interface TopBarProps {
	selectedChannel: string;
	className?: string;
}

export default function TopBar({ selectedChannel, className }: TopBarProps) {
	const { theme } = useChatTheme();
	const { store } = useStore()

	// Query to get the current channel details - use a more robust approach
	const channelQuery = queryDb(() => {
		console.log('🔍 TopBar: Querying all channels for lookup')
		return tables.channels.where({ deletedAt: null })
	})
	
	const channels = store.useQuery(channelQuery)
	const currentChannel = channels?.find((channel: any) => channel.id === selectedChannel)
	
	console.log('🎯 TopBar Channel Data:', {
		selectedChannel,
		foundChannel: !!currentChannel,
		channelName: currentChannel?.name,
		channelType: currentChannel?.type,
		totalChannelsFound: channels?.length || 0,
		queryingSpecificChannel: selectedChannel,
		allChannelIds: channels?.map((c: any) => c.id)
	})
	
	// Display the channel name, fallback to ID if not found
	const channelName = currentChannel?.name || selectedChannel || 'Unknown Channel'
	const channelType = currentChannel?.type || 'text'

	// Show debug info if channel is not found
	if (selectedChannel && !currentChannel) {
		console.error('❌ TopBar: Channel not found in database!', {
			searchingFor: selectedChannel,
			availableChannels: channels?.map((c: any) => ({ id: c.id, name: c.name }))
		})
	}

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
				<span className="text-xl text-zinc-500">
					{channelType === 'voice' ? '🔊' : '#'}
				</span>
				<h2
					className={cn("font-semibold text-xl", theme.chatArea.topBar.color)}
				>
					{channelName}
				</h2>
				{currentChannel?.description && (
					<span className="hidden text-sm text-zinc-400 sm:block">
						{currentChannel.description}
					</span>
				)}
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
