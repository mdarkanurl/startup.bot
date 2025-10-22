import { drizzle } from 'drizzle-orm/neon-http';
import { DATABASE_URL } from "../config";

export const db = drizzle(DATABASE_URL);
