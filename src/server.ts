import app from "./app";
import { MongoDB } from "./db";
import "dotenv/config";
import { getStartupDataFromWebsite } from "./modules/fetch-data-from-online/website-crawler/crawlee";

const PORT = process.env.PORT || 404;

app.listen(PORT, async () => {
    console.log("Server is running at port", PORT);
    console.log(`Here's the endpoint http://localhost:${PORT}`);

    await MongoDB.DBConnect();

    const runCrawlerLoop = async () => {
        try {
            await getStartupDataFromWebsite();

            console.log("✅ Crawler finished, restarting...");
            setTimeout(runCrawlerLoop, 5000);
        } catch (err) {
            console.error("❌ Error during crawl:", err);
        }
    };
    
    await runCrawlerLoop();
});