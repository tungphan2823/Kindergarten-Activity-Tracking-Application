
import { app } from "./app";
import http from "http";
import mongoose from "mongoose";
require("dotenv").config();

const port = process.env.PORT || 3000;
const server = http.createServer(app);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error(err);
});

async function startServer() {
  
  if (process.env.NODE_ENV !== "test") {
    await mongoose.connect(process.env.MONGODB_URL);
    server.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  }
}

startServer();


export { server };
