import { Link } from "react-router-dom";

function CTA() {
  return (
    <section className="py-24 bg-indigo-600 text-white">

      <div className="max-w-5xl mx-auto text-center px-8">

        <h2 className="text-5xl font-bold">
          Ready to Improve Your Resume?
        </h2>

        <p className="mt-6 text-xl text-indigo-100">
          Upload your resume and receive AI-powered feedback,
          ATS scoring and job matching in seconds.
        </p>

        <Link to="/upload">

          <button className="mt-10 bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold hover:scale-105 transition">

            Analyze Resume

          </button>

        </Link>

      </div>

    </section>
  );
}

export default CTA;