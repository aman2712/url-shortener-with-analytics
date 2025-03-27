import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, connectRedis } from "./utils/db.js";
import urlRoutes from "./routes/urlRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use("/", urlRoutes);

const startServer = async () => {
  await connectDB();
  await connectRedis();

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
