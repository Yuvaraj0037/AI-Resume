const {
  GoogleGenAI,
} = require("@google/genai");

function limitText(
  value,
  maxLength = 500
) {
  const text = String(
    value || ""
  ).trim();

  if (text.length <= maxLength) {
    return text;
  }

  return `${text
    .slice(0, maxLength - 3)
    .trim()}...`;
}

function normalizeStringArray(
  value,
  {
    maxItems = 6,
    maxLength = 500,
  } = {}
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (
        typeof item === "string"
      ) {
        return limitText(
          item,
          maxLength
        );
      }

      // Prevent [object Object] from being saved.
      if (
        item &&
        typeof item === "object"
      ) {
        return limitText(
          item.text ||
            item.action ||
            item.question ||
            item.evidence ||
            item.description ||
            "",
          maxLength
        );
      }

      return "";
    })
    .filter(Boolean)
    .slice(0, maxItems);
}

function cleanJsonResponse(value) {
  let text = String(
    value || ""
  ).trim();

  // Remove possible Markdown code fences.
  text = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const firstBrace =
    text.indexOf("{");

  const lastBrace =
    text.lastIndexOf("}");

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace > firstBrace
  ) {
    text = text.slice(
      firstBrace,
      lastBrace + 1
    );
  }

  return text;
}

function sanitizeResume(resume) {
  if (!resume) {
    return {};
  }

  return {
    title: limitText(
      resume.title,
      150
    ),

    template: limitText(
      resume.template,
      80
    ),

    personal: {
      name: limitText(
        resume.personal?.name,
        100
      ),

      location: limitText(
        resume.personal?.location,
        100
      ),

      jobTitle: limitText(
        resume.personal?.jobTitle,
        150
      ),

      linkedin: limitText(
        resume.personal?.linkedin,
        300
      ),

      github: limitText(
        resume.personal?.github,
        300
      ),

      portfolio: limitText(
        resume.personal?.portfolio,
        300
      ),
    },

    summary: limitText(
      resume.summary,
      2000
    ),

    skills: normalizeStringArray(
      resume.skills,
      {
        maxItems: 50,
        maxLength: 100,
      }
    ),

    education: Array.isArray(
      resume.education
    )
      ? resume.education
          .slice(0, 10)
          .map((item) => ({
            institution:
              limitText(
                item.institution,
                200
              ),

            degree: limitText(
              item.degree,
              150
            ),

            fieldOfStudy:
              limitText(
                item.fieldOfStudy,
                150
              ),

            startDate:
              limitText(
                item.startDate,
                30
              ),

            endDate: limitText(
              item.endDate,
              30
            ),

            grade: limitText(
              item.grade,
              80
            ),

            description:
              limitText(
                item.description,
                1000
              ),
          }))
      : [],

    experience: Array.isArray(
      resume.experience
    )
      ? resume.experience
          .slice(0, 15)
          .map((item) => ({
            company: limitText(
              item.company,
              200
            ),

            role: limitText(
              item.role ||
                item.jobTitle,
              150
            ),

            location: limitText(
              item.location,
              100
            ),

            startDate:
              limitText(
                item.startDate,
                30
              ),

            endDate: limitText(
              item.endDate,
              30
            ),

            description:
              limitText(
                item.description,
                1500
              ),

            bulletPoints:
              normalizeStringArray(
                item.bulletPoints,
                {
                  maxItems: 10,
                  maxLength: 500,
                }
              ),
          }))
      : [],

    projects: Array.isArray(
      resume.projects
    )
      ? resume.projects
          .slice(0, 15)
          .map((item) => ({
            name: limitText(
              item.name,
              200
            ),

            role: limitText(
              item.role,
              150
            ),

            technologies:
              normalizeStringArray(
                item.technologies,
                {
                  maxItems: 20,
                  maxLength: 100,
                }
              ),

            description:
              limitText(
                item.description,
                1500
              ),

            bulletPoints:
              normalizeStringArray(
                item.bulletPoints,
                {
                  maxItems: 10,
                  maxLength: 500,
                }
              ),
          }))
      : [],

    certifications: Array.isArray(
      resume.certifications
    )
      ? resume.certifications
          .slice(0, 15)
          .map((item) => ({
            name: limitText(
              item.name ||
                item.title,
              200
            ),

            issuer: limitText(
              item.issuer,
              150
            ),

            date: limitText(
              item.date,
              50
            ),
          }))
      : [],

    achievements:
      normalizeStringArray(
        resume.achievements,
        {
          maxItems: 20,
          maxLength: 500,
        }
      ),

    languages:
      normalizeStringArray(
        resume.languages,
        {
          maxItems: 20,
          maxLength: 100,
        }
      ),

    targetJobDescription:
      limitText(
        resume.targetJobDescription,
        5000
      ),
  };
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .slice(-10)
    .map((message) => ({
      role:
        message.role ===
        "assistant"
          ? "assistant"
          : "user",

      content: limitText(
        message.content,
        2000
      ),
    }))
    .filter(
      (message) =>
        message.content
    );
}

