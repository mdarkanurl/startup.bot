import { PlaywrightCrawler, RequestQueue } from 'crawlee';
import { extractInformativeText, extractVisibleText } from './extract-visible-readability';
import { fetchDataFromMongoDB } from "./get-data-from-mongo";
import "dotenv/config";
import { db } from "../../../connection";
import { Tables } from "../../../db";
import { normalizeUrl, removeREFParams } from './regex';
import { logger } from "../../../winston";

const childLogger = logger.child({
  file_path: "website-crawler/crawlee.ts",
});

const excludedPatterns = [
    'privacy', 'terms', 'login', 'signup', 'signin', 'register',
    'contact', 'support', 'faq', 'cookie', 'policy', 'sign-up',
    'help', 'careers', 'jobs', 'apply', 'hire', 'feedback'];

let startUrls: any;
const visited = new Set<string>();
let finalDomain: string | null = null;

const crawler = new PlaywrightCrawler({
    launchContext: {
        launchOptions: {
            headless: process.env.HEADLESS === 'false' ? false : true,
        },
    },

    maxRequestsPerCrawl: Number(process.env.MAX_REQUESTS || 200),
    maxConcurrency: 5,

    async requestHandler({ page, request, enqueueLinks }) {
        childLogger.info(`Crawling: ${request.loadedUrl}`);

        try {
            await page.route('**/*', (route) => {
                const request = route.request();
                const type = request.resourceType();
                if (['image', 'media', 'font', 'stylesheet'].includes(type)) {
                    route.abort();
                } else {
                    route.continue();
                }
            });

            await page.goto(request.loadedUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        } catch (err) {
            childLogger.warning(`Skipping ${request.loadedUrl} due to timeout or navigation error.`);
            return;
        }

        await page.evaluate(() => {
            return new Promise((resolve) => {
                let lastHeight = document.body.scrollHeight;
                let sameHeightCount = 0;
                const distance = 500;

                const timer = setInterval(() => {
                window.scrollBy(0, distance);
                const newHeight = document.body.scrollHeight;

                if (newHeight === lastHeight) {
                    sameHeightCount++;
                } else {
                    sameHeightCount = 0;
                    lastHeight = newHeight;
                }

                if (sameHeightCount >= 3) {
                    clearInterval(timer);
                    resolve("Done scrolling");
                }
                }, 500);
            });
        });

        const title = await page.title();
        const metaDescription = await page
            .$eval('meta[name="description"]', (m: any) => m?.getAttribute('content'))
            .catch(() => null);

        const article = await extractInformativeText(page);

        const text = article?.text || (await extractVisibleText(page));
        const finalTitle = article?.title || title;
        const summary = article?.summary || metaDescription;

        if (!text || text.split(' ').length < 30) {
            childLogger.info(`Skipping non-informative page: ${request.loadedUrl}`);
            return;
        }

        // Save the data to the database
        try {
            if(visited.has(removeREFParams(request.loadedUrl))) {
                childLogger.info(`Alrealy crawled an saved in DB`);
            } else {
                await db
                    .insert(Tables.web_page_data)
                    .values({
                        url: removeREFParams(request.loadedUrl),
                        title: finalTitle,
                        description: summary || "",
                        text,
                        startupId: request.userData.id,
                    })
                    .returning();

                visited.add(removeREFParams(request.loadedUrl));
                childLogger.info(`Saved crawled pages to DB`);
            }
        } catch (error) {
            childLogger.error(`Failed to save data: ${error}`);
            return;
        }

        const currentOrigin = new URL(request.loadedUrl).origin;

        // Detect final domain only once
        if (!finalDomain) finalDomain = currentOrigin;
        console.log("Home page: ", finalDomain);

        const requestQueue = await RequestQueue.open();

        if(currentOrigin === finalDomain) {
            // Enqueue internal links
            console.log("URL found in pages:", request.loadedUrl);
            await enqueueLinks({
            selector: 'a[href]',
            requestQueue,

            transformRequestFunction: (req) => {
                try {
                    const reqUrl = new URL(req.url);
                    const base = new URL(finalDomain!);

                    // Normalize both hostnames
                    const reqHost = reqUrl.hostname.replace(/^www\./, "");
                    const baseHost = base.hostname.replace(/^www\./, "");

                    // Reject external domains (protocol doesn't matter)
                    if (reqHost !== baseHost) return false;

                    // Skip excluded paths (privacy, login, careers, etc.)
                    const pathname = reqUrl.pathname.toLowerCase();
                    if (excludedPatterns.some(word => pathname.includes(word))) return false;

                    // Remove tracking + hash
                    reqUrl.search = "";
                    reqUrl.hash = "";

                    // Remove trailing slash (unless root)
                    if (reqUrl.pathname !== "/") {
                        reqUrl.pathname = reqUrl.pathname.replace(/\/$/, "");
                    }

                    // Full normalization
                    const normalized = normalizeUrl(reqUrl.toString());

                    // Prevent duplicates
                    if (visited.has(normalized)) return false;
                    visited.add(normalized);

                    // Update final request
                    req.url = normalized;
                    req.userData = { id: request.userData.id };

                    return req;

                } catch (err) {
                    childLogger.error(`Error in transformRequestFunction: ${err}`);
                    return false;
                }
            },

            globs: ["**/*"],
        });
        } else {
            childLogger.info(`Skipping link enqueueing for non-root page: ${request.loadedUrl}`);
        }
    },

    async failedRequestHandler({ request, error }) {
        childLogger.error(`Failed ${request.loadedUrl}`);

        if (error instanceof Error) {
            if (error.message.includes('ERR_TOO_MANY_REDIRECTS')) {
                childLogger.warning(`Skipping ${request.loadedUrl} due to redirect loop.`);
                return;
            }

            if (error.message.includes('Timeout')) {
                childLogger.warning(`Skipping ${request.loadedUrl} due to timeout.`);
                return;
            }
            } else {
                childLogger.error(`Unknown error type: ${String(error)}`);
            }
    },
});

async function getStartupDataFromWebsite() {
    startUrls = await fetchDataFromMongoDB();
    if (!startUrls) {
        childLogger.info("No unused startup found in database.");
        return;
    }
    await crawler.run(startUrls);
    finalDomain = null;
}

// getStartupDataFromWebsite();

export {
    getStartupDataFromWebsite
}