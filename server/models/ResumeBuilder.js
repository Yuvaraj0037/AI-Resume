const mongoose = require("mongoose");

const { Schema } = mongoose;

// Custom profile links
const linkSchema = new Schema(
  {
    label: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "",
    },

    url: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    _id: true,
  }
);

// Education
const educationSchema = new Schema(
  {
    institution: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    degree: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    fieldOfStudy: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    startDate: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },

    endDate: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },

    current: {
      type: Boolean,
      default: false,
    },

    grade: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1500,
      default: "",
    },
  },
  {
    _id: true,
  }
);

// Work experience
const experienceSchema = new Schema(
  {
    company: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    role: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    startDate: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },

    endDate: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },

    current: {
      type: Boolean,
      default: false,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    bulletPoints: [
      {
        type: String,
        trim: true,
        maxlength: 500,
      },
    ],
  },
  {
    _id: true,
  }
);

// Projects
const projectSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    role: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    technologies: [
      {
        type: String,
        trim: true,
        maxlength: 80,
      },
    ],

    startDate: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },

    endDate: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    bulletPoints: [
      {
        type: String,
        trim: true,
        maxlength: 500,
      },
    ],

    githubUrl: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    liveUrl: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    _id: true,
  }
);

// Certifications
const certificationSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    issuer: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    date: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },

    credentialUrl: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    _id: true,
  }
);

// Main Resume Builder schema
const resumeBuilderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Original analyzed resume used for importing
    sourceAnalysisResume: {
      type: Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },

    title: {
      type: String,
      trim: true,
      minlength: 1,
      maxlength: 120,
      default: "Untitled Resume",
    },

    template: {
      type: String,
      enum: [
        "ats-classic",
        "modern-professional",
        "student-tech",
      ],
      default: "student-tech",
    },

    personal: {
      name: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "",
      },

      email: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 160,
        default: "",
      },

      phone: {
        type: String,
        trim: true,
        maxlength: 30,
        default: "",
      },

      location: {
        type: String,
        trim: true,
        maxlength: 120,
        default: "",
      },

      jobTitle: {
        type: String,
        trim: true,
        maxlength: 120,
        default: "",
      },

      linkedin: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },

      github: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },

      portfolio: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },

      links: {
        type: [linkSchema],
        default: [],
      },
    },

    summary: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    education: {
      type: [educationSchema],
      default: [],
    },

    experience: {
      type: [experienceSchema],
      default: [],
    },

    projects: {
      type: [projectSchema],
      default: [],
    },

    skills: [
      {
        type: String,
        trim: true,
        maxlength: 80,
      },
    ],

    certifications: {
      type: [certificationSchema],
      default: [],
    },

    achievements: [
      {
        type: String,
        trim: true,
        maxlength: 500,
      },
    ],

    languages: [
      {
        type: String,
        trim: true,
        maxlength: 80,
      },
    ],

    sectionOrder: {
      type: [String],

      default: [
        "summary",
        "skills",
        "experience",
        "projects",
        "education",
        "certifications",
        "achievements",
        "languages",
      ],

      validate: {
        validator(value) {
          if (!Array.isArray(value)) {
            return false;
          }

          const allowedSections = [
            "summary",
            "skills",
            "experience",
            "projects",
            "education",
            "certifications",
            "achievements",
            "languages",
          ];

          return (
            new Set(value).size === value.length &&
            value.every((section) =>
              allowedSections.includes(section)
            )
          );
        },

        message:
          "sectionOrder contains invalid or duplicate sections",
      },
    },

    targetJobDescription: {
      type: String,
      trim: true,
      maxlength: 15000,
      default: "",
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

// Speeds up listing a user's latest builder resumes
resumeBuilderSchema.index({
  user: 1,
  updatedAt: -1,
});

// Prevent importing the same analyzed resume twice
resumeBuilderSchema.index(
  {
    user: 1,
    sourceAnalysisResume: 1,
  },
  {
    unique: true,

    partialFilterExpression: {
      sourceAnalysisResume: {
        $type: "objectId",
      },
    },
  }
);

module.exports = mongoose.model(
  "ResumeBuilder",
  resumeBuilderSchema
);