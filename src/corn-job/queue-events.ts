import { QueueEvents } from "bullmq";
import { jobsQueue } from "./queue";
import { redis } from "../db/redis";

const queueEvents = new QueueEvents("jobs-queue", {
  connection: redis
});

let bCompleted = new Set();

queueEvents.on("completed", async (event) => {
    const { jobId, name } = event as any;
    const B_JOBS = ["jobB1", "jobB2", "jobB3", "jobB4"];

    if (B_JOBS.includes(name)) {
        bCompleted.add(name);

        if (bCompleted.size === B_JOBS.length) {
            console.log("All B jobs completed. Scheduling C jobs...");

        await jobsQueue.addBulk([
            { name: "jobC1", data: {} },
            { name: "jobC2", data: {} },
        ]);

            bCompleted.clear();
        }
    }
});
