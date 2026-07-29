const fs = require("fs");
const mongoose = require("mongoose");
const pdfParse = require("pdf-parse");

const Resume = require(
  "../models/Resume"
);

const analyzeResume = require(
  "../services/geminiService"
);

const parseGeminiResponse =
  require("../utils/parseGemini");

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(
    value
  );
}

function numberValue(value) {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function flattenSkills(
  analysis = {}
) {
  const skills =
    analysis.skills || {};

  return [
    ...(skills.programming || []),
    ...(skills.ml || []),
    ...(skills.web || []),
    ...(skills.tools || []),
  ].filter(
    (skill) =>
      typeof skill === "string" &&
      skill.trim()
  );
}

function createUniqueSkillMap(
  skills
) {
  const skillMap = new Map();

  for (const skill of skills) {
    const cleaned =
      skill.trim();

    const normalized =
      cleaned.toLowerCase();

    if (
      !skillMap.has(normalized)
    ) {
      skillMap.set(
        normalized,
        cleaned
      );
    }
  }

  return skillMap;
}

function isGeminiQuotaError(
  error
) {
  const message = String(
    error?.message || ""
  ).toLowerCase();

  return (
    error?.status === 429 ||
    error?.statusCode === 429 ||
    message.includes("429") ||
    message.includes(
      "resource_exhausted"
    ) ||
    message.includes("quota")
  );
}

// UPLOAD AND ANALYZE RESUME
exports.uploadResume = async (
  req,
  res
) => {
  let temporaryFilePath = null;

  try {
    if (!req.user?.id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message:
          "No resume file uploaded",
      });
    }

    let pdfBuffer;

    // Multer memoryStorage
    if (
      req.file.buffer &&
      Buffer.isBuffer(
        req.file.buffer
      )
    ) {
      pdfBuffer =
        req.file.buffer;
    }

    // Multer diskStorage
    else if (req.file.path) {
      temporaryFilePath =
        req.file.path;

      pdfBuffer =
        await fs.promises.readFile(
          temporaryFilePath
        );
    } else {
      throw new Error(
        "Uploaded PDF data is unavailable"
      );
    }

    const pdfData =
      await pdfParse(pdfBuffer);

    const extractedText =
      String(
        pdfData?.text || ""
      ).trim();

    if (
      extractedText.length < 50
    ) {
      return res.status(400).json({
        message:
          "The PDF does not contain enough readable text. Scanned-image resumes are not currently supported.",
      });
    }

    const rawAnalysis =
      await analyzeResume(
        extractedText
      );

    const analysis =
      parseGeminiResponse(
        rawAnalysis
      );

    const resume =
      await Resume.create({
        user: req.user.id,

        filename:
          req.file.originalname ||
          req.file.filename ||
          "resume.pdf",

        extractedText,
        analysis,
      });

    return res.status(201).json({
      message:
        "Resume uploaded and analyzed successfully",
      resume,
    });
  } catch (error) {
    console.error(
      "Resume upload error:",
      error.message
    );

    const errorMessage =
      String(
        error?.message || ""
      ).toLowerCase();

    if (
      error.status === 429 ||
      errorMessage.includes("429") ||
      errorMessage.includes(
        "resource_exhausted"
      ) ||
      errorMessage.includes(
        "quota"
      )
    ) {
      return res.status(429).json({
        message:
          "AI analysis limit reached. Please try again later.",
        code: "AI_QUOTA_EXCEEDED",
      });
    }

    if (
      errorMessage.includes(
        "fetch failed"
      )
    ) {
      return res.status(502).json({
        message:
          "Unable to connect to the AI analysis service. Please try again.",
        code:
          "AI_SERVICE_UNAVAILABLE",
      });
    }

    return res.status(
      error.status || 500
    ).json({
      message:
        process.env.NODE_ENV ===
        "production"
          ? "Resume analysis failed"
          : error.message ||
            "Resume upload failed",
    });
  } finally {
    // Only diskStorage creates a physical file.
    if (temporaryFilePath) {
      try {
        await fs.promises.unlink(
          temporaryFilePath
        );
      } catch (cleanupError) {
        if (
          cleanupError.code !==
          "ENOENT"
        ) {
          console.error(
            "Temporary PDF cleanup failed:",
            cleanupError.message
          );
        }
      }
    }
  }
};

// GET LATEST ANALYZED RESUME
exports.getLatestResume = async (
  req,
  res
) => {
  try {
    const resume =
      await Resume.findOne({
        user: req.user.id,
      }).sort({
        createdAt: -1,
      });

    if (!resume) {
      return res.status(404).json({
        message:
          "No resume found",
      });
    }

    return res.status(200).json(
      resume
    );
  } catch (error) {
    console.error(
      "Get latest resume error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Failed to load the latest resume",
    });
  }
};

