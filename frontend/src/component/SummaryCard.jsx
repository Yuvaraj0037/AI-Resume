import { FileText } from "lucide-react";

function SummaryCard({ summary }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">

      <div className="flex items-center gap-3 mb-6">

        <div className="bg-indigo-100 p-3 rounded-xl">

          <FileText className="text-indigo-600" size={24} />

        </div>

        <div>

          <h2 className="text-2xl font-bold">
            Professional Summary
          </h2>

          <p className="text-gray-500 text-sm">
            AI-generated overview of your resume
          </p>

        </div>

      </div>

      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">

        <p className="text-gray-700 leading-8 text-lg">
          {summary}
        </p>

      </div>

    </div>
  );
}

export default SummaryCard;