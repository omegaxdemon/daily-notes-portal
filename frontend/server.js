/**
 * Tiny Express static file server for the Daily Notes Portal frontend.
 *
 * Serves everything inside the `public/` directory.
 */

const path = require("path");
const express = require("express");

const app = express();

const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";

const PUBLIC_DIR = path.join(__dirname, "public");

// -----------------------------------------------------------------------------
// Static Files
// -----------------------------------------------------------------------------

app.use(
  express.static(PUBLIC_DIR, {
    extensions: ["html"],

    setHeaders(res, filePath) {
      // Security headers
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

      // Cache only CSS/JS/images/fonts
      if (
        /\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/i.test(filePath)
      ) {
        res.setHeader(
          "Cache-Control",
          "public, max-age=31536000, immutable"
        );
      } else {
        // Never cache HTML pages
        res.setHeader(
          "Cache-Control",
          "no-cache, no-store, must-revalidate"
        );
      }
    },
  })
);

// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------

// Login page
app.get("/", (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

// -----------------------------------------------------------------------------
// 404 Handler
// -----------------------------------------------------------------------------

// Unknown routes redirect to the login page.
// If you later convert this into a true SPA, you can change the status to 200.
app.use((_req, res) => {
  res.status(404).sendFile(path.join(PUBLIC_DIR, "index.html"));
});

// -----------------------------------------------------------------------------
// Start Server
// -----------------------------------------------------------------------------

app.listen(PORT, HOST, () => {
  console.log(
    `[frontend] Static server listening on http://${HOST}:${PORT}`
  );
});