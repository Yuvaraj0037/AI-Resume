const ResumeBuilder = require("../models/ResumeBuilder");
const Resume = require("../models/Resume");
const User = require("../models/User");

const {
  rewriteResumeSection,
  ALLOWED_SECTIONS,
} = require("../services/resumeBuilderAIService");

const ALLOWED_FIELDS = [
  "title",
  "template",
  "personal",
  "summary",
  "education",
  "experience",
  "projects",
  "skills",
  "certifications",
  "achievements",
  "languages",
  "sectionOrder",
  "targetJobDescription",
];

function selectAllowedFields(body = {}) {
  return ALLOWED_FIELDS.reduce((result, field) => {
    if (body[field] !== undefined) {
      result[field] = body[field];
    }

    return result;
  }, {});
}

function uniqueStrings(values = []) {
  return [
    ...new Set(
      values
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    ),
  ];
}

function extractSkills(analysis = {}) {
  const skills = analysis.skills || {};

  return uniqueStrings([
    ...(skills.programming || []),
    ...(skills.web || []),
    ...(skills.ml || []),
    ...(skills.tools || []),
  ]);
}

function getBestJobRole(jobMatches = {}) {
  const roleLabels = {
    backend: "Backend Developer",
    frontend: "Frontend Developer",
    mlEngineer: "Machine Learning Engineer",
    dataScientist: "Data Scientist",
  };

  const entries = Object.entries(jobMatches).filter(
    ([, score]) => Number.isFinite(Number(score))
  );

  if (entries.length === 0) {
    return "";
  }

  const [bestRole] = entries.reduce((best, current) =>
    Number(current[1]) > Number(best[1]) ? current : best
  );

  return roleLabels[bestRole] || bestRole;
}

exports.createResume = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const data = selectAllowedFields(req.body);

    const resume = await ResumeBuilder.create({
      ...data,
      user: req.user.id,
      title: data.title || "Untitled Resume",
      personal: {
        name: user.name || "",
        email: user.email || "",
        ...(data.personal || {}),
      },
    });

    return res.status(201).json({
      message: "Resume created successfully",
      resume,
    });
  } catch (error) {
    console.error("Create builder resume error:", error);

    return res.status(400).json({
      message: error.message || "Unable to create resume",
    });
  }
};

exports.getResumes = async (req, res) => {
  try {
    const resumes = await ResumeBuilder.find({
      user: req.user.id,
    })
      .select("title template personal.name updatedAt createdAt")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      count: resumes.length,
      resumes,
    });
  } catch (error) {
    console.error("Get builder resumes error:", error);

    return res.status(500).json({
      message: "Unable to load resumes",
    });
  }
};

exports.getResumeById = async (req, res) => {
  try {
    const resume = await ResumeBuilder.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    return res.status(200).json({
      resume,
    });
  } catch (error) {
    console.error("Get builder resume error:", error);

    return res.status(400).json({
      message: "Invalid resume ID",
    });
  }
};

exports.updateResume = async (req, res) => {
  try {
    const updates = selectAllowedFields(req.body);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid resume fields provided",
      });
    }

    const resume = await ResumeBuilder.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      {
        $set: updates,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    return res.status(200).json({
      message: "Resume saved successfully",
      resume,
    });
  } catch (error) {
    console.error("Update builder resume error:", error);

    return res.status(400).json({
      message: error.message || "Unable to save resume",
    });
  }
};

exports.duplicateResume = async (req, res) => {
  try {
    const existingResume = await ResumeBuilder.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).lean();

    if (!existingResume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    delete existingResume._id;
    delete existingResume.createdAt;
    delete existingResume.updatedAt;
    delete existingResume.__v;

    const duplicate = await ResumeBuilder.create({
      ...existingResume,
      user: req.user.id,
      title: `${existingResume.title} Copy`,
    });

    return res.status(201).json({
      message: "Resume duplicated successfully",
      resume: duplicate,
    });
  } catch (error) {
    console.error("Duplicate builder resume error:", error);

    return res.status(400).json({
      message: "Unable to duplicate resume",
    });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const resume = await ResumeBuilder.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    return res.status(200).json({
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error("Delete builder resume error:", error);

    return res.status(400).json({
      message: "Invalid resume ID",
    });
  }
};

exports.importAnalyzedResume = async (req, res) => {
  try {
    const analysisResume = await Resume.findOne({
      _id: req.params.analysisResumeId,
      user: req.user.id,
    }).lean();

    if (!analysisResume) {
      return res.status(404).json({
        message: "Analyzed resume not found",
      });
    }

    const user = await User.findById(req.user.id)
      .select("name email")
      .lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const analysis = analysisResume.analysis || {};
    const skills = extractSkills(analysis);
    const bestJobRole = getBestJobRole(
      analysis.jobMatches || {}
    );

    const existingImport = await ResumeBuilder.findOne({
      user: req.user.id,
      sourceAnalysisResume: analysisResume._id,
    });

    if (existingImport) {
      return res.status(409).json({
        message:
          "This analyzed resume has already been imported",
        resume: existingImport,
      });
    }

    const originalFilename =
      analysisResume.filename || "Imported Resume";

    const title = originalFilename
      .replace(/\.[^/.]+$/, "")
      .trim();

    const builderResume = await ResumeBuilder.create({
      user: req.user.id,

      title: title
        ? `${title} - Builder`
        : "Imported Resume",

      template: "student-tech",

      personal: {
        name: user.name || "",
        email: user.email || "",
        phone: "",
        location: "",
        jobTitle: bestJobRole,
        linkedin: "",
        github: "",
        portfolio: "",
        links: [],
      },

      summary: analysis.summary || "",

      skills,

      education: [],
      experience: [],
      projects: [],
      certifications: [],
      achievements: [],
      languages: [],

      sourceAnalysisResume:
        analysisResume._id,
    });

    return res.status(201).json({
      message:
        "Analyzed resume imported successfully",
      imported: {
        summary: Boolean(analysis.summary),
        skills: skills.length,
        suggestedJobRole: bestJobRole,
      },
      resume: builderResume,
    });
  } catch (error) {
    console.error(
      "Import analyzed resume error:",
      error
    );

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid analyzed resume ID",
      });
    }

    return res.status(500).json({
      message:
        "Unable to import analyzed resume",
    });
  }
};

exports.rewriteSection = async (
  req,
  res
) => {
  try {
    const {
      section,
      content,
      targetJobDescription,
    } = req.body;

    if (!section || !content) {
      return res.status(400).json({
        message:
          "Section and content are required",
      });
    }

    if (
      !ALLOWED_SECTIONS.includes(section)
    ) {
      return res.status(400).json({
        message:
          "Section must be summary, experience, project, education or achievement",
      });
    }

    const resume =
      await ResumeBuilder.findOne({
        _id: req.params.id,
        user: req.user.id,
      }).select(
        "targetJobDescription title"
      );

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    const result =
      await rewriteResumeSection({
        section,
        content,

        targetJobDescription:
          targetJobDescription !== undefined
            ? targetJobDescription
            : resume.targetJobDescription,
      });

    return res.status(200).json({
      message:
        "Resume section improved successfully",

      section,

      originalContent: content,

      ...result,
    });
  } catch (error) {
    console.error(
      "Rewrite section controller error:",
      error
    );

    return res
      .status(error.status || 500)
      .json({
        message:
          error.message ||
          "Unable to improve resume section",
      });
  }
};