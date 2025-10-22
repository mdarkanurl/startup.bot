import mongoose, { Schema } from "mongoose";
import { MONGODB_CONNECT_URL } from "../config";

const startupsSchema = new Schema({
    id: Schema.Types.UUID,
    title: String,
    website: String,
    description: String,
    VC_firm: [String],
    services: String,
    founder_names: [String],
    foundedAt: String
});

const startupsModel = mongoose.model('startupsModel', startupsSchema);

const DBConnect = async () => {
    try {
        await mongoose.connect(MONGODB_CONNECT_URL);
        console.log('MongoDB is connected');
    } catch (error: any) {
        console.log('MongoDB failed to connected');
        console.log(error.message);
    }
}

export {
    startupsModel,
    DBConnect
}