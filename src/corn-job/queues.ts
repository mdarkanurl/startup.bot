// queues.ts
import { Queue } from "bullmq";
import { redis } from "../db/redis";

export const startupQueue = new Queue("startupQueue", { connection: redis });