// GET RESUME HISTORY
exports.getResumeHistory =
  async (req, res) => {
    try {
      const resumes =
        await Resume.find({
          user: req.user.id,
        })
          .select(
            "filename analysis createdAt updatedAt"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json(
        resumes
      );
    } catch (error) {
      console.error(
        "Get resume history error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to load resume history",
      });
    }
  };

// DELETE ANALYZED RESUME
exports.deleteResume = async (
  req,
  res
) => {
  try {
    const resumeId =
      req.params.id;

    if (
      !isValidObjectId(
        resumeId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid resume ID",
      });
    }

    const resume =
      await Resume.findOneAndDelete({
        _id: resumeId,
        user: req.user.id,
      });

    if (!resume) {
      return res.status(404).json({
        message:
          "Resume not found",
      });
    }

    return res.status(200).json({
      message:
        "Resume deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete resume error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Failed to delete resume",
    });
  }
};

// MATCH LATEST RESUME WITH JOB DESCRIPTION
exports.matchJobDescription =
  async (req, res) => {
    try {
      const jobDescription =
        String(
          req.body
            ?.jobDescription || ""
        ).trim();

      if (!jobDescription) {
        return res.status(400).json({
          message:
            "Job description is required",
        });
      }

      if (
        jobDescription.length <
        30
      ) {
        return res.status(400).json({
          message:
            "Job description is too short",
        });
      }

      if (
        jobDescription.length >
        15000
      ) {
        return res.status(400).json({
          message:
            "Job description is too long",
        });
      }

      const resume =
        await Resume.findOne({
          user: req.user.id,
        }).sort({
          createdAt: -1,
        });

      if (!resume) {
        return res.status(404).json({
          message:
            "No resume found. Upload a resume first.",
        });
      }

      const analysis =
        resume.analysis || {};

      const matchScore =
        Math.round(
          (numberValue(
            analysis.atsScore
          ) +
            numberValue(
              analysis.resumeScore
            )) /
            2
        );

      return res.status(200).json({
        message:
          "Job match completed",

        resumeFile:
          resume.filename,

        matchScore,

        matchedSkills:
          analysis.skills || {},

        missingSkills:
          analysis.missingSkills ||
          [],

        suggestions:
          analysis.suggestions || [],

        jobDescription,
      });
    } catch (error) {
      console.error(
        "Job match error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to match job description",
      });
    }
  };

// GENERATE RESUME IMPROVEMENT DATA
exports.improveResume = async (
  req,
  res
) => {
  try {
    const resume =
      await Resume.findOne({
        user: req.user.id,
      }).sort({
        createdAt: -1,
      });

    if (!resume) {
      return res.status(404).json({
        message:
          "No resume found. Upload a resume first.",
      });
    }

    const analysis =
      resume.analysis || {};

    const improvedSkills = [
      ...(analysis.skills
        ?.programming || []),

      ...(analysis.skills?.web ||
        []),

      ...(analysis.skills?.ml ||
        []),

      ...(analysis.skills?.tools ||
        []),
    ].filter(Boolean);

    const improvedProjects =
      Array.isArray(
        analysis.suggestions
      ) &&
      analysis.suggestions.length >
        0
        ? analysis.suggestions.map(
            (item) =>
              `Improve project: ${item}`
          )
        : [
            "Add measurable results to each project.",
            "Mention technologies used clearly.",
            "Include deployment or GitHub links.",
          ];

    const atsTips =
      Array.isArray(
        analysis.weaknesses
      ) &&
      analysis.weaknesses.length >
        0
        ? analysis.weaknesses
        : [
            "Add ATS keywords from the target job description.",
            "Use bullet points with action verbs.",
            "Quantify achievements wherever possible.",
          ];

    return res.status(200).json({
      improvedSummary:
        analysis.summary ||
        "Create a clear professional summary highlighting technical skills, projects, and measurable achievements.",

      improvedSkills,
      improvedProjects,
      atsTips,
    });
  } catch (error) {
    console.error(
      "Improve resume error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Failed to improve resume",
    });
  }
};

