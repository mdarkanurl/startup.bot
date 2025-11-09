import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const DELAY_MS = 30000; // 30 seconds

const googleGenAI = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
});

type PageData = {
  url: string;
  title: string;
  description: string;
  text: string;
};

const models = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-preview",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash-lite-preview",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateSummaryOfPages(...pages: PageData[]): Promise<string | null | undefined> {
    console.log(`Generating summary for ${pages.length} pages...`);
    pages.forEach((p, idx) => console.log(`${idx + 1}: ${p.title}`));

    const formattedInput = pages
        .map(
            (p, i) => `
        Page ${i + 1}:
        Title: ${p?.title || ""}
        URL: ${p?.url || ""}
        Description: ${p?.description || ""}
        Text: ${p?.text || ""}
        `
        )
        .join("\n\n");

    const prompt = `
        Given the following few pages' contents, write a detailed, professional paragraph summarizing both pages together.
        Include every relevant piece of information, but avoid repetition.
        
        Data:
        ${formattedInput}
    `;

    let modelIndex = 0;
    while (true) {
        const model = models[modelIndex];

        try {
            console.log(`Using model: ${model}`);
            const res = await googleGenAI.models.generateContent({
                model: model,
                contents: prompt,
                config: {
                    systemInstruction: "You are an AI that writes clear summaries.",
                    thinkingConfig: {
                        thinkingBudget: 0, // Disables thinking
                    }
                }
            });

            const text = res?.text || "No text returned.";
            console.log(`Success with ${model}`);
            await delay(DELAY_MS);
            return text;
        } catch (error: any) {
            console.error(`Error with ${model}:`, error?.message);

            // Check if rate limit error
            if (error?.status === 429 || /rate/i.test(error?.message)) {
                console.warn(`Rate limit hit for ${model}, switching to next model...`);
                modelIndex = (modelIndex + 1) % models.length;
                await delay(DELAY_MS);
                continue;
            }

            throw error;
        }
    }
}