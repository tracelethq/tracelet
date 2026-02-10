import { createAuth } from "@tracelet/core";
import express from "express";

const auth = createAuth();
const authRouter = express.Router();

authRouter.get("/check-auth", (_req, res) => {
  res.status(200).json({ authRequired: auth.isAuthRequired() });
});

/** POST body: { username, password }. Returns { token } (JWT) on success, 401 on failure. */
authRouter.post("/auth", (req, res) => {
  const { username, password } = req.body ?? {};
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "username and password required" });
  }
  if (!auth.authenticate(username, password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  try {
    const token = auth.createToken(username);
    return res.status(200).json({ token });
  } catch (e) {
    return res.status(500).json({ error: "Failed to create token" });
  }
});

/** GET for backward compat: pass ?username=...&password=... (less secure). Prefer POST /auth. */
authRouter.get("/auth", (req, res) => {
  const username = req.query.username as string | undefined;
  const password = req.query.password as string | undefined;
  if (!username || !password) {
    return res.status(400).json({ error: "username and password required" });
  }
  if (!auth.authenticate(username, password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  try {
    const token = auth.createToken(username);
    return res.status(200).json({ token });
  } catch (e) {
    return res.status(500).json({ error: "Failed to create token" });
  }
});

export default authRouter;
export { auth };
