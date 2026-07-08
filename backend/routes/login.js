/**
 * POST /api/login
 *
 * Body:
 * {
 *   roll: number | string,
 *   course: "UG" | "PG"
 * }
 *
 * Returns:
 * {
 *   success: boolean,
 *   name?: string,
 *   roll?: number,
 *   course?: string,
 *   message?: string
 * }
 *
 * Verifies the (roll, course) tuple against the private students.json list.
 * The JSON file lives on disk and is never exposed to the client.
 */

const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const STUDENTS_FILE = path.join(__dirname, "..", "data", "students.json");

/**
 * Reads the student list.
 * Small file, so synchronous reading is acceptable here.
 */
function loadStudents() {
  const raw = fs.readFileSync(STUDENTS_FILE, "utf8");
  return JSON.parse(raw);
}

router.post("/login", (req, res) => {
  try {
    const { roll, course } = req.body || {};

    // -----------------------------------------------------------------------
    // Validation
    // -----------------------------------------------------------------------

    if (roll === undefined || roll === null || roll === "" || !course) {
      return res.status(400).json({
        success: false,
        message: "Roll Number and Course are required.",
      });
    }

    const normalizedRoll = Number(roll);
    const normalizedCourse = String(course).trim().toUpperCase();

    if (!Number.isInteger(normalizedRoll) || normalizedRoll <= 0) {
      return res.status(400).json({
        success: false,
        message: "Roll Number must be a positive number.",
      });
    }

    if (!["UG", "PG"].includes(normalizedCourse)) {
      return res.status(400).json({
        success: false,
        message: "Course must be either UG or PG.",
      });
    }

    // -----------------------------------------------------------------------
    // Student Lookup
    // -----------------------------------------------------------------------

    const students = loadStudents();

    const student = students.find(
      (s) =>
        Number(s.roll) === normalizedRoll &&
        String(s.course).trim().toUpperCase() === normalizedCourse
    );

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid Roll Number or Course.",
      });
    }

    return res.status(200).json({
      success: true,
      name: student.name,
      roll: student.roll,
      course: student.course,
    });

  } catch (err) {
    console.error("[login] Failed to process login:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

module.exports = router;