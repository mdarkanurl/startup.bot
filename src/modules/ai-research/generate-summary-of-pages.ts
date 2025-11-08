import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const googleGenAI = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
});

type PageData = {
  url: string;
  title: string;
  description: string;
  text: string;
};

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
        You are an AI that writes clear summaries.
        Given the following few pages' contents, write a detailed, professional paragraph summarizing both pages together.
        Include every relevant piece of information, but avoid repetition.
        
        Data:
        ${formattedInput}
    `;

    try {
        const res = await googleGenAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return res.text;
    } catch (err) {
        console.error("Error generating summary:", err);
        return null;
    }
}