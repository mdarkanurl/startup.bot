import axios from "axios";
import { Startups } from "../../interfaces/startups-types";
import { config } from "dotenv";
config();

const API_FREE_LLM = process.env.API_FREE_LLM || "https://apifreellm.com/api/chat";

const writeAboutStartups = async (data: Startups[]) => {
  try {
    // Create a summary for the LLM
    const formattedInput = data
      .map(
        (startup, index) => `
            ${index + 1}. 
            Name: ${startup.title}
            Description: ${startup.description}
            Text: ${startup.text.slice(0, 5000)}...  // limit text size `)
      .join("\n\n");

    // Prompt for the LLM
    const prompt = `
        You are an AI that writes clear startup summaries.

        Given the following startup data, write a detail, professional paragraph for the startup.
        Each paragraph should describe:
        - What the startup does
        - Its main services
        - Its target users or market
        - Any unique features or offerings

        Here’s the data:
        ${formattedInput}
    `;

    // Call the LLM API
    const res = await axios.post(API_FREE_LLM, {
      message: prompt,
    });

    // Extract LLM output
    const summary = await res.data?.message || res.data;

    return summary;
  } catch (error: any) {
    console.error("Error generating startup summaries:", error);
    return null;
  }
};