import { useCallback, useEffect, useRef, useState } from "react";

import {
  ArrowLeft,
  Check,
  Download,
  Eye,
  FileText,
  Loader2,
  Save,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

import DashboardLayout from "../component/DashboardLayout";
import OptionalSectionsEditor from "../component/builder/OptionalSectionsEditor";
import { useAppearance } from "../context/AppearanceContext";

import {
  getBuilderResumeById,
  rewriteResumeSection,
  updateBuilderResume,
} from "../services/resumeBuilderApi";

const BUILDER_MODE_CLASSES = {
  light:
    "bg-gradient-to-br from-slate-50 via-indigo-50 to-white text-slate-950 [&_.resume-builder-toolbar]:border-indigo-100 [&_.resume-builder-toolbar]:bg-white/95 [&_.resume-builder-toolbar]:text-slate-950 [&_.resume-builder-modal]:border-indigo-100 [&_.resume-builder-modal]:bg-white [&_.resume-builder-modal]:text-slate-950 [&_.builder-main-heading]:text-slate-950 [&_#resume-builder-controls_section]:border-indigo-100 [&_#resume-builder-controls_section]:bg-white/90 [&_#resume-builder-controls_section]:text-slate-950 [&_#resume-builder-controls_h2]:text-slate-950 [&_#resume-builder-controls_h3]:text-slate-950 [&_#resume-builder-controls_label]:text-slate-700 [&_#resume-builder-controls_label_span]:text-slate-700 [&_#resume-builder-controls_p]:text-slate-600 [&_#resume-builder-controls_input]:border-indigo-100 [&_#resume-builder-controls_input]:bg-slate-50 [&_#resume-builder-controls_input]:text-slate-950 [&_#resume-builder-controls_textarea]:border-indigo-100 [&_#resume-builder-controls_textarea]:bg-slate-50 [&_#resume-builder-controls_textarea]:text-slate-950 [&_#resume-builder-controls_.text-slate-300]:text-slate-700 [&_#resume-builder-controls_.text-slate-400]:text-slate-600 [&_#resume-builder-controls_.text-slate-500]:text-slate-500",

  dark: "bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white [&_.resume-builder-toolbar]:border-white/10 [&_.resume-builder-toolbar]:bg-slate-950/90 [&_.resume-builder-toolbar]:text-white [&_.resume-builder-modal]:border-white/10 [&_.resume-builder-modal]:bg-slate-950 [&_.resume-builder-modal]:text-white [&_.builder-main-heading]:text-white",

  sleep:
    "bg-gradient-to-br from-[#17130c] via-[#292014] to-[#17130c] text-orange-50 [&_.resume-builder-toolbar]:border-amber-400/10 [&_.resume-builder-toolbar]:bg-[#1d1a12]/95 [&_.resume-builder-toolbar]:text-orange-50 [&_.resume-builder-modal]:border-amber-400/10 [&_.resume-builder-modal]:bg-[#1d1a12] [&_.resume-builder-modal]:text-orange-50 [&_.builder-main-heading]:text-orange-50 [&_#resume-builder-controls_section]:border-amber-400/10 [&_#resume-builder-controls_section]:bg-[#302819]/80 [&_#resume-builder-controls_section]:text-orange-50 [&_#resume-builder-controls_input]:border-amber-400/10 [&_#resume-builder-controls_input]:bg-[#14110c]/80 [&_#resume-builder-controls_input]:text-orange-50 [&_#resume-builder-controls_textarea]:border-amber-400/10 [&_#resume-builder-controls_textarea]:bg-[#14110c]/80 [&_#resume-builder-controls_textarea]:text-orange-50 [&_#resume-builder-controls_.text-slate-300]:text-stone-200 [&_#resume-builder-controls_.text-slate-400]:text-stone-300 [&_#resume-builder-controls_.text-slate-500]:text-stone-400",
};

const TEMPLATE_OPTIONS = [
  {
    value: "ats-classic",
    label: "ATS Classic",
    description: "Simple single-column ATS design",
  },
  {
    value: "modern-professional",
    label: "Modern Professional",
    description: "Clean professional presentation",
  },
  {
    value: "student-tech",
    label: "Student Tech",
    description: "Projects and technical skills focused",
  },
];

const EMPTY_PERSONAL = {
  name: "",
  email: "",
  phone: "",
  location: "",
  jobTitle: "",
  linkedin: "",
  github: "",
  portfolio: "",
  links: [],
};

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </span>

      <input
        type={type}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
      />
    </label>
  );
}

