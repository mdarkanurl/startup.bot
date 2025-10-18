import { PlaywrightCrawler, Dataset } from 'crawlee';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';


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


const startUrls = ['https://speechify.com/'];

const crawler = new PlaywrightCrawler({
    launchContext: {
        launchOptions: {
            headless: true,
        },
    },

    maxRequestsPerCrawl: 10,

    async requestHandler({ page, request, enqueueLinks, log }) {
        log.info(`Crawling: ${request.url}`);

        await page.waitForLoadState('networkidle');

        const title = await page.title();
        const metaDescription = await page
            .$eval('meta[name="description"]', (m: any) => m?.getAttribute('content'))
            .catch(() => null);

        const article = await extractInformativeText(page);

        const text = article?.text || (await extractVisibleText(page));
        const finalTitle = article?.title || title;
        const summary = article?.summary || metaDescription;

        if (!text || text.split(' ').length < 50) {
            log.info(`Skipping non-informative page: ${request.url}`);
            return;
        }

        // Save to Dataset
        const startupDataset = await Dataset.open('Speechify');
        await startupDataset.pushData({
            url: request.url,
            title: finalTitle,
            description: summary,
            text,
            crawledAt: new Date().toISOString(),
        });

        // Enqueue internal links
        await enqueueLinks({
            selector: 'a[href]',
            transformRequestFunction: (req) => {
                try {
                    const reqUrl = new URL(req.url);
                    const startHost = new URL(startUrls[0]).hostname;
                    if (reqUrl.hostname !== startHost) return null;
                    if (!reqUrl.protocol.startsWith('http')) return null;
                    if (reqUrl.hash && reqUrl.pathname === new URL(request.url).pathname)
                        return null;
                    return req;
                } catch (err) {
                    console.error('Error from link handler', err);
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
    console.log('🚀 Starting the informative content crawler...');
    await crawler.run(startUrls);
    console.log('✅ Crawl finished.');
})();