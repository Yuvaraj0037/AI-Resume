const mongoose = require(
  "mongoose"
);

const messageSchema =
  new mongoose.Schema(
    {
      role: {
        type: String,
        enum: [
          "user",
          "assistant",
        ],
        required: true,
      },

      content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 4000,
      },

      suggestedActions: [
        {
          type: String,
          trim: true,
          maxlength: 500,
        },
      ],

      resumeEvidence: [
        {
          type: String,
          trim: true,
          maxlength: 500,
        },
      ],

      followUpQuestions: [
        {
          type: String,
          trim: true,
          maxlength: 300,
        },
      ],
    },
    {
      timestamps: true,
      _id: true,
    }
  );

const coachConversationSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      resume: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "ResumeBuilder",
        required: true,
        index: true,
      },

      title: {
        type: String,
        trim: true,
        maxlength: 120,
        default:
          "Resume coaching conversation",
      },

      messages: {
        type: [messageSchema],
        default: [],
      },

      lastMessageAt: {
        type: Date,
        default: Date.now,
        index: true,
      },
    },
    {
      timestamps: true,
    }
  );

// Keep only the latest 40 messages.
// This prevents a conversation document
// from growing without limit.
coachConversationSchema.pre(
  "save",
  function limitConversationMessages() {
    if (
      Array.isArray(this.messages) &&
      this.messages.length > 40
    ) {
      this.messages =
        this.messages.slice(-40);
    }

    if (
      this.isModified("messages")
    ) {
      this.lastMessageAt =
        new Date();
    }
  }
);

coachConversationSchema.index({
  user: 1,
  lastMessageAt: -1,
});

coachConversationSchema.index({
  user: 1,
  resume: 1,
  lastMessageAt: -1,
});

module.exports =
  mongoose.model(
    "CoachConversation",
    coachConversationSchema
  );