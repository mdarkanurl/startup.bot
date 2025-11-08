import { db } from "../../connection";
import { GenerateContentResponse, GoogleGenAI } from '@google/genai';
import 'dotenv/config';
import { generateSummaryOfTwoPages } from "./generate-summary-of-two-pages";

const API_FREE_LLM = process.env.API_FREE_LLM || "https://apifreellm.com/api/chat";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

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

    // process 2 pages at a time safely
    for (let i = 0; i < pages.length; i += 2) {
        const page1 = pages[i];
        const page2 = pages[i + 1];

        console.log(`Summarizing pages ${i + 1} and ${i + 2}...`);
        const res = await generateSummaryOfTwoPages(page1, page2);

        if (res) summaries.push(res);

        // add a delay between requests to avoid hitting rate limits
        console.log("⏳ Waiting 8 seconds before next request...");
        await delay(8000);
    }

    console.log("✅ Summaries generated:", summaries);
    return summaries;
}


console.log("Summary of a website: ", generateAndSaveTweets());