// COMPARE TWO ANALYZED RESUMES
exports.compareResumes = async (
  req,
  res
) => {
  try {
    const baselineId =
      String(
        req.query.baselineId ||
          ""
      ).trim();

    const currentId = String(
      req.query.currentId ||
        ""
    ).trim();

    if (
      !baselineId ||
      !currentId
    ) {
      return res.status(400).json({
        message:
          "Both baselineId and currentId are required",
      });
    }

    if (
      baselineId === currentId
    ) {
      return res.status(400).json({
        message:
          "Select two different resumes for comparison",
      });
    }

    if (
      !isValidObjectId(
        baselineId
      ) ||
      !isValidObjectId(currentId)
    ) {
      return res.status(400).json({
        message:
          "Invalid resume ID",
      });
    }

    const [
      baselineResume,
      currentResume,
    ] = await Promise.all([
      Resume.findOne({
        _id: baselineId,
        user: req.user.id,
      }).select(
        "filename analysis createdAt"
      ),

      Resume.findOne({
        _id: currentId,
        user: req.user.id,
      }).select(
        "filename analysis createdAt"
      ),
    ]);

    if (
      !baselineResume ||
      !currentResume
    ) {
      return res.status(404).json({
        message:
          "One or both selected resumes were not found",
      });
    }

    const baselineAnalysis =
      baselineResume.analysis || {};

    const currentAnalysis =
      currentResume.analysis || {};

    const baselineSkills =
      createUniqueSkillMap(
        flattenSkills(
          baselineAnalysis
        )
      );

    const currentSkills =
      createUniqueSkillMap(
        flattenSkills(
          currentAnalysis
        )
      );

    const gainedSkills = [
      ...currentSkills.entries(),
    ]
      .filter(
        ([key]) =>
          !baselineSkills.has(key)
      )
      .map(
        ([, value]) => value
      );

    const removedSkills = [
      ...baselineSkills.entries(),
    ]
      .filter(
        ([key]) =>
          !currentSkills.has(key)
      )
      .map(
        ([, value]) => value
      );

    const unchangedSkills = [
      ...currentSkills.entries(),
    ]
      .filter(([key]) =>
        baselineSkills.has(key)
      )
      .map(
        ([, value]) => value
      );

    const atsDelta =
      numberValue(
        currentAnalysis.atsScore
      ) -
      numberValue(
        baselineAnalysis.atsScore
      );

    const resumeScoreDelta =
      numberValue(
        currentAnalysis.resumeScore
      ) -
      numberValue(
        baselineAnalysis.resumeScore
      );

    const jobRoles = [
      "backend",
      "frontend",
      "mlEngineer",
      "dataScientist",
    ];

    const jobMatchChanges = {};

    for (const role of jobRoles) {
      const baselineScore =
        numberValue(
          baselineAnalysis
            .jobMatches?.[role]
        );

      const currentScore =
        numberValue(
          currentAnalysis
            .jobMatches?.[role]
        );

      jobMatchChanges[role] = {
        baseline:
          baselineScore,

        current:
          currentScore,

        delta:
          currentScore -
          baselineScore,
      };
    }

    let verdict =
      "The current resume has similar overall performance.";

    if (atsDelta >= 10) {
      verdict =
        "Major improvement. The current resume is significantly more ATS-friendly.";
    } else if (
      atsDelta > 0
    ) {
      verdict =
        "Positive improvement. The current resume performs better.";
    } else if (
      atsDelta <= -10
    ) {
      verdict =
        "Major regression. The current resume needs significant correction.";
    } else if (
      atsDelta < 0
    ) {
      verdict =
        "The current resume performs slightly worse than the baseline.";
    }

    return res.status(200).json({
      baseline: {
        id:
          baselineResume._id,

        filename:
          baselineResume.filename,

        createdAt:
          baselineResume.createdAt,

        atsScore:
          numberValue(
            baselineAnalysis.atsScore
          ),

        resumeScore:
          numberValue(
            baselineAnalysis
              .resumeScore
          ),
      },

      current: {
        id:
          currentResume._id,

        filename:
          currentResume.filename,

        createdAt:
          currentResume.createdAt,

        atsScore:
          numberValue(
            currentAnalysis.atsScore
          ),

        resumeScore:
          numberValue(
            currentAnalysis
              .resumeScore
          ),
      },

      comparison: {
        atsDelta,
        resumeScoreDelta,
        gainedSkills,
        removedSkills,
        unchangedSkills,
        jobMatchChanges,

        currentStrengths:
          currentAnalysis.strengths ||
          [],

        currentWeaknesses:
          currentAnalysis.weaknesses ||
          [],

        recommendations:
          currentAnalysis.suggestions ||
          [],

        verdict,
      },
    });
  } catch (error) {
    console.error(
      "Resume comparison error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Failed to compare resumes",
    });
  }
};