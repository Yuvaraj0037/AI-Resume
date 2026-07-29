const express = require("express");

const auth = require(
  "../middleware/authMiddleware"
);

const {
  chatWithCoach,
  getConversations,
  getConversationById,
  deleteConversation,
} = require(
  "../controllers/coachController"
);

const router = express.Router();

// Every AI Coach route requires login.
router.use(auth);

router.post(
  "/chat",
  chatWithCoach
);

router.get(
  "/conversations",
  getConversations
);

router.get(
  "/conversations/:id",
  getConversationById
);

router.delete(
  "/conversations/:id",
  deleteConversation
);

module.exports = router;