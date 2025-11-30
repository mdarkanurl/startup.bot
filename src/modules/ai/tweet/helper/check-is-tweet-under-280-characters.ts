import { ApiError, GoogleGenAI } from "@google/genai";
import { logger } from "../../../../winston";
import { aiUtils } from "../../../../utils";

const childLogger = logger.child({
    file_path: "tweet/helper/check-is-tweet-under-280-characters.ts",
});


export async function checkIsTweetUnder280Characters(
    googleGenAI: GoogleGenAI,
    tweet: string
) {
    try {
        if (tweet.length > 280) {
            childLogger.info(`Generated tweet exceeds 280 characters (${tweet.length}). Removing hashtags and regenerating...`);

            // Remove hashtags and retry
            tweet = tweet.replace(/#\w+/g, '').trim();

            if (tweet.length <= 280) {
                childLogger.info(`Tweet is now within limit after removing hashtags (${tweet.length}).`);
                return tweet;
            }

            childLogger.info(`Asking LLM to rewrite tweet without hashtags cuz tweet too long after removing hashtags...`);

            let attempts = 0;
            const maxAttempts = 5;

            while (attempts < maxAttempts) {
                const delay: number = Math.pow(2, attempts) * 1000;

                const editPrompt = `
                    Rewrite the following tweet to be at most 280 characters and remove all hashtags.
                    Original tweet:
                    ${tweet}`;

                await aiUtils.delay(delay);
                try {
                    const editRes = await googleGenAI.models.generateContent({
                        model: "gemini-2.5-pro",
                        contents: editPrompt,
                        config: {
                        systemInstruction: "You are an AI that rewrites tweets to fit character limits.",
                        },
                    });

                    tweet = editRes.text as string;

                    if (tweet.length <= 280) {
                        childLogger.info(`Tweet is now within limit after regenerate (${tweet.length}).`);
                        return tweet;
                    }

                    attempts++;
                    await aiUtils.delay(delay);
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
                        childLogger.error(`Error from regenerating tweet: ${error}`);
                    }
                }
            }
            childLogger.error("Failed after multiple retries (model still overloaded).");
        } else {
            return tweet;
        }
    } catch (error) {
        childLogger.error(`Error for checking generated tweet size: ${error}`);
    }
}