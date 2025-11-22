import { jobsQueue } from "./queue";

export async function scheduleBootstrapJob() {
  await jobsQueue.add(
    "jobA",
    {},
    {
      repeat: {
        every: 24 * 60 * 60 * 1000, // 24 hours
      },
      removeOnComplete: true,
    }
  );
}
