import { db } from "../../../connection";
import { ApiError, GoogleGenAI } from "@google/genai";
import { ai_generated_startup_summary, tweets } from "../../../db/schema";
import { aiUtils } from "../../../utils/ai-utils";
import { eq } from "drizzle-orm";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const googleGenAI = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
});

export async function generateTweet() {
    
    try {
        // Get startup summary from DB
        const startups = await db.query.ai_generated_startup_summary.findFirst({
            where: (summaries, { eq }) => eq(summaries.isUsedForTweets, false)
        });

        if(!startups) {
            console.log("No startup summaries found in DB.");
            return;
        }

        const prompt = `
            You are a professional writer skilled at writing concise and engaging tweets under 280 characters with the info you get from input.
            Given the following summaries of a startup, write a tweet that highlights its core services or products in a professional, catchy, and authentic tone.
            ⚠️ The entire tweet, including hashtags, must be under 280 characters.

            The tweet should be like this example:
            "YouTube lets anyone share videos with the world, changing how we learn, entertain, and connect. With 2B+ users, it turned content into culture—and became a $300B+ ad powerhouse, thriving by helping creators and advertisers grow. #YouTube #Success #Innovation"

            Use this format to write the tweet:
            "{[name (if available) then what the startup does (tell about products/services) then what the startup gains (if available)] e.g "YXZ startup does ABC and they make PQR amount of revenue annually."} #hashtag1 #hashtag2"
            - Keep the tweet under 280 characters.
            - Don't share misinformation, just share what you get from input.
            - Focus on the startup's main products or services.
            - Use a professional and engaging tone.

            Don't include in the tweet:
            - we, our, I, my, us
            - Call to actions like "Check this out", "Visit now"
            - Links or URLs
            - Excessive hashtags (max 3 relevant hashtags)

            Startup Summaries:
            ${startups.summary.join('\n')}
            `;

        let attempts = 0;
        const maxAttempts = 5;

        const delay: number = Math.pow(2, attempts) * 1000;

        while (attempts < maxAttempts) {
            try {
                const res = await googleGenAI.models.generateContent({
                    model: "gemini-2.5-pro",
                    contents: prompt,
                    config: {
                        systemInstruction: "You are an AI that writes tweet under 280 characters.",
                    },
                }) as any;

                if (!res.text) {
                    console.log("No tweet generated.");
                    return;
                }

                // Check tweet length
                if (res.text.length > 280) {
                    console.log(`Generated tweet exceeds 280 characters (${res.text.length}). Removing hashtags and regenerating...`);
    
                    // Remove hashtags and retry
                    res.text = res.text.replace(/#\w+/g, '').trim();

                    if (res.text.length <= 280) {
                        console.log(`Tweet is now within limit after removing hashtags (${res.text.length}).`);
                        break;
                    }

                    attempts++;
                    await aiUtils.delay(delay);
                    continue;
                }

                console.log("✅ Generated Tweet:", res.text);

                await db.insert(tweets).values({
                    startupId: startups.startupId,
                    tweet: res.text,
                });

                console.log("Tweet saved to Database");

                // Mark the summaries as used
                await db.update(ai_generated_startup_summary)
                    .set({ isUsedForTweets: true })
                    .where(eq(ai_generated_startup_summary.startupId, startups.startupId));

                console.log("Marked startup summaries as used.");
                return res.text;
            } catch (error: any) {
                
                if (error instanceof ApiError) {
                    
                    if(error.status === 503) {
                        attempts++;
                        console.log(
                            `Model overloaded (503). Retrying in ${delay / 1000}s... [Attempt ${attempts}/${maxAttempts}]`
                        );
                        
                        aiUtils.delay(delay);
                    }

                    if(error.status === 429) {
                        console.log(`Rate limit hit (429). Retrying in ${delay / 1000}s... [Attempt ${attempts}/${maxAttempts}]`);
                        aiUtils.delay(delay);
                    }
                } else {
                    throw error;
                }
            }
        }

        console.error("❌ Failed after multiple retries (model still overloaded).");
    } catch (error) {
        console.error("Error fetching startup summaries:", error);
    }
}

generateTweet();