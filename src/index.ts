import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { fetchYCombinatorStartups, startups } from './modules/fetch-startup-data/YCombinator/ycombinator';
import { ai2incubator } from './modules/fetch-startup-data/ai2incubator';

const db = drizzle(process.env.DATABASE_URL!);

// crawl VC websites or other sources and get startups data
const startupsData = async () => {
    await fetchYCombinatorStartups(startups); // YCombinator
    await ai2incubator(); // AI2 Incubator
}

// generate tweets and save them to the database

export {
    db,
    startupsData,
}