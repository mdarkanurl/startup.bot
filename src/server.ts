import app from "./app";
import { MongoDB } from "./database";

app.listen(3000, () => {
    MongoDB.DBConnect();
})