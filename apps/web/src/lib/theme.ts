export interface AuthTheme {
	container: {
		background: string;
		padding: string;
	};
	card: {
		background: string;
		border: string;
		borderRadius: string;
		shadow: string;
		padding: string;
		maxWidth: string;
	};
	typography: {
		heading: {
			size: string;
			weight: string;
			color: string;
		};
		body: {
			size: string;
			color: string;
		};
		link: {
			color: string;
			hoverColor: string;
		};
	};
	button: {
		primary: {
			background: string;
			hoverBackground: string;
			color: string;
			height: string;
		};
		secondary: {
			background: string;
			hoverBackground: string;
			color: string;
			border: string;
		};
	};
	input: {
		background: string;
		border: string;
		focusBorder: string;
		color: string;
		placeholderColor: string;
		height: string;
	};
	divider: {
		color: string;
	};
	error: {
		color: string;
	};
}

export interface ChatTheme {
	layout: {
		background: string;
		containerBackground: string;
	};
	serverSidebar: {
		background: string;
		width: string;
		serverItem: {
			size: string;
			borderRadius: string;
			background: string;
			hoverBackground: string;
			selectedRing: string;
			hoverRing: string;
			border: string;
		};
		tooltip: {
			background: string;
			color: string;
			border: string;
		};
		addButton: {
			background: string;
			hoverBackground: string;
			color: string;
			hoverColor: string;
		};
	};
	channelSidebar: {
		background: string;
		border: string;
		borderRadius: string;
		header: {
			background: string;
			color: string;
			borderBottom: string;
		};
		section: {
			titleColor: string;
			titleHoverColor: string;
			titleSize: string;
		};
		channel: {
			background: string;
			hoverBackground: string;
			selectedBackground: string;
			color: string;
			hoverColor: string;
			selectedColor: string;
			borderRadius: string;
			padding: string;
		};
		notification: {
			background: string;
			color: string;
			size: string;
		};
	};
	chatArea: {
		background: string;
		borderRadius: string;
		topBar: {
			background: string;
			borderBottom: string;
			color: string;
			height: string;
		};
		messageArea: {
			background: string;
			padding: string;
		};
		message: {
			padding: string;
			hoverBackground: string;
			borderRadius: string;
			author: {
				color: string;
				size: string;
				weight: string;
			};
			content: {
				color: string;
				size: string;
			};
			timestamp: {
				color: string;
				size: string;
			};
			avatar: {
				size: string;
				borderRadius: string;
			};
		};
		inputArea: {
			background: string;
			border: string;
			borderRadius: string;
			padding: string;
			input: {
				background: string;
				color: string;
				placeholderColor: string;
				borderRadius: string;
				padding: string;
			};
		};
	};
	userBar: {
		background: string;
		borderTop: string;
		padding: string;
		avatar: {
			size: string;
			borderRadius: string;
		};
		username: {
			color: string;
			size: string;
			weight: string;
		};
		status: {
			color: string;
			size: string;
		};
		buttons: {
			background: string;
			hoverBackground: string;
			color: string;
			hoverColor: string;
			size: string;
		};
	};
	callControls: {
		container: {
			background: string;
			border: string;
			borderRadius: string;
		};
		statusSection: {
			background: string;
			color: string;
			channelNameColor: string;
		};
		controlsSection: {
			background: string;
			border: string;
		};
		buttons: {
			background: string;
			hoverBackground: string;
			color: string;
			hoverColor: string;
			activeBackground: string;
			activeColor: string;
			mutedBackground: string;
			mutedColor: string;
		};
	};
	scrollbar: {
		track: string;
		thumb: string;
		thumbHover: string;
	};
}

