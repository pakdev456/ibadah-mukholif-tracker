import { Router } from "express";

const router = Router();

const VALID_USERNAME = "jali";
const VALID_PASSWORD = "ibadah2026";

router.post("/auth/login", (req, res) => {
  const { username, password } = req.body as { username: string; password: string };

  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    req.session.authenticated = true;
    req.session.username = username;
    res.json({ authenticated: true, username });
  } else {
    res.status(401).json({ error: "Username atau password salah" });
  }
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: "Logged out" });
  });
});

router.get("/auth/me", (req, res) => {
  if (req.session.authenticated) {
    res.json({ authenticated: true, username: req.session.username });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

export default router;
