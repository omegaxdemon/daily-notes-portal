/**
 * GET /api/notes?date=DD-MM-YY
 *
 * Delegates to driveService.listNotesForDate() and returns a
 * frontend-friendly response.
 *
 * If the corresponding Google Drive folder does not exist,
 * the response will contain:
 *
 * {
 *   found: false,
 *   files: []
 * }
 *
 * allowing the UI to display "No notes uploaded."
 */

const express = require("express");
const driveService = require("../services/driveService");

const router = express.Router();

/**
 * Strict DD-MM-YY format
 * Example: 08-07-26
 */
const DATE_RE = /^\d{2}-\d{2}-\d{2}$/;

router.get("/notes", async (req, res) => {
  const date = String(req.query.date || "").trim();

  // -------------------------------------------------------------------------
  // Validate date format
  // -------------------------------------------------------------------------

  if (!DATE_RE.test(date)) {
    return res.status(400).json({
      success: false,
      message:
        "Query parameter 'date' must be in DD-MM-YY format (e.g. 08-07-26).",
    });
  }

  try {
    // -----------------------------------------------------------------------
    // Fetch notes from Google Drive
    // -----------------------------------------------------------------------

    const result = await driveService.listNotesForDate(date);

    return res.status(200).json({
      success: true,
      date,
      found: result.found,
      mode: result.mode,
      files: result.files || [],
      ...(result.note && { note: result.note }),
    });

  } catch (err) {
    console.error("[notes] Drive lookup failed:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notes from Google Drive.",
    });
  }
});

module.exports = router;