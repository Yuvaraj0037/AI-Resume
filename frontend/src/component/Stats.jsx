function Stats() {
  return (
    <section className="py-24 bg-indigo-600 text-white">
      <div className="max-w-7xl mx-auto px-8">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          <div className="bg-white/10 p-8 rounded-xl">
            <h3 className="text-5xl font-bold">5000+</h3>
            <p>Resumes Analyzed</p>
          </div>

          <div className="bg-white/10 p-8 rounded-xl">
            <h3 className="text-5xl font-bold">95%</h3>
            <p>ATS Accuracy</p>
          </div>

          <div className="bg-white/10 p-8 rounded-xl">
            <h3 className="text-5xl font-bold">1200+</h3>
            <p>Students Helped</p>
          </div>

          <div className="bg-white/10 p-8 rounded-xl">
            <h3 className="text-5xl font-bold">25+</h3>
            <p>Job Roles</p>
          </div>

        </div>

      </div>
    </section>
  );
}

export default Stats;