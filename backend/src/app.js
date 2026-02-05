import "dotenv/config";
import path from "node:path";
import express from "express";
import { initDbIfNeeded } from "./db/init.js";
import { attachUser } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import articleRoutes from "./routes/articles.js";
import commentRoutes from "./routes/comments.js";
import adminRoutes from "./routes/admin.js";

// Create the main Express app instance.
const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

// Ensure the database is ready before handling requests.
await initDbIfNeeded();

// Parse JSON bodies with a safe size limit.
// Note: image uploads use multipart/form-data (Multer) and are limited separately.
app.use(express.json({ limit: "10mb" }));

// Basic CORS middleware so the frontend can call this API.
// Logic: set CORS headers, short-circuit preflight, then continue.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,DELETE,OPTIONS"
  );
  if (req.method === "OPTIONS") return res.sendStatus(204);
  return next();
});

// Serve uploaded files directly from the filesystem.
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

// Attach user info (if logged in) to each request.
app.use(attachUser);

// Mount all API routes under a single /api prefix.
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", articleRoutes);
app.use("/api", commentRoutes);
app.use("/api", adminRoutes);

// Health check endpoint for monitoring and dev sanity checks.
// Logic: always respond with { ok: true } to confirm server is up.
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Final error handler to avoid leaking stack traces to clients.
// Logic: log error on server, return generic 500 JSON response.
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res
    .status(500)
    .json({ error: { code: "server_error", message: "Unexpected error" } });
});

// Start the HTTP server and print the URL.
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${PORT}`);
});
