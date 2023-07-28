import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { initRoutes } from "./api.js";

const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
  })
);
const port = 4000;

// Initialize routes
initRoutes(app);

app.listen(port, () => {
  console.log(`Server started, listening on port ${port}...`);
});
