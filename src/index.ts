import { MongoDB } from "./db";
import { generateBlog } from "./modules/ai/blog/generate-blog";
import { generateSummaryOfStartups } from "./modules/ai/startups/generate-startups-summary";
import { generateTweet } from "./modules/ai/tweet/generate-tweet";
import { getStartupDataFromWebsite } from "./modules/fetch-data-from-online/website-crawler/crawlee";
import { aiUtils } from "./utils/ai-utils";

async function main() {
    await MongoDB.DBConnect();

    while (true) {
        try {
            // Get data from startups website
            console.log("Starting crawler...");
            await getStartupDataFromWebsite();
            console.log("Crawler finished.");

        } catch (err) {
            console.error("Error during crawl:", err);
        }

        try {
            // Generate startups summaries
            console.log("Waiting 10 seconds before starting startups summaries generator...");
            await aiUtils.delay(10000);

            console.log("Starting generator...");
            await generateSummaryOfStartups();
            console.log("Startups summaries generator finished.");

        } catch (err) {
            console.error("Error during generating summaries:", err);
        }

        try {
            // Generate tweet
            console.log("Waiting 10 seconds before starting generating tweet...");
            await aiUtils.delay(10000);

            console.log("Starting generating tweet...");
            await generateTweet();
            console.log("Tweet generator finished.");

        } catch (err) {
            console.error("Error during generating tweet:", err);
        }

        try {
            // Generate blog
            console.log("Waiting 10 seconds before starting generating tweet...");
            await aiUtils.delay(10000);

            console.log("Starting generating blog...");
            await generateBlog();
            console.log("Blog generator finished");

        } catch (err) {
            console.error("Error during generating blog:", err);
        }

        console.log("Waiting 10 seconds before restarting...");
        await aiUtils.delay(10000);
    }
}

main();
