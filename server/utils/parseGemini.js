function parseGeminiResponse(text) {
  // Gemini *should* return JSON only, but sometimes it includes extra text.
  if (typeof text !== "string") {
    throw new Error("Gemini response is not a string");
  }

  // Fast path
  try {
    return JSON.parse(text);
  } catch (_) {
    // continue
  }

  let cleaned = text
    .replace(/```json\s*/g, "")
    .replace(/```/g, "")
    .trim();

  // Extract the largest JSON object found
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Gemini did not return a valid JSON object");
  }

  cleaned = cleaned.substring(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Provide context (truncated) to speed up debugging
    const snippet = cleaned.slice(0, 300);
    throw new Error(`Gemini JSON parse failed. Snippet: ${snippet}`);
  }
}

module.exports = parseGeminiResponse;

