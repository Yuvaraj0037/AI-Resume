import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  CircleUserRound,
  FileCheck,
  FileText,
  Gavel,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

const EFFECTIVE_DATE = "27 July 2026";

const SUPPORT_EMAIL =
  import.meta.env.VITE_SUPPORT_EMAIL ||
  "privacy@replace-before-deployment.invalid";

const sections = [
  {
    icon: FileCheck,
    title: "Acceptance of these terms",
    paragraphs: [
      "By creating an account or using ResumeAI, you agree to these Terms of Service and the Privacy Policy.",
      "If you do not agree, you must not access or use ResumeAI.",
    ],
  },
  {
    icon: CircleUserRound,
    title: "Eligibility and accounts",
    paragraphs: [
      "You must be at least 18 years old to create and independently operate a ResumeAI account.",
      "You must provide accurate account information and keep your password secure.",
      "You are responsible for activity performed through your account. Contact us immediately if you suspect unauthorized access.",
      "You may not create accounts using another person’s identity or email address without authorization.",
    ],
  },
  {
    icon: Bot,
    title: "AI-generated information",
    paragraphs: [
      "ResumeAI uses artificial intelligence to generate ATS scores, resume suggestions, job matches, rewritten content and coaching responses.",
      "AI-generated results may be incomplete, outdated or inaccurate. They are recommendations, not professional, legal, financial or employment advice.",
      "ResumeAI does not guarantee interviews, employment, ATS acceptance, salary outcomes or recruiter decisions.",
      "You must review and verify every generated statement before adding it to a resume or submitting it to an employer.",
    ],
  },
  {
    icon: FileText,
    title: "Your content",
    paragraphs: [
      "You retain ownership of resume content, job descriptions, prompts and other material you submit.",
      "You grant ResumeAI a limited permission to store, process and transmit that content only as necessary to provide, secure and maintain the service.",
      "You are responsible for ensuring that submitted content is accurate and that you have permission to use it.",
      "You must not submit confidential information belonging to another person or organization without authorization.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Acceptable use",
    paragraphs: [
      "Do not use ResumeAI for unlawful, fraudulent, abusive or harmful activity.",
      "Do not upload malware, attempt unauthorized access, bypass usage limits, probe application security or interfere with other users.",
      "Do not use AI features to fabricate degrees, employment, projects, certifications, achievements or other qualifications.",
      "Do not copy, resell or commercially exploit the application or its protected components without written authorization.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Service availability",
    paragraphs: [
      "Features may become temporarily unavailable because of maintenance, network failures or third-party service limits.",
      "AI operations may be restricted when Gemini quotas or rate limits are reached.",
      "Features, templates and service limits may change as ResumeAI is developed.",
      "You are responsible for keeping your own copy of important resume information.",
    ],
  },
  {
    icon: Gavel,
    title: "Suspension and termination",
    paragraphs: [
      "Access may be suspended or terminated when an account violates these terms, threatens application security or is used for unlawful activity.",
      "You may stop using ResumeAI at any time and request account deletion through the support contact.",
      "Provisions concerning ownership, disclaimers, liability and disputes may continue after account termination where legally applicable.",
    ],
  },
];

function TermsOfService() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 pb-20 pt-28 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.header
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-10"
        >
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 transition hover:text-indigo-200"
            >
              <ArrowLeft size={18} />
              Back to ResumeAI
            </Link>

            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-950/40">
                <Gavel size={38} />
              </div>

              <div>
                <p className="font-semibold uppercase tracking-[0.22em] text-indigo-300">
                  Service agreement
                </p>

                <h1 className="mt-2 text-4xl font-black sm:text-5xl">
                  Terms of Service
                </h1>

                <p className="mt-3 text-slate-300">
                  Effective date: {EFFECTIVE_DATE}
                </p>
              </div>
            </div>

            <p className="mt-8 max-w-3xl text-base leading-7 text-slate-300">
              These terms govern your access to ResumeAI,
              including resume analysis, Resume Builder, job
              matching, resume comparison and AI Resume Coach.
            </p>
          </div>
        </motion.header>

        <div className="mt-8 space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;

            return (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{
                  once: true,
                  amount: 0.15,
                }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.04,
                }}
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

                    <div className="mt-4 space-y-3">
                      {section.paragraphs.map(
                        (paragraph) => (
                          <p
                            key={paragraph}
                            className="leading-7 text-slate-300"
                          >
                            {paragraph}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </motion.section>
            );
          })}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:p-8"
        >
          <h2 className="text-2xl font-bold">
            Third-party services
          </h2>

          <p className="mt-4 leading-7 text-slate-300">
            ResumeAI depends on services such as Google Gemini,
            Google OAuth, MongoDB Atlas, Brevo and deployment
            providers. Their availability and processing are also
            governed by their own terms and policies.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:p-8"
        >
          <h2 className="text-2xl font-bold">
            Disclaimer and liability
          </h2>

          <div className="mt-4 space-y-3 leading-7 text-slate-300">
            <p>
              ResumeAI is provided on an “as available” basis.
              The service does not guarantee that every feature
              will be uninterrupted, error-free or suitable for
              every employment process.
            </p>

            <p>
              To the extent permitted by applicable law,
              ResumeAI is not responsible for employment
              decisions, lost opportunities or losses caused by
              relying exclusively on AI-generated content.
            </p>

            <p>
              Nothing in these terms excludes rights or
              liabilities that cannot legally be excluded.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:p-8"
        >
          <h2 className="text-2xl font-bold">
            Governing law
          </h2>

          <p className="mt-4 leading-7 text-slate-300">
            These terms are governed by the laws of India,
            subject to any mandatory consumer or data-protection
            rights that apply to you. The exact legal entity and
            dispute jurisdiction must be added before commercial
            deployment.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
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
                Contact
              </h2>

              <p className="mt-4 leading-7 text-slate-300">
                Contact us with questions about these terms,
                account access or data deletion.
              </p>

              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="mt-4 inline-block break-all font-semibold text-indigo-300 transition hover:text-indigo-200"
              >
                {SUPPORT_EMAIL}
              </a>
            </div>
          </div>
        </motion.section>

        <p className="mt-8 text-center text-sm leading-6 text-slate-500">
          This is a practical baseline, not legal advice. Have
          the final policy reviewed before public commercial
          deployment.
        </p>
      </div>
    </main>
  );
}

export default TermsOfService;