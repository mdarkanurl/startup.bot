import { Queue } from "bullmq";
import { redis } from "../db/redis/index";

export const jobsQueue = new Queue("jobs-queue", { connection: redis });
