import "dotenv/config";
import { db } from "../../../connection";
import { ai_generated_startup_summary, blogs } from "../../../db/schema";
import { aiUtils } from "../../../utils";
import { ApiError, GoogleGenAI } from "@google/genai";
import { eq } from "drizzle-orm";
import { promptForGenerateBlog } from "./helper/prompt";
import { checkBlogsFormatAndGenerateTitle } from "./helper/ai";
import { logger } from "../../../winston";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const googleGenAI = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
});

const childLogger = logger.child({
    file_path: "blog/generate-blog.ts",
});

export async function generateBlog() {
    try {
        // Get the startup summaries from DB
        const startups = await db.query.ai_generated_startup_summary.findFirst({
            where: (summaries, { eq }) => eq(summaries.isUsedForBlogs, false),
        });

        if (!startups) return childLogger.info("No unused startup summaries found.");
        if(startups.summary.length <= 3) return childLogger.info("Not enough summaries to generate blog");

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
                    childLogger.info("No blog generated.");
                    return;
                }

                childLogger.info("Generated Blog:", res.text);

                // Check blog's format by AI
                const resLLM = await checkBlogsFormatAndGenerateTitle(res.text);

                if(!resLLM) return childLogger.info("Invalid blog format");

                await db.insert(blogs).values({
                    startupId: startups.startupId,
                    title: resLLM.title,
                    blog: res.text,
                });

                childLogger.info("Blog saved to Database");

                // Mark the summaries as used
                await db.update(ai_generated_startup_summary)
                    .set({ isUsedForBlogs: true })
                    .where(eq(ai_generated_startup_summary.startupId, startups.startupId));

                childLogger.info("Marked startup summaries as used.");
                return res.text;
            } catch (error) {
                
                if (error instanceof ApiError) {
                    attempts++;
                    
                    const delay: number = Math.pow(2, attempts) * 1000;

                    if(error.status === 503) {
                        childLogger.warning(
                            `Model overloaded (503). Retrying in ${delay / 1000}s... [Attempt ${attempts}/${maxAttempts}]`
                        );
                        
                        await aiUtils.delay(delay);
                    }

                    if(error.status === 429) {
                        childLogger.warning(`Rate limit hit (429). Retrying in ${delay / 1000}s... [Attempt ${attempts}/${maxAttempts}]`);
                        await aiUtils.delay(delay);
                    }
                } else {
                    childLogger.error(`Error from generating blog: ${error}`);
                }
            }
        }

        childLogger.error("Failed after multiple retries.");
    } catch (error) {
        childLogger.error(`Error generating blog: ${error}`);
    }
}
