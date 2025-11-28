import axios, { AxiosResponse } from "axios";
import "dotenv/config";
import { MongoDB } from "../../../db";

const API_URL = process.env.PRODUCT_HUNT_API_URL || "https://api.producthunt.com/v2/api/graphql";
const BEARER_TOKEN = process.env.BEARER_TOKEN || "";

const query = `
query ($cursor: String) {
  posts(order: NEWEST, first: 50, after: $cursor) {
    pageInfo {
      endCursor
      hasNextPage
    }
    edges {
      node {
        id
        website
        createdAt
      }
    }
  }
}
`;

function isTodayOrYesterday(dateString: string) {
  const postDate = new Date(dateString);
  const now = new Date();
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  return postDate >= yesterday;
}

async function fetchTodayYesterdayPosts() {
  let cursor = null;
  let websites = [];
  let page = 1;

  while (true) {
    console.log(`Fetching page ${page}...`);

    let res;
    try {
      res = await axios.post(
        API_URL,
        { query, variables: { cursor } },
        { headers: { "Content-Type": "application/json", "Authorization": `Bearer ${BEARER_TOKEN}` } }
      );
    } catch (error) {
      console.log("ERROR: axios throws", error);
      break;
    }

    const posts = res.data.data.posts.edges;
    if (!posts || posts.length === 0) break; // No more posts

    const filtered = posts
      .map((edge: any) => edge.node)
      .filter((node: any) => isTodayOrYesterday(node.createdAt))
      .map((node: any) => ({ website: node.website, startupID: node.id }))
      .filter(Boolean);

    websites.push(...filtered);

    // Stop if there are no more pages
    if (!res.data.data.posts.pageInfo.hasNextPage) break;

    // Stop if the last post is older than yesterday
    const lastPostDate = new Date(posts[posts.length - 1].node.createdAt);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastPostDate < yesterday) break;

    cursor = res.data.data.posts.pageInfo.endCursor;
    page++;

    await new Promise(res => setTimeout(res, 300)); // throttle
  }

  console.log(`\n🔥 Total websites from today & yesterday: ${websites.length}\n`);

  // Save the data to MongoDB
  try {
    await MongoDB.ProductHuntStartups.insertMany(websites, { ordered: false });
    console.log("Inserted successfully (duplicates skipped)");
    return;
  } catch (err: any) {
    if (err.writeErrors) {
      console.log(`${err.writeErrors.length} duplicates ignored`);
      return;
    } else {
      console.error(err);
      return;
    }
  }
}

export {
  fetchTodayYesterdayPosts
}
