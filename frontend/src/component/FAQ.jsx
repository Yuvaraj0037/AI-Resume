import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "Is my resume stored securely?",
    answer:
      "Yes. Your uploaded resume is securely stored in MongoDB and only accessible to your account.",
  },
  {
    question: "Which file formats are supported?",
    answer:
      "Currently PDF resumes are supported.",
  },
  {
    question: "How accurate is the ATS score?",
    answer:
      "The ATS score is generated using AI analysis and common ATS best practices. It is an estimate, not an official recruiter score.",
  },
  {
    question: "Can I upload multiple resumes?",
    answer:
      "Yes. Every uploaded resume is saved in your history for later comparison.",
  },
];

function FAQ() {
  const [active, setActive] = useState(null);

  return (
    <section id="faq" className="py-24 bg-slate-50">
      <div className="max-w-5xl mx-auto px-8">

        <h2 className="text-5xl font-bold text-center mb-14">
          Frequently Asked Questions
        </h2>

        {faqs.map((faq, index) => (
          <div
            key={index}
            className="mb-5 bg-white rounded-2xl shadow"
          >
            <button
              className="w-full flex justify-between items-center p-6"
              onClick={() =>
                setActive(active === index ? null : index)
              }
            >
              <h3 className="font-semibold text-lg">
                {faq.question}
              </h3>

              <ChevronDown
                className={`transition ${
                  active === index ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {active === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                  }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-6 text-gray-600">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FAQ;