import axios from "axios";
import { db } from "../../../connection";
import { TwitterApi } from 'twitter-api-v2';

const X_POST_API_ENDPOINT = process.env.X_POST_API_ENDPOINT || "https://api.x.com/2/tweets";
const X_BEARER_TOKEN = process.env.X_BEARER_TOKEN || "";

const client = new TwitterApi({
  appKey: process.env.X_API_KEY!,
  appSecret: process.env.X_API_SECRET!,
  accessToken: process.env.X_ACCESS_TOKEN!,
  accessSecret: process.env.X_ACCESS_SECRET!,
});

export async function postTweet() {
    try {
        // Fetch tweet fron DB
        const tweet = await db.query.tweets.findFirst({
            with: {
                isUsed: false
            }
        });

        if(!tweet) return console.log("No tweet found");

        // Post the tweet
        try {
            // const response = await axios.post(
            //     X_POST_API_ENDPOINT,
            //     {
            //         text: tweet.tweet
            //     },
            //     {
            //         headers: {
            //         'Authorization': `Bearer ${X_BEARER_TOKEN}`,
            //         'Content-Type': 'application/json',
            //         },
            //     }
            // );

            const tweet = await client.v2.tweet('Hello world – my first post via API!');
            console.log(tweet);

            // if (response.status === 201) {
            //     console.log('✅ Post created successfully!');
            //     console.log('Response:', response.data);
            // } else {
            //     console.log('⚠️ Unexpected response:', response.status, response.data);
            // }
        } catch (error) {
            console.log("❌ Failed to create post:", error);
        }
    } catch (error) {
        console.log("Unexpected error: ", error);
    }
}

postTweet();