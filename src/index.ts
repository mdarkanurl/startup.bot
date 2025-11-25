import { fetchTodayYesterdayPosts } from "./modules/fetch-data-from-online/collect-startups-info/product-hunt";
import { aiUtils } from "./utils/ai-utils";
import { getStartupDataFromWebsite } from "./modules/fetch-data-from-online/website-crawler/crawlee";
import { ai_startups } from "./modules/ai/startups";
import { generateTweet } from "./modules/ai/tweet/generate-tweet";
import { generateBlog } from "./modules/ai/blog/generate-blog";
import { postTweet } from "./modules/ai/tweet/post-tweet";
import { postBlog } from "./modules/ai/blog/post-blog";

async function main() {
    try {
        let now: Date = new Date();
        let oneDayLater: Date = new Date(now.getTime() + (24 * 60 * 60 * 1000));
        let oneHoursLater: Date = new Date(now.getTime() + (1 * 60 * 60 * 1000));
        await fetchTodayYesterdayPosts();

        while (true) {
            now = new Date();
            await getStartupDataFromWebsite();
            await aiUtils.delay(60000);

            await ai_startups.generateSummaryOfStartups();
            await aiUtils.delay(60000);

            await generateTweet();
            await aiUtils.delay(60000);

            await generateBlog();
            await aiUtils.delay(60000);

            if(now >= oneHoursLater) {
                await postTweet();
                oneHoursLater = new Date(now.getTime() + (1 * 60 * 60 * 1000));
                await aiUtils.delay(60000);
            }

            if(now >= oneDayLater) {
                await postBlog();
                await aiUtils.delay(60000);
                
                await fetchTodayYesterdayPosts();
                oneDayLater = new Date(now.getTime() + (24 * 60 * 60 * 1000));
                await aiUtils.delay(60000);
            };
        }
    } catch (error) {
        console.log("ERROR from main function", error);
    }
}

main();