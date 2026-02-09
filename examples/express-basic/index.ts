import express from "express";
import { tracelet } from "@tracelet/express";

const app = express();

app.use(express.json());

// 🔌 Tracelet middleware
app.use(tracelet({
  serviceName: "express-basic-example",
  environment: "dev",
}));

  
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/users", (req, res) => {
  res.status(201).json({
    id: "user_123",
    name: req.body.name,
    password: req.body.password, // should be REDACTED
  });
});

app.listen(3000, () => {
  console.log("🚀 Express example running on http://localhost:3000");
});
