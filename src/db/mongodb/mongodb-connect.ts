import mongoose from "mongoose";
import "dotenv/config";
import { logger } from "../../winston";

const MONGODB_CONNECT_URL = process.env.MONGODB_CONNECT_URL || "mongodb://127.0.0.1:27017/startup.bot";

const childLogger = logger.child({
    file_path: "mongodb/mongodb-connect.ts",
});

const DBConnect = async () => {
  try {
    await mongoose.connect(MONGODB_CONNECT_URL);
    childLogger.info("MongoDB is connected");

    mongoose.connection.on("disconnected", () => {
      childLogger.info("MongoDB is disconnected!");
    });

    mongoose.connection.on("error", (err) => {
      childLogger.error(`MongoDB error: ${err}`);
    });
  } catch (error) {
    childLogger.error(`MongoDB failed to connect ${error}`);
  }
};

export { DBConnect };
