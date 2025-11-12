import "dotenv/config";
import { db } from "../../../connection";

export async function generateBlog() {
    try {
        // Get the startup summaries from DB
        const startups = await db.query.ai_generated_startup_summary.findFirst({
            where: (summaries, { eq }) => eq(summaries.isUsed, false),
        });

        if (!startups) return console.log("No unused startup summaries found.");

        // Generate blog using AI
        const prompt = `
            You are a professional writer skilled at writing concise and engaging blog with the info you get from input.
            Given the following summaries of a startup, write a blog that highlights its core services or products in a professional, catchy, and authentic tone.

            The tweet should be like this example:
            "YouTube lets anyone share videos with the world, changing how we learn, entertain, and connect. With 2B+ users, it turned content into culture—and became a $300B+ ad powerhouse, thriving by helping creators and advertisers grow. #YouTube #Success #Innovation"

            Use this format to write the tweet:
            "{[name (if available) then what the startup does (tell about products/services) then what the startup gains (if available)] e.g "YXZ startup does ABC and they make PQR amount of revenue annually."} #hashtag1 #hashtag2"
            - Keep the tweet under 280 characters.
            - Don't share misinformation, just share what you get from input.
            - Focus on the startup's main products or services.
            - Use a professional and engaging tone.
        
            Don't include in the blog:
            - we, our, I, my, us
            - Call to actions like "Check this out", "Visit now"
            - Links or URLs
            - Excessive hashtags (max 3 relevant hashtags)

            Startup Summaries:
            ${startups.summary.join('\n')}
            `;
    } catch (error) {
        
    }
}