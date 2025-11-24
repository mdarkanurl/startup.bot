// scheduler.ts
import { FlowProducer } from "bullmq";
import { startupQueue } from "./queues";
import { redis } from "../db/redis";

const flow = new FlowProducer({ connection: redis });

export async function setupSchedules() {
  // 1) Add the productHunt job now and repeat every 24h
  const productHuntJobOptions = {
    removeOnComplete: { age: 24 * 3600, count: 10 },
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    repeat: { every: 24 * 60 * 60 * 1000 }, // 24 hours
  };

  // Use FlowProducer to chain first-run downstream jobs
  // We'll add a top-level collectStartups job that has children for the initial chain.
  await flow.add({
    name: "collectStartups",
    queueName: "startupQueue",
    data: { initialRun: true }, // flag you can inspect inside the worker if needed
    opts: productHuntJobOptions,
    children: [
      {
        name: "crawlStartups",
        queueName: "startupQueue",
        data: { initialRun: true },
        opts: { attempts: 3, backoff: { type: "exponential", delay: 2000 } },
        children: [
          {
            name: "generateSummary",
            queueName: "startupQueue",
            data: { initialRun: true },
            opts: { attempts: 3 },
            children: [
              {
                name: "generateTweet",
                queueName: "startupQueue",
                data: { initialRun: true },
                opts: { attempts: 2 },
                children: [
                  {
                    name: "generateBlog",
                    queueName: "startupQueue",
                    data: { initialRun: true },
                    opts: { attempts: 2 },
                    children: [
                      {
                        name: "postTweet",
                        queueName: "startupQueue",
                        data: { initialRun: true },
                        opts: { attempts: 2 },
                        children: [
                          {
                            name: "publishBlog",
                            queueName: "startupQueue",
                            data: { initialRun: true },
                            opts: { attempts: 2 },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  // 2) After scheduling the initial flow, create repeatable jobs for the ongoing schedules.
  // Middle four jobs: every 1 minute, NOT chained (runs separately)
  const everyMinute = 60 * 1000;
  await startupQueue.add("crawlStartups", { scheduled: true }, { repeat: { every: everyMinute } });
  await startupQueue.add("generateSummary", { scheduled: true }, { repeat: { every: everyMinute } });
  await startupQueue.add("generateTweet", { scheduled: true }, { repeat: { every: everyMinute } });
  await startupQueue.add("generateBlog", { scheduled: true }, { repeat: { every: everyMinute } });

  // Final two jobs: every 1 hour.
  // To keep ordering "good", schedule publishBlog with a small delay (e.g., 1 minute after postTweet).
  const everyHour = 60 * 60 * 1000;
  await startupQueue.add("postTweet", { scheduled: true }, { repeat: { every: everyHour } });
  // publishBlog runs every hour but with a 1 minute offset to improve chance postTweet ran first.
  await startupQueue.add("publishBlog", { scheduled: true }, { repeat: { every: everyHour, tz: "UTC" }, delay: 60 * 1000 });
}
