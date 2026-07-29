import { jsPDF } from "jspdf";

export function downloadAnalysisPDF({ filename = "resume.pdf", analysis }) {
  const doc = new jsPDF();

  const margin = 20;
  let y = margin;

  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;

  const addLine = (text, fontSize = 11, style = "normal") => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", style);

    const lines = doc.splitTextToSize(String(text), maxWidth);

    lines.forEach((line) => {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }

      doc.text(line, margin, y);
      y += fontSize * 0.5 + 4;
    });
  };

  const addSection = (title, content) => {
    y += 4;
    addLine(title, 14, "bold");
    y += 2;

    if (Array.isArray(content)) {
      content.forEach((item) => addLine(`• ${item}`, 10));
    } else if (typeof content === "object" && content !== null) {
      Object.entries(content).forEach(([key, val]) => {
        const label = key.charAt(0).toUpperCase() + key.slice(1);

        if (Array.isArray(val)) {
          addLine(`${label}: ${val.join(", ")}`, 10);
        } else {
          addLine(`${label}: ${val}`, 10);
        }
      });
    } else {
      addLine(content || "Not available", 10);
    }
  };

  if (!analysis) {
    alert("No analysis data available.");
    return;
  }

  addLine("Resume Analysis Report", 20, "bold");
  addLine(`File: ${filename}`, 10);
  addLine(`Generated: ${new Date().toLocaleDateString()}`, 10);

  y += 6;

  addLine(`ATS Score: ${analysis.atsScore || 0}%`, 12, "bold");
  addLine(`Resume Score: ${analysis.resumeScore || 0}%`, 12, "bold");

  const jobMatch = analysis.jobMatches
    ? Math.round(
        ((analysis.jobMatches.backend || 0) +
          (analysis.jobMatches.frontend || 0) +
          (analysis.jobMatches.mlEngineer || 0) +
          (analysis.jobMatches.dataScientist || 0)) /
          4
      )
    : Math.round(((analysis.atsScore || 0) + (analysis.resumeScore || 0)) / 2);

  addLine(`Job Match: ${jobMatch}%`, 12, "bold");

  if (analysis.summary) addSection("Summary", analysis.summary);
  if (analysis.skills) addSection("Skills", analysis.skills);

  if (analysis.missingSkills?.length) {
    addSection(
      "Missing Skills",
      analysis.missingSkills.map((s) => `${s.skill} (${s.severity})`)
    );
  }

  if (analysis.strengths?.length) addSection("Strengths", analysis.strengths);
  if (analysis.weaknesses?.length) addSection("Weaknesses", analysis.weaknesses);
  if (analysis.suggestions?.length) addSection("AI Suggestions", analysis.suggestions);

  const cleanFileName = filename.replace(/\.pdf$/i, "");

  doc.save(`${cleanFileName}-analysis.pdf`);
}