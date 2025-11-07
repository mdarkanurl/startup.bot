import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

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

export {
    extractInformativeText,
    extractVisibleText,
}