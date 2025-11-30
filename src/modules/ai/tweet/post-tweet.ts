import { TwitterApi } from "twitter-api-v2";
import { db } from "../../../connection";
import "dotenv/config";
import { tweets } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { logger } from "../../../winston";

const client = new TwitterApi({
  appKey: process.env.X_APP_KEY || "",
  appSecret: process.env.X_APP_SECRET || "",
  accessToken: process.env.X_ACCESS_TOKEN || "",
  accessSecret: process.env.X_ACCESS_TOKEN_SECRET || "",
});

const childLogger = logger.child({
    file_path: "tweet/post-tweet.ts",
});

const rwClient = client.readWrite;

export async function postTweet() {
    try {
      // Fetch tweet fron DB
      const tweetFromDB = await db.query.tweets.findFirst({
        where: (tweets, { eq }) => eq(tweets.isUsed, false)
      });

      if(!tweetFromDB) return childLogger.info("No tweet found");

      // Post the tweet
      const tweet = await rwClient.v2.tweet(tweetFromDB.tweet);
      childLogger.info(`Tweeted successfully: ${tweet.data}`);

      // Mark the tweet as used
      await db.update(tweets)
        .set({ isUsed: true })
        .where(eq(tweets.startupId, tweetFromDB.startupId));

      childLogger.info("Marked the tweet as used.");
    } catch (error) {
      childLogger.error(`Unexpected error: ${error}`);
    }
}
