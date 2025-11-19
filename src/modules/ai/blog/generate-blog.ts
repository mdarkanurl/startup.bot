import "dotenv/config";
import { db } from "../../../connection";
import { ai_generated_startup_summary, blogs } from "../../../db/schema";
import { aiUtils } from "../../../utils";
import { ApiError, GoogleGenAI } from "@google/genai";
import { eq } from "drizzle-orm";
import { promptForGenerateBlog } from "./helper/prompt";
import { checkBlogsFormatAndGenerateTitle } from "./helper/ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const googleGenAI = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
});

export async function generateBlog() {
    try {
        // Get the startup summaries from DB
        const startups = await db.query.ai_generated_startup_summary.findFirst({
            where: (summaries, { eq }) => eq(summaries.isUsedForBlogs, false),
        });

        if (!startups) return console.log("No unused startup summaries found.");

        // Generate blog using AI
        const prompt = promptForGenerateBlog(startups.summary);

        let attempts = 0;
        const maxAttempts = 5;
        while (attempts < maxAttempts) {
            try {
                const res = await googleGenAI.models.generateContent({
                    model: "gemini-2.5-pro",
                    contents: prompt,
                    config: {
                        systemInstruction: "You are an AI that writes blog",
                    },
                }) as any;

                if (!res.text) {
                    console.log("No blog generated.");
                    return;
                }

                console.log("Generated Blog:", res.text);

                // Check blogs for format by AI
                const resLLM = await checkBlogsFormatAndGenerateTitle(res.text);

                if(!resLLM) return console.log("Invalid blog format");

                await db.insert(blogs).values({
                    startupId: startups.startupId,
                    title: resLLM.title,
                    blog: res.text,
                });

                console.log("Blog saved to Database");

                // Mark the summaries as used
                await db.update(ai_generated_startup_summary)
                    .set({ isUsedForBlogs: true })
                    .where(eq(ai_generated_startup_summary.startupId, startups.startupId));

                console.log("Marked startup summaries as used.");
                return res.text;
            } catch (error: any) {
                
                if (error instanceof ApiError) {
                    attempts++;
                    
                    const delay: number = Math.pow(2, attempts) * 1000;

                    if(error.status === 503) {
                        console.log(
                            `Model overloaded (503). Retrying in ${delay / 1000}s... [Attempt ${attempts}/${maxAttempts}]`
                        );
                        
                        await aiUtils.delay(delay);
                    }

                    if(error.status === 429) {
                        console.log(`Rate limit hit (429). Retrying in ${delay / 1000}s... [Attempt ${attempts}/${maxAttempts}]`);
                        await aiUtils.delay(delay);
                    }
                } else {
                    throw error;
                }
            }
        }

        console.error("Failed after multiple retries.");
    } catch (error) {
        console.error("Error generating blog:", error);
    }
}
