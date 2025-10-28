import { Startup } from "./mongodb/mongodb";
import { DBConnect } from "./mongodb/mongodb-connect";

const MongoDB = {
    StartupDB: Startup,
    DBConnect
}

export {
    MongoDB
}