import { useState } from "react";
import DashboardLayout from "../component/DashboardLayout";
import { matchJobDescription } from "../services/resumeApi";

function JobMatch() {
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleMatch = async () => {
    if (!jobDescription.trim()) {
      alert("Please paste a job description.");
      return;
    }

    try {
      setLoading(true);
      const data = await matchJobDescription(jobDescription);
      setResult(data);
    } catch (err) {
      alert(err.response?.data?.message || "Job match failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Job Description Match</h1>
          <p className="text-gray-600 mt-2">
            Compare your latest resume with a job description.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-8">
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job description here..."
            className="w-full h-64 border rounded-xl p-4 outline-none focus:border-indigo-500 resize-none"
          />

          <button
            onClick={handleMatch}
            disabled={loading}
            className={`mt-6 px-8 py-3 rounded-xl text-white font-semibold transition ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Matching..." : "Analyze Job Match"}
          </button>
        </div>

        {result && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow p-8">
              <h2 className="text-xl font-bold text-gray-700">Match Score</h2>
              <p className="text-6xl font-bold text-indigo-600 mt-4">
                {result.matchScore || 0}%
              </p>
              <p className="text-gray-500 mt-3">
                Resume: {result.resumeFile || "Latest Resume"}
              </p>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl shadow p-8">
              <h2 className="text-xl font-bold mb-4">Missing Skills</h2>

              {result.missingSkills?.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {result.missingSkills.map((item, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium"
                    >
                      {item.skill || item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No major missing skills found.</p>
              )}
            </div>

            <div className="lg:col-span-3 bg-white rounded-2xl shadow p-8">
              <h2 className="text-xl font-bold mb-4">Suggestions</h2>

              {result.suggestions?.length > 0 ? (
                <ul className="space-y-3">
                  {result.suggestions.map((item, index) => (
                    <li
                      key={index}
                      className="bg-gray-50 rounded-xl p-4 text-gray-700"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No suggestions available.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default JobMatch;