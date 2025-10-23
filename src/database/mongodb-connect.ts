import mongoose from "mongoose";
import { MONGODB_CONNECT_URL } from "../config";

const DBConnect = async () => {
  try {
    await mongoose.connect(MONGODB_CONNECT_URL);
    console.log("MongoDB is connected");
  } catch (error: any) {
    console.log("MongoDB failed to connect");
    console.log(error.message);
  }
};

DBConnect();

export {
    DBConnect
}