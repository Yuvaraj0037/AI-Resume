import { AlertCircle } from "lucide-react";

function WeaknessCard({ weaknesses }) {

  return (

    <div className="bg-white rounded-3xl shadow-lg p-8">

      <h2 className="text-2xl font-bold mb-6">

        Weaknesses

      </h2>

      <div className="space-y-4">

        {weaknesses.map((item, index) => (

          <div
            key={index}
            className="flex gap-3 items-start"
          >

            <AlertCircle
              className="text-red-500 mt-1"
            />

            <p>{item}</p>

          </div>

        ))}

      </div>

    </div>

  );

}

export default WeaknessCard;