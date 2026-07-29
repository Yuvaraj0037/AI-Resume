const express = require("express");

const router = express.Router();

const upload = require("../middleware/uploadMiddleware");

const auth = require("../middleware/authMiddleware");

const {
  uploadResume,
  getLatestResume,
  getResumeHistory,
  deleteResume,
  matchJobDescription,
  improveResume,
  compareResumes,
} = require("../controllers/resumeController");

router.post("/upload", auth, upload.single("resume"), uploadResume);
router.get("/latest", auth, getLatestResume);
router.get("/history", auth, getResumeHistory);
router.get("/compare", auth, compareResumes);
router.post("/job-match", auth, matchJobDescription);
router.post("/improve", auth, improveResume);
router.delete("/:id", auth, deleteResume);
module.exports = router;