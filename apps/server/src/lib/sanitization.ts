import sanitizeHtml from "sanitize-html";

// Configure sanitize-html for message sanitization
const sanitizeConfig: sanitizeHtml.IOptions = {
	// Allow only safe HTML tags commonly used in markdown
	allowedTags: [
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
	allowedAttributes: {
		a: ["href", "title"],
		img: ["src", "alt", "title"],
		"*": ["class"], // Allow class on all elements
	},

	// Configure URL schemes
	allowedSchemes: ["http", "https", "mailto", "tel"],

	// Additional security options
	allowedSchemesByTag: {
		a: ["http", "https", "mailto", "tel"],
		img: ["http", "https"],
	},

	// Disallow attributes that could be dangerous
	disallowedTagsMode: "discard",
	allowedClasses: {}, // No specific classes allowed by default

	// Transform URLs to ensure they're safe
	transformTags: {
		a: (tagName, attribs) => {
			return {
				tagName: "a",
				attribs: {
					...attribs,
					// Add rel="noopener noreferrer" for security
					rel: "noopener noreferrer",
					// Add target="_blank" for external links
					target: "_blank",
				},
			};
		},
	},
};

/**
 * Sanitizes message content to prevent XSS and other security issues
 * This should be called on the server before storing messages and
 * before encrypting for E2EE
 */
export function sanitizeMessageContent(content: string): string {
	if (!content || typeof content !== "string") {
		return "";
	}

	// Basic length check to prevent abuse
	if (content.length > 10000) {
		throw new Error("Message content too long");
	}

	// Sanitize the content
	const sanitized = sanitizeHtml(content, sanitizeConfig);

	return sanitized;
}

/**
 * Validates that a URL is safe for use in messages
 */
export function isSafeUrl(url: string): boolean {
	if (!url || typeof url !== "string") {
		return false;
	}

	try {
		const parsedUrl = new URL(url);

		// Allow only specific safe protocols
		const safeProtocols = ["http:", "https:", "mailto:", "tel:"];
		if (!safeProtocols.includes(parsedUrl.protocol)) {
			return false;
		}

		// Block suspicious domains (this can be expanded as needed)
		const suspiciousDomains = ["localhost", "127.0.0.1", "0.0.0.0", "::1"];

		if (
			suspiciousDomains.some((domain) => parsedUrl.hostname.includes(domain))
		) {
			return false;
		}

		return true;
	} catch {
		return false;
	}
}

/**
 * Sanitizes markdown content by converting it to HTML and then sanitizing
 * This is meant to be used after markdown processing but before rendering
 */
export function sanitizeMarkdownHtml(html: string): string {
	if (!html || typeof html !== "string") {
		return "";
	}

	// Use stricter config for already-processed markdown HTML
	const markdownConfig: sanitizeHtml.IOptions = {
		...sanitizeConfig,
		// Be more restrictive on attributes for processed markdown
		allowedAttributes: {
			a: ["href", "title"],
			img: ["src", "alt", "title"],
		},
	};

	return sanitizeHtml(html, markdownConfig);
}

/**
 * Quick check if content contains potentially dangerous patterns
 * This can be used for additional validation before processing
 */
export function containsSuspiciousContent(content: string): boolean {
	if (!content || typeof content !== "string") {
		return false;
	}

	// Check for suspicious patterns
	const suspiciousPatterns = [
		/<script/i,
		/javascript:/i,
		/data:.*base64/i,
		/vbscript:/i,
		/on\w+\s*=/i, // Event handlers like onclick=, onload=, etc.
		/<iframe/i,
		/<object/i,
		/<embed/i,
		/<form/i,
	];

	return suspiciousPatterns.some((pattern) => pattern.test(content));
}
