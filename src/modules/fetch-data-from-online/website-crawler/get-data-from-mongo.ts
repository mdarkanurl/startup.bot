import { MongoDB } from "../../../db/";
import { db } from "../../../connection";
import { Tables } from "../../../db";

async function getDataFromYCStartup() {
    try {
        const startup = await MongoDB.YCStartup.findOne({ isUsed: false });

        if(!startup) return null;

        const result = await db
            .insert(Tables.startup)
            .values({
                name: startup.name?.toString(),
                VC_firm: startup.VC_firm?.toString(),
                website: startup.website || "",
                founder_names: startup.founder_names?.map(name => name.toString()) || [],
                foundedAt: startup.foundedAt?.toString(),
            })
            .returning();

        if (!result) return null;
        await MongoDB.YCStartup.updateOne({ id: startup.id }, { $set: { isUsed: true } });

        return [
            {
                url: startup.website || "",
                userData: {
                    id: result[0].id,
                    mongoID: startup.id,
                },
            }
        ];
    } catch (error) {
        console.log("Error from MongoDB", error);
    }
}

// Fetch startup data from MongoDB
const fetchDataFromMongoDB = async () => {
    try {
        let startup = await MongoDB.ProductHuntStartups.findOne({ isUsed: false });

        if(!startup) {
            return await getDataFromYCStartup();
        };

        const result = await db
            .insert(Tables.startup)
            .values({
                website: startup.website || "",
            })
            .returning();

        if (!result) return null;
        await MongoDB.ProductHuntStartups.updateOne({ id: startup.id }, { $set: { isUsed: true } });

        return [
            {
                url: startup.website || "",
                userData: {
                    id: result[0].id,
                    mongoID: startup.id,
                },
            }
        ];
    } catch (error) {
        console.error("Error from MongoDB", error);
    }
}

export {
    fetchDataFromMongoDB,
}