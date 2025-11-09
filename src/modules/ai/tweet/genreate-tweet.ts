import { db } from "../../../connection";
import { ApiError, GoogleGenAI } from "@google/genai";
import { tweets } from "../../../db/schema";
import { aiUtils } from "../../../utils/ai-utils";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const googleGenAI = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
});

export async function generateTweet() {
    
    try {
        // Get startup summary from DB
        const startups = await db.query.ai_generated_startup_summary.findFirst({
            with: {
                isUsed: false
            }
        });

        if(!startups) {
            console.log("No startup summaries found in DB.");
            return;
        }

        const prompt = `
            Given the following summaries of a startup,
            write a professional tweet about the services or products of the startup under 280 characters.
            
            Summaries:
            ${startups.summary.join('\n')}
            `

        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
            try {
                const res = await googleGenAI.models.generateContent({
                    model: "gemini-2.5-pro",
                    contents: prompt,
                    config: {
                        systemInstruction: "You are an AI that writes tweet.",
                    },
                });

                if (!res.text) {
                    console.log("No tweet generated.");
                    return;
                }

                console.log("✅ Generated Tweet:", res.text);

                await db.insert(tweets).values({
                    startupId: startups.startupId,
                    tweet: res.text,
                });

                console.log("Tweet saved to Database");
                return res.text;
            } catch (error: any) {
                
                if (error instanceof ApiError) {
                    
                    const delay: number = Math.pow(2, attempts) * 1000;

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