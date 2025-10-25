import { drizzle } from 'drizzle-orm/neon-http';
import { config } from "dotenv";
config();

const DATABASE_URL = process.env.DATABASE_URL;

export const db = drizzle(DATABASE_URL);
