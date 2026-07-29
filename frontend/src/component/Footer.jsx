import {
  FaEnvelope,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";
import { Link } from "react-router-dom";

function Footer() {
  const supportEmail =
    import.meta.env.VITE_SUPPORT_EMAIL ||
    "privacy@replace-before-deployment.invalid";

  return (
    <footer className="border-t border-white/10 bg-gray-900 py-16 text-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="inline-block text-3xl font-black transition hover:text-indigo-300"
            >
              ResumeAI
            </Link>

            <p className="mt-4 max-w-sm leading-7 text-gray-400">
              AI-powered resume analysis, ATS scoring,
              resume building and career coaching using
              Gemini AI.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 text-lg font-bold">
              Quick Links
            </h3>

            <nav className="flex flex-col items-start gap-3">
              <Link
                to="/"
                className="text-gray-400 transition hover:text-indigo-300"
              >
                Home
              </Link>

              <Link
                to="/#features"
                className="text-gray-400 transition hover:text-indigo-300"
              >
                Features
              </Link>

              <Link
                to="/dashboard"
                className="text-gray-400 transition hover:text-indigo-300"
              >
                Dashboard
              </Link>

              <Link
                to="/privacy"
                className="text-gray-400 transition hover:text-indigo-300"
              >
                Privacy Policy
              </Link>

              <Link
                to="/terms"
                className="text-gray-400 transition hover:text-indigo-300"
              >
                Terms of Service
              </Link>
            </nav>
          </div>

          {/* Social links */}
          <div>
            <h3 className="mb-4 text-lg font-bold">
              Connect
            </h3>

            <div className="flex gap-5 text-2xl">
              <a
                href="https://github.com/replace-with-your-username"
                target="_blank"
                rel="noreferrer"
                aria-label="ResumeAI GitHub"
                className="text-gray-400 transition hover:-translate-y-1 hover:text-indigo-400"
              >
                <FaGithub />
              </a>

              <a
                href="https://www.linkedin.com/in/replace-with-your-profile"
                target="_blank"
                rel="noreferrer"
                aria-label="ResumeAI LinkedIn"
                className="text-gray-400 transition hover:-translate-y-1 hover:text-indigo-400"
              >
                <FaLinkedin />
              </a>

              <a
                href={`mailto:${supportEmail}`}
                aria-label="Email ResumeAI support"
                className="text-gray-400 transition hover:-translate-y-1 hover:text-indigo-400"
              >
                <FaEnvelope />
              </a>
            </div>

            <p className="mt-4 break-all text-sm text-gray-500">
              {supportEmail}
            </p>
          </div>
        </div>

        <hr className="my-10 border-gray-700" />

        <div className="flex flex-col items-center justify-between gap-3 text-center text-sm text-gray-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} ResumeAI.
            All rights reserved.
          </p>

          <p>
            AI recommendations should be reviewed before use.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;