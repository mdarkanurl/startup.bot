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

export async function generateSummaryOfPages(
    page1: PageData,
    page2: PageData,
    page3: PageData,
    page4: PageData,
    page5: PageData,
    page6: PageData,
    page7: PageData,
) {
    console.log("Generating summary for pages:");
    console.log(`1: ${page1.title}`);
    console.log(`2: ${page2.title}`);
    console.log(`3: ${page3.title}`);
    console.log(`4: ${page4.title}`);
    console.log(`5: ${page5.title}`);
    console.log(`6: ${page6.title}`);
    console.log(`7: ${page7.title}`);
    const formattedInput = `
        Page 1:
        Title: ${page1?.title || ""}
        URL: ${page1?.url || ""}
        Description: ${page1?.description || ""}
        Text: ${page1?.text || ""}

        Page 2:
        Title: ${page2?.title || ""}
        URL: ${page2?.url || ""}
        Description: ${page2?.description || ""}
        Text: ${page2?.text || ""}

        Page 3:
        Title: ${page3?.title || ""}
        URL: ${page3?.url || ""}
        Description: ${page3?.description || ""}
        Text: ${page3?.text || ""}

        Page 4:
        Title: ${page4?.title || ""}
        URL: ${page4?.url || ""}
        Description: ${page4?.description || ""}
        Text: ${page4?.text || ""}

        Page 5:
        Title: ${page5?.title || ""}
        URL: ${page5?.url || ""}
        Description: ${page5?.description || ""}
        Text: ${page5?.text || ""}

        Page 6:
        Title: ${page6?.title || ""}
        URL: ${page6?.url || ""}
        Description: ${page6?.description || ""}
        Text: ${page6?.text || ""}

        Page 7:
        Title: ${page7?.title || ""}
        URL: ${page7?.url || ""}
        Description: ${page7?.description || ""}
        Text: ${page7?.text || ""}
    `;

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