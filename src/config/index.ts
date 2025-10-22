import { config } from "dotenv";
config({ path: "../config/.env" });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const JINA_AI_API_KEY = process.env.JINA_AI_API_KEY;
const API_FREE_LLM = process.env.API_FREE_LLM || "https://apifreellm.com/api/chat";
const NEWS_API = process.env.NEWS_API;
const MONGODB_CONNECT_URL = process.env.MONGODB_CONNECT_URL || "mongodb://127.0.0.1:27017/startup.bot";
const DATABASE_URL = process.env.DATABASE_URL || "";

export {
    GEMINI_API_KEY,
    JINA_AI_API_KEY,
    API_FREE_LLM,
    NEWS_API,
    MONGODB_CONNECT_URL,
    DATABASE_URL
}