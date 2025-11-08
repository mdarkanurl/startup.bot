import { db } from "../../connection";
import { GenerateContentResponse, GoogleGenAI } from '@google/genai';
import 'dotenv/config';
import { generateSummaryOfPages } from "./generate-summary-of-pages";

const API_FREE_LLM = process.env.API_FREE_LLM || "https://apifreellm.com/api/chat";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const CHUNK_SIZE = Number(process.env.CHUNK_SIZE) || 7;

const googleGenAI = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
});

async function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateAndSaveTweets() {
    const pages = await db.query.web_page_data.findMany({
        where: (web_page_data, { eq, and, sql }) =>
        and(
            eq(web_page_data.isUsed, false),
            eq(
            web_page_data.startupId,
            sql`(
                SELECT "startupId" FROM "web_page_data"
                WHERE "isUsed" = false
                LIMIT 1
            )`
            )
        ),
        columns: {
        url: true,
        title: true,
        description: true,
        text: true,
        },
    });

    const summaries: string[] = [];

    // process 7 pages at a time safely
    for (let i = 0; i < pages.length; i += CHUNK_SIZE) {
        const chunk = pages.slice(i, i + CHUNK_SIZE);

        console.log(`Summarizing pages ${i + 1} to ${i + chunk.length}...`);
        const res = await generateSummaryOfPages(...chunk);

        if (res) summaries.push(res);

        // add a delay between requests to avoid hitting rate limits
        console.log("⏳ Waiting 8 seconds before next request...");
        await delay(8000);
    }

    console.log("✅ Summaries generated:", summaries);
    return summaries;
}


generateAndSaveTweets();