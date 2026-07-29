import {
  Award,
  BriefcaseBusiness,
  Code2,
  FolderGit2,
  GraduationCap,
  Plus,
  Trash2,
} from "lucide-react";

function Input({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </span>

      <input
        type={type}
        value={value || ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-indigo-400"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 4,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </span>

      <textarea
        value={value || ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-indigo-400"
      />
    </label>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
  buttonLabel,
  onAdd,
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-indigo-500/20 p-3 text-indigo-300">
          <Icon size={21} />
        </div>

        <div>
          <h2 className="text-xl font-bold">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold hover:bg-indigo-500"
      >
        <Plus size={18} />
        {buttonLabel}
      </button>
    </div>
  );
}

function EmptyState({
  message,
}) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-sm text-slate-400">
      {message}
    </div>
  );
}

function RemoveButton({
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 font-semibold text-red-300 hover:bg-red-500/20"
    >
      <Trash2 size={16} />
      Remove
    </button>
  );
}

function splitCommaList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitLineList(value) {
  return value
    .split("\n")
    .map((item) =>
      item
        .replace(/^[-•]\s*/, "")
        .trim()
    )
    .filter(Boolean);
}

function updateArrayItem(
  items,
  index,
  field,
  value
) {
  return items.map((item, itemIndex) =>
    itemIndex === index
      ? {
          ...item,
          [field]: value,
        }
      : item
  );
}

function OptionalSectionsEditor({
  resume,
  onChange,
  onLinksChange,
}) {
  const education =
    resume.education || [];

  const experiences =
    resume.experience || [];

  const projects =
    resume.projects || [];

  const certifications =
    resume.certifications || [];

  const codingProfiles =
    resume.personal?.links || [];

  const addEducation = () => {
    onChange("education", [
      ...education,
      {
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        current: false,
        grade: "",
        location: "",
        description: "",
      },
    ]);
  };

  const updateEducation = (
    index,
    field,
    value
  ) => {
    onChange(
      "education",
      updateArrayItem(
        education,
        index,
        field,
        value
      )
    );
  };

  const removeEducation = (index) => {
    onChange(
      "education",
      education.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const addExperience = () => {
    onChange("experience", [
      ...experiences,
      {
        company: "",
        role: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
        bulletPoints: [],
      },
    ]);
  };

  const updateExperience = (
    index,
    field,
    value
  ) => {
    onChange(
      "experience",
      updateArrayItem(
        experiences,
        index,
        field,
        value
      )
    );
  };

  const removeExperience = (
    index
  ) => {
    onChange(
      "experience",
      experiences.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const addProject = () => {
    onChange("projects", [
      ...projects,
      {
        name: "",
        role: "",
        technologies: [],
        startDate: "",
        endDate: "",
        description: "",
        bulletPoints: [],
        githubUrl: "",
        liveUrl: "",
      },
    ]);
  };

  const updateProject = (
    index,
    field,
    value
  ) => {
    onChange(
      "projects",
      updateArrayItem(
        projects,
        index,
        field,
        value
      )
    );
  };

  const removeProject = (index) => {
    onChange(
      "projects",
      projects.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const addCertification = () => {
    onChange("certifications", [
      ...certifications,
      {
        name: "",
        issuer: "",
        date: "",
        credentialUrl: "",
      },
    ]);
  };

  const updateCertification = (
    index,
    field,
    value
  ) => {
    onChange(
      "certifications",
      updateArrayItem(
        certifications,
        index,
        field,
        value
      )
    );
  };

  const removeCertification = (
    index
  ) => {
    onChange(
      "certifications",
      certifications.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const addCodingProfile = () => {
    onLinksChange([
      ...codingProfiles,
      {
        label: "",
        url: "",
      },
    ]);
  };

  const updateCodingProfile = (
    index,
    field,
    value
  ) => {
    onLinksChange(
      updateArrayItem(
        codingProfiles,
        index,
        field,
        value
      )
    );
  };

  const removeCodingProfile = (
    index
  ) => {
    onLinksChange(
      codingProfiles.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
        <SectionHeader
          icon={GraduationCap}
          title="Education"
          description="Add college, university, diploma and higher-secondary education."
          buttonLabel="Add Education"
          onAdd={addEducation}
        />

        {education.length === 0 ? (
          <EmptyState message="No education added. Add your most recent qualification first." />
        ) : (
          <div className="mt-6 space-y-5">
            {education.map(
              (item, index) => (
                <div
                  key={
                    item._id ||
                    `education-${index}`
                  }
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Institution"
                      value={
                        item.institution
                      }
                      onChange={(value) =>
                        updateEducation(
                          index,
                          "institution",
                          value
                        )
                      }
                      placeholder="Madras Institute of Technology, Anna University"
                    />

                    <Input
                      label="Qualification"
                      value={item.degree}
                      onChange={(value) =>
                        updateEducation(
                          index,
                          "degree",
                          value
                        )
                      }
                      placeholder="B.Tech"
                    />

                    <Input
                      label="Field of study"
                      value={
                        item.fieldOfStudy
                      }
                      onChange={(value) =>
                        updateEducation(
                          index,
                          "fieldOfStudy",
                          value
                        )
                      }
                      placeholder="Artificial Intelligence and Data Science"
                    />

                    <Input
                      label="Grade / CGPA / Percentage"
                      value={item.grade}
                      onChange={(value) =>
                        updateEducation(
                          index,
                          "grade",
                          value
                        )
                      }
                      placeholder="CGPA: 6.55/10 or 90.67%"
                    />

                    <Input
                      label="Start year"
                      value={
                        item.startDate
                      }
                      onChange={(value) =>
                        updateEducation(
                          index,
                          "startDate",
                          value
                        )
                      }
                      placeholder="2023"
                    />

                    <Input
                      label="End year"
                      value={item.endDate}
                      onChange={(value) =>
                        updateEducation(
                          index,
                          "endDate",
                          value
                        )
                      }
                      placeholder="2027"
                    />

                    <Input
                      label="Location"
                      value={item.location}
                      onChange={(value) =>
                        updateEducation(
                          index,
                          "location",
                          value
                        )
                      }
                      placeholder="Chennai"
                    />

                    <label className="flex items-center gap-3 pt-7 text-slate-300">
                      <input
                        type="checkbox"
                        checked={
                          item.current ||
                          false
                        }
                        onChange={(event) =>
                          updateEducation(
                            index,
                            "current",
                            event.target
                              .checked
                          )
                        }
                      />

                      Currently studying here
                    </label>
                  </div>

                  <div className="mt-4">
                    <TextArea
                      label="Additional details"
                      value={
                        item.description
                      }
                      onChange={(value) =>
                        updateEducation(
                          index,
                          "description",
                          value
                        )
                      }
                      placeholder="Relevant coursework, honours or academic specialization."
                      rows={3}
                    />
                  </div>

                  <div className="mt-4 flex justify-end">
                    <RemoveButton
                      onClick={() =>
                        removeEducation(
                          index
                        )
                      }
                    />
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
        <SectionHeader
          icon={BriefcaseBusiness}
          title="Experience"
          description="Optional. Add internships, employment or freelance work."
          buttonLabel="Add Experience"
          onAdd={addExperience}
        />

        {experiences.length === 0 ? (
          <EmptyState message="No experience added. Students can leave this section empty." />
        ) : (
          <div className="mt-6 space-y-5">
            {experiences.map(
              (item, index) => (
                <div
                  key={
                    item._id ||
                    `experience-${index}`
                  }
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Role"
                      value={item.role}
                      onChange={(value) =>
                        updateExperience(
                          index,
                          "role",
                          value
                        )
                      }
                      placeholder="Frontend Developer Intern"
                    />

                    <Input
                      label="Company"
                      value={item.company}
                      onChange={(value) =>
                        updateExperience(
                          index,
                          "company",
                          value
                        )
                      }
                      placeholder="Company name"
                    />

                    <Input
                      label="Location"
                      value={item.location}
                      onChange={(value) =>
                        updateExperience(
                          index,
                          "location",
                          value
                        )
                      }
                      placeholder="Chennai"
                    />

                    <Input
                      label="Start date"
                      value={
                        item.startDate
                      }
                      onChange={(value) =>
                        updateExperience(
                          index,
                          "startDate",
                          value
                        )
                      }
                      placeholder="Jun 2026"
                    />

                    <Input
                      label="End date"
                      value={item.endDate}
                      onChange={(value) =>
                        updateExperience(
                          index,
                          "endDate",
                          value
                        )
                      }
                      placeholder="Jul 2026"
                    />

                    <label className="flex items-center gap-3 pt-7 text-slate-300">
                      <input
                        type="checkbox"
                        checked={
                          item.current ||
                          false
                        }
                        onChange={(event) =>
                          updateExperience(
                            index,
                            "current",
                            event.target
                              .checked
                          )
                        }
                      />

                      Currently working here
                    </label>
                  </div>

                  <div className="mt-4 grid gap-4">
                    <TextArea
                      label="Short description"
                      value={
                        item.description
                      }
                      onChange={(value) =>
                        updateExperience(
                          index,
                          "description",
                          value
                        )
                      }
                      placeholder="Short overview of the role."
                      rows={3}
                    />

                    <TextArea
                      label="Achievement bullets"
                      value={(
                        item.bulletPoints ||
                        []
                      ).join("\n")}
                      onChange={(value) =>
                        updateExperience(
                          index,
                          "bulletPoints",
                          splitLineList(
                            value
                          )
                        )
                      }
                      placeholder={
                        "Developed reusable React components\nImproved API error handling\nCollaborated with a three-member team"
                      }
                      rows={5}
                    />
                  </div>

                  <div className="mt-4 flex justify-end">
                    <RemoveButton
                      onClick={() =>
                        removeExperience(
                          index
                        )
                      }
                    />
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
        <SectionHeader
          icon={FolderGit2}
          title="Projects"
          description="Add projects you can explain clearly during an interview."
          buttonLabel="Add Project"
          onAdd={addProject}
        />

        {projects.length === 0 ? (
          <EmptyState message="No projects added. Add your strongest and most relevant project first." />
        ) : (
          <div className="mt-6 space-y-5">
            {projects.map(
              (project, index) => (
                <div
                  key={
                    project._id ||
                    `project-${index}`
                  }
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Project name"
                      value={project.name}
                      onChange={(value) =>
                        updateProject(
                          index,
                          "name",
                          value
                        )
                      }
                      placeholder="AI Resume Analyzer"
                    />

                    <Input
                      label="Your role"
                      value={project.role}
                      onChange={(value) =>
                        updateProject(
                          index,
                          "role",
                          value
                        )
                      }
                      placeholder="Full-Stack Developer"
                    />

                    <Input
                      label="Technologies"
                      value={(
                        project.technologies ||
                        []
                      ).join(", ")}
                      onChange={(value) =>
                        updateProject(
                          index,
                          "technologies",
                          splitCommaList(
                            value
                          )
                        )
                      }
                      placeholder="React.js, Node.js, Express.js, MongoDB Atlas, Gemini API"
                    />

                    <Input
                      label="GitHub URL"
                      value={
                        project.githubUrl
                      }
                      onChange={(value) =>
                        updateProject(
                          index,
                          "githubUrl",
                          value
                        )
                      }
                      placeholder="https://github.com/..."
                    />

                    <Input
                      label="Live project URL"
                      value={project.liveUrl}
                      onChange={(value) =>
                        updateProject(
                          index,
                          "liveUrl",
                          value
                        )
                      }
                      placeholder="https://..."
                    />

                    <Input
                      label="Start date"
                      value={
                        project.startDate
                      }
                      onChange={(value) =>
                        updateProject(
                          index,
                          "startDate",
                          value
                        )
                      }
                      placeholder="Jun 2026"
                    />

                    <Input
                      label="End date"
                      value={project.endDate}
                      onChange={(value) =>
                        updateProject(
                          index,
                          "endDate",
                          value
                        )
                      }
                      placeholder="Jul 2026"
                    />
                  </div>

                  <div className="mt-4 grid gap-4">
                    <TextArea
                      label="Project overview"
                      value={
                        project.description
                      }
                      onChange={(value) =>
                        updateProject(
                          index,
                          "description",
                          value
                        )
                      }
                      placeholder="One concise sentence explaining the project."
                      rows={3}
                    />

                    <TextArea
                      label="Project achievement bullets"
                      value={(
                        project.bulletPoints ||
                        []
                      ).join("\n")}
                      onChange={(value) =>
                        updateProject(
                          index,
                          "bulletPoints",
                          splitLineList(
                            value
                          )
                        )
                      }
                      placeholder={
                        "Developed a MERN-stack resume analyzer with JWT authentication\nImplemented PDF upload and extraction using Multer and pdf-parse\nIntegrated Gemini to generate ATS scores and actionable suggestions"
                      }
                      rows={7}
                    />
                  </div>

                  <div className="mt-4 flex justify-end">
                    <RemoveButton
                      onClick={() =>
                        removeProject(index)
                      }
                    />
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
        <SectionHeader
          icon={Code2}
          title="Coding Profiles"
          description="Optional links such as LeetCode, HackerRank, CodeChef or GeeksforGeeks."
          buttonLabel="Add Profile"
          onAdd={addCodingProfile}
        />

        {codingProfiles.length ===
        0 ? (
          <EmptyState message="No coding profile added. Leave this empty if the profile is inactive." />
        ) : (
          <div className="mt-6 space-y-4">
            {codingProfiles.map(
              (profile, index) => (
                <div
                  key={
                    profile._id ||
                    `profile-${index}`
                  }
                  className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-[1fr_2fr_auto]"
                >
                  <Input
                    label="Platform"
                    value={profile.label}
                    onChange={(value) =>
                      updateCodingProfile(
                        index,
                        "label",
                        value
                      )
                    }
                    placeholder="LeetCode"
                  />

                  <Input
                    label="Profile URL"
                    value={profile.url}
                    onChange={(value) =>
                      updateCodingProfile(
                        index,
                        "url",
                        value
                      )
                    }
                    placeholder="https://leetcode.com/u/..."
                  />

                  <div className="flex items-end">
                    <RemoveButton
                      onClick={() =>
                        removeCodingProfile(
                          index
                        )
                      }
                    />
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
        <SectionHeader
          icon={Award}
          title="Certifications"
          description="Add only relevant and completed certifications."
          buttonLabel="Add Certificate"
          onAdd={addCertification}
        />

        {certifications.length ===
        0 ? (
          <EmptyState message="No certification added. This section is optional." />
        ) : (
          <div className="mt-6 space-y-4">
            {certifications.map(
              (certificate, index) => (
                <div
                  key={
                    certificate._id ||
                    `certificate-${index}`
                  }
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Certificate name"
                      value={
                        certificate.name
                      }
                      onChange={(value) =>
                        updateCertification(
                          index,
                          "name",
                          value
                        )
                      }
                      placeholder="MongoDB Developer Path"
                    />

                    <Input
                      label="Issuer"
                      value={
                        certificate.issuer
                      }
                      onChange={(value) =>
                        updateCertification(
                          index,
                          "issuer",
                          value
                        )
                      }
                      placeholder="MongoDB University"
                    />

                    <Input
                      label="Completion date"
                      value={
                        certificate.date
                      }
                      onChange={(value) =>
                        updateCertification(
                          index,
                          "date",
                          value
                        )
                      }
                      placeholder="July 2026"
                    />

                    <Input
                      label="Credential URL"
                      value={
                        certificate.credentialUrl
                      }
                      onChange={(value) =>
                        updateCertification(
                          index,
                          "credentialUrl",
                          value
                        )
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <div className="mt-4 flex justify-end">
                    <RemoveButton
                      onClick={() =>
                        removeCertification(
                          index
                        )
                      }
                    />
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default OptionalSectionsEditor;
