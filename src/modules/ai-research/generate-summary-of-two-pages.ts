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

export async function generateSummaryOfTwoPages(page1: PageData, page2: PageData) {
    const formattedInput = `
        Page 1:
        Title: ${page1.title}
        URL: ${page1.url}
        Description: ${page1.description}
        Text: ${page1.text}

        Page 2:
        Title: ${page2.title}
        URL: ${page2.url}
        Description: ${page2.description}
        Text: ${page2.text}
    `;

    const prompt = `
        You are an AI that writes clear summaries.
        Given the following two pages' contents, write a detailed, professional paragraph summarizing both pages together.
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