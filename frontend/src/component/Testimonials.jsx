import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Rahul Sharma",
    role: "Software Engineer",
    review:
      "The ATS analysis helped me identify missing skills before interviews. It significantly improved my resume.",
  },
  {
    name: "Priya Nair",
    role: "AI Student",
    review:
      "The AI suggestions were practical and helped me restructure my resume for internships.",
  },
  {
    name: "Arun Kumar",
    role: "Data Analyst",
    review:
      "A clean dashboard and detailed analytics made it easy to understand my resume quality.",
  },
];

function Testimonials() {
  return (
    <section className="py-24 bg-white">

      <div className="max-w-7xl mx-auto px-8">

        <div className="text-center mb-16">

          <h2 className="text-5xl font-bold">
            What Users Say
          </h2>

        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {reviews.map((review, index) => (

            <motion.div
              key={index}
              whileHover={{
                y: -10,
              }}
              className="bg-slate-50 rounded-3xl shadow-lg p-8"
            >

              <div className="flex gap-1 mb-5">

                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}

              </div>

              <p className="text-gray-600 leading-8">
                "{review.review}"
              </p>

              <div className="mt-8">

                <h4 className="font-bold">
                  {review.name}
                </h4>

                <p className="text-gray-500">
                  {review.role}
                </p>

              </div>

            </motion.div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default Testimonials;