import { aiUtils } from "../../../../utils";
import { ApiError, GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { promptForCheckBlogsFormatAndGenerateTitle } from "./prompt";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const googleGenAI = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
});

export async function checkBlogsFormatAndGenerateTitle(blog: string) {
    try {
        const prompt = promptForCheckBlogsFormatAndGenerateTitle(blog);

        let attempts: number = 0;
        let maxAttempts: number = 5;

        while(attempts < maxAttempts) {
            try {
                const resLLM = await googleGenAI.models.generateContent({
                    model: "gemini-2.5-pro",
                    contents: prompt,
                    config: {
                        systemInstruction: "You are an AI that checks blogs format",
                    },
                }) as any;

                console.log("Raw LLM Res: ", resLLM.text);

                const match = resLLM.text.match(/\{[\s\S]*?\}/);

                let resultJson;
                if (match) {
                    const jsonString = match[0];
                    resultJson = JSON.parse(jsonString);
                    console.log("Parsed JSON: ", resultJson);
                } else {
                    console.log("No JSON found.");
                    return null;
                }

                if(!resultJson || !resultJson.valid) {
                    console.log("Invalid blog format");
                    return null;
                }

                return resultJson;
            } catch (error) {
                if(error instanceof ApiError) {
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
        console.log("Error checking blog's format and generate title: ", error);
    }
}