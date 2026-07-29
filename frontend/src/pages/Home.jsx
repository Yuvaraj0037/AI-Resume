import Navbar from "../component/Navbar";
import Hero from "../component/Hero";
import AIAssistant from "../component/AIAssistant";
import Features from "../component/Features";
import HowItWorks from "../component/HowItWorks";
import AnalysisPreview from "../component/AnalysisPreview";
import Stats from "../component/Stats";
import Testimonials from "../component/Testimonials";
import FAQ from "../component/FAQ";
import CTA from "../component/CTA";
import Footer from "../component/Footer";
function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <AIAssistant />
      <Features />
      <HowItWorks />
      <AnalysisPreview />
      <Stats />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}

export default Home;