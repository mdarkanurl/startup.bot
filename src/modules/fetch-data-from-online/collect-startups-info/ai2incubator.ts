import puppeteer from "puppeteer";

const ai2incubator=  async () => {

    // Launch the browser and navigate ai2incubator
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://www.ai2incubator.com/companies", { waitUntil: "networkidle0" });

    // Start collecting data
    const startups = await page.$$eval("div.ssr-variant", (elements) => {
        return elements.map((el) => {
        const link = el.querySelector("a")?.getAttribute("href") || "";
        const description = el.querySelector("p.framer-text")?.textContent?.trim() || "";

        return { description, link };
        });
    });

    // Log the data and close the browser
    console.log(startups);
    await browser.close();
};

// Call the function
ai2incubator();

export {
    ai2incubator
}