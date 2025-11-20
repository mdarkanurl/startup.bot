import { MongoDB } from "./db";
import { generateBlog } from "./modules/ai/blog/generate-blog";
import { postBlog } from "./modules/ai/blog/post-blog";
import { generateSummaryOfStartups } from "./modules/ai/startups/generate-startups-summary";
import { generateTweet } from "./modules/ai/tweet/generate-tweet";
import { postTweet } from "./modules/ai/tweet/post-tweet";
import { fetchYCombinatorStartups, startups } from "./modules/fetch-data-from-online/collect-startups-info/ycombinator";
import { getStartupDataFromWebsite } from "./modules/fetch-data-from-online/website-crawler/crawlee";
import { aiUtils } from "./utils/ai-utils";

async function main() {
    await MongoDB.DBConnect();

    // Run main2 immediately and then every 24 hours
    fetchYCombinatorStartups(startups);
    setInterval(() => fetchYCombinatorStartups(startups), 24 * 60 * 60 * 1000);

    // Run main3 immediately and then every 1 hour
    postTweet();
    setInterval(postBlog, 60 * 60 * 1000);

    // Run main4 immediately and then every 24 hours
    postBlog();
    setInterval(postBlog, 24 * 60 * 60 * 1000);

    // Start the infinite crawler/summary generator/blog process
    (async function FetchDataFromWebsite() {
        while (true) {
            try {
                console.log("Starting crawler...");
                await getStartupDataFromWebsite();
                console.log("Crawler finished.");
            } catch (err) {
                console.error("Error during crawl:", err);
            }

            try {
                console.log("Waiting 10 seconds before generating summaries...");
                await aiUtils.delay(10000);
                console.log("Starting generator...");
                await generateSummaryOfStartups();
                console.log("Startups summaries generator finished.");
            } catch (err) {
                console.error("Error during generating summaries:", err);
            }

            try {
                console.log("Waiting 10 seconds before generating tweet...");
                await aiUtils.delay(10000);
                console.log("Starting generating tweet...");
                await generateTweet();
                console.log("Tweet generator finished.");
            } catch (err) {
                console.error("Error during generating tweet:", err);
            }

            try {
                console.log("Waiting 10 seconds before generating blog...");
                await aiUtils.delay(10000);
                console.log("Starting generating blog...");
                await generateBlog();
                console.log("Blog generator finished.");
            } catch (err) {
                console.error("Error during generating blog:", err);
            }

            console.log("Waiting 10 seconds before restarting...");
            await aiUtils.delay(10000);
        }
    })();
}

main();

