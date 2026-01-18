import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";

import { leadRouter } from "./routes/lead.js";

dotenv.config();

const app = express();

// --- basics
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "50kb" }));

// --- optional CORS (нужно для варианта B / если нет proxy)
const corsOrigin = process.env.CORS_ORIGIN?.trim();
if (corsOrigin) {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", corsOrigin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
}

// --- API
app.use("/api", leadRouter);

// --- healthcheck (чтобы быстро понять, что backend живой)
app.get("/health", (req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`✅ Backend API started: http://localhost:${port}`);
});
