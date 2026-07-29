import { Lightbulb } from "lucide-react";

function SuggestionCard({ suggestions }) {

  return (

    <div className="bg-white rounded-3xl shadow-lg p-8">

      <div className="flex items-center gap-3 mb-8">

        <Lightbulb className="text-yellow-500" />

        <h2 className="text-2xl font-bold">

          AI Suggestions

        </h2>

      </div>

      <div className="space-y-5">

        {suggestions.map((item, index) => (

          <div
            key={index}
            className="bg-yellow-50 rounded-xl p-5 border-l-4 border-yellow-500"
          >

            {item}

          </div>

        ))}

      </div>

    </div>

  );

}

export default SuggestionCard;