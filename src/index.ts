import { aiUtils } from "./utils/ai-utils";

async function main() {
    try {
        let now: Date = new Date(); // 2025-11-25T06:46:42.509Z
        let oneDayLater: Date = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // 2025-11-26T06:46:42.509Z
        let oneHoursLater: Date = new Date(now.getTime() + (1 * 60 * 60 * 1000)); // 2025-11-25T07:46:42.509Z
        // await getStartupsinfo();

        while (true) {
            now = new Date();
            // await crawlWebsite();
            await aiUtils.delay(60000);

            // await generateSummaryOfStartups();
            await aiUtils.delay(60000);

            // await generateTweet()
            await aiUtils.delay(60000);

            // await genertaeBlog();
            await aiUtils.delay(60000);

            if(now >= oneHoursLater) {
                // await postTweet();
                oneHoursLater = new Date(now.getTime() + (1 * 60 * 60 * 1000));
                await aiUtils.delay(60000);
            }

            if(now >= oneDayLater) {
                // await getStartupsinfo();
                await aiUtils.delay(60000);
                // await postBlog();
                oneDayLater = new Date(now.getTime() + (24 * 60 * 60 * 1000));
                await aiUtils.delay(60000);
            };
        }
    } catch (error) {
        console.log("ERROR from main function", error);
    }
}

main();