import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, waitlist } from "../db";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	joinWaitlist: publicProcedure
		.input(
			z.object({
				email: z.string().email("Please enter a valid email address"),
				honeypot: z.string().optional(), // Honeypot field for bot detection
			}),
		)
		.mutation(async ({ input }) => {
			// Security: Check honeypot field - if filled, it's likely a bot
			if (input.honeypot && input.honeypot.trim() !== "") {
				// Silently reject without giving feedback to bots
				return {
					success: false,
					message: "Invalid submission. Please try again.",
				};
			}

			try {
				// Check if email already exists
				const existingEmail = await db
					.select()
					.from(waitlist)
					.where(eq(waitlist.email, input.email))
					.limit(1);

				if (existingEmail.length > 0) {
					return {
						success: false,
						message: "This email is already on the waitlist.",
					};
				}

				// Insert new email
				await db.insert(waitlist).values({
					email: input.email,
				});

				return { success: true, message: "Successfully joined the waitlist!" };
			} catch (error) {
				console.error("Waitlist join error:", error);

				// Handle database constraint errors
				if (
					error instanceof Error &&
					error.message.includes("unique constraint")
				) {
					return {
						success: false,
						message: "This email is already on the waitlist.",
					};
				}

				// Generic error for other cases
				return {
					success: false,
					message: "Unable to join waitlist. Please try again later.",
				};
			}
		}),
});
export type AppRouter = typeof appRouter;
