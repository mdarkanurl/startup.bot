import "dotenv/config";
import { db } from "../../../connection";
import { ai_generated_startup_summary, blogs } from "../../../db/schema";
import { aiUtils } from "../../../utils";
import { ApiError, GoogleGenAI } from "@google/genai";
import { eq } from "drizzle-orm";
import "dotenv/config";

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
        const prompt = `
            You are a professional tech writer.
            Using the information provided about a startup, write a clear, engaging, and human-sounding blog following the exact structure and rules below.
            Focus on accuracy, storytelling, and simplicity.

            Blog Structure (Must Follow Exactly)
            
            1. Introduction
            - Briefly introduce the startup
            - Mention the core problem it solves
            - Add an interesting or bold hook

            2. The Problem
            - Describe the market pain point
            - Explain who faces this issue and why it matters

            3. The Solution
            - Describe the product or service
            - Highlight its main features
            - Explain how it solves the problem better than alternatives

            4. Why This Startup Stands Out
            - Unique advantages (technology, execution, timing, team)
            - Traction, stats, or early validation

            5. Business Model
            - Explain how the startup earns revenue
            - Example: SaaS, marketplace fees, subscriptions, freemium, etc.

            6. Challenges & Future Outlook
            - Main obstacles the startup may face
            - Potential opportunities and long-term possibilities

            7. Conclusion
            - Summarize the overall value of the startup
            - End with a strong, forward-looking insight

            Writing Rules (Follow Strictly)

            - Do NOT use first-person pronouns: avoid I, me, we, us, our, my.\
            - No calls to action: avoid “Check this out,” “Visit now,” etc.
            - No URLs or external links
            - Maximum 3 relevant hashtags at the end (optional)
            - Tone must be professional, confident, simple, and authentic
            - Sentences must sound human, not robotic
            - Avoid filler sentences or generic marketing fluff

            Input Format:
            I will give you a startup summary.
            You will turn that summary into a full blog using the structure and rules above.

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
                        systemInstruction: "You are an AI that writes blog",
                    },
                }) as any;

                if (!res.text) {
                    console.log("No blog generated.");
                    return;
                }

                console.log("✅ Generated Blog:", res.text);

                await db.insert(blogs).values({
                    startupId: startups.startupId,
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
                    
                    if(error.status === 503) {
                        attempts++;
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

        console.error("❌ Failed after multiple retries.");
    } catch (error) {
        console.error("Error generating blog:", error);
    }
}

generateBlog();