import { drizzle } from 'drizzle-orm/postgres-js';
import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL || "";

export const db = drizzle(DATABASE_URL);
