import mongoose, { Schema } from "mongoose";
import crypto from "crypto";

const YCstartupsSchema = new Schema({
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
  foundedAt: String,
  isUsed: {
    type: Boolean,
    default: () => false
  }
}, { timestamps: true });

const ProductHuntStartupsSchema = new Schema({
  id: {
    type: String,
    default: () => crypto.randomUUID(),
    unique: true
  },
  startupID: {
    type: Number,
    unique: true
  },
  website: String,
  isUsed: {
    type: Boolean,
    default: () => false
  }
}, { timestamps: true });

const YCStartup = mongoose.model("YCStartup", YCstartupsSchema);
const ProductHuntStartups = mongoose.model("ProductHuntStartups", ProductHuntStartupsSchema);

export {
  YCStartup,
  ProductHuntStartups
};
