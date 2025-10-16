import { PlaywrightCrawler, Dataset } from 'crawlee';
import fs from 'fs';

// Helper: extract only visible text nodes from the page
const extractVisibleText = async (page: any) => {

    return await page.evaluate(() => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null as any);
        const visibleTexts: string[] = [];

        function isVisible(node: Node) {
            const el = node.parentElement;
            if (!el) return false;
            const style = window.getComputedStyle(el);
            if (
                style &&
                (style.visibility === 'hidden' || style.display === 'none' ||
                parseFloat(style.opacity || '1') === 0)
            ) {
                return false;
            }
            
            // size check
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) return false;
            return true;
        }

        while (walker.nextNode()) {
            const node = walker.currentNode;
            const text = node.nodeValue?.trim();
            if (!text) continue;
            if (!isVisible(node)) continue;

            visibleTexts.push(text);
        }

        return visibleTexts;
    });
};


const startUrls = ['https://www.carribiz.com/'];


const crawler = new PlaywrightCrawler({

    launchContext: {
        launchOptions: {
            headless: true,
        },
    },

    maxRequestsPerCrawl: 10,

    async requestHandler({ page, request, enqueueLinks, log }) {
        log.info(`Crawling: ${request.url}`);

        // Wait for network + some content to render
        await page.waitForLoadState('networkidle');

        const title = await page.title();
        const text = await extractVisibleText(page);

        // Optionally extract meta description
        const metaDescription = await page.$eval('meta[name="description"]', (m: any) => m?.getAttribute('content'),).catch(() => null);

        // Open or create a dataset for this startup
        const startupDataset = await Dataset.open("CarriBiz");

        await startupDataset.pushData({
            url: request.url,
            title,
            description: metaDescription,
            text,
            crawledAt: new Date().toISOString(),
        });


        await enqueueLinks({
            selector: 'a[href]',
            transformRequestFunction: (req) => {
                try {
                    const reqUrl = new URL(req.url);
                    const startHost = new URL(startUrls[0]).hostname;
                    if (reqUrl.hostname !== startHost) return null;
                    if (!reqUrl.protocol.startsWith('http')) return null;
                    if (reqUrl.hash && reqUrl.pathname === new URL(request.url).pathname) return null;
                    return req;
                } catch (err) {
                    console.error("Error from crawlee.ts", err);
                    return null;
                }
            },
            globs: ['**/*'],
        });
    },

    failedRequestHandler({ request, log }) {
        log.error(`Failed ${request.url}`);
    },
});

(async () => {
    await crawler.run(startUrls);
})();
