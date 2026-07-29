const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const ALLOWED_SECTIONS = [
  "summary",
  "experience",
  "project",
  "education",
  "achievement",
];

function cleanStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 15);
}

function parseAIResponse(text) {
  try {
    const parsed = JSON.parse(text);

    return {
      rewrittenContent: String(
        parsed.rewrittenContent || ""
      ).trim(),

      improvements: cleanStringArray(
        parsed.improvements
      ),

      keywordsUsed: cleanStringArray(
        parsed.keywordsUsed
      ),
    };
  } catch {
    throw new Error(
      "Gemini returned an invalid response"
    );
  }
}

async function rewriteResumeSection({
  section,
  content,
  targetJobDescription = "",
}) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not configured"
    );
  }

  if (!ALLOWED_SECTIONS.includes(section)) {
    throw new Error(
      "Unsupported resume section"
    );
  }

  const cleanContent = String(content || "").trim();

  if (cleanContent.length < 10) {
    throw new Error(
      "Content must contain at least 10 characters"
    );
  }

  if (cleanContent.length > 6000) {
    throw new Error(
      "Content cannot exceed 6000 characters"
    );
  }

  const cleanJobDescription = String(
    targetJobDescription || ""
  )
    .trim()
    .slice(0, 12000);

  const prompt = `
You are an expert ATS resume editor.

Rewrite the supplied resume section so it is:
- concise
- professional
- ATS-friendly
- grammatically correct
- easy to read
- based only on facts supplied by the user

Strict rules:
- Never invent companies, technologies, qualifications, metrics, dates or achievements.
- Never claim experience that is not present.
- Preserve the original meaning.
- Use strong action verbs when appropriate.
- Add job-description keywords only when supported by the original content.
- Do not include markdown.
- Do not include explanations outside JSON.
- Return valid JSON only.

Section type:
${section}

Original content:
${cleanContent}

Target job description:
${
  cleanJobDescription ||
  "No target job description supplied."
}

Return exactly this JSON structure:

{
  "rewrittenContent": "",
  "improvements": [],
  "keywordsUsed": []
}
`;

  try {
    const response =
      await ai.models.generateContent({
        model:
          process.env.GEMINI_MODEL ||
          "gemini-2.5-flash",

        contents: prompt,

        config: {
          responseMimeType:
            "application/json",

          temperature: 0.25,
        },
      });

    const result = parseAIResponse(
      response.text
    );

    if (!result.rewrittenContent) {
      throw new Error(
        "Gemini returned empty rewritten content"
      );
    }

    return result;
  } catch (error) {
    console.error(
      "Resume Builder AI error:",
      error
    );

    if (
      error.status === 429 ||
      error.code === 429 ||
      String(error.message).includes("429") ||
      String(error.message).includes(
        "RESOURCE_EXHAUSTED"
      )
    ) {
      const quotaError = new Error(
        "AI usage limit reached. Try again later."
      );

      quotaError.status = 429;
      throw quotaError;
    }

    throw error;
  }
}

module.exports = {
  rewriteResumeSection,
  ALLOWED_SECTIONS,
};