import { MongoDB } from "./db";
import { getStartupDataFromWebsite } from "./modules/fetch-data-from-online/website-crawler/crawlee";
import { aiUtils } from "./utils/ai-utils";

async function main() {
    await MongoDB.DBConnect();

    while (true) {
        try {
            console.log("🚀 Starting crawler...");
            await getStartupDataFromWebsite();
            console.log("✅ Crawler finished.");

        } catch (err) {
            console.error("❌ Error during crawl:", err);
        }

        console.log("⏳ Waiting 60 seconds before restarting...");
        await aiUtils.delay(60000);
    }
}

main();
