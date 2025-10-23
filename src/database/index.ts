import { Startup } from "./mongodb";
import { DBConnect } from "./mongodb-connect";

const MongoDB = {
    StartupDB: Startup,
    DBConnect
}

export {
    MongoDB
}