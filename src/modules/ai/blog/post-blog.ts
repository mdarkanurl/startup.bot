import axios from "axios";
import "dotenv/config";
import { db } from "../../../connection";
import { ApiError, GoogleGenAI } from "@google/genai";
import { aiUtils } from "../../../utils";

const apiKey = process.env.DEVTO_API_KEY || "";
const baseUrl = process.env.DEVTO_BASE_URL || "https://dev.to/api";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const googleGenAI = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
});

async function postBlog() {
  try {
      // Fetch blog content fron DB
      const blogs = await db.query.blogs.findFirst({
        where: (blogs, { eq }) => eq(blogs.isUsed, false)
      });

      if(!blogs) return console.log("No blog found");

      // check the format of blog content
      const formatCheckPrompt = `
      You are a strict blog format validator.

      Given the blog below, check if it follows all rules:
      Required Sections:
      1. Introduction
      2. The Problem
      3. The Solution
      4. Why This Startup Stands Out
      5. Business Model
      6. Challenges & Future Outlook
      7. Conclusion

      Output ONLY in JSON with fields:
      {
        "valid": true/false,
        "missing_sections": [],
        "rule_violations": [],
        "details": "Explain issues shortly"
      }

      Blog to check:
      ${blogs.blog}`;

      let attempts = 0;
      let maxAttempts = 5;

      const delay: number = Math.pow(2, attempts) * 1000;

      while(attempts < maxAttempts) {
        try {
          const isFormated = await googleGenAI.models.generateContent({
            model: "gemini-2.5-pro",
            contents: formatCheckPrompt,
            config: {
                systemInstruction: "You are an AI that writes blog",
            },
          }) as any;

          
          const match = isFormated.text.match(/(?<=```json)([\s\S]*?)(?=```)/);

          console.log("Raw LLM output: ", isFormated.text);
          console.log("Regex output: ", JSON.parse(match[1].trim()));

          if(!JSON.parse(match[1].trim()).valid) {
            console.log("Invalid blog format");
            return;
          }

          // Post the blog to Dev.to
          await axios.get(
            `${baseUrl}/users/me`,
            {
              headers: {
                "api-key": apiKey,
                "Content-Type": "application/json",
              }
          });

          const data = {
            title: "This is title",
            content: blogs.blog,
            tags: ["AI", "startups"],
            published: false
          }

          const res = await axios.post(`${baseUrl}/articles`, data, {
            headers: {
              "api-key": apiKey,
              "Content-Type": "application/json",
            },
          });

          console.log("output from dev.to post req", res.data);

        } catch (error) {
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
      
    } catch (error) {
      console.log("Error posting bolg", error)
    }
}

class DevToPublisher {
  private apiKey: string;
  private baseUrl = "https://dev.to/api";

  constructor() {
    const key = process.env.DEVTO_API_KEY;
    if (!key) throw new Error("DEVTO_API_KEY not found in .env");
    this.apiKey = key;
  }

  private get headers() {
    return {
      "api-key": this.apiKey,
      "Content-Type": "application/json",
    };
  }

  /** Get authenticated user info */
  async getUser() {
    const res = await axios.get(`${this.baseUrl}/users/me`, { headers: this.headers });
    return res.data;
  }

  /**
   * Publish a new article to Dev.to
   * @param title Article title
   * @param content Markdown content
   * @param tags List of tags
   * @param published Whether to publish immediately
   */
  async publishArticle(
    title: string,
    content: string,
    tags: string[] = [],
    published: boolean = false
  ) {
    const data = {
      article: {
        title,
        published,
        body_markdown: content,
        tags,
      },
    };

    const res = await axios.post(`${this.baseUrl}/articles`, data, {
      headers: this.headers,
    });

    return res.data;
  }
}

// Example usage
(async () => {
  try {
    const articleContent = fs.readFileSync("article.md", "utf-8");

    const publisher = new DevToPublisher();

    // Optional: Check your user info
    const user = await publisher.getUser();
    console.log(`👋 Logged in as: ${user.username}`);

    // Publish or save as draft
    const response = await publisher.publishArticle(
      "My First Dev.to Post via API 🚀",
      articleContent,
      ["typescript", "api", "tutorial"],
      false
    );

    console.log("✅ Article created:", response.url);
  } catch (error: any) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
})();

postBlog();