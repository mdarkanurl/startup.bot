import { Startup } from "./mongodb/mongodb";
import { DBConnect } from "./mongodb/mongodb-connect";
import { startup, web_page_data } from "./schema";

const MongoDB = {
    StartupDB: Startup,
    DBConnect
}

const Tables = {
    startup,
    web_page_data
}

export {
    MongoDB,
    Tables
}