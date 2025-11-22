import { Worker, Job, QueueEvents } from "bullmq";
import { jobsQueue } from "./queue";
import { redis } from "../db/redis";

const B_JOBS = ["jobB1", "jobB2", "jobB3", "jobB4"];

new Worker(
  "jobs-queue",
  async job => {
    if (!B_JOBS.includes(job.name)) return;

    console.log(`Running ${job.name}...`);
    // await runBJob(job.name);

    console.log(`${job.name} completed. Scheduling repeating cycle...`);

    // Schedule repeating version of this B job
    await jobsQueue.add(
      job.name,         // same name
      {},               // data
      {
        repeat: {
          every: 60_000,  // run every 10 seconds
        },
        removeOnComplete: true,
        jobId: `${job.name}-repeater`, // important for stable repeatable key
      }
    );
  },
  { connection: redis }
);
