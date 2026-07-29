import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bot,
  Database,
  FileText,
  Lock,
  Mail,
  ShieldCheck,
  Trash2,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

const EFFECTIVE_DATE = "27 July 2026";

const SUPPORT_EMAIL =
  import.meta.env.VITE_SUPPORT_EMAIL ||
  "privacy@replace-before-deployment.invalid";

const sections = [
  {
    icon: FileText,
    title: "Information we collect",
    content: [
      "Account information such as your name, email address, authentication provider and account preferences.",
      "Resume information including uploaded resume text, education, experience, projects, skills, certifications and contact details contained in the resume.",
      "Information you enter into Resume Builder, Job Match, Resume Comparison and AI Resume Coach.",
      "Technical and security information needed to operate, protect and troubleshoot the service.",
    ],
  },
  {
    icon: UserCheck,
    title: "How we use your information",
    content: [
      "Create and secure your ResumeAI account.",
      "Analyze resumes and generate ATS scores, suggestions and job-match information.",
      "Save resume history, builder resumes, preferences and coach conversations.",
      "Send account-verification and security emails.",
      "Detect misuse, investigate errors and improve service reliability.",
    ],
  },
  {
    icon: Bot,
    title: "AI processing",
    content: [
      "Resume text, job descriptions and coach prompts may be sent to Google Gemini to generate requested analysis and recommendations.",
      "AI responses may be incomplete or inaccurate. You should review every recommendation before using it.",
      "Do not upload information that is unnecessary for resume analysis, such as government identification numbers, banking information or medical records.",
    ],
  },
  {
    icon: Database,
    title: "Service providers",
    content: [
      "ResumeAI may use MongoDB Atlas for data storage, Google Gemini for AI processing, Google OAuth for authentication and Brevo for verification emails.",
      "Hosting, monitoring and infrastructure providers may process limited data needed to operate and secure the application.",
      "These providers process information according to their respective terms and privacy practices.",
    ],
  },
  {
    icon: Trash2,
    title: "Storage and retention",
    content: [
      "Uploaded PDF files are temporary and are deleted from the application server after text extraction, including when analysis fails.",
      "Extracted resume text, analysis results, builder resumes and coach conversations remain stored so you can access application features.",
      "You may delete individual resume analyses and coach conversations through the application.",
      "You may contact us to request account correction, access or deletion. Some limited information may be retained where required for security, fraud prevention or legal compliance.",
    ],
  },
  {
    icon: Lock,
    title: "Security",
    content: [
      "Passwords are stored as secure hashes rather than readable passwords.",
      "The application uses authenticated API requests, access controls and reasonable technical safeguards.",
      "No internet service is completely secure. Protect your password and immediately report suspected unauthorized access.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Your privacy choices",
    content: [
      "You may access and update certain profile information inside the application.",
      "You may delete saved analyses and coach conversations using their delete controls.",
      "You may request a summary of your processed personal data, correction of inaccurate data, erasure or grievance handling by contacting us.",
      "Where processing depends on consent, you may withdraw consent, subject to processing already lawfully completed.",
    ],
  },
];

function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 pb-20 pt-28 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-10"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 transition hover:text-indigo-200"
          >
            <ArrowLeft size={18} />
            Back to ResumeAI
          </Link>

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-950/40">
              <ShieldCheck size={38} />
            </div>

            <div>
              <p className="font-semibold uppercase tracking-[0.22em] text-indigo-300">
                Privacy and data protection
              </p>

              <h1 className="mt-2 text-4xl font-black sm:text-5xl">
                Privacy Policy
              </h1>

              <p className="mt-3 text-slate-300">
                Effective date: {EFFECTIVE_DATE}
              </p>
            </div>
          </div>

          <div className="mt-9 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-5 text-slate-200">
            ResumeAI processes personal information to provide resume
            analysis, resume building, job matching and AI coaching.
            This policy explains what information is processed and the
            choices available to you.
          </div>
        </motion.div>

        <div className="mt-8 space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;

            return (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300">
                    <Icon size={24} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold">
                      {section.title}
                    </h2>

                    <ul className="mt-4 space-y-3 text-slate-300">
                      {section.content.map((item) => (
                        <li
                          key={item}
                          className="flex gap-3 leading-7"
                        >
                          <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.section>
            );
          })}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:p-8"
        >
          <h2 className="text-2xl font-bold">
            Children’s privacy
          </h2>

          <p className="mt-4 leading-7 text-slate-300">
            ResumeAI is not intended for people under 18. Do not create
            an account or submit personal information if you are under
            18 without the involvement and authorization of a parent or
            legal guardian.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:p-8"
        >
          <h2 className="text-2xl font-bold">
            International processing
          </h2>

          <p className="mt-4 leading-7 text-slate-300">
            Some service providers may process information outside your
            state or country. Where required, appropriate contractual
            and legal safeguards should be used for such processing.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:p-8"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">
              <Mail size={24} />
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                Contact and privacy requests
              </h2>

              <p className="mt-4 leading-7 text-slate-300">
                Contact us to request access, correction, deletion,
                consent withdrawal or grievance handling.
              </p>

              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="mt-4 inline-block break-all font-semibold text-indigo-300 hover:text-indigo-200"
              >
                {SUPPORT_EMAIL}
              </a>
            </div>
          </div>
        </motion.section>

        <p className="mt-8 text-center text-sm leading-6 text-slate-500">
          This page is a practical product-policy baseline and is not
          legal advice. Review it with a qualified professional before
          public commercial deployment.
        </p>
      </div>
    </main>
  );
}

export default PrivacyPolicy;