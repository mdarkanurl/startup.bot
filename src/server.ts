import app from "./app";
import { MongoDB } from "./db";
import "dotenv/config";
import { main } from "./modules/fetch-startup-data/crawlee";

const PORT = process.env.PORT || 404;

app.listen(PORT, async () => {
    console.log("server is running at port", PORT);
    console.log(`Here's the endpoint http://localhost:${PORT}`);
    await MongoDB.DBConnect();
    await main();
});