import axios from "axios";
import "dotenv/config";
import { db } from "../../../connection";
import { ApiError, GoogleGenAI } from "@google/genai";
import { aiUtils } from "../../../utils";
import { blogs } from "../../../db/schema";
import { eq } from "drizzle-orm";

const apiKey = process.env.DEVTO_API_KEY || "";
const baseUrl = process.env.DEVTO_BASE_URL || "https://dev.to/api";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const googleGenAI = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
});

async function postBlog() {
  try {
    /** 1. Fetch a blog that isn't used yet */
    const blog = await db.query.blogs.findFirst({
      where: (blogs, { eq }) => eq(blogs.isUsed, false)
    });

    if (!blog) {
      console.log("No unused blog found.");
      return;
    }

    /** 2. Build the format-checking prompt */
    const formatCheckPrompt = `
      You are a strict blog format validator.

      Required Sections:
      1. Introduction
      2. The Problem
      3. The Solution
      4. Why This Startup Stands Out
      5. Business Model
      6. Challenges & Future Outlook
      7. Conclusion

      Output ONLY JSON:
      {
        "valid": true/false,
        "missing_sections": [],
        "rule_violations": [],
        "details": "short explanation"
      }

      Blog:
      ${blog.blog}
    `;

    /** Retry Settings */
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        /** 3. Call Gemini */
        const llmRes = await googleGenAI.models.generateContent({
          model: "gemini-2.5-pro",
          contents: [
            {
              role: "user",
              parts: [{ text: formatCheckPrompt }]
            }
          ],
          config: {
            systemInstruction: "You validate blog structure only."
          }
        }) as any;

        const rawOutput = llmRes.text || "";

        console.log("Raw LLM output:", rawOutput);

        /** 4. Extract JSON safely */
        const match = rawOutput.match(/```json([\s\S]*?)```/);

        if (!match) {
          console.log("❌ No JSON found in LLM output. Trying again…");
          attempts++;
          await aiUtils.delay(1000);
          continue;
        }

        let formatResult;
        try {
          formatResult = JSON.parse(match[1].trim());
        } catch {
          console.log("❌ JSON parse error. Trying again…");
          attempts++;
          await aiUtils.delay(1000);
          continue;
        }

        console.log("Format check result:", formatResult);

        /** 5. Stop if blog is invalid */
        if (!formatResult.valid) {
          console.log("❌ Blog format invalid:", formatResult.details);
          return;
        }

        /** 6. Publish to Dev.to */
        const articlePayload = {
          article: {
            title: "Untitled Blog",
            body_markdown: blog.blog,
            tags: ["AI", "startup", "tech"],
            published: false
          }
        };

        const postRes = await axios.post(
          `${baseUrl}/articles`,
          articlePayload,
          {
            headers: {
              "api-key": apiKey,
              "Content-Type": "application/json",
            }
          }
        );

        console.log("✅ Article posted:", postRes.data.url);

        /** 7. Mark the blog as used */
        await db.update(blogs)
          .set({ isUsed: true })
          .where(eq(blogs.id, blog.id));

        console.log("✔ Blog marked as used.");

        return postRes.data;

      } catch (error: any) {
        /** Handle API errors */
        if (error instanceof ApiError) {
          attempts++;

          const delay = Math.pow(2, attempts) * 1000; // exponential backoff

          if (error.status === 503) {
            console.log(
              `⚠ Model overloaded (503). Retrying in ${delay / 1000}s… [${attempts}/${maxAttempts}]`
            );
            await aiUtils.delay(delay);
            continue;
          }

          if (error.status === 429) {
            console.log(
              `⚠ Rate limit (429). Retrying in ${delay / 1000}s… [${attempts}/${maxAttempts}]`
            );
            await aiUtils.delay(delay);
            continue;
          }
        }

        /** Unknown error: throw it */
        throw error;
      }
    }

    console.log("❌ Failed after max retries.");

  } catch (err) {
    console.error("❌ Error posting blog:", err);
  }
}

postBlog();