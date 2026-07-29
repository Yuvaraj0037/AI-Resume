import {
  Code2,
  BrainCircuit,
  Globe,
  Wrench,
} from "lucide-react";

function SkillSection({ title, icon, skills }) {
  return (
    <div>

      <div className="flex items-center gap-2 mb-4">

        {icon}

        <h3 className="font-semibold text-lg">
          {title}
        </h3>

      </div>

      <div className="flex flex-wrap gap-3">

        {skills.map((skill) => (
          <span
            key={skill}
            className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-600 hover:text-white transition"
          >
            {skill}
          </span>
        ))}

      </div>

    </div>
  );
}

function SkillsCard({ skills }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">

      <h2 className="text-2xl font-bold mb-8">
        Technical Skills
      </h2>

      <div className="space-y-8">

        <SkillSection
          title="Programming"
          icon={<Code2 className="text-blue-600" />}
          skills={skills.programming}
        />

        <SkillSection
          title="Machine Learning"
          icon={<BrainCircuit className="text-green-600" />}
          skills={skills.ml}
        />

        <SkillSection
          title="Web Development"
          icon={<Globe className="text-purple-600" />}
          skills={skills.web}
        />

        <SkillSection
          title="Tools"
          icon={<Wrench className="text-orange-500" />}
          skills={skills.tools}
        />

      </div>

    </div>
  );
}

export default SkillsCard;