export const defaultAuthTheme: AuthTheme = {
	container: {
		background: "bg-zinc-50 dark:bg-zinc-950",
		padding: "p-4",
	},
	card: {
		background: "bg-white dark:bg-zinc-900",
		border: "border border-zinc-200 dark:border-zinc-700",
		borderRadius: "rounded-2xl",
		shadow: "shadow-xl",
		padding: "p-8",
		maxWidth: "max-w-md",
	},
	typography: {
		heading: {
			size: "text-2xl",
			weight: "font-bold",
			color: "text-zinc-900 dark:text-zinc-100",
		},
		body: {
			size: "text-sm",
			color: "text-zinc-600 dark:text-zinc-400",
		},
		link: {
			color: "text-zinc-900 dark:text-zinc-100",
			hoverColor: "hover:text-zinc-700 dark:hover:text-zinc-300",
		},
	},
	button: {
		primary: {
			background: "bg-primary",
			hoverBackground: "hover:bg-primary/90",
			color: "text-primary-foreground",
			height: "h-11",
		},
		secondary: {
			background: "bg-background",
			hoverBackground: "hover:bg-zinc-50 dark:hover:bg-zinc-800",
			color: "text-zinc-700 dark:text-zinc-300",
			border: "border border-zinc-300 dark:border-zinc-600",
		},
	},
	input: {
		background: "bg-transparent",
		border: "border-input",
		focusBorder: "focus-visible:border-ring",
		color: "text-foreground",
		placeholderColor: "placeholder:text-muted-foreground",
		height: "h-11",
	},
	divider: {
		color: "border-zinc-300 dark:border-zinc-600",
	},
	error: {
		color: "text-red-500",
	},
};

export const defaultChatTheme: ChatTheme = {
	layout: {
		background: "bg-zinc-900",
		containerBackground: "bg-zinc-900",
	},
	serverSidebar: {
		background: "bg-zinc-900",
		width: "w-[72px]",
		serverItem: {
			size: "w-12 h-12",
			borderRadius: "rounded-xl",
			background: "bg-zinc-950",
			hoverBackground: "hover:bg-zinc-800",
			selectedRing: "ring-2 ring-white ring-offset-2 ring-offset-zinc-900",
			hoverRing: "ring-2 ring-zinc-400 ring-offset-2 ring-offset-zinc-900",
			border: "border border-zinc-800",
		},
		tooltip: {
			background: "bg-zinc-950",
			color: "text-zinc-200",
			border: "border border-zinc-700",
		},
		addButton: {
			background: "bg-zinc-950",
			hoverBackground: "hover:bg-green-600",
			color: "text-green-500",
			hoverColor: "hover:text-white",
		},
	},
	channelSidebar: {
		background: "bg-zinc-950",
		border: "border-r border-zinc-800",
		borderRadius: "rounded-tl-[16px]",
		header: {
			background: "bg-transparent",
			color: "text-zinc-100",
			borderBottom: "border-b border-zinc-800",
		},
		section: {
			titleColor: "text-zinc-400",
			titleHoverColor: "hover:text-zinc-200",
			titleSize: "text-xs",
		},
		channel: {
			background: "bg-transparent",
			hoverBackground: "hover:bg-zinc-900",
			selectedBackground: "bg-zinc-800",
			color: "text-zinc-400",
			hoverColor: "hover:text-zinc-200",
			selectedColor: "text-zinc-100",
			borderRadius: "rounded-md",
			padding: "px-2 py-1.5",
		},
		notification: {
			background: "bg-red-500",
			color: "text-white",
			size: "w-4 h-4 sm:w-5 sm:h-5",
		},
	},
	chatArea: {
		background: "bg-zinc-900",
		borderRadius: "rounded-tr-[16px]",
		topBar: {
			background: "bg-zinc-950",
			borderBottom: "border-b border-zinc-800",
			color: "text-zinc-100",
			height: "h-14",
		},
		messageArea: {
			background: "bg-zinc-900",
			padding: "p-4",
		},
		message: {
			padding: "py-2 px-4",
			hoverBackground: "hover:bg-zinc-800/50",
			borderRadius: "rounded-lg",
			author: {
				color: "text-zinc-100",
				size: "text-sm",
				weight: "font-semibold",
			},
			content: {
				color: "text-zinc-300",
				size: "text-sm",
			},
			timestamp: {
				color: "text-zinc-500",
				size: "text-xs",
			},
			avatar: {
				size: "w-10 h-10",
				borderRadius: "rounded-lg",
			},
		},
		inputArea: {
			background: "bg-zinc-950",
			border: "border-t border-zinc-800",
			borderRadius: "rounded-none",
			padding: "p-4",
			input: {
				background: "bg-zinc-800",
				color: "text-zinc-100",
				placeholderColor: "placeholder:text-zinc-400",
				borderRadius: "rounded-lg",
				padding: "px-4 py-3",
			},
		},
	},
	userBar: {
		background: "bg-zinc-950",
		borderTop: "border-t border-zinc-800",
		padding: "p-3",
		avatar: {
			size: "w-8 h-8",
			borderRadius: "rounded-lg",
		},
		username: {
			color: "text-zinc-100",
			size: "text-sm",
			weight: "font-semibold",
		},
		status: {
			color: "text-zinc-400",
			size: "text-xs",
		},
		buttons: {
			background: "bg-transparent",
			hoverBackground: "hover:bg-zinc-800",
			color: "text-zinc-400",
			hoverColor: "hover:text-zinc-200",
			size: "w-8 h-8",
		},
	},
	callControls: {
		container: {
			background: "bg-zinc-950",
			border: "border border-zinc-800",
			borderRadius: "rounded-lg",
		},
		statusSection: {
			background: "bg-zinc-900/50",
			color: "text-green-400",
			channelNameColor: "text-zinc-100",
		},
		controlsSection: {
			background: "bg-zinc-950",
			border: "border-t border-zinc-800",
		},
		buttons: {
			background: "bg-zinc-800",
			hoverBackground: "hover:bg-zinc-700",
			color: "text-zinc-400",
			hoverColor: "hover:text-zinc-200",
			activeBackground: "bg-green-600",
			activeColor: "text-white",
			mutedBackground: "bg-red-600",
			mutedColor: "text-white",
		},
	},
	scrollbar: {
		track: "scrollbar-track-zinc-900",
		thumb: "scrollbar-thumb-zinc-700",
		thumbHover: "scrollbar-thumb-zinc-600",
	},
};

