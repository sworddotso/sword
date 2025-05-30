import { cn } from "@/lib/utils";
import {
	ClockIcon,
	FaceSmileIcon as FaceSmileIconOutline,
	HandRaisedIcon,
	MagnifyingGlassIcon,
	SparklesIcon, // Using Sparkles for Food as a generic 'items' icon for now
	UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { useChatTheme } from "./chat-theme-provider";

// Define the structure for individual emoji data
interface EmojiItem {
	emoji: string;
	name: string;
	keywords: string[];
}

// Update categories to potentially hold EmojiItem objects or strings
// For now, only a few smileys will be EmojiItem for demonstration
const emojiCategories: Record<string, (EmojiItem | string)[]> = {
	Smileys: [
		{
			emoji: "😀",
			name: "grinning face",
			keywords: ["face", "smile", "happy"],
		},
		{
			emoji: "😃",
			name: "grinning face with big eyes",
			keywords: ["face", "happy", "joy"],
		},
		{
			emoji: "😄",
			name: "grinning face with smiling eyes",
			keywords: ["face", "happy", "laugh", "pleased"],
		},
		{
			emoji: "😁",
			name: "beaming face with smiling eyes",
			keywords: ["face", "happy", "smile"],
		},
		{
			emoji: "😆",
			name: "grinning squinting face",
			keywords: ["happy", "haha"],
		},
		"😅",
		"😂",
		"🤣",
		"😊",
		"😇",
		"🙂",
		"🙃",
		"😉",
		"😌",
		"😍",
		"🥰",
		"😘",
		"😗",
		"😙",
		"😚",
		"😋",
		"😛",
		"😝",
		"😜",
		"🤪",
		"🤨",
		"🧐",
		"🤓",
		"😎",
		"🤩",
		"🥳",
		"😏",
		"😒",
		"😞",
		"😔",
		"😟",
		"😕",
		"🙁",
		"☹️",
		"😣",
		"😖",
		"😫",
		"😩",
		"🥺",
		"😢",
		"😭",
		"😤",
		"😠",
		"😡",
		"🤬",
		"🤯",
		"😳",
		"🥵",
		"🥶",
		"😱",
		"😨",
		"😰",
		"😥",
		"😓",
		"🤗",
		"🤔",
		"🤭",
		"🤫",
		"🤥",
		"😶",
		"😐",
		"😑",
		"😬",
		"🙄",
		"😯",
		"😦",
		"😧",
		"😮",
		"😲",
		"🥱",
		"😴",
		"🤤",
		"😪",
		"😵",
		"🤐",
		"🥴",
		"🤢",
		"🤮",
		"🤧",
		"😷",
		"🤒",
		"🤕",
		"🤑",
		"🤠",
		"😈",
		"👿",
		"👹",
		"👺",
		"🤡",
		"💩",
		"👻",
		"💀",
		"☠️",
		"👽",
		"👾",
		"🤖",
		"🎃",
		"😺",
		"😸",
		"😹",
		"😻",
		"😼",
		"😽",
		"🙀",
		"😿",
		"😾",
	],
	Gestures: [
		"👋",
		"🤚",
		"🖐️",
		"✋",
		"🖖",
		"👌",
		"🤌",
		"🤏",
		"✌️",
		"🤞",
		"🤟",
		"🤘",
		"🤙",
		"👈",
		"👉",
		"👆",
		"🖕",
		"👇",
		"☝️",
		"👍",
		"👎",
		"✊",
		"👊",
		"🤛",
		"🤜",
		"👏",
		"🙌",
		"🤲",
		"🤝",
		"🙏",
		"✍️",
		"💅",
		"🤳",
		"💪",
		"🦾",
		"🦵",
		"🦿",
		"🦶",
		"👂",
		"🦻",
		"👃",
		"🧠",
		"🦷",
		"🦴",
		"👀",
		"👁️",
		"👅",
		"👄",
		"💋",
		"🩸",
	],
	People: [
		"👶",
		"👧",
		"🧒",
		"👦",
		"👩",
		"🧑",
		"👨",
		"👩‍🦱",
		"🧑‍🦱",
		"👨‍🦱",
		"👩‍🦰",
		"🧑‍🦰",
		"👨‍🦰",
		"👱‍♀️",
		"👱",
		"👱‍♂️",
		"👩‍🦳",
		"🧑‍🦳",
		"👨‍🦳",
		"👩‍🦲",
		"🧑‍🦲",
		"👨‍🦲",
		"🧔‍♀️",
		"🧔",
		"🧔‍♂️",
		"👵",
		"🧓",
		"👴",
		"👲",
		"👳‍♀️",
		"👳",
		"👳‍♂️",
		"🧕",
		"👮‍♀️",
		"👮",
		"👮‍♂️",
		"👷‍♀️",
		"👷",
		"👷‍♂️",
		"💂‍♀️",
		"💂",
		"💂‍♂️",
		"🕵️‍♀️",
		"🕵️",
		"🕵️‍♂️",
		"👩‍⚕️",
		"🧑‍⚕️",
		"👨‍⚕️",
		"👩‍🌾",
		"🧑‍🌾",
		"👨‍🌾",
		"👩‍🍳",
		"🧑‍🍳",
		"👨‍🍳",
		"👩‍🎓",
		"🧑‍🎓",
		"👨‍🎓",
		"👩‍🎤",
		"🧑‍🎤",
		"👨‍🎤",
		"👩‍🏫",
		"🧑‍🏫",
		"👨‍🏫",
		"👩‍🏭",
		"🧑‍🏭",
		"👨‍🏭",
		"👩‍💻",
		"🧑‍💻",
		"👨‍💻",
		"👩‍💼",
		"🧑‍💼",
		"👨‍💼",
		"👩‍🔧",
		"🧑‍🔧",
		"👨‍🔧",
		"👩‍🔬",
		"🧑‍🔬",
		"👨‍🔬",
		"👩‍🎨",
		"🧑‍🎨",
		"👨‍🎨",
		"👩‍🚒",
		"🧑‍🚒",
		"👨‍🚒",
		"👩‍✈️",
		"🧑‍✈️",
		"👨‍✈️",
		"👩‍🚀",
		"🧑‍🚀",
		"👨‍🚀",
		"👩‍⚖️",
		"🧑‍⚖️",
		"👨‍⚖️",
		"👰‍♀️",
		"👰",
		"👰‍♂️",
		"🤵‍♀️",
		"🤵",
		"🤵‍♂️",
		"👸",
		"🤴",
		"SUPERHERO",
		"🦸‍♀️",
		"🦸",
		"🦸‍♂️",
		"🦹‍♀️",
		"🦹",
		"🦹‍♂️",
		"🤶",
		"🧑‍🎄",
		"🎅",
		"🧙‍♀️",
		"🧙",
		"🧙‍♂️",
		"🧝‍♀️",
		"🧝",
		"🧝‍♂️",
		"🧛‍♀️",
		"🧛",
		"🧛‍♂️",
		"🧟‍♀️",
		"🧟",
		"🧟‍♂️",
		"🧞‍♀️",
		"🧞",
		"🧞‍♂️",
		"🧜‍♀️",
		"🧜",
		"🧜‍♂️",
		"🧚‍♀️",
		"🧚",
		"🧚‍♂️",
		"👼",
		"🤰",
		"🤱",
		"👩‍🍼",
		"🧑‍🍼",
		"👨‍🍼",
		"🙇‍♀️",
		"🙇",
		"🙇‍♂️",
		"💁‍♀️",
		"💁",
		"💁‍♂️",
		"🙅‍♀️",
		"🙅",
		"🙅‍♂️",
		"🙆‍♀️",
		"🙆",
		"🙆‍♂️",
		"🙋‍♀️",
		"🙋",
		"🙋‍♂️",
		"🧏‍♀️",
		"🧏",
		"🧏‍♂️",
		"🤦‍♀️",
		"🤦",
		"🤦‍♂️",
		"🤷‍♀️",
		"🤷",
		"🤷‍♂️",
		"🙎‍♀️",
		"🙎",
		"🙎‍♂️",
		"🙍‍♀️",
		"🙍",
		"🙍‍♂️",
		"💇‍♀️",
		"💇",
		"💇‍♂️",
		"💆‍♀️",
		"💆",
		"💆‍♂️",
		"🧖‍♀️",
		"🧖",
		"🧖‍♂️",
		"💅",
		"🤳",
		"💃",
		"🕺",
		"👯‍♀️",
		"👯",
		"👯‍♂️",
		"🕴️",
		"👩‍🦽",
		"🧑‍🦽",
		"👨‍🦽",
		"👩‍🦼",
		"🧑‍🦼",
		"👨‍🦼",
		"🚶‍♀️",
		"🚶",
		"🚶‍♂️",
		"👩‍🦯",
		"🧑‍🦯",
		"👨‍🦯",
		"🧎‍♀️",
		"🧎",
		"🧎‍♂️",
		"🏃‍♀️",
		"🏃",
		"🏃‍♂️",
		"🧍‍♀️",
		"🧍",
		"🧍‍♂️",
		"🧑‍🤝‍🧑",
		"👭",
		"👫",
		"👬",
		"💏",
		"👩‍❤️‍💋‍👨",
		"👨‍❤️‍💋‍👨",
		"👩‍❤️‍💋‍👩",
		"💑",
		"👩‍❤️‍👨",
		"👨‍❤️‍👨",
		"👩‍❤️‍👩",
	],
	Food: [
		"🍏",
		"🍎",
		"🍐",
		"🍊",
		"🍋",
		"🍌",
		"🍉",
		"🍇",
		"🍓",
		"🍈",
		"🍒",
		"🍑",
		"🥭",
		"🍍",
		"🥥",
		"🥝",
		"🍅",
		"🍆",
		"🥑",
		"🥦",
		"🥬",
		"🥒",
		"🌶️",
		"🌽",
		"🥕",
		"🧄",
		"🧅",
		"🥔",
		"🍠",
		"🥐",
		"🥯",
		"🍞",
		"🥖",
		"🥨",
		"🧀",
		"🥚",
		"🍳",
		"🧈",
		"🥞",
		"🧇",
		"🥓",
		"🥩",
		"🍗",
		"🍖",
		"🦴",
		"🌭",
		"🍔",
		"🍟",
		"🍕",
		"🫓",
		"🥪",
		"🥙",
		"🧆",
		"🌮",
		"🌯",
		"🥗",
		"🥘",
		"🥫",
		"🍝",
		"🍜",
		"🍲",
		"🍛",
		"🍣",
		"🍱",
		"🥟",
		"🍤",
		"🍙",
		"🍚",
		"🍘",
		"🍥",
		"🥠",
		"🥮",
		"🍢",
		"🍡",
		"🍧",
		"🍨",
		"🍦",
		"🥧",
		"🧁",
		"🍰",
		"🎂",
		"🍮",
		"🍭",
		"🍬",
		"🍫",
		"🍿",
		"🍩",
		"🍪",
		"🌰",
		"🥜",
		"🍯",
		"🥛",
		"🍼",
		"☕",
		"🍵",
		"🧃",
		"🥤",
		"🍶",
		"🍺",
		"🍻",
		"🥂",
		"🍷",
		"🥃",
		"🍸",
		"🍹",
		"🧉",
		"🍾",
		"🧊",
		"🥄",
		"🍴",
		"🍽️",
		"🥣",
		"🥡",
		"🧂",
	],
};

const categoryIcons: Record<string, React.ElementType> = {
	Recent: ClockIcon,
	Smileys: FaceSmileIconOutline,
	Gestures: HandRaisedIcon,
	People: UserGroupIcon,
	Food: SparklesIcon,
	// Add more as categories are expanded
};

const RECENT_EMOJIS_KEY = "customRecentEmojis";
const MAX_RECENT_EMOJIS = 24; // Number of columns * 3 rows for example

interface CustomEmojiPickerProps {
	onSelectEmoji: (emoji: string) => void;
	onClose: () => void;
	position?: "top" | "bottom";
	// Optional: to control if picker closes on select (for reactions vs input)
	closeOnSelect?: boolean;
}

export function CustomEmojiPicker({
	onSelectEmoji,
	onClose,
	position = "top",
	closeOnSelect = false, // Default to not closing (for message input)
}: CustomEmojiPickerProps) {
	const pickerRef = useRef<HTMLDivElement>(null);
	const { variant } = useChatTheme();
	const [searchTerm, setSearchTerm] = useState("");

	const [recentEmojis, setRecentEmojis] = useState<string[]>(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem(RECENT_EMOJIS_KEY);
			return saved ? JSON.parse(saved) : [];
		}
		return [];
	});

	const allCategoryKeys = ["Recent", ...Object.keys(emojiCategories)];
	const [activeCategory, setActiveCategory] = useState(allCategoryKeys[0]);

	useEffect(() => {
		if (typeof window !== "undefined") {
			localStorage.setItem(RECENT_EMOJIS_KEY, JSON.stringify(recentEmojis));
		}
	}, [recentEmojis]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				pickerRef.current &&
				!pickerRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEscape);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [onClose]);

	const handleEmojiClick = (emojiChar: string) => {
		onSelectEmoji(emojiChar);

		// Add to recent emojis
		setRecentEmojis((prev) => {
			const updatedRecents = [
				emojiChar,
				...prev.filter((e) => e !== emojiChar),
			];
			return updatedRecents.slice(0, MAX_RECENT_EMOJIS);
		});

		if (closeOnSelect) {
			onClose();
		}
	};

	const getEmojiChar = (item: EmojiItem | string): string => {
		return typeof item === "string" ? item : item.emoji;
	};

	const getEmojiName = (item: EmojiItem | string): string => {
		return typeof item === "string" ? item : item.name;
	};

	const themeClasses =
		variant === "light"
			? {
					bg: "bg-white",
					border: "border-zinc-200",
					text: "text-zinc-700",
					hoverBg: "hover:bg-zinc-100",
					activeBg: "bg-zinc-100",
					buttonBg: "bg-zinc-50 hover:bg-zinc-200",
					buttonText: "text-zinc-600",
					scrollbarThumb: "scrollbar-thumb-zinc-300",
					scrollbarTrack: "scrollbar-track-zinc-100",
					inputBg: "bg-zinc-100",
					inputText: "text-zinc-800",
					placeholderText: "placeholder-zinc-400",
					iconColor: "text-zinc-400",
				}
			: {
					bg: "bg-zinc-800",
					border: "border-zinc-700",
					text: "text-zinc-200",
					hoverBg: "hover:bg-zinc-700",
					activeBg: "bg-zinc-700",
					buttonBg: "bg-zinc-700 hover:bg-zinc-600",
					buttonText: "text-zinc-300",
					scrollbarThumb: "scrollbar-thumb-zinc-600",
					scrollbarTrack: "scrollbar-track-zinc-700",
					inputBg: "bg-zinc-700",
					inputText: "text-zinc-100",
					placeholderText: "placeholder-zinc-500",
					iconColor: "text-zinc-500",
				};

	let emojisToDisplay: (EmojiItem | string)[] = [];
	const searchEnabled = activeCategory !== "Recent" && searchTerm.length > 0;

	if (activeCategory === "Recent" && !searchTerm) {
		emojisToDisplay = recentEmojis;
	} else {
		const categoryToSearch = emojiCategories[activeCategory] || [];
		emojisToDisplay = searchEnabled
			? categoryToSearch.filter((item) => {
					const emojiChar = getEmojiChar(item);
					const name = getEmojiName(item);
					const keywords = typeof item === "object" ? item.keywords : [];
					const term = searchTerm.toLowerCase();
					return (
						emojiChar.includes(term) ||
						name.toLowerCase().includes(term) ||
						keywords.some((k) => k.toLowerCase().includes(term))
					);
				})
			: activeCategory !== "Recent"
				? categoryToSearch
				: [];
	}

	return (
		<div
			ref={pickerRef}
			className={cn(
				"absolute z-[60] flex h-96 w-80 flex-col rounded-lg shadow-xl",
				themeClasses.bg,
				themeClasses.border,
				position === "top"
					? "right-0 bottom-full mb-2"
					: "top-full right-0 mt-2",
			)}
			data-theme={variant}
		>
			{/* Category Tabs - Horizontally scrollable */}
			<div
				className={cn(
					"flex flex-shrink-0 flex-nowrap overflow-x-auto border-b p-1",
					themeClasses.border,
					"emoji-picker-scrollbar pr-2",
				)}
			>
				{allCategoryKeys.map((category) => {
					const Icon = categoryIcons[category];
					return (
						<button
							key={category}
							type="button"
							onClick={() => {
								setActiveCategory(category);
								setSearchTerm("");
							}}
							className={cn(
								"mr-1 flex flex-shrink-0 items-center space-x-1.5 rounded-md px-3 py-1.5 font-medium text-xs last:mr-0", // Added flex-shrink-0 to prevent button squishing
								themeClasses.buttonText,
								activeCategory === category
									? themeClasses.activeBg
									: themeClasses.buttonBg,
							)}
							title={category} // Tooltip for the category name
						>
							{Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
							<span>{category}</span>
						</button>
					);
				})}
			</div>

			{activeCategory !== "Recent" && (
				<div className={cn("flex-shrink-0 border-b p-2", themeClasses.border)}>
					<div className="relative">
						<input
							type="text"
							placeholder="Search emojis..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className={cn(
								"w-full rounded-md border py-1.5 pr-2 pl-8 text-sm",
								themeClasses.inputBg,
								themeClasses.border,
								themeClasses.inputText,
								themeClasses.placeholderText,
								"outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
							)}
						/>
						<MagnifyingGlassIcon
							className={cn(
								"-translate-y-1/2 absolute top-1/2 left-2 h-4 w-4",
								themeClasses.iconColor,
							)}
						/>
					</div>
				</div>
			)}

			<div
				className={cn(
					"emoji-picker-scrollbar grid flex-1 grid-cols-8 gap-1 overflow-y-auto p-2",
				)}
			>
				{emojisToDisplay.length === 0 && (
					<div
						className={cn(
							"col-span-8 py-4 text-center text-xs",
							themeClasses.text,
						)}
					>
						{searchEnabled
							? `No emojis found for "${searchTerm}"`
							: activeCategory === "Recent"
								? "No recent emojis."
								: "No emojis in this category."}
					</div>
				)}
				{emojisToDisplay.map((item, index) => {
					const emojiChar = getEmojiChar(item);
					const emojiName = getEmojiName(item);
					return (
						<button
							key={`${activeCategory}-${emojiChar}-${index}`}
							type="button"
							onClick={() => handleEmojiClick(emojiChar)}
							className={cn(
								"flex aspect-square items-center justify-center rounded-md text-xl",
								themeClasses.hoverBg,
								themeClasses.text,
							)}
							title={emojiName}
						>
							{emojiChar}
						</button>
					);
				})}
			</div>
		</div>
	);
}
