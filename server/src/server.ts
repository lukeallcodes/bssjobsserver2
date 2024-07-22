import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectToDatabase } from "./database";
import { clientRouter } from "./routes/client.routes";
import { jobRouter } from "./routes/job.routes";
import { sectionRouter } from "./routes/section.routes";
import { serviceRouter } from "./routes/service.routes";
import { userRouter } from "./routes/user.routes";

// Load environment variables from the .env file, where the ATLAS_URI is configured
dotenv.config();

const { ATLAS_URI } = process.env;

if (!ATLAS_URI) {
  console.error("No ATLAS_URI environment variable has been defined in config.env");
  process.exit(1);
}

connectToDatabase(ATLAS_URI)
  .then(() => {
    const app = express();
    app.use(cors());
    app.use("/api/clients", clientRouter);
    app.use("/api/jobs", jobRouter);
    app.use("/api/sections", sectionRouter);
    app.use("/api/services", serviceRouter);
    app.use("/api/auth", userRouter); // Add the user router

    // Start the Express server
    app.listen(5200, () => {
      console.log(`Server running at http://localhost:5200...`);
    });
  })
  .catch((error) => console.error(error));
