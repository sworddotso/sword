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
			}),
		)
		.mutation(async ({ input }) => {
			try {
				await db.insert(waitlist).values({
					email: input.email,
				});
				return { success: true, message: "Successfully joined the waitlist!" };
			} catch (error) {
				// Handle duplicate email error
				if (
					error instanceof Error &&
					error.message.includes("unique constraint")
				) {
					return {
						success: false,
						message: "This email is already on the waitlist.",
					};
				}
				throw error;
			}
		}),
});
export type AppRouter = typeof appRouter;
