import axios from "axios";
import fs from "fs";
import path from "path";
import { Startup } from "../../../interfaces/ycombinator-types";
import { MongoDB } from "../../../db";

const filePath = path.join(__dirname, "startups.json");

let set = new Set();

// Return array of startups
const startups = async (URL: string): Promise<Startup[]> => {
  const response = await axios.get(URL);
    let startups: Startup[] = [];

    for (let i = 0; i < response.data.length; i++) {
      startups.push({
        startupID: response.data[i].id,
        name: response.data[i].name,
        website: response.data[i].website,
        description: response.data[i].long_description,
        VC_firm: "YCombinator",
        services: undefined,
        founder_names: undefined,
        foundedAt: response.data[i].launched_at
      });
    }

  return startups;
}

const fetchYCombinatorStartups = async (data: any) => {
  try {
    const URLs: string[] = [
      "https://yc-oss.github.io/api/tags/ai.json",
      "https://yc-oss.github.io/api/tags/ai-assistant.json",
      "https://yc-oss.github.io/api/tags/ai-enhanced-learning.json",
      "https://yc-oss.github.io/api/tags/ai-powered-drug-discovery.json",
      "https://yc-oss.github.io/api/tags/aiops.json",
      "https://yc-oss.github.io/api/tags/artificial-intelligence.json",
      "https://yc-oss.github.io/api/tags/conversational-ai.json",
      "https://yc-oss.github.io/api/tags/deep-learning.json",
      "https://yc-oss.github.io/api/tags/generative-ai.json",
      "https://yc-oss.github.io/api/tags/machine-learning.json",
      "https://yc-oss.github.io/api/tags/ml.json"
    ];
    let startups: Startup[] = [];

    for(let URL = 0; URL < URLs.length; URL++) {
      const startupsFromUrl = await data(URLs[URL]);

      startups.push(...startupsFromUrl);
    }

    // Save the data to MongoDB
    try {
      await MongoDB.StartupDB.insertMany(startups, { ordered: false });
      console.log("✅ Inserted successfully (duplicates skipped)");
    } catch (err: any) {
      if (err.writeErrors) {
        console.log(`⚠️ ${err.writeErrors.length} duplicates ignored`);
      } else {
        console.error(err);
      }
    }

    // Write to JSON file
    fs.writeFileSync(filePath, JSON.stringify(startups, null, 2), "utf-8");
    console.log(`Saved ${startups.length} startups to ${filePath}`);
  } catch (error) {
    console.error("Error fetching startups:", error);
  }
};

fetchYCombinatorStartups(startups);

export {
  startups,
  fetchYCombinatorStartups
}