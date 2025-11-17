import axios from "axios";
import "dotenv/config";
import { db } from "../../../connection";
import { blogs } from "../../../db/schema";
import { eq } from "drizzle-orm";

const apiKey = process.env.DEVTO_API_KEY || "";
const baseUrl = process.env.DEVTO_BASE_URL || "https://dev.to/api";

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

    const articlePayload = {
      article: {
        title: blog.title,
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
      console.error("❌ Error posting blog:", error);
  }
}

postBlog();