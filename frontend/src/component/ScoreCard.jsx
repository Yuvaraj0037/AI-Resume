function ScoreCard({ title, score, color }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      <h3 className="text-gray-500 font-semibold">
        {title}
      </h3>

      <h1 className={`text-5xl font-bold mt-4 ${color}`}>
        {score}
      </h1>

    </div>
  );
}

export default ScoreCard;