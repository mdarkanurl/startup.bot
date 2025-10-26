import { PlaywrightCrawler, Dataset } from 'crawlee';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { Startup } from "../../database/mongodb";

const excludedPatterns = [
    'privacy', 'terms', 'login', 'signup', 'register',
    'contact', 'support', 'faq', 'cookie', 'policy',
    'help', 'careers', 'jobs', 'apply', 'hire'];

let startUrls: any[] | null | undefined = [];

const extractVisibleText = async (page: any) => {
    return await page.evaluate(() => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null as any);
        const visibleTexts: string[] = [];

        function isVisible(node: Node) {
            const el = node.parentElement;
            if (!el) return false;
            const style = window.getComputedStyle(el);
            if (
                style.visibility === 'hidden' ||
                style.display === 'none' ||
                parseFloat(style.opacity || '1') === 0
            ) {
                return false;
            }
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) return false;
            return true;
        }

        while (walker.nextNode()) {
            const node = walker.currentNode;
            const text = node.nodeValue?.trim();
            if (!text) continue;
            if (!isVisible(node)) continue;
            if (text.length < 30) continue;
            visibleTexts.push(text);
        }

        return visibleTexts.join(' ').replace(/\s+/g, ' ').trim();
    });
};


const extractInformativeText = async (page: any) => {
    const html = await page.content();
    const dom = new JSDOM(html, { url: page.url() });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) return null;

    return {
        title: article.title,
        text: article.textContent?.replace(/\s+/g, ' ').trim(),
        summary: article.excerpt,
    };
};

// Fetch startup data from MongoDB
const fetchDataFromMongoDB = async () => {
    try {
        const startup = await Startup.findOne();
        console.log("Fetched startup from MongoDB:", startup);
        if(!startup) return null;

        return [
            {
                url: startup.website || "",
                userData: {
                    VC_firm: startup.VC_firm,
                    founder_names: startup.founder_names,
                    name: startup.name,
                    description: startup.description,
                    foundedAt: startup.foundedAt
                }
            }
        ];
    } catch (error) {
        console.error("Error from crawlee", error);
    }
}

const crawler = new PlaywrightCrawler({
    launchContext: {
        launchOptions: {
            headless: false,
        },
    },

    maxRequestsPerCrawl: 10,

    async requestHandler({ page, request, enqueueLinks, log }) {
        log.info(`Crawling: ${request.url}`);

        await page.waitForLoadState('networkidle', { timeout: 15000 });

        const title = await page.title();
        const metaDescription = await page
            .$eval('meta[name="description"]', (m: any) => m?.getAttribute('content'))
            .catch(() => null);

        const article = await extractInformativeText(page);

        const text = article?.text || (await extractVisibleText(page));
        const finalTitle = article?.title || title;
        const summary = article?.summary || metaDescription;

        // if (!text || text.split(' ').length < 50) {
        //     log.info(`Skipping non-informative page: ${request.url}`);
        //     return;
        // }

        // Save to Dataset
        const startupDataset = await Dataset.open('MixerBox');
        await startupDataset.pushData({
            url: request.url,
            title: finalTitle,
            description: summary,
            text,
            crawledAt: new Date().toISOString(),
        });

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

        // Enqueue internal links
        await enqueueLinks({
            selector: 'a[href]',
            transformRequestFunction: (req) => {
                try {
                    const reqUrl = new URL(req.url);
                    const currentHost = new URL(request.url).hostname;

                    // Only crawl internal links
                    if (reqUrl.hostname !== currentHost) return false;

                    // Skip unnecessary or duplicate paths
                    if (!reqUrl.protocol.startsWith('http')) return false;
                    if (reqUrl.hash && reqUrl.pathname === new URL(request.url).pathname)
                        return false;

                    if (excludedPatterns.some(word => reqUrl.pathname.toLowerCase().includes(word))) {
                        console.log('Skipping:', reqUrl.href);
                        return false;
                    }

                    return req;
                } catch (err) {
                    console.error('Error in transformRequestFunction:', err);
                    return false;
                }
            },
            globs: ['**/*'],
        });
    },

    failedRequestHandler({ request, log }) {
        log.error(`Failed ${request.url}`);
    },
});

const main = async () => {
  console.log('🚀 Starting the informative content crawler...');
  startUrls = await fetchDataFromMongoDB();
  if (!startUrls) {
    console.log("No unused startup found in database.");
    return;
  }
  await crawler.run(startUrls);
  console.log('✅ Crawl finished.');
};

// main();

export {
    main
}