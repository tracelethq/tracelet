import "reflect-metadata";
import "dotenv/config";
import cors from "cors";
import express from "express";
import { useExpressServer } from "routing-controllers";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { ExampleController } from "./controllers/ExampleController.js";
import { UsersController } from "./controllers/UsersController.js";
import { OrganizationsController } from "./controllers/OrganizationsController.js";
import { OrganizationEnvsController } from "./controllers/OrganizationEnvsController.js";
import { IngestController } from "./controllers/IngestController.js";
import { LogsController } from "./controllers/LogsController.js";
import { DashboardController } from "./controllers/DashboardController.js";

const app = express();
const port = Number(process.env.PORT) || 3003;

const allowedOrigins = [
  ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) ?? []),
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean) : []),
];

// CORS for auth (and API): required for browser preflight and cross-origin requests
app.use(
  "/api",
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.length === 0) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  })
);

// Better Auth: mount before express.json(); Express 5 uses *splat for catch-all
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// API controllers (routing-controllers)
useExpressServer(app, {
  routePrefix: "/api",
  controllers: [ExampleController, UsersController, OrganizationsController, OrganizationEnvsController, IngestController, LogsController, DashboardController],
});

app.listen(port, () => {
  const serverUrl = process.env.BETTER_AUTH_BASE_URL ?? process.env.BETTER_AUTH_URL ?? `port ${port}`;
console.log(`Backend listening on ${serverUrl}`);
});
