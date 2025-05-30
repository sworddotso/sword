import DOMPurify from "dompurify";

// Configure DOMPurify for message rendering
const renderConfig = {
	// Allow safe HTML tags for markdown rendering
	ALLOWED_TAGS: [
		"p",
		"br",
		"strong",
		"em",
		"u",
		"s",
		"code",
		"pre",
		"blockquote",
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6",
		"ul",
		"ol",
		"li",
		"a",
		"img",
		"table",
		"thead",
		"tbody",
		"tr",
		"th",
		"td",
		"hr",
	],

	// Allow only safe attributes
	ALLOWED_ATTR: ["href", "title", "alt", "src", "class"],

	// Allow only safe URL schemes
	ALLOWED_URI_REGEXP:
		/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,

	// Forbid dangerous tags
	FORBID_TAGS: [
		"script",
		"object",
		"embed",
		"iframe",
		"form",
		"input",
		"textarea",
		"button",
	],

	// Additional security
	FORBID_ATTR: ["style", "on*"], // No inline styles or event handlers
	KEEP_CONTENT: true,
	RETURN_DOM: false,
	RETURN_DOM_FRAGMENT: false,
	SANITIZE_DOM: true,
};

/**
 * Sanitizes HTML content before rendering in the browser
 * This should be used when rendering markdown-converted HTML
 */
export function sanitizeForRender(html: string): string {
	if (!html || typeof html !== "string") {
		return "";
	}

	return DOMPurify.sanitize(html, renderConfig);
}

/**
 * Sanitizes message content for display
 * This is a lighter sanitization for plain text messages
 */
export function sanitizeMessageText(content: string): string {
	if (!content || typeof content !== "string") {
		return "";
	}

	// For plain text, just escape HTML entities
	return DOMPurify.sanitize(content, {
		ALLOWED_TAGS: [],
		ALLOWED_ATTR: [],
		KEEP_CONTENT: true,
	});
}

/**
 * Validates URLs before opening them
 */
export function isSafeUrlForDisplay(url: string): boolean {
	if (!url || typeof url !== "string") {
		return false;
	}

	try {
		const parsedUrl = new URL(url);

		// Allow only safe protocols
		const safeProtocols = ["http:", "https:", "mailto:", "tel:"];
		return safeProtocols.includes(parsedUrl.protocol);
	} catch {
		return false;
	}
}

/**
 * Creates a safe version of a URL for display
 */
export function makeSafeDisplayUrl(url: string): string {
	if (!isSafeUrlForDisplay(url)) {
		return "#"; // Fallback to anchor
	}
	return url;
}
