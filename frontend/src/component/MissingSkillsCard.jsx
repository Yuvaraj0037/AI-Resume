import { AlertTriangle } from "lucide-react";

function MissingSkillsCard({ skills }) {
  const color = (severity) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-600";

      case "medium":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-green-100 text-green-700";
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">

      <div className="flex items-center gap-3 mb-8">

        <AlertTriangle className="text-red-500" />

        <h2 className="text-2xl font-bold">
          Missing Skills
        </h2>

      </div>

      <div className="flex flex-wrap gap-4">

        {skills.map((item, index) => (

          <div
            key={index}
            className={`px-4 py-2 rounded-full font-semibold ${color(item.severity)}`}
          >
            {item.skill}
          </div>

        ))}

      </div>

    </div>
  );
}

export default MissingSkillsCard;