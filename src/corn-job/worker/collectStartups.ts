

// workers/collectStartups.ts
export async function collectStartups(job: any) {
  console.log("collectStartups running", job.id, job.data);
  // call your productHunt scraper and store results in MongoDB
  // await productHunt();   <-- implement and import your actual function
}
