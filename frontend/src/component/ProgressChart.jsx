import {
  RadialBarChart,
  RadialBar,
} from "recharts";

function ProgressChart({ title, value, color }) {

  const data = [
    {
      name: title,
      value,
      fill: color,
    },
  ];

  return (

    <div className="bg-white rounded-2xl shadow p-6">

      <h2 className="font-bold mb-5">
        {title}
      </h2>

      <div className="flex justify-center">

        <RadialBarChart
          width={220}
          height={220}
          innerRadius="70%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >

          <RadialBar
            minAngle={15}
            dataKey="value"
          />

          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="28"
            fontWeight="bold"
          >
            {value}%
          </text>

        </RadialBarChart>

      </div>

    </div>

  );

}

export default ProgressChart;