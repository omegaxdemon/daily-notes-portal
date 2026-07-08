/**
 * Daily Notes Portal — Backend entry point.
 *
 * Boots an Express server on port 8001 (behind the Kubernetes ingress that routes
 * every `/api/*` request from the public URL to this process). All business logic
 * lives in dedicated routers (routes/) and services (services/) so this file stays
 * a thin composition root.
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const loginRouter = require("./routes/login");
const notesRouter = require("./routes/notes");

const app = express();
const PORT = parseInt(process.env.PORT || "8001", 10);

// -----------------------------------------------------------------------------
// Middleware
// -----------------------------------------------------------------------------

// const corsOrigins = (process.env.CORS_ORIGINS || "*")
//   .split(",")
//   .map(origin => origin.trim());

// app.use(
//   cors({
//     origin: corsOrigins,
//   })
// );
app.use(cors());

app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));

// -----------------------------------------------------------------------------
// Health Check
// -----------------------------------------------------------------------------

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "daily-notes-portal",
    time: new Date().toISOString(),
  });
});

// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------

app.use("/api", loginRouter);
app.use("/api", notesRouter);

// -----------------------------------------------------------------------------
// 404 Handler
// -----------------------------------------------------------------------------

app.use("/api", (_req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// -----------------------------------------------------------------------------
// Global Error Handler
// -----------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[server] Unhandled error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// -----------------------------------------------------------------------------
// Start Server
// -----------------------------------------------------------------------------

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `[server] Daily Notes Portal backend listening on http://0.0.0.0:${PORT}`
  );
});