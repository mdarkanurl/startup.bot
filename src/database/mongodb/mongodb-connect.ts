import mongoose from "mongoose";
import { config } from "dotenv";
config();

const MONGODB_CONNECT_URL = process.env.MONGODB_CONNECT_URL || "mongodb://127.0.0.1:27017/startup.bot";

const DBConnect = async () => {
  try {
    await mongoose.connect(MONGODB_CONNECT_URL);
    console.log("MongoDB is connected");

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB is disconnected!");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB error:", err);
    });
  } catch (error: any) {
    console.log("MongoDB failed to connect");
    console.log(error.message);
  }
};

export { DBConnect };
