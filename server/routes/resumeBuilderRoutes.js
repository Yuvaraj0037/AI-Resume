const express = require("express");

const auth = require("../middleware/authMiddleware");

const {
  createResume,
  getResumes,
  getResumeById,
  updateResume,
  duplicateResume,
  deleteResume,
  importAnalyzedResume,
  rewriteSection,
} = require("../controllers/resumeBuilderController");

const router = express.Router();

router.use(auth);

router.post("/", createResume);
router.get("/", getResumes);

// Must exist before parameter routes
router.post(
  "/import/:analysisResumeId",
  importAnalyzedResume
);

router.post(
  "/:id/ai-rewrite",
  rewriteSection
);

router.get("/:id", getResumeById);
router.put("/:id", updateResume);
router.post("/:id/duplicate", duplicateResume);
router.delete("/:id", deleteResume);

module.exports = router;