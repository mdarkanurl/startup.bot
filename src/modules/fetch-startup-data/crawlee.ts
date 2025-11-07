import { PlaywrightCrawler, Dataset, RequestQueue } from 'crawlee';
import { extractInformativeText, extractVisibleText } from './extract-visible-readability';
import { fetchDataFromMongoDB } from "./get-data-from-mongo";
import "dotenv/config";
import { db } from "../../connection";
import { Tables } from "../../db";

const excludedPatterns = [
    'privacy', 'terms', 'login', 'signup', 'register',
    'contact', 'support', 'faq', 'cookie', 'policy',
    'help', 'careers', 'jobs', 'apply', 'hire'];

let startUrls: any;

const normalizeUrl = (url: string) => {
    try {
        const u = new URL(url.toLowerCase());
        let host = u.hostname.replace(/^www\./, '');
        let path = u.pathname.replace(/\/$/, '');
        return `${u.protocol}//${host}${path}`;
    } catch (err) {
        return url;
    }
};

const crawler = new PlaywrightCrawler({
    launchContext: {
        launchOptions: {
            headless: process.env.HEADLESS === 'false' ? false : true,
        },
    },

    maxRequestsPerCrawl: Number(process.env.MAX_REQUESTS || 200),
    maxConcurrency: 5,

    async requestHandler({ page, request, enqueueLinks, log }) {
        log.info(`Crawling: ${request.url} | Depth: ${request.userData.depth ?? 0}`);

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

            await page.goto(request.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        } catch (err) {
            log.warning(`Skipping ${request.url} due to timeout or navigation error.`);
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
            log.info(`Skipping non-informative page: ${request.url}`);
            return;
        }

        // Save the data to the database
        try {
            const result = await db
                .insert(Tables.web_page_data)
                .values({
                    url: request.url,
                    title: finalTitle,
                    description: summary || "",
                    text,
                    startupId: request.userData.id,
                })
                .returning();

            console.log('Saved to DB with ID:', result[0]);
        } catch (error: any) {
            log.error(`Failed to save data for ${request.url}: ${error.message}`);
            return;
        }

        const baseUrl = new URL(startUrls[0].url).origin;
        const requestQueue = await RequestQueue.open(); // ✅ Shared queue

        if(request.url === baseUrl) {
            console.log('Enqueueing links from the homepage:', request.url);
            console.log("baseUrl:", baseUrl);
            // Enqueue internal links
            await enqueueLinks({
                selector: 'a[href]',
                requestQueue,
                transformRequestFunction: (req) => {
                    console.log('Found link:', req.url);
                    req.url = normalizeUrl(req.url);
                    try {
                        const reqUrl = new URL(req.url);
                        const currentHost = new URL(request.url).hostname;

                        // Only crawl internal links
                        if (normalizeUrl(reqUrl.hostname) !== normalizeUrl(currentHost)) return false;

                        // Skip duplicates or hash links
                        if (reqUrl.hash) return false;

                        // Skip certain words
                        if (excludedPatterns.some(word => reqUrl.pathname.toLowerCase().includes(word)))
                            return false;

                        req.userData = { id: request.userData.id };
                        return req;
                    } catch (err) {
                        console.error('Error in transformRequestFunction:', err, req.url);
                        return false;
                    }
                },
                globs: ['**/*'],
            });
        } else {
            log.info(`Skipping link enqueueing for non-root page: ${request.url}`);
        }
    },

    async failedRequestHandler({ request, error, log }) {
        log.error(`Failed ${request.url}`);

        if (error instanceof Error) {
            if (error.message.includes('ERR_TOO_MANY_REDIRECTS')) {
                log.warning(`Skipping ${request.url} due to redirect loop.`);
                return;
            }

            if (error.message.includes('Timeout')) {
                log.warning(`Skipping ${request.url} due to timeout.`);
                return;
            }
            } else {
                log.error(`Unknown error type: ${String(error)}`);
            }
    },
});

async function getStartupDataFromWebsite() {
    console.log('🚀 Starting the informative content crawler...');
    startUrls = await fetchDataFromMongoDB();
    if (!startUrls) {
        console.log("No unused startup found in database.");
        return;
    }
    await crawler.run(startUrls);
    console.log('✅ Crawl finished.');
}

// getStartupDataFromWebsite();

export {
    getStartupDataFromWebsite
}