import { YCStartup, ProductHuntStartups } from "./mongodb/mongodb";
import { DBConnect } from "./mongodb/mongodb-connect";
import { startup, web_page_data, ai_generated_startup_summary, tweets, blogs } from "./schema";

const MongoDB = {
    YCStartup,
    ProductHuntStartups,
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