import axios from "axios";
import { Startup } from "../../interfaces/ycombinator-types";

const ycombinator = async () => {
    try {
        const startups = await axios.get("https://yc-oss.github.io/api/tags/ai.json");

        let startup: Startup[] = [];

        for (let i = 0; i < startups.data.length; i++) {
            let currentStartup = startups.data[i];
            startup.push({
                id: currentStartup.id,
                name: currentStartup.name,
                website: currentStartup.website,
                description: currentStartup.long_description,
                VC_firm: "YCombinator",
                services: undefined,
                former_names: currentStartup.former_names,
                foundedAt: currentStartup.launched_at.toString(),
            });
        }
        console.log("startup from YCombinator", startup);
    } catch (error) {
        console.error("Error from: ", error);
    }
}

ycombinator();