import { Startup } from "../../../db/mongodb/mongodb";
import { db } from "../../../connection";
import { Tables } from "../../../db";

// Fetch startup data from MongoDB
const fetchDataFromMongoDB = async () => {
    try {
        const startup = await Startup.findOne({ isUsed: false });
        if(!startup) return null;

        const result = await db
            .insert(Tables.startup)
            .values({
                name: startup.name?.toString() || "",
                VC_firm: startup.VC_firm?.toString() || "",
                founder_names: startup.founder_names?.map(name => name.toString()) || [],
                foundedAt: startup.foundedAt?.toString() || "",
            })
            .returning();

        if (!result) return null;
        await Startup.updateOne({ id: startup.id }, { $set: { isUsed: true } });

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
        console.error("Error from crawlee", error);
    }
}

export {
    fetchDataFromMongoDB,
}