import { db } from "../../../connection";
import 'dotenv/config';
import { generateSummaryOfPages } from "./generate-summary-of-pages";
import { ai_generated_startup_summary, web_page_data } from "../../../db/schema";
import { eq } from "drizzle-orm";

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
            startupId: true,
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

    try {
        // Save summaries to DB
        const saveSummary = await db.insert(ai_generated_startup_summary).values({
            summary: summaries,
            startupId: pages[0].startupId
        });

        console.log("✅ Summaries saved to DB:", saveSummary);
    } catch (error) {
        console.error("❌ Error saving summaries to DB:", error);
    }

    try {
        // Update database to mark pages as used
        await db.update(web_page_data)
            .set({ isUsed: true })
            .where(eq(web_page_data.startupId, pages[0].startupId));

        console.log("✅ Pages isUsed is updated in database");
    } catch (error) {
        console.error("❌ Error updating pages in database:", error);
    }

    return summaries;
}


generateSummaryOfStartups();