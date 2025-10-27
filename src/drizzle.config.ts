import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
config();

export default defineConfig({
  dialect: "postgresql",
  schema: "./database/drizzle/schema.ts",
  out: "./database/drizzle/migrate",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
