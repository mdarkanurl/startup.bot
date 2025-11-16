import { Startup } from "./mongodb/mongodb";
import { DBConnect } from "./mongodb/mongodb-connect";
import { startup, web_page_data, ai_generated_startup_summary, tweets, blogs } from "./schema";

const MongoDB = {
    StartupDB: Startup,
    DBConnect
}

const Tables = {
    startup,
    web_page_data,
    ai_generated_startup_summary,
    tweets,
    blogs
}

export {
    MongoDB,
    Tables
}