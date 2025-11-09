import { db } from "../../../connection";
import 'dotenv/config';
import { generateSummaryOfPages } from "./generate-summary-of-pages";

const CHUNK_SIZE = Number(process.env.CHUNK_SIZE) || 5;

export async function generateSummaryOfStartups() {

    // fetch unprocessed pages from the database
    const pages = await db.query.web_page_data.findMany({
        where: (web_page_data, { eq, and, sql }) =>
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
        columns: {
        url: true,
        title: true,
        description: true,
        text: true,
        },
    });

    const summaries: string[] = [];

    // process few pages at a time safely
    for (let i = 0; i < pages.length; i += CHUNK_SIZE) {
        const chunk = pages.slice(i, i + CHUNK_SIZE);

        console.log(`Summarizing pages ${i + 1} to ${i + chunk.length}...`);
        const res = await generateSummaryOfPages(...chunk);

        if (res) summaries.push(res);
    }

    console.log("✅ Summaries generated:", summaries);
    return summaries;
}


generateSummaryOfStartups();