# Startup Collector & Poster Bot

## Description
This project is a bot that automatically discovers startups online, gathers detailed information, and shares it with the community. It helps tech enthusiasts stay updated on new ventures by posting informative content on Dev.to and X (Twitter).

## Features
- 🔹 **AI Startup Discovery** – Fetch data from Product Hunt via api to identify emerging startups.
- 🔹 **Website Crawling** – Visits startup websites to gather detailed info.
- 🔹 **Content Generation** – Automatically writes tweets and blogs about startups via LLM.
- 🔹 **Content Posting** – Automatically pots tweets and blogs on X (Twitter), Dev.to via api.
- 🔹 **Schedule & Jobs** – Schedule all tasks to automatically post at optimal times and manage the entire bot workflow.
- 🔹 **Logging & Monitoring** – Logs activities with Winston and Better Stack for reliable monitoring.
- 🔹 **Persistent Storage** – Stores collected data in PostgreSQL and MongoDB.
- 🔹 **Optimization & Reliable** – Used Mozilla’s Readability algorithm to extract informative text and added robust error handling.

## Tech Stack
- Backend: Node.js, TypeScript
- Database: PostgreSQL, MongoDB, Drizzle (ORM)
- Crawle: Crawlee, PlaywrightCrawler
- LLM: Google Gemini
- APIs: Dev.to, X/Twitter, Product Hunt, Y Combinator
- Logging & Monitoring: Winston, Better Stack
- Containerization: Docker

## Setup Instructions
1. Clone the repository:  
   ```bash
   git clone <repo-url>
   cd startups-from-ai
   ```
2. Copy `.env.example` to `.env` and configure API keys and database URLs.
3. Install necessary packages and tools
    ```bash
    pnpm install --frozen-lockfile
    npx playwright install webkit
    ```
4. Run the bot:
    ```bash
    pnpm run build
    pnpm run start
    ```
5. Logs will be available in the configured Winston/Better Stack outputs as well as in the console.

## Contributing
Contributions, issues, and feature requests are welcome!
If you want to contribute to Startups from AI, please follow the guidelines outlined in the [contributing.md](contributing.md) file.

## License
MIT License
