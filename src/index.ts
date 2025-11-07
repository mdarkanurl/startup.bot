import 'dotenv/config';
import { getStartupDataFromWebsite, consumerEvents } from './modules/fetch-startup-data/crawlee';

// import { fetchYCombinatorStartups, startups } from './modules/fetch-startup-data/YCombinator/ycombinator';
// import { ai2incubator } from './modules/fetch-startup-data/ai2incubator';

// crawl VC websites or other sources and get startups data
// const startupsData = async () => {
//     await fetchYCombinatorStartups(startups); // YCombinator
//     await ai2incubator(); // AI2 Incubator

getStartupDataFromWebsite();

consumerEvents.on('pageCrawled', async () => await getStartupDataFromWebsite());

// generate tweets and save them to the database

export {
    // startupsData,
}