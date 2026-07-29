import {
  FileText,
  BadgeCheck,
  Target,
} from "lucide-react";

function AnalysisHeader({ ats, resume, filename = "resume.pdf" }) {
  const jobMatch = Math.round((ats + resume) / 2);

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <div>
        <h1 className="text-4xl font-bold">
          Resume Analysis Report
        </h1>

        <div className="flex items-center gap-2 mt-3 text-gray-500">
          <FileText size={20} />
          <span>{filename}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="bg-green-50 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <BadgeCheck className="text-green-600" />
            <h3 className="font-semibold">ATS Score</h3>
          </div>

          <h2 className="text-5xl font-bold text-green-600 mt-5">
            {ats}%
          </h2>
        </div>

        <div className="bg-blue-50 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600" />
            <h3 className="font-semibold">Resume Score</h3>
          </div>

          <h2 className="text-5xl font-bold text-blue-600 mt-5">
            {resume}%
          </h2>
        </div>

        <div className="bg-purple-50 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Target className="text-purple-600" />
            <h3 className="font-semibold">Job Match</h3>
          </div>

          <h2 className="text-5xl font-bold text-purple-600 mt-5">
            {jobMatch}%
          </h2>
        </div>
      </div>
    </div>
  );
}

export default AnalysisHeader;