// Custom theme variations that users can choose from
export const authThemeVariants = {
	default: defaultAuthTheme,
	minimal: {
		...defaultAuthTheme,
		card: {
			...defaultAuthTheme.card,
			background: "bg-transparent",
			border: "border-0",
			shadow: "shadow-none",
		},
	},
	colorful: {
		...defaultAuthTheme,
		card: {
			...defaultAuthTheme.card,
			background:
				"bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950",
		},
		button: {
			...defaultAuthTheme.button,
			primary: {
				...defaultAuthTheme.button.primary,
				background: "bg-blue-600",
				hoverBackground: "hover:bg-blue-700",
			},
		},
	},
} as const;

export const chatThemeVariants = {
	default: defaultChatTheme,
	light: {
		...defaultChatTheme,
		layout: {
			background: "bg-white",
			containerBackground: "bg-white",
		},
		serverSidebar: {
			...defaultChatTheme.serverSidebar,
			background: "bg-zinc-100",
			serverItem: {
				...defaultChatTheme.serverSidebar.serverItem,
				background: "bg-white",
				hoverBackground: "hover:bg-zinc-50",
				selectedRing: "ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-100",
				hoverRing: "ring-2 ring-zinc-300 ring-offset-2 ring-offset-zinc-100",
				border: "border border-zinc-200",
			},
			tooltip: {
				background: "bg-zinc-800",
				color: "text-zinc-100",
				border: "border border-zinc-600",
			},
		},
		channelSidebar: {
			...defaultChatTheme.channelSidebar,
			background: "bg-zinc-50",
			border: "border-r border-zinc-200",
			section: {
				...defaultChatTheme.channelSidebar.section,
				titleColor: "text-zinc-600",
				titleHoverColor: "hover:text-zinc-800",
			},
			channel: {
				...defaultChatTheme.channelSidebar.channel,
				hoverBackground: "hover:bg-zinc-100",
				selectedBackground: "bg-blue-100",
				color: "text-zinc-600",
				hoverColor: "hover:text-zinc-800",
				selectedColor: "text-blue-700",
			},
		},
		chatArea: {
			...defaultChatTheme.chatArea,
			background: "bg-white",
			topBar: {
				...defaultChatTheme.chatArea.topBar,
				background: "bg-zinc-50",
				borderBottom: "border-b border-zinc-200",
				color: "text-zinc-900",
			},
			messageArea: {
				background: "bg-white",
				padding: "p-4",
			},
			message: {
				...defaultChatTheme.chatArea.message,
				hoverBackground: "hover:bg-zinc-50",
				author: {
					...defaultChatTheme.chatArea.message.author,
					color: "text-zinc-900",
				},
				content: {
					...defaultChatTheme.chatArea.message.content,
					color: "text-zinc-700",
				},
				timestamp: {
					...defaultChatTheme.chatArea.message.timestamp,
					color: "text-zinc-500",
				},
			},
			inputArea: {
				...defaultChatTheme.chatArea.inputArea,
				background: "bg-zinc-50",
				border: "border-t border-zinc-200",
				input: {
					...defaultChatTheme.chatArea.inputArea.input,
					background: "bg-white",
					color: "text-zinc-900",
					placeholderColor: "placeholder:text-zinc-500",
				},
			},
		},
		userBar: {
			...defaultChatTheme.userBar,
			background: "bg-zinc-50",
			borderTop: "border-t border-zinc-200",
			username: {
				...defaultChatTheme.userBar.username,
				color: "text-zinc-900",
			},
			status: {
				...defaultChatTheme.userBar.status,
				color: "text-zinc-600",
			},
			buttons: {
				...defaultChatTheme.userBar.buttons,
				hoverBackground: "hover:bg-zinc-200",
				color: "text-zinc-600",
				hoverColor: "hover:text-zinc-800",
			},
		},
		callControls: {
			container: {
				background: "bg-white",
				border: "border border-zinc-200",
				borderRadius: "rounded-lg",
			},
			statusSection: {
				background: "bg-zinc-50",
				color: "text-green-600",
				channelNameColor: "text-zinc-900",
			},
			controlsSection: {
				background: "bg-white",
				border: "border-t border-zinc-200",
			},
			buttons: {
				background: "bg-zinc-100",
				hoverBackground: "hover:bg-zinc-200",
				color: "text-zinc-600",
				hoverColor: "hover:text-zinc-800",
				activeBackground: "bg-green-500",
				activeColor: "text-white",
				mutedBackground: "bg-red-500",
				mutedColor: "text-white",
			},
		},
		scrollbar: {
			track: "scrollbar-track-zinc-100",
			thumb: "scrollbar-thumb-zinc-300",
			thumbHover: "scrollbar-thumb-zinc-400",
		},
	},
	discord: {
		...defaultChatTheme,
		layout: {
			background: "bg-[#36393f]",
			containerBackground: "bg-[#36393f]",
		},
		serverSidebar: {
			...defaultChatTheme.serverSidebar,
			background: "bg-[#202225]",
			serverItem: {
				...defaultChatTheme.serverSidebar.serverItem,
				background: "bg-[#36393f]",
				hoverBackground: "hover:bg-[#5865f2]",
				selectedRing: "ring-2 ring-white ring-offset-2 ring-offset-[#202225]",
				border: "border-0",
			},
		},
		channelSidebar: {
			...defaultChatTheme.channelSidebar,
			background: "bg-[#2f3136]",
			border: "border-r border-[#202225]",
			channel: {
				...defaultChatTheme.channelSidebar.channel,
				hoverBackground: "hover:bg-[#393c43]",
				selectedBackground: "bg-[#393c43]",
			},
		},
		chatArea: {
			...defaultChatTheme.chatArea,
			background: "bg-[#36393f]",
			topBar: {
				...defaultChatTheme.chatArea.topBar,
				background: "bg-[#36393f]",
				borderBottom: "border-b border-[#2f3136]",
			},
			messageArea: {
				background: "bg-[#36393f]",
				padding: "p-4",
			},
			inputArea: {
				...defaultChatTheme.chatArea.inputArea,
				background: "bg-[#36393f]",
				border: "border-t border-[#2f3136]",
				input: {
					...defaultChatTheme.chatArea.inputArea.input,
					background: "bg-[#40444b]",
				},
			},
		},
		userBar: {
			...defaultChatTheme.userBar,
			background: "bg-[#292b2f]",
			borderTop: "border-t border-[#202225]",
		},
		callControls: {
			container: {
				background: "bg-[#2f3136]",
				border: "border border-[#202225]",
				borderRadius: "rounded-lg",
			},
			statusSection: {
				background: "bg-[#36393f]",
				color: "text-green-400",
				channelNameColor: "text-[#dcddde]",
			},
			controlsSection: {
				background: "bg-[#2f3136]",
				border: "border-t border-[#202225]",
			},
			buttons: {
				background: "bg-[#36393f]",
				hoverBackground: "hover:bg-[#40444b]",
				color: "text-[#b9bbbe]",
				hoverColor: "hover:text-[#dcddde]",
				activeBackground: "bg-green-600",
				activeColor: "text-white",
				mutedBackground: "bg-red-600",
				mutedColor: "text-white",
			},
		},
		scrollbar: {
			track: "scrollbar-track-zinc-900",
			thumb: "scrollbar-thumb-zinc-700",
			thumbHover: "scrollbar-thumb-zinc-600",
		},
	},
} as const;

export type AuthThemeVariant = keyof typeof authThemeVariants;
export type ChatThemeVariant = keyof typeof chatThemeVariants;
