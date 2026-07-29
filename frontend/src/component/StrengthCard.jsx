import { CheckCircle2 } from "lucide-react";

function StrengthCard({ strengths }) {

  return (

    <div className="bg-white rounded-3xl shadow-lg p-8">

      <h2 className="text-2xl font-bold mb-6">

        Strengths

      </h2>

      <div className="space-y-4">

        {strengths.map((item, index) => (

          <div
            key={index}
            className="flex gap-3 items-start"
          >

            <CheckCircle2
              className="text-green-600 mt-1"
            />

            <p>{item}</p>

          </div>

        ))}

      </div>

    </div>

  );

}

export default StrengthCard;