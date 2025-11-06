import { db } from "../../index";
import { sql } from 'drizzle-orm';


const generateAndSaveTweets = async () => {
    // Get startup data from the database
    const pages = await db.query.web_page_data.findMany({
        where: (web_page_data, { eq, and }) =>
            and(
            eq(web_page_data.isUsed, false),
            eq(
                web_page_data.startupId,
                sql`(
                SELECT "startupId" FROM "web_page_data"
                WHERE "isUsed" = false
                LIMIT 1
                )`
            )
        ),
    });

    console.log('Pages to generate tweets for:', pages);


    // format the data for tweet generation

    // Call the AI model to generate tweets

    // Save the generated tweets back to the database
}

generateAndSaveTweets();