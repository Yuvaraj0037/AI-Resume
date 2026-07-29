const mongoose = require("mongoose");

const CoachConversation = require(
  "../models/CoachConversation"
);

const ResumeBuilder = require(
  "../models/ResumeBuilder"
);

const {
  askResumeCoach,
} = require("../services/coachService");

function isValidId(value) {
  return mongoose.isValidObjectId(
    value
  );
}

function cleanMessage(value) {
  return String(value || "")
    .trim()
    .slice(0, 4000);
}

function createConversationTitle(
  message
) {
  const cleanTitle = cleanMessage(
    message
  )
    .replace(/\s+/g, " ")
    .slice(0, 70);

  return (
    cleanTitle ||
    "Resume Coach Conversation"
  );
}

// POST /api/coach/chat
exports.chatWithCoach = async (
  req,
  res
) => {
  try {
    const {
      resumeId,
      conversationId,
    } = req.body;

    const message = cleanMessage(
      req.body.message
    );

    if (!resumeId) {
      return res.status(400).json({
        message:
          "Builder resume ID is required",
      });
    }

    if (!isValidId(resumeId)) {
      return res.status(400).json({
        message:
          "Invalid builder resume ID",
      });
    }

    if (message.length < 2) {
      return res.status(400).json({
        message:
          "Coach message must contain at least 2 characters",
      });
    }

    const resume =
      await ResumeBuilder.findOne({
        _id: resumeId,
        user: req.user.id,
      }).lean();

    if (!resume) {
      return res.status(404).json({
        message:
          "Builder resume not found",
      });
    }

    let conversation;

    if (conversationId) {
      if (
        !isValidId(conversationId)
      ) {
        return res.status(400).json({
          message:
            "Invalid conversation ID",
        });
      }

      conversation =
        await CoachConversation.findOne(
          {
            _id: conversationId,
            user: req.user.id,
            resume: resumeId,
          }
        );

      if (!conversation) {
        return res.status(404).json({
          message:
            "Coach conversation not found",
        });
      }
    } else {
      conversation =
        new CoachConversation({
          user: req.user.id,
          resume: resumeId,

          title:
            createConversationTitle(
              message
            ),

          messages: [],
          lastMessageAt:
            new Date(),
        });
    }

    /*
     * Pass only previous messages.
     * The current message is supplied
     * separately to the AI service.
     */
    const previousMessages =
      conversation.messages
        .slice(-10)
        .map((item) => ({
          role: item.role,
          content: item.content,
        }));

    const coachResult =
      await askResumeCoach({
        resume,
        history:
          previousMessages,
        message,
      });

    conversation.messages.push({
      role: "user",
      content: message,
    });

    conversation.messages.push({
      role: "assistant",

      content:
        coachResult.answer,

      suggestedActions:
        coachResult.suggestedActions,

      resumeEvidence:
        coachResult.resumeEvidence,

      followUpQuestions:
        coachResult.followUpQuestions,
    });

    conversation.lastMessageAt =
      new Date();

    await conversation.save();

    const assistantMessage =
      conversation.messages[
        conversation.messages.length -
          1
      ];

    return res.status(200).json({
      message:
        "Coach response generated",

      conversationId:
        conversation._id,

      resumeId: resume._id,

      response: {
        id: assistantMessage._id,

        role:
          assistantMessage.role,

        content:
          assistantMessage.content,

        suggestedActions:
          assistantMessage
            .suggestedActions,

        resumeEvidence:
          assistantMessage
            .resumeEvidence,

        followUpQuestions:
          assistantMessage
            .followUpQuestions,

        createdAt:
          assistantMessage.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Coach chat error:",
      error
    );

    return res
      .status(error.status || 500)
      .json({
        message:
          error.message ||
          "Unable to generate coach response",
      });
  }
};

// GET /api/coach/conversations
exports.getConversations = async (
  req,
  res
) => {
  try {
    const conversations =
      await CoachConversation.find({
        user: req.user.id,
      })
        .populate({
          path: "resume",
          select:
            "title template personal.name",
        })
        .sort({
          lastMessageAt: -1,
        })
        .limit(50)
        .lean();

    const result =
      conversations.map(
        (conversation) => {
          const lastMessage =
            conversation.messages[
              conversation.messages
                .length - 1
            ];

          return {
            id: conversation._id,
            title:
              conversation.title,

            resume:
              conversation.resume,

            messageCount:
              conversation.messages
                .length,

            lastMessage:
              lastMessage
                ? {
                    role:
                      lastMessage.role,

                    content:
                      lastMessage.content,

                    createdAt:
                      lastMessage.createdAt,
                  }
                : null,

            lastMessageAt:
              conversation.lastMessageAt,

            createdAt:
              conversation.createdAt,
          };
        }
      );

    return res.status(200).json({
      count: result.length,
      conversations: result,
    });
  } catch (error) {
    console.error(
      "Get coach conversations error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load coach conversations",
    });
  }
};

// GET /api/coach/conversations/:id
exports.getConversationById =
  async (req, res) => {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({
          message:
            "Invalid conversation ID",
        });
      }

      const conversation =
        await CoachConversation.findOne(
          {
            _id: req.params.id,
            user: req.user.id,
          }
        )
          .populate({
            path: "resume",
            select:
              "title template personal.name",
          })
          .lean();

      if (!conversation) {
        return res.status(404).json({
          message:
            "Coach conversation not found",
        });
      }

      return res.status(200).json({
        conversation: {
          id: conversation._id,

          title:
            conversation.title,

          resume:
            conversation.resume,

          messages:
            conversation.messages,

          lastMessageAt:
            conversation.lastMessageAt,

          createdAt:
            conversation.createdAt,

          updatedAt:
            conversation.updatedAt,
        },
      });
    } catch (error) {
      console.error(
        "Get coach conversation error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to load coach conversation",
      });
    }
  };

// DELETE /api/coach/conversations/:id
exports.deleteConversation = async (
  req,
  res
) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message:
          "Invalid conversation ID",
      });
    }

    const conversation =
      await CoachConversation.findOneAndDelete(
        {
          _id: req.params.id,
          user: req.user.id,
        }
      );

    if (!conversation) {
      return res.status(404).json({
        message:
          "Coach conversation not found",
      });
    }

    return res.status(200).json({
      message:
        "Coach conversation deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete coach conversation error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to delete coach conversation",
    });
  }
};