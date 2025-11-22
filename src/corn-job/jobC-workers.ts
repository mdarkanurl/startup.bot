import { Worker } from "bullmq";
import { redis } from "../db/redis";

const C_JOBS = ["jobC1", "jobC2"];

new Worker(
  "jobs-queue",
  async job => {
    if (!C_JOBS.includes(job.name)) return;

    console.log(`Running ${job.name}...`);
    // await runCJob(job.name);
  },
  { connection: redis }
);
