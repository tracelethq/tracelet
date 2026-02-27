import express from "express";
import { tracelet } from "@tracelet/express";
import cors from "cors";
import { userRoutes } from "./routes/users";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
// Init Tracelet
// app.use(tracelet({ serviceName: "external-test", environment: "dev" }));
tracelet({
  app,
  environment: "local",
  logFilePath: "./logs/tracelet.log",
  traceletDocOptions:{
    uiBasePath: "/docs",
  }
});

/**
 * @description Login endpoint
 * @request { "username": "string", "password": "string" }
 * @response { "token": "string" }
 */
function loginHandler(req: express.Request, res: express.Response) {
  res.json({ token: "abc123" });
}

function pingHandler(req: express.Request, res: express.Response) {
  // throw new Error("test error");
  req.traceletLogger?.error({ message: "Pinging the server" });
  req.traceletLogger?.info({ message: "Pinging the server" });
  req.traceletLogger?.warn({ message: "Pinging the server" });
  req.traceletLogger?.debug({ message: "Pinging the server" });
  res.json({ message: "pong" });
}

// Register routes
app.post("/login", loginHandler);
app.get("/ping", pingHandler);

app.use("/users", userRoutes);

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
