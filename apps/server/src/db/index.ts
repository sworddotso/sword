import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(process.env.DATABASE_URL || "");

// Export schemas
export * from "./schema/auth";
export * from "./schema/waitlist";
