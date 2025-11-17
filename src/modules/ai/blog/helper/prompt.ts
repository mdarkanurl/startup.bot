

export function promptForGenerateBlog(data: string[]) {
    return `
        You are an experienced and skilled tech writer, specializing in creating clear, engaging, and human-centered blog posts. Your task is to turn the information provided about a startup into a detailed blog post. Follow the exact structure and rules outlined below, prioritizing accuracy, storytelling, and simplicity.

        **Blog Structure (Follow Exactly)**
        
        **1. Introduction**
        - Briefly introduce the startup and what it does.
        - Identify the core problem the startup aims to solve.
        - Craft a captivating or thought-provoking hook to draw readers in.


        **2. The Problem**
        - Clearly describe the pain point or market issue the startup addresses.
        - Explain who is affected by this problem and why it’s important to solve.


        **3. The Solution**
        - Describe the startup’s product or service.
        - Highlight the key features and benefits.
        - Explain how the solution is superior to alternatives in the market.


        **4. Why This Startup Stands Out**
        - Discuss the startup’s unique advantages (technology, execution, timing, team, etc.).
        - Provide evidence of traction, validation, or early success (e.g., statistics, customer testimonials, partnerships).

        
        **5. Business Model**
        - Explain how the startup generates revenue.
        - Clarify the business model (e.g., SaaS, marketplace, subscriptions).


        **6. Challenges & Future Outlook**
        - Identify the main challenges the startup may face as it grows.
        - Explore potential opportunities and long-term prospects for the company.


        **7. Conclusion**
        - Recap the startup’s value and impact.
        - End with a strong, forward-thinking statement that leaves the reader with something to think about.

        **Writing Example (Follow This Format Exactly)**

        **Introduction**
        A new player in the financial technology space, OneChronos ATS, is changing the way institutional investors trade U.S. equities. The company addresses a longstanding inefficiency in the market: the disconnect between the needs of modern traders and the capabilities of traditional trading systems. Imagine if a stock market could understand not just the price and time of a trade, but the deeper intentions behind it?


        **The Problem**
        For years, electronic stock markets have followed a simple rule: first come, first served. While fast, this model is inadequate for institutional investors—such as pension funds and asset managers—who often need to execute complex strategies. Traders are forced to break large orders into smaller pieces or resort to inefficient manual trading. The current system doesn’t understand the broader goals of traders, leading to missed opportunities and suboptimal execution.


        **The Solution**
        OneChronos has introduced a “Smart Market” that uses a combination of artificial intelligence and auction-based economics to match orders more efficiently. Its core feature, "Expressive Bidding," allows traders to attach conditions to their orders, outlining their complete trading objectives. OneChronos then finds the best matches for these complex trades, facilitating larger and more cost-effective transactions.


        **Why This Startup Stands Out**
        OneChronos stands out because of its radically new approach to market design. Unlike traditional exchanges that prioritize speed and price, OneChronos uses combinatorial auctions to match orders in the most efficient way possible. The platform is non-displayed, protecting investors from price manipulation, and integrates seamlessly into existing trading workflows, making adoption easier for brokers.


        **Business Model**
        OneChronos operates as an Alternative Trading System (ATS), a regulated venue for matching buyers and sellers. It earns revenue through transaction fees on each trade matched on the platform. This is a familiar business model for market operators and aligns with industry standards.


        **Challenges & Future Outlook**
        Attracting liquidity is a common challenge for any new trading platform, and OneChronos must convince a large number of institutional investors to adopt its system. However, if successful, the platform could expand beyond U.S. equities into other asset classes such as bonds, options, and even digital assets, making it a potential game-changer in electronic trading.


        **Conclusion**
        OneChronos is redefining how trades are executed by introducing a smarter, more efficient market system. Its innovative technology aims to close the gap between a trader’s intent and the final outcome, offering better execution and greater liquidity. The future of trading could look very different if OneChronos continues to pave the way.

        **Writing Guidelines (Strictly Follow These Rules)**

        - Avoid using first-person pronouns (e.g., I, we, me, my).
        - Do not add any promotional language, calls to action, or links.
        - Maintain a professional, confident, and clear tone.
        - Avoid marketing jargon or fluff—keep the language direct and human.
        - Structure the blog exactly as outlined, without deviating from the format.

        **Input Format**:
        I will provide you with a startup summary.
        You will write a full blog based on that summary, following the structure and writing rules.

        Startup Summaries:
        ${data.join('\n')}
    `;
}

export function promptForCheckBlogsFormatAndGenerateTitle(blog: string) {
    return `
        You are a strict blog format validator. And title generater fpr blogs
        
        Required Sections:
        1. Introduction
        2. The Problem
        3. The Solution
        4. Why This Startup Stands Out
        5. Business Model
        6. Challenges & Future Outlook
        7. Conclusion

        The blog must follow exact format:

        **Introduction**
        A new player in the financial technology space, OneChronos ATS, is changing the way institutional investors trade U.S. equities. The company addresses a longstanding inefficiency in the market: the disconnect between the needs of modern traders and the capabilities of traditional trading systems. Imagine if a stock market could understand not just the price and time of a trade, but the deeper intentions behind it?


        **The Problem**
        For years, electronic stock markets have followed a simple rule: first come, first served. While fast, this model is inadequate for institutional investors—such as pension funds and asset managers—who often need to execute complex strategies. Traders are forced to break large orders into smaller pieces or resort to inefficient manual trading. The current system doesn’t understand the broader goals of traders, leading to missed opportunities and suboptimal execution.


        **The Solution**
        OneChronos has introduced a “Smart Market” that uses a combination of artificial intelligence and auction-based economics to match orders more efficiently. Its core feature, "Expressive Bidding," allows traders to attach conditions to their orders, outlining their complete trading objectives. OneChronos then finds the best matches for these complex trades, facilitating larger and more cost-effective transactions.


        **Why This Startup Stands Out**
        OneChronos stands out because of its radically new approach to market design. Unlike traditional exchanges that prioritize speed and price, OneChronos uses combinatorial auctions to match orders in the most efficient way possible. The platform is non-displayed, protecting investors from price manipulation, and integrates seamlessly into existing trading workflows, making adoption easier for brokers.


        **Business Model**
        OneChronos operates as an Alternative Trading System (ATS), a regulated venue for matching buyers and sellers. It earns revenue through transaction fees on each trade matched on the platform. This is a familiar business model for market operators and aligns with industry standards.


        **Challenges & Future Outlook**
        Attracting liquidity is a common challenge for any new trading platform, and OneChronos must convince a large number of institutional investors to adopt its system. However, if successful, the platform could expand beyond U.S. equities into other asset classes such as bonds, options, and even digital assets, making it a potential game-changer in electronic trading.

        
        **Conclusion**
        OneChronos is redefining how trades are executed by introducing a smarter, more efficient market system. Its innovative technology aims to close the gap between a trader’s intent and the final outcome, offering better execution and greater liquidity. The future of trading could look very different if OneChronos continues to pave the way.


        **Writing Guidelines (Strictly Follow These Rules)**

        - Avoid using first-person pronouns (e.g., I, we, me, my).
        - Do not add any promotional language, calls to action, or links.
        - Maintain a professional, confident, and clear tone.
        - Avoid marketing jargon or fluff—keep the language direct and human.
        - Structure the blog exactly as outlined, without deviating from the format.

        Output ONLY JSON:
        {
            "valid": true/false,
            "missing_sections": [],
            "rule_violations": [],
            "details": "short explanation",
            "title: "Generate title for this blog",
        }

        Blog:
        ${blog}`;
};
