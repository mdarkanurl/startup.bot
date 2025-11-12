import axios from "axios";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

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