function normalizeCoachResponse(
  value
) {
  return {
    answer:
      limitText(
        value?.answer,
        4000
      ) ||
      "I could not generate a useful response. Please ask a more specific resume question.",

    suggestedActions:
      normalizeStringArray(
        value?.suggestedActions,
        {
          maxItems: 6,
          maxLength: 500,
        }
      ),

    resumeEvidence:
      normalizeStringArray(
        value?.resumeEvidence,
        {
          maxItems: 6,
          maxLength: 500,
        }
      ),

    followUpQuestions:
      normalizeStringArray(
        value?.followUpQuestions,
        {
          maxItems: 5,
          maxLength: 300,
        }
      ),
  };
}

async function askResumeCoach({
  resume,
  history = [],
  message,
}) {
  if (
    !process.env.GEMINI_API_KEY
  ) {
    throw new Error(
      "GEMINI_API_KEY is missing"
    );
  }

  const userMessage = limitText(
    message,
    2000
  );

  if (!userMessage) {
    throw new Error(
      "Coach message is required"
    );
  }

  const ai = new GoogleGenAI({
    apiKey:
      process.env.GEMINI_API_KEY,
  });

  const safeResume =
    sanitizeResume(resume);

  const safeHistory =
    sanitizeHistory(history);

  const prompt = `
You are ResumeAI Coach, a careful and practical career assistant.

Your task is to answer questions using only the resume data supplied below.

STRICT RULES:
1. Never invent employers, qualifications, skills, certifications, projects, metrics, dates, achievements or experience.
2. Clearly state when information is missing.
3. Do not claim that a resume guarantees employment.
4. Give direct, actionable and concise guidance.
5. Base every recommendation on evidence found in the supplied resume.
6. If rewriting resume content, preserve all facts.
7. Do not add percentages or measurable results unless they already exist in the resume.
8. Return only valid JSON.
9. Do not return Markdown or code fences.
10. Each suggested action and evidence item must be under 500 characters.
11. Each follow-up question must be under 300 characters.

Return exactly this structure:

{
  "answer": "A clear answer to the user's question",
  "suggestedActions": [
    "Specific action based on the resume"
  ],
  "resumeEvidence": [
    "Relevant fact found in the resume"
  ],
  "followUpQuestions": [
    "A useful question the user can ask next"
  ]
}

RESUME DATA:
${JSON.stringify(
  safeResume,
  null,
  2
)}

RECENT CONVERSATION:
${JSON.stringify(
  safeHistory,
  null,
  2
)}

USER MESSAGE:
${userMessage}
`;

  try {
    const response =
      await ai.models.generateContent({
        model:
          process.env
            .GEMINI_COACH_MODEL ||
          process.env.GEMINI_MODEL ||
          "gemini-2.5-flash",

        contents: prompt,

        config: {
          responseMimeType:
            "application/json",

          temperature: 0.25,
        },
      });

    const responseText =
      typeof response.text ===
      "function"
        ? response.text()
        : response.text;

    if (!responseText) {
      throw new Error(
        "Gemini returned an empty response"
      );
    }

    const cleaned =
      cleanJsonResponse(
        responseText
      );

    let parsed;

    try {
      parsed =
        JSON.parse(cleaned);
    } catch (parseError) {
      console.error(
        "Coach JSON parse error:",
        parseError.message
      );

      console.error(
        "Gemini response:",
        cleaned.slice(0, 1000)
      );

      throw new Error(
        "AI Coach returned an invalid response"
      );
    }

    return normalizeCoachResponse(
      parsed
    );
  } catch (error) {
    console.error(
      "AI Coach error:",
      error.message
    );

    const errorText =
      `${error.message || ""} ${
        error.status || ""
      }`.toLowerCase();

    if (
      error.status === 429 ||
      errorText.includes("429") ||
      errorText.includes(
        "resource_exhausted"
      ) ||
      errorText.includes(
        "quota"
      )
    ) {
      throw new Error(
        "AI Coach usage limit reached. Please try again later."
      );
    }

    if (
      errorText.includes(
        "api key"
      )
    ) {
      throw new Error(
        "AI Coach API key is invalid or unavailable."
      );
    }

    throw error;
  }
}

module.exports = {
  askResumeCoach,
};