function ResumePreview({ resume, printable = false }) {
  const personal = resume.personal || EMPTY_PERSONAL;

  const skills = Array.isArray(resume.skills) ? resume.skills : [];

  const experiences = (resume.experience || []).filter(
    (item) => item.role || item.company || item.description,
  );

  const projects = (resume.projects || []).filter(
    (item) => item.name || item.description || item.technologies?.length,
  );

  const education = (resume.education || []).filter(
    (item) => item.institution || item.degree || item.fieldOfStudy,
  );

  const certifications = (resume.certifications || []).filter(
    (item) => item.name || item.issuer,
  );

  const codingProfiles = (personal.links || []).filter(
    (item) => item.label && item.url,
  );

  const isModern = resume.template === "modern-professional";

  const isStudent = resume.template === "student-tech";

  return (
    <div
      id={printable ? "resume-print-area" : undefined}
      className={`mx-auto overflow-hidden bg-white text-slate-900 ${
        printable
          ? "min-h-[297mm] w-[210mm] max-w-none shadow-none"
          : "min-h-[900px] w-full max-w-[760px] shadow-2xl"
      } ${isModern ? "border-t-[12px] border-indigo-700" : ""}`}
    >
      <header
        className={`p-8 ${
          isStudent
            ? "bg-slate-900 text-white"
            : isModern
              ? "bg-indigo-50"
              : "border-b-2 border-slate-900"
        }`}
      >
        <h1 className="text-3xl font-black tracking-tight">
          {personal.name || "Your Name"}
        </h1>

        <p
          className={`mt-2 text-lg font-semibold ${
            isStudent ? "text-indigo-300" : "text-indigo-700"
          }`}
        >
          {personal.jobTitle || "Professional Title"}
        </p>

        <div
          className={`mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm ${
            isStudent ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {personal.email && <span>{personal.email}</span>}

          {personal.phone && <span>{personal.phone}</span>}

          {personal.location && <span>{personal.location}</span>}

          {personal.linkedin && <span>LinkedIn</span>}

          {personal.github && <span>GitHub</span>}

          {personal.portfolio && <span>Portfolio</span>}

          {codingProfiles.map((profile, index) => (
            <span key={profile._id || `${profile.label}-${index}`}>
              {profile.label}
            </span>
          ))}
        </div>
      </header>

      <main className="space-y-7 p-8">
        {resume.summary && (
          <section>
            <h2 className="border-b border-slate-300 pb-2 text-sm font-black uppercase tracking-[0.18em] text-indigo-700">
              Professional Summary
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-700">
              {resume.summary}
            </p>
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <h2 className="border-b border-slate-300 pb-2 text-sm font-black uppercase tracking-[0.18em] text-indigo-700">
              Skills
            </h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className={
                    resume.template === "ats-classic"
                      ? "text-sm text-slate-700"
                      : "rounded-md bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-800"
                  }
                >
                  {skill}
                  {resume.template === "ats-classic" &&
                  index < skills.length - 1
                    ? " • "
                    : ""}
                </span>
              ))}
            </div>
          </section>
        )}

        {experiences.length > 0 && (
          <section>
            <h2 className="border-b border-slate-300 pb-2 text-sm font-black uppercase tracking-[0.18em] text-indigo-700">
              Experience
            </h2>

            <div className="mt-4 space-y-5">
              {experiences.map((item, index) => (
                <div key={item._id || `experience-preview-${index}`}>
                  <div className="flex justify-between gap-4">
                    <div>
                      <h3 className="font-bold">{item.role}</h3>

                      <p className="text-sm font-semibold text-indigo-700">
                        {item.company}
                      </p>
                    </div>

                    <p className="text-xs text-slate-500">
                      {item.startDate} {item.startDate && "–"}{" "}
                      {item.current ? "Present" : item.endDate}
                    </p>
                  </div>

                  {item.description && (
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {item.description}
                    </p>
                  )}

                  {item.bulletPoints?.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
                      {item.bulletPoints.map((bullet, bulletIndex) => (
                        <li key={`${bullet}-${bulletIndex}`}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <h2 className="border-b border-slate-300 pb-2 text-sm font-black uppercase tracking-[0.18em] text-indigo-700">
              Projects
            </h2>

            <div className="mt-4 space-y-5">
              {projects.map((project, index) => (
                <div key={project._id || `project-preview-${index}`}>
                  <h3 className="font-bold">{project.name}</h3>

                  {project.technologies?.length > 0 && (
                    <p className="mt-1 text-xs font-semibold text-indigo-700">
                      {project.technologies.join(" • ")}
                    </p>
                  )}

                  {project.description && (
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {project.description}
                    </p>
                  )}

                  {project.bulletPoints?.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
                      {project.bulletPoints.map((bullet, bulletIndex) => (
                        <li key={`${bullet}-${bulletIndex}`}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section>
            <h2 className="border-b border-slate-300 pb-2 text-sm font-black uppercase tracking-[0.18em] text-indigo-700">
              Education
            </h2>

            <div className="mt-4 space-y-4">
              {education.map((item, index) => (
                <div
                  key={item._id || `education-preview-${index}`}
                  className="flex justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold">
                      {item.degree}{" "}
                      {item.fieldOfStudy && `– ${item.fieldOfStudy}`}
                    </h3>

                    <p className="text-sm text-slate-700">{item.institution}</p>

                    {item.grade && (
                      <p className="text-xs text-slate-500">{item.grade}</p>
                    )}
                  </div>

                  <p className="text-xs text-slate-500">
                    {item.startDate} {item.startDate && "–"}{" "}
                    {item.current ? "Present" : item.endDate}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {certifications.length > 0 && (
          <section>
            <h2 className="border-b border-slate-300 pb-2 text-sm font-black uppercase tracking-[0.18em] text-indigo-700">
              Certifications
            </h2>

            <div className="mt-4 space-y-3">
              {certifications.map((item, index) => (
                <div
                  key={item._id || `certification-preview-${index}`}
                  className="flex justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold">{item.name}</h3>

                    {item.issuer && (
                      <p className="text-sm text-slate-700">{item.issuer}</p>
                    )}
                  </div>

                  {item.date && (
                    <p className="text-xs text-slate-500">{item.date}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function ResumeBuilderEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, sleepMode } = useAppearance();

  const appearanceMode = sleepMode
    ? "sleep"
    : theme === "dark"
      ? "dark"
      : "light";

  const autosaveTimer = useRef(null);
  const loadedRef = useRef(false);

  const [resume, setResume] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [dirty, setDirty] = useState(false);

  const [saveStatus, setSaveStatus] = useState("Saved");

  const [improving, setImproving] = useState(false);

  const [suggestion, setSuggestion] = useState(null);

  const [previewExpanded, setPreviewExpanded] = useState(false);

  const [previewPinned, setPreviewPinned] = useState(false);

  const loadResume = useCallback(async () => {
    try {
      setLoading(true);

      const result = await getBuilderResumeById(id);

      const loadedResume = result.resume || result;

      setResume({
        ...loadedResume,

        personal: {
          ...EMPTY_PERSONAL,
          ...(loadedResume.personal || {}),
        },

        skills: Array.isArray(loadedResume.skills) ? loadedResume.skills : [],
      });

      loadedRef.current = true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load resume");

      navigate("/resume-builder");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadResume();
  }, [loadResume]);

  const changeResume = (field, value) => {
    setResume((current) => ({
      ...current,
      [field]: value,
    }));

    setDirty(true);
    setSaveStatus("Unsaved changes");
  };

  const changePersonal = (field, value) => {
    setResume((current) => ({
      ...current,

      personal: {
        ...current.personal,
        [field]: value,
      },
    }));

    setDirty(true);
    setSaveStatus("Unsaved changes");
  };

  const saveResume = useCallback(
    async ({ showSuccessToast = false } = {}) => {
      if (!resume || !loadedRef.current) {
        return false;
      }

      try {
        clearTimeout(autosaveTimer.current);

        setSaving(true);
        setSaveStatus("Saving...");

        const result = await updateBuilderResume(id, {
          title: resume.title,
          template: resume.template,
          personal: resume.personal,
          summary: resume.summary,
          skills: resume.skills,
          education: resume.education || [],
          experience: resume.experience || [],
          projects: resume.projects || [],
          certifications: resume.certifications || [],
          achievements: resume.achievements || [],
          languages: resume.languages || [],
          sectionOrder: resume.sectionOrder,
          targetJobDescription: resume.targetJobDescription || "",
        });

        const savedResume = result.resume || result;

        setResume((current) => ({
          ...current,
          updatedAt: savedResume.updatedAt || current.updatedAt,
        }));

        setDirty(false);
        setSaveStatus("Saved");

        if (showSuccessToast) {
          toast.success("Resume saved successfully");
        }

        return true;
      } catch (error) {
        setSaveStatus("Save failed");

        toast.error(error.response?.data?.message || "Unable to save resume");

        return false;
      } finally {
        setSaving(false);
      }
    },
    [id, resume],
  );

  useEffect(() => {
    if (!dirty || !loadedRef.current) {
      return undefined;
    }

    setSaveStatus("Saving soon...");

    clearTimeout(autosaveTimer.current);

    autosaveTimer.current = setTimeout(() => {
      saveResume();
    }, 1200);

    return () => {
      clearTimeout(autosaveTimer.current);
    };
  }, [dirty, resume, saveResume]);

  const handleSkillsChange = (value) => {
    const skills = value
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    changeResume("skills", skills);
  };

  const handleImproveSummary = async () => {
    if (!resume.summary || resume.summary.trim().length < 10) {
      toast.error("Enter a summary before using AI improvement");

      return;
    }

    try {
      setImproving(true);

      const result = await rewriteResumeSection(id, {
        section: "summary",
        content: resume.summary,

        targetJobDescription: resume.targetJobDescription || "",
      });

      setSuggestion(result);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to improve summary",
      );
    } finally {
      setImproving(false);
    }
  };

  const applySuggestion = () => {
    if (!suggestion?.rewrittenContent) {
      return;
    }

    changeResume("summary", suggestion.rewrittenContent);

    setSuggestion(null);

    toast.success("AI suggestion applied");
  };

  const handlePrintResume = () => {
    if (dirty) {
      toast("Save the latest changes before exporting");
      return;
    }

    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[75vh] items-center justify-center rounded-3xl bg-slate-950">
          <div className="text-center text-white">
            <Loader2
              size={46}
              className="mx-auto animate-spin text-indigo-400"
            />

            <p className="mt-4">Opening Resume Builder...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!resume) {
    return null;
  }

  return (
    <DashboardLayout>
      <div
        data-builder-mode={appearanceMode}
        className={`resume-builder-workspace relative isolate min-h-screen overflow-hidden rounded-3xl p-4 transition-colors duration-500 print:hidden sm:p-6 ${BUILDER_MODE_CLASSES[appearanceMode]}`}
      >
        <motion.div
          aria-hidden="true"
          animate={{
            x: [0, 70, -25, 0],
            y: [0, 35, 90, 0],
            scale: [1, 1.15, 0.92, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -left-24 top-20 -z-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl"
        />

        <motion.div
          aria-hidden="true"
          animate={{
            x: [0, -80, 20, 0],
            y: [0, 100, 35, 0],
            scale: [0.9, 1.12, 1, 0.9],
          }}
          transition={{
            duration: 19,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -right-24 top-1/3 -z-10 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl"
        />

        <motion.header
          initial={{
            opacity: 0,
            y: -30,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            type: "spring",
            stiffness: 145,
            damping: 18,
          }}
          className="resume-builder-toolbar sticky top-0 z-30 mb-6 flex flex-col justify-between gap-4 rounded-2xl border p-4 shadow-xl backdrop-blur-xl lg:flex-row lg:items-center"
        >
          <div className="flex items-center gap-4">
            <motion.button
              type="button"
              onClick={() => navigate("/resume-builder")}
              whileHover={{
                x: -4,
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.9,
              }}
              className="rounded-xl bg-white/10 p-3 hover:bg-white/20"
            >
              <ArrowLeft size={20} />
            </motion.button>

            <div>
              <h1 className="text-xl font-bold">Resume Editor</h1>

              <motion.p
                key={saveStatus}
                initial={{
                  opacity: 0,
                  y: -5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.2,
                }}
                className={`mt-1 text-sm ${
                  saveStatus === "Save failed"
                    ? "text-red-300"
                    : saveStatus === "Saved"
                      ? "text-emerald-300"
                      : "text-amber-300"
                }`}
              >
                {saving && (
                  <Loader2 size={14} className="mr-2 inline animate-spin" />
                )}

                {saveStatus}
              </motion.p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <motion.button
              type="button"
              onClick={handlePrintResume}
              disabled={dirty || saving}
              whileHover={{
                y: -3,
                scale: 1.025,
              }}
              whileTap={{
                scale: 0.96,
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 font-semibold hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={18} />
              Export PDF
            </motion.button>

            <motion.button
              type="button"
              onClick={() =>
                saveResume({
                  showSuccessToast: true,
                })
              }
              disabled={saving}
              whileHover={{
                y: -3,
                scale: 1.025,
                boxShadow: "0 14px 34px rgba(79,70,229,0.34)",
              }}
              whileTap={{
                scale: 0.96,
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : saveStatus === "Saved" ? (
                <Check size={18} />
              ) : (
                <Save size={18} />
              )}
              Save Resume
            </motion.button>
          </div>
        </motion.header>

        <motion.div
          initial={{
            opacity: 0,
            y: 34,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.65,
            delay: 0.12,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative z-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_88px]"
        >
          <motion.div id="resume-builder-controls" className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
              <div className="mb-6 flex items-center gap-3">
                <FileText className="text-indigo-300" />

                <h2 className="text-xl font-bold">Resume Setup</h2>
              </div>

              <div className="space-y-5">
                <FormInput
                  label="Resume title"
                  value={resume.title}
                  onChange={(value) => changeResume("title", value)}
                  placeholder="Frontend Developer Resume"
                />

                <div>
                  <p className="mb-3 text-sm font-semibold text-slate-300">
                    Template
                  </p>

                  <div className="grid gap-3 md:grid-cols-3">
                    {TEMPLATE_OPTIONS.map((template) => (
                      <button
                        key={template.value}
                        type="button"
                        onClick={() => changeResume("template", template.value)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          resume.template === template.value
                            ? "border-indigo-400 bg-indigo-500/20"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <p className="font-bold">{template.label}</p>

                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          {template.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
              <h2 className="mb-6 text-xl font-bold">Personal Information</h2>

              <div className="grid gap-5 md:grid-cols-2">
                <FormInput
                  label="Full name"
                  value={resume.personal.name}
                  onChange={(value) => changePersonal("name", value)}
                />

                <FormInput
                  label="Professional title"
                  value={resume.personal.jobTitle}
                  onChange={(value) => changePersonal("jobTitle", value)}
                />

                <FormInput
                  label="Email"
                  type="email"
                  value={resume.personal.email}
                  onChange={(value) => changePersonal("email", value)}
                />

                <FormInput
                  label="Phone"
                  value={resume.personal.phone}
                  onChange={(value) => changePersonal("phone", value)}
                />

                <FormInput
                  label="Location"
                  value={resume.personal.location}
                  onChange={(value) => changePersonal("location", value)}
                />

                <FormInput
                  label="LinkedIn URL"
                  value={resume.personal.linkedin}
                  onChange={(value) => changePersonal("linkedin", value)}
                />

                <FormInput
                  label="GitHub URL"
                  value={resume.personal.github}
                  onChange={(value) => changePersonal("github", value)}
                />

                <FormInput
                  label="Portfolio URL"
                  value={resume.personal.portfolio}
                  onChange={(value) => changePersonal("portfolio", value)}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold">Professional Summary</h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Describe your strongest relevant qualifications.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleImproveSummary}
                  disabled={improving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 font-semibold hover:bg-purple-500 disabled:opacity-60"
                >
                  {improving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <WandSparkles size={18} />
                  )}
                  Improve with AI
                </button>
              </div>

              <textarea
                value={resume.summary || ""}
                onChange={(event) =>
                  changeResume("summary", event.target.value)
                }
                rows={7}
                maxLength={3000}
                placeholder="Write your professional summary..."
                className="mt-5 w-full resize-y rounded-2xl border border-white/10 bg-white/10 p-4 leading-7 text-white outline-none placeholder:text-slate-500 focus:border-indigo-400"
              />

              <p className="mt-2 text-right text-xs text-slate-400">
                {(resume.summary || "").length}
                /3000
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-bold">Skills</h2>

              <p className="mt-2 text-sm text-slate-400">
                Separate skills using commas.
              </p>

              <textarea
                value={resume.skills.join(", ")}
                onChange={(event) => handleSkillsChange(event.target.value)}
                rows={4}
                placeholder="React, JavaScript, Node.js, MongoDB"
                className="mt-5 w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none placeholder:text-slate-500 focus:border-indigo-400"
              />
            </section>

            <OptionalSectionsEditor
              resume={resume}
              onChange={changeResume}
              onLinksChange={(links) => changePersonal("links", links)}
            />

            <section className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <Sparkles className="text-indigo-300" />

                <h2 className="text-xl font-bold">Target Job Description</h2>
              </div>

              <p className="mt-2 text-sm text-slate-400">
                AI suggestions will use this description without inventing
                unsupported experience.
              </p>

              <textarea
                value={resume.targetJobDescription || ""}
                onChange={(event) =>
                  changeResume("targetJobDescription", event.target.value)
                }
                rows={8}
                maxLength={15000}
                placeholder="Paste the target job description..."
                className="mt-5 w-full rounded-2xl border border-white/10 bg-white/10 p-4 leading-7 text-white outline-none placeholder:text-slate-500 focus:border-indigo-400"
              />
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-bold">Resume References</h2>

              <p className="mt-2 text-sm text-slate-400">
                Use these tools for design inspiration. Do not copy template
                content or add information that is not true.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <a
                  href="https://www.overleaf.com/gallery/tagged/cv"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-emerald-400/40 hover:bg-white/10"
                >
                  <h3 className="font-bold text-emerald-300">
                    Overleaf Gallery
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Browse LaTeX CV and resume designs.
                  </p>
                </a>

                <a
                  href="https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-indigo-400/40 hover:bg-white/10"
                >
                  <h3 className="font-bold text-indigo-300">
                    Jake&apos;s Resume
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Simple technical single-column reference.
                  </p>
                </a>

                <a
                  href="https://www.overleaf.com/latex/templates/awesome-cv/dfnvtnhzhhbm"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-purple-400/40 hover:bg-white/10"
                >
                  <h3 className="font-bold text-purple-300">Awesome CV</h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Modern customizable CV reference.
                  </p>
                </a>
              </div>
            </section>
          </motion.div>

          <motion.aside
            initial={{
              opacity: 0,
              x: 55,
              rotateY: -4,
            }}
            animate={{
              opacity: 1,
              x: 0,
              rotateY: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 95,
              damping: 17,
              delay: 0.25,
            }}
            onMouseEnter={() => setPreviewExpanded(true)}
            onMouseLeave={() => {
              if (!previewPinned) {
                setPreviewExpanded(false);
              }
            }}
            className="relative min-h-[620px] xl:sticky xl:top-28 xl:h-[calc(100vh-130px)] xl:min-h-0 xl:self-start"
          >
            <motion.div
              layout
              initial={false}
              animate={{
                width: previewExpanded ? 560 : 88,
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 28,
              }}
              style={{
                maxWidth: "calc(100vw - 2rem)",
              }}
              className="absolute right-0 top-0 z-40 h-full overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-indigo-950/40 backdrop-blur-2xl"
            >
              <button
                type="button"
                onClick={() => {
                  const nextPinned = !previewPinned;

                  setPreviewPinned(nextPinned);

                  setPreviewExpanded(nextPinned);
                }}
                className={`flex h-20 w-full items-center border-b border-white/10 px-5 text-left text-white transition hover:bg-white/10 ${
                  previewExpanded ? "justify-between" : "justify-center"
                }`}
                title={
                  previewPinned
                    ? "Close live preview"
                    : "Keep live preview open"
                }
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300">
                    <Eye size={22} />
                  </span>

                  <AnimatePresence>
                    {previewExpanded && (
                      <motion.span
                        initial={{
                          opacity: 0,
                          x: 12,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        exit={{
                          opacity: 0,
                          x: 12,
                        }}
                        className="whitespace-nowrap text-lg font-black"
                      >
                        Live Preview
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>

                {previewExpanded && (
                  <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200">
                    {resume.template}
                  </span>
                )}
              </button>

              {!previewExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-[calc(100%_-_5rem)] flex-col items-center justify-center gap-4 text-indigo-200"
                >
                  <span
                    className="whitespace-nowrap text-sm font-bold uppercase tracking-[0.28em]"
                    style={{
                      writingMode: "vertical-rl",
                    }}
                  >
                    Live Preview
                  </span>

                  <span className="h-12 w-px bg-gradient-to-b from-indigo-400 to-transparent" />
                </motion.div>
              )}

              <AnimatePresence>
                {previewExpanded && (
                  <motion.div
                    key="expanded-preview"
                    initial={{
                      opacity: 0,
                      x: 28,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: 28,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                    className="h-[calc(100%_-_5rem)] overflow-y-auto bg-slate-900/70 p-4"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={resume.template}
                        initial={{
                          opacity: 0,
                          scale: 0.98,
                          filter: "blur(3px)",
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          filter: "blur(0px)",
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.98,
                        }}
                        transition={{
                          duration: 0.3,
                        }}
                      >
                        <ResumePreview resume={resume} />
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.aside>
        </motion.div>

        {suggestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.94,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="resume-builder-modal max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl border p-6 shadow-2xl sm:p-8"
            >
              <div className="flex justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">AI Summary Suggestion</h2>

                  <p className="mt-2 text-slate-400">Review before applying.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setSuggestion(null)}
                  className="rounded-xl bg-white/10 p-3 hover:bg-white/20"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    Original
                  </p>

                  <p className="mt-4 leading-7 text-slate-300">
                    {suggestion.originalContent}
                  </p>
                </div>

                <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-5">
                  <p className="text-sm font-bold uppercase tracking-wider text-indigo-300">
                    Improved
                  </p>

                  <p className="mt-4 leading-7 text-white">
                    {suggestion.rewrittenContent}
                  </p>
                </div>
              </div>

              {suggestion.improvements?.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold">Improvements</h3>

                  <ul className="mt-3 space-y-2 text-slate-300">
                    {suggestion.improvements.map((item, index) => (
                      <li key={`${item}-${index}`} className="flex gap-2">
                        <Check
                          size={18}
                          className="mt-1 shrink-0 text-emerald-400"
                        />

                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setSuggestion(null)}
                  className="rounded-xl bg-white/10 px-6 py-3 font-semibold hover:bg-white/20"
                >
                  Keep Original
                </button>

                <button
                  type="button"
                  onClick={applySuggestion}
                  className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500"
                >
                  Apply Improved Summary
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <div className="fixed inset-0 z-[9999] hidden min-h-screen overflow-visible bg-white print:block">
        <ResumePreview resume={resume} printable />
      </div>
    </DashboardLayout>
  );
}

export default ResumeBuilderEditor;