// workers/index.ts
import { Worker } from "bullmq";
import { redis } from "../../db/redis";
import * as collect from "./collectStartups";
import * as crawl from "./crawlStartups";
import * as sum from "./generateSummary";
import * as tgen from "./generateTweet";
import * as bgen from "./generateBlog";
import * as post from "./postTweet";
import * as pub from "./publishBlog";

const processors: Record<string, (job: any) => Promise<any>> = {
  collectStartups: collect.collectStartups,
  crawlStartups: crawl.crawlStartups,
  generateSummary: sum.generateSummary,
  generateTweet: tgen.generateTweet,
  generateBlog: bgen.generateBlog,
  postTweet: post.postTweet,
  publishBlog: pub.publishBlog,
};

export function startWorkers() {
  const w = new Worker("startupQueue", async (job) => {
    const fn = processors[job.name];
    if (!fn) throw new Error(`No processor for job ${job.name}`);
    return fn(job);
  }, {
    connection: redis,
    // Add helpful defaults:
    // concurrency: 5,
    // lockDuration: 30_000
  });

  w.on("completed", (job) => console.log(`Job ${job.id} (${job.name}) completed`));
  w.on("failed", (job, err) => console.error(`Job ${job?.id} (${job?.name}) failed:`, err));
  w.on("error", (err) => console.error("Worker error", err));
}
