import mongoose, { Schema } from "mongoose";
import { MONGODB_CONNECT_URL } from "../config";
import crypto from "crypto";

const startupsSchema = new Schema({
  id: {
    type: String,
    default: () => crypto.randomUUID(),
    unique: true
  },
  startupID: {
    type: Number,
    unique: true
  },
  title: String,
  website: String,
  description: String,
  VC_firm: [String],
  services: String,
  founder_names: [String],
  foundedAt: String
}, { timestamps: true });

const Startup = mongoose.model("Startup", startupsSchema);

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
  Startup,
  DBConnect
};
