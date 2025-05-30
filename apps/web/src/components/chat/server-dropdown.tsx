import { useState } from "react";

interface ServerDropdownProps {
	serverName: string;
	serverId: string;
}

export default function ServerDropdown({
	serverName,
	serverId,
}: ServerDropdownProps) {
	const [isOpen, setIsOpen] = useState(false);

	// Mock server data - in real app this would come from API
	const serverData = {
		analog: {
			banner:
				"https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop",
			level: 3,
			boosts: 14,
			owner: "Alex Slater",
			ownerHandle: "@alexslater",
		},
		design: {
			banner:
				"https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=400&h=200&fit=crop",
			level: 2,
			boosts: 8,
			owner: "Design Lead",
			ownerHandle: "@designlead",
		},
		dev: {
			banner:
				"https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=200&fit=crop",
			level: 4,
			boosts: 22,
			owner: "Dev Team",
			ownerHandle: "@devteam",
		},
		gaming: {
			banner:
				"https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=200&fit=crop",
			level: 1,
			boosts: 3,
			owner: "Gaming Squad",
			ownerHandle: "@gamingsquad",
		},
	};

	const currentServer =
		serverData[serverId as keyof typeof serverData] || serverData.analog;

	return (
		<div className="relative">
			{/* Server Name Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center space-x-2 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-zinc-800"
			>
				<h1 className="font-bold text-lg text-zinc-50">{serverName}</h1>
				<svg
					className={`h-4 w-4 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<path
						fillRule="evenodd"
						d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
						clipRule="evenodd"
					/>
				</svg>
			</button>

			{/* Dropdown Panel */}
			{isOpen && (
				<div className="absolute top-full left-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
					{/* Server Banner */}
					<div className="relative h-32 overflow-hidden">
						<img
							src={currentServer.banner}
							alt={`${serverName} banner`}
							className="h-full w-full object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950/80" />

						{/* Server Owner Info */}
						<div className="absolute bottom-3 left-4 text-white">
							<h3 className="font-bold text-sm">{currentServer.owner}</h3>
							<p className="text-xs text-zinc-300">
								{currentServer.ownerHandle}
							</p>
						</div>
					</div>

					{/* Server Stats */}
					<div className="border-zinc-800 border-b p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-4">
								<div>
									<p className="text-xs text-zinc-400 uppercase tracking-wide">
										Level
									</p>
									<p className="font-bold text-lg text-zinc-200">
										{currentServer.level}
									</p>
								</div>
								<div>
									<p className="text-xs text-zinc-400 uppercase tracking-wide">
										Boosts
									</p>
									<p className="font-bold text-lg text-zinc-200">
										{currentServer.boosts}
									</p>
								</div>
							</div>
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800">
								<span className="text-yellow-400">⚡</span>
							</div>
						</div>

						{/* Progress Bar */}
						<div className="mt-3">
							<div className="h-2 w-full rounded-full bg-zinc-800">
								<div
									className="h-2 rounded-full bg-blue-500"
									style={{ width: `${currentServer.level * 25}%` }}
								/>
							</div>
						</div>
					</div>

					{/* Navigation Menu */}
					<div className="p-2">
						<button className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-zinc-900">
							<svg
								className="h-5 w-5 text-zinc-400"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
									clipRule="evenodd"
								/>
							</svg>
							<span className="font-medium text-zinc-300">Events</span>
						</button>

						<button className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-zinc-900">
							<svg
								className="h-5 w-5 text-zinc-400"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
									clipRule="evenodd"
								/>
							</svg>
							<span className="font-medium text-zinc-300">
								Channels & Roles
							</span>
						</button>

						<button className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-zinc-900">
							<svg
								className="h-5 w-5 text-zinc-400"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
							</svg>
							<span className="font-medium text-zinc-300">Members</span>
						</button>
					</div>
				</div>
			)}

			{/* Backdrop */}
			{isOpen && (
				<div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
			)}
		</div>
	);
}
