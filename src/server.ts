import app from "./app";
import { MongoDB } from "./database";

app.listen(3000, async () => {
    await MongoDB.DBConnect();
});