import { config } from "dotenv";
import { drizzle } from 'drizzle-orm/neon-http';

config({ path: "../config/.env" });

export const db = drizzle(process.env.DATABASE_URL!);
