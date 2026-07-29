function Progress({ title, value, color }) {
  return (

    <div className="mb-6">

      <div className="flex justify-between mb-2">

        <span>{title}</span>

        <span className="font-bold">
          {value}%
        </span>

      </div>

      <div className="w-full bg-gray-200 rounded-full h-4">

        <div
          className={`${color} h-4 rounded-full transition-all duration-700`}
          style={{ width: `${value}%` }}
        />

      </div>

    </div>

  );
}

function JobMatchCard({ matches }) {
  return (

    <div className="bg-white rounded-3xl shadow-lg p-8">

      <h2 className="text-2xl font-bold mb-8">
        Job Match
      </h2>

      <Progress
        title="Backend Developer"
        value={matches.backend}
        color="bg-indigo-600"
      />

      <Progress
        title="Frontend Developer"
        value={matches.frontend}
        color="bg-pink-500"
      />

      <Progress
        title="ML Engineer"
        value={matches.mlEngineer}
        color="bg-green-500"
      />

      <Progress
        title="Data Scientist"
        value={matches.dataScientist}
        color="bg-orange-500"
      />

    </div>

  );
}

export default JobMatchCard;