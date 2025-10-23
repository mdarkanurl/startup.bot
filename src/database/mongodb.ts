import mongoose, { Schema } from "mongoose";
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
  name: String,
  website: String,
  description: String,
  VC_firm: [String],
  services: String,
  founder_names: [String],
  foundedAt: String
}, { timestamps: true });

const Startup = mongoose.model("Startup", startupsSchema);

export {
  Startup
};
