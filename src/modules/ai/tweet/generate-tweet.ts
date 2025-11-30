import { db } from "../../../connection";
import { ApiError, GoogleGenAI } from "@google/genai";
import { ai_generated_startup_summary, tweets } from "../../../db/schema";
import { aiUtils } from "../../../utils/ai-utils";
import { eq } from "drizzle-orm";
import { promptForGenerateTweet } from "./helper/prompt";
import { logger } from "../../../winston";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const googleGenAI = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
});

const childLogger = logger.child({
    file_path: "tweet/generate-tweet.ts",
});

export async function generateTweet() {
    
    try {
        // Get startup summary from DB
        const startups = await db.query.ai_generated_startup_summary.findFirst({
            where: (summaries, { eq }) => eq(summaries.isUsedForTweets, false)
        });

        if(!startups) {
            childLogger.info("No startup summaries found in DB.");
            return;
        }

        const prompt = promptForGenerateTweet(startups.summary);

        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
            const delay: number = Math.pow(2, attempts) * 1000;
            
            try {
                const res = await googleGenAI.models.generateContent({
                    model: "gemini-2.5-pro",
                    contents: prompt,
                    config: {
                        systemInstruction: "You are an AI that writes tweet under 280 characters.",
                    },
                });

                let tweet = res.text as string;
                
                if (!tweet) {
                    childLogger.info("No tweet generated.");
                    return;
                }

                // Check tweet length
                if (tweet.length > 280) {
                    childLogger.info(`Generated tweet exceeds 280 characters (${tweet.length}). Removing hashtags and regenerating...`);
    
                    // Remove hashtags and retry
                    tweet = tweet.replace(/#\w+/g, '').trim();

                    if (tweet.length <= 280) {
                        childLogger.info(`Tweet is now within limit after removing hashtags (${tweet.length}).`);
                        break;
                    }

                    attempts++;
                    await aiUtils.delay(delay);
                    continue;
                }

                childLogger.info(`Generated Tweet: ${tweet}`);

                // Save tweet to DB
                await db.insert(tweets).values({
                    startupId: startups.startupId,
                    tweet: tweet,
                });

                childLogger.info("Tweet saved to Database");

                // Mark the summaries as used
                await db.update(ai_generated_startup_summary)
                    .set({ isUsedForTweets: true })
                    .where(eq(ai_generated_startup_summary.startupId, startups.startupId));

                childLogger.info("Marked startup summaries as used.");
                return tweet;
            } catch (error) {
                
                if (error instanceof ApiError) {
                    attempts++;

                    

                    if(error.status === 503) {
                        childLogger.warning(
                            `Model overloaded (503). Retrying in ${delay / 1000}s... [Attempt ${attempts}/${maxAttempts}]`
                        );
                        aiUtils.delay(delay);
                    }

                    if(error.status === 429) {
                        childLogger.warning(`Rate limit hit (429). Retrying in ${delay / 1000}s... [Attempt ${attempts}/${maxAttempts}]`);
                        aiUtils.delay(delay);
                    }
                } else {
                    childLogger.error(`Error from generating tweet: ${error}`);
                }
            }
        }

        childLogger.error("Failed after multiple retries (model still overloaded).");
    } catch (error) {
        childLogger.error(`Error fetching startup summaries: ${error}`);
    }
}
