import { Worker } from "bullmq";
import { jobsQueue } from "./queue";
import { redis } from "../db/redis";

new Worker(
  "jobs-queue",
  async job => {
    if (job.name !== "jobA") return;

    console.log("Running Job A...");

    // ➤ Your A function logic
    // await runJobA();

    console.log("A completed. Scheduling B jobs...");

    // Add dependent B jobs
    await jobsQueue.addBulk([
      { name: "jobB1", data: {}, opts: {} },
      { name: "jobB2", data: {}, opts: {} },
      { name: "jobB3", data: {}, opts: {} },
      { name: "jobB4", data: {}, opts: {} },
    ]);
  },
  { connection: redis }
);
