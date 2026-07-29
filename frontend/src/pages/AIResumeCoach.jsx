import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  FileText,
  Lightbulb,
  LoaderCircle,
  MessageCirclePlus,
  MessageSquareText,
  Send,
  Sparkles,
  Target,
  Trash2,
  User,
} from "lucide-react";

import toast from "react-hot-toast";

import DashboardLayout from "../component/DashboardLayout";

import api from "../services/api";

import {
  deleteCoachConversation,
  getCoachConversation,
  getCoachConversations,
  sendCoachMessage,
} from "../services/coachApi";

import {
  useAppearance,
} from "../context/AppearanceContext";

const QUICK_PROMPTS = [
  {
    icon: Target,
    title: "Top improvements",
    prompt:
      "Review my resume and provide the three highest-priority improvements.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Job readiness",
    prompt:
      "Based only on my resume, which job roles am I currently most suitable for and why?",
  },
  {
    icon: Sparkles,
    title: "Improve summary",
    prompt:
      "Rewrite my professional summary without inventing new skills or experience.",
  },
  {
    icon: FileText,
    title: "Project feedback",
    prompt:
      "Review my projects and explain how I can describe them more effectively.",
  },
];

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    "Something went wrong"
  );
}

function getResumeId(resume) {
  if (!resume) {
    return "";
  }

  if (typeof resume === "string") {
    return resume;
  }

  return (
    resume._id ||
    resume.id ||
    ""
  );
}

function getConversationId(
  conversation
) {
  if (!conversation) {
    return "";
  }

  if (
    typeof conversation ===
    "string"
  ) {
    return conversation;
  }

  return (
    conversation._id ||
    conversation.id ||
    conversation.conversationId ||
    ""
  );
}

function formatDate(value) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Recently";
  }

  return date.toLocaleString(
    [],
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

function normalizeMessage(
  message,
  fallbackRole = "assistant"
) {
  if (!message) {
    return null;
  }

  return {
    _id:
      message._id ||
      message.id ||
      `message-${Date.now()}-${Math.random()}`,

    role:
      message.role ||
      fallbackRole,

    content:
      message.content ||
      message.answer ||
      "",

    suggestedActions:
      Array.isArray(
        message.suggestedActions
      )
        ? message.suggestedActions
        : [],

    resumeEvidence:
      Array.isArray(
        message.resumeEvidence
      )
        ? message.resumeEvidence
        : [],

    followUpQuestions:
      Array.isArray(
        message.followUpQuestions
      )
        ? message.followUpQuestions
        : [],

    createdAt:
      message.createdAt ||
      new Date().toISOString(),
  };
}

function AIResumeCoach() {
  const {
    theme,
    sleepMode,
  } = useAppearance();

  const isDark =
    theme === "dark";

  const [resumes, setResumes] =
    useState([]);

  const [
    selectedResumeId,
    setSelectedResumeId,
  ] = useState("");

  const [
    conversations,
    setConversations,
  ] = useState([]);

  const [
    activeConversationId,
    setActiveConversationId,
  ] = useState("");

  const [messages, setMessages] =
    useState([]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    loadingConversation,
    setLoadingConversation,
  ] = useState(false);

  const [sending, setSending] =
    useState(false);

  const [
    deletingConversationId,
    setDeletingConversationId,
  ] = useState("");

  const messagesEndRef =
    useRef(null);

  const selectedResume =
    useMemo(
      () =>
        resumes.find(
          (resume) =>
            getResumeId(resume) ===
            selectedResumeId
        ),
      [
        resumes,
        selectedResumeId,
      ]
    );

  const pageClass = sleepMode
    ? "bg-gradient-to-br from-[#241f16] via-[#2e2618] to-[#18150f] text-amber-50"
    : isDark
      ? "bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white"
      : "bg-gradient-to-br from-slate-100 via-indigo-50 to-violet-100 text-slate-950";

  const panelClass = sleepMode
    ? "border-amber-200/10 bg-[#332b1d]/90 text-amber-50"
    : isDark
      ? "border-white/10 bg-white/[0.07] text-white"
      : "border-white/80 bg-white/85 text-slate-950";

  const softPanelClass =
    sleepMode
      ? "border-amber-200/10 bg-amber-50/[0.05]"
      : isDark
        ? "border-white/10 bg-white/[0.05]"
        : "border-slate-200 bg-slate-50/90";

  const mutedTextClass =
    sleepMode
      ? "text-amber-100/65"
      : isDark
        ? "text-slate-400"
        : "text-slate-600";

  const inputClass = sleepMode
    ? "border-amber-200/10 bg-[#241f16] text-amber-50 placeholder:text-amber-100/35"
    : isDark
      ? "border-white/10 bg-slate-950/70 text-white placeholder:text-slate-500"
      : "border-slate-200 bg-white text-slate-950 placeholder:text-slate-400";

  useEffect(() => {
    async function loadPage() {
      try {
        setLoading(true);

        const [
          resumeResponse,
          conversationData,
        ] = await Promise.all([
          api.get(
            "/resume-builder"
          ),

          getCoachConversations(),
        ]);

        const resumeData =
          Array.isArray(
            resumeResponse.data
          )
            ? resumeResponse.data
            : resumeResponse.data
                ?.resumes || [];

        setResumes(
          resumeData
        );

        setConversations(
          Array.isArray(
            conversationData
          )
            ? conversationData
            : []
        );

        if (
          resumeData.length > 0
        ) {
          setSelectedResumeId(
            getResumeId(
              resumeData[0]
            )
          );
        }
      } catch (error) {
        console.error(
          "AI Coach loading error:",
          error
        );

        toast.error(
          getErrorMessage(error)
        );
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, []);

  useEffect(() => {
    messagesEndRef.current
      ?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
  }, [messages, sending]);

  async function refreshConversations() {
    try {
      const data =
        await getCoachConversations();

      setConversations(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Conversation refresh error:",
        error
      );
    }
  }

  function handleNewConversation() {
    setActiveConversationId(
      ""
    );

    setMessages([]);
    setInput("");
  }

  async function handleOpenConversation(
    conversationValue
  ) {
    const conversationId =
      getConversationId(
        conversationValue
      );

    if (
      !conversationId ||
      loadingConversation ||
      sending
    ) {
      return;
    }

    try {
      setLoadingConversation(
        true
      );

      const conversation =
        await getCoachConversation(
          conversationId
        );

      if (!conversation) {
        throw new Error(
          "Conversation was not returned by the server"
        );
      }

      const resolvedId =
        getConversationId(
          conversation
        ) ||
        conversationId;

      setActiveConversationId(
        resolvedId
      );

      const conversationMessages =
        Array.isArray(
          conversation.messages
        )
          ? conversation.messages
              .map((message) =>
                normalizeMessage(
                  message,
                  message.role
                )
              )
              .filter(Boolean)
          : [];

      setMessages(
        conversationMessages
      );

      const conversationResumeId =
        getResumeId(
          conversation.resume
        );

      if (
        conversationResumeId
      ) {
        setSelectedResumeId(
          conversationResumeId
        );
      }
    } catch (error) {
      console.error(
        "Open conversation error:",
        error
      );

      toast.error(
        getErrorMessage(error)
      );
    } finally {
      setLoadingConversation(
        false
      );
    }
  }

  async function handleDeleteConversation(
    event,
    conversationValue
  ) {
    event.preventDefault();
    event.stopPropagation();

    const conversationId =
      getConversationId(
        conversationValue
      );

    if (!conversationId) {
      toast.error(
        "Conversation ID is missing"
      );

      return;
    }

    const confirmed =
      window.confirm(
        "Delete this AI Coach conversation permanently?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingConversationId(
        conversationId
      );

      await deleteCoachConversation(
        conversationId
      );

      setConversations(
        (current) =>
          current.filter(
            (conversation) =>
              getConversationId(
                conversation
              ) !==
              conversationId
          )
      );

      if (
        activeConversationId ===
        conversationId
      ) {
        setActiveConversationId(
          ""
        );

        setMessages([]);
        setInput("");
      }

      toast.success(
        "Conversation deleted"
      );
    } catch (error) {
      console.error(
        "Delete conversation error:",
        error
      );

      toast.error(
        getErrorMessage(error)
      );
    } finally {
      setDeletingConversationId(
        ""
      );
    }
  }

  async function handleSend(
    customMessage = ""
  ) {
    const messageText =
      String(
        customMessage ||
          input
      ).trim();

    if (!selectedResumeId) {
      toast.error(
        "Select a builder resume first"
      );

      return;
    }

    if (!messageText) {
      toast.error(
        "Enter a message"
      );

      return;
    }

    if (sending) {
      return;
    }

    const temporaryId =
      `temporary-${Date.now()}`;

    const temporaryUserMessage =
      {
        _id: temporaryId,
        role: "user",
        content: messageText,
        suggestedActions: [],
        resumeEvidence: [],
        followUpQuestions:
          [],
        createdAt:
          new Date().toISOString(),
      };

    setMessages(
      (current) => [
        ...current,
        temporaryUserMessage,
      ]
    );

    setInput("");
    setSending(true);

    try {
      const result =
        await sendCoachMessage({
          resumeId:
            selectedResumeId,

          conversationId:
            activeConversationId ||
            undefined,

          message:
            messageText,
        });

      const rawAssistantMessage =
        result.response ||
        result.reply ||
        result.assistantMessage;

      const assistantMessage =
        normalizeMessage(
          rawAssistantMessage,
          "assistant"
        );

      if (
        !assistantMessage ||
        !assistantMessage.content
      ) {
        throw new Error(
          "AI Coach returned an empty response"
        );
      }

      setMessages(
        (current) => [
          ...current,
          assistantMessage,
        ]
      );

      const newConversationId =
        result.conversationId ||
        getConversationId(
          result.conversation
        );

      if (
        newConversationId
      ) {
        setActiveConversationId(
          newConversationId
        );
      }

      await refreshConversations();
    } catch (error) {
      setMessages(
        (current) =>
          current.filter(
            (message) =>
              message._id !==
              temporaryId
          )
      );

      setInput(
        messageText
      );

      console.error(
        "Coach message error:",
        error
      );

      toast.error(
        getErrorMessage(error)
      );
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(
    event
  ) {
    event.preventDefault();
    handleSend();
  }

  function handleKeyDown(
    event
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSend();
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div
          className={`flex min-h-[75vh] items-center justify-center rounded-3xl ${pageClass}`}
        >
          <div className="text-center">
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-2xl shadow-indigo-500/30"
            >
              <Bot size={40} />
            </motion.div>

            <h2 className="mt-6 text-2xl font-black">
              Loading AI Coach
            </h2>

            <p
              className={`mt-2 ${mutedTextClass}`}
            >
              Preparing your
              resume workspace...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div
        className={`relative min-h-[calc(100vh-8rem)] overflow-hidden rounded-3xl p-4 transition-colors duration-500 md:p-6 ${pageClass}`}
      >
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, -25, 0],
            scale: [
              1,
              1.08,
              1,
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -35, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl"
        />

        <div className="relative z-10">
          <motion.header
            initial={{
              opacity: 0,
              y: -25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className={`rounded-3xl border p-6 shadow-xl backdrop-blur-2xl ${panelClass}`}
          >
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{
                    y: [
                      0,
                      -6,
                      0,
                    ],
                    rotate: [
                      0,
                      3,
                      -3,
                      0,
                    ],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-xl shadow-indigo-500/25"
                >
                  <Bot size={34} />
                </motion.div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-black md:text-4xl">
                      AI Resume
                      Coach
                    </h1>

                    <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500">
                      Resume grounded
                    </span>
                  </div>

                  <p
                    className={`mt-2 max-w-2xl ${mutedTextClass}`}
                  >
                    Ask questions
                    about your resume
                    and receive advice
                    based only on your
                    actual information.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={
                    selectedResumeId
                  }
                  onChange={(
                    event
                  ) => {
                    setSelectedResumeId(
                      event.target.value
                    );

                    handleNewConversation();
                  }}
                  className={`min-w-64 rounded-2xl border px-4 py-3 font-semibold outline-none transition focus:border-indigo-500 ${inputClass}`}
                >
                  {resumes.length ===
                  0 ? (
                    <option value="">
                      No builder
                      resumes
                    </option>
                  ) : (
                    resumes.map(
                      (resume) => (
                        <option
                          key={getResumeId(
                            resume
                          )}
                          value={getResumeId(
                            resume
                          )}
                        >
                          {resume.title ||
                            "Untitled Resume"}
                        </option>
                      )
                    )
                  )}
                </select>

                <button
                  type="button"
                  onClick={
                    handleNewConversation
                  }
                  disabled={
                    !selectedResumeId
                  }
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MessageCirclePlus
                    size={19}
                  />

                  New chat
                </button>
              </div>
            </div>
          </motion.header>

          {resumes.length ===
          0 ? (
            <EmptyResumeState
              panelClass={
                panelClass
              }
              mutedTextClass={
                mutedTextClass
              }
            />
          ) : (
            <div className="mt-6 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
              <motion.aside
                initial={{
                  opacity: 0,
                  x: -25,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                className={`rounded-3xl border p-4 shadow-xl backdrop-blur-2xl ${panelClass}`}
              >
                <div className="flex items-center justify-between px-2 py-2">
                  <div>
                    <h2 className="font-black">
                      Conversations
                    </h2>

                    <p
                      className={`mt-1 text-xs ${mutedTextClass}`}
                    >
                      {
                        conversations.length
                      }{" "}
                      saved chats
                    </p>
                  </div>

                  <MessageSquareText className="text-indigo-500" />
                </div>

                <div className="mt-4 max-h-[650px] space-y-2 overflow-y-auto pr-1">
                  {conversations.length ===
                  0 ? (
                    <div
                      className={`rounded-2xl border p-5 text-center ${softPanelClass}`}
                    >
                      <Bot
                        size={30}
                        className="mx-auto text-indigo-500"
                      />

                      <p className="mt-3 text-sm font-bold">
                        No conversations
                      </p>

                      <p
                        className={`mt-1 text-xs ${mutedTextClass}`}
                      >
                        Send your first
                        message to
                        begin.
                      </p>
                    </div>
                  ) : (
                    conversations.map(
                      (
                        conversation
                      ) => {
                        const conversationId =
                          getConversationId(
                            conversation
                          );

                        const isActive =
                          activeConversationId ===
                          conversationId;

                        const isDeleting =
                          deletingConversationId ===
                          conversationId;

                        return (
                          <motion.div
                            layout
                            role="button"
                            tabIndex={
                              0
                            }
                            key={
                              conversationId
                            }
                            onClick={() =>
                              handleOpenConversation(
                                conversation
                              )
                            }
                            onKeyDown={(
                              event
                            ) => {
                              if (
                                event.key ===
                                  "Enter" ||
                                event.key ===
                                  " "
                              ) {
                                event.preventDefault();

                                handleOpenConversation(
                                  conversation
                                );
                              }
                            }}
                            whileHover={{
                              x: 3,
                              scale:
                                1.01,
                            }}
                            whileTap={{
                              scale:
                                0.99,
                            }}
                            className={`group w-full cursor-pointer rounded-2xl border p-4 text-left transition ${
                              isActive
                                ? "border-indigo-500/50 bg-indigo-500/20 shadow-lg shadow-indigo-500/10"
                                : softPanelClass
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold">
                                  {conversation.title ||
                                    "Resume coaching"}
                                </p>

                                <p
                                  className={`mt-2 text-xs ${mutedTextClass}`}
                                >
                                  {formatDate(
                                    conversation.lastMessageAt ||
                                      conversation.updatedAt ||
                                      conversation.createdAt
                                  )}
                                </p>
                              </div>

                              <button
                                type="button"
                                title="Delete conversation"
                                disabled={
                                  isDeleting ||
                                  !conversationId
                                }
                                onClick={(
                                  event
                                ) =>
                                  handleDeleteConversation(
                                    event,
                                    conversation
                                  )
                                }
                                className="shrink-0 rounded-xl p-2 text-slate-500 opacity-60 transition hover:bg-red-500/15 hover:text-red-500 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                {isDeleting ? (
                                  <LoaderCircle
                                    size={
                                      17
                                    }
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2
                                    size={
                                      17
                                    }
                                  />
                                )}
                              </button>
                            </div>
                          </motion.div>
                        );
                      }
                    )
                  )}
                </div>
              </motion.aside>

              <motion.main
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className={`flex min-h-[720px] flex-col overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-2xl ${panelClass}`}
              >
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-500">
                      <FileText
                        size={22}
                      />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate font-black">
                        {selectedResume
                          ?.title ||
                          "Selected resume"}
                      </h2>

                      <p
                        className={`truncate text-xs ${mutedTextClass}`}
                      >
                        {selectedResume
                          ?.personal
                          ?.jobTitle ||
                          "Resume coaching session"}
                      </p>
                    </div>
                  </div>

                  <span className="flex items-center gap-2 text-xs font-semibold text-emerald-500">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

                    Coach ready
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                  {loadingConversation ? (
                    <div className="flex min-h-[500px] items-center justify-center">
                      <div className="text-center">
                        <LoaderCircle className="mx-auto animate-spin text-indigo-500" />

                        <p
                          className={`mt-3 text-sm ${mutedTextClass}`}
                        >
                          Loading
                          conversation...
                        </p>
                      </div>
                    </div>
                  ) : messages.length ===
                    0 ? (
                    <WelcomeState
                      softPanelClass={
                        softPanelClass
                      }
                      mutedTextClass={
                        mutedTextClass
                      }
                      sending={
                        sending
                      }
                      onPrompt={
                        handleSend
                      }
                    />
                  ) : (
                    <div className="space-y-6">
                      <AnimatePresence initial={false}>
                        {messages.map(
                          (
                            message,
                            index
                          ) => (
                            <ChatMessage
                              key={
                                message._id ||
                                `${message.role}-${index}`
                              }
                              message={
                                message
                              }
                              panelClass={
                                softPanelClass
                              }
                              mutedTextClass={
                                mutedTextClass
                              }
                            />
                          )
                        )}
                      </AnimatePresence>

                      {sending && (
                        <TypingIndicator
                          panelClass={
                            softPanelClass
                          }
                        />
                      )}

                      <div
                        ref={
                          messagesEndRef
                        }
                      />
                    </div>
                  )}
                </div>

                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="border-t border-white/10 p-4 md:p-5"
                >
                  <div
                    className={`flex items-end gap-3 rounded-2xl border p-2 transition focus-within:border-indigo-500 ${inputClass}`}
                  >
                    <textarea
                      rows={1}
                      maxLength={
                        2000
                      }
                      value={input}
                      disabled={
                        sending
                      }
                      onKeyDown={
                        handleKeyDown
                      }
                      onChange={(
                        event
                      ) =>
                        setInput(
                          event.target.value
                        )
                      }
                      placeholder="Ask about your resume..."
                      className="max-h-36 min-h-12 flex-1 resize-none bg-transparent px-3 py-3 outline-none"
                    />

                    <motion.button
                      whileHover={{
                        scale:
                          1.05,
                      }}
                      whileTap={{
                        scale:
                          0.95,
                      }}
                      type="submit"
                      disabled={
                        sending ||
                        !input.trim() ||
                        !selectedResumeId
                      }
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {sending ? (
                        <LoaderCircle
                          className="animate-spin"
                          size={21}
                        />
                      ) : (
                        <Send
                          size={21}
                        />
                      )}
                    </motion.button>
                  </div>

                  <p
                    className={`mt-2 text-center text-xs ${mutedTextClass}`}
                  >
                    Verify AI advice
                    before using it
                    in applications.
                  </p>
                </form>
              </motion.main>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function EmptyResumeState({
  panelClass,
  mutedTextClass,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.96,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      className={`mt-6 rounded-3xl border p-12 text-center shadow-xl backdrop-blur-xl ${panelClass}`}
    >
      <FileText
        size={54}
        className="mx-auto text-indigo-500"
      />

      <h2 className="mt-6 text-3xl font-black">
        Create a resume first
      </h2>

      <p
        className={`mx-auto mt-3 max-w-xl ${mutedTextClass}`}
      >
        AI Coach requires a
        Resume Builder resume
        before it can provide
        grounded advice.
      </p>

      <button
        type="button"
        onClick={() => {
          window.location.href =
            "/resume-builder";
        }}
        className="mt-7 rounded-2xl bg-indigo-600 px-7 py-3 font-bold text-white transition hover:bg-indigo-700"
      >
        Open Resume Builder
      </button>
    </motion.div>
  );
}

function WelcomeState({
  softPanelClass,
  mutedTextClass,
  sending,
  onPrompt,
}) {
  return (
    <div className="mx-auto flex min-h-[500px] max-w-3xl flex-col items-center justify-center">
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-2xl shadow-indigo-500/30"
      >
        <Bot size={48} />
      </motion.div>

      <h2 className="mt-7 text-center text-3xl font-black">
        What should we
        improve?
      </h2>

      <p
        className={`mt-3 max-w-xl text-center leading-7 ${mutedTextClass}`}
      >
        Select a suggestion or
        ask a specific question
        about your resume.
      </p>

      <div className="mt-8 grid w-full gap-3 md:grid-cols-2">
        {QUICK_PROMPTS.map(
          (prompt, index) => {
            const Icon =
              prompt.icon;

            return (
              <motion.button
                key={
                  prompt.title
                }
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay:
                    index *
                    0.08,
                }}
                whileHover={{
                  y: -4,
                  scale: 1.01,
                }}
                type="button"
                disabled={sending}
                onClick={() =>
                  onPrompt(
                    prompt.prompt
                  )
                }
                className={`rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${softPanelClass}`}
              >
                <Icon className="text-indigo-500" />

                <h3 className="mt-3 font-bold">
                  {prompt.title}
                </h3>

                <p
                  className={`mt-2 text-sm leading-6 ${mutedTextClass}`}
                >
                  {prompt.prompt}
                </p>
              </motion.button>
            );
          }
        )}
      </div>
    </div>
  );
}

function TypingIndicator({
  panelClass,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="flex items-start gap-3"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white">
        <Bot size={20} />
      </div>

      <div
        className={`rounded-2xl border px-5 py-4 ${panelClass}`}
      >
        <div className="flex items-center gap-2">
          {[0, 1, 2].map(
            (dot) => (
              <motion.span
                key={dot}
                animate={{
                  y: [
                    0,
                    -6,
                    0,
                  ],
                }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  delay:
                    dot * 0.16,
                }}
                className="h-2.5 w-2.5 rounded-full bg-indigo-500"
              />
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ChatMessage({
  message,
  panelClass,
  mutedTextClass,
}) {
  const isAssistant =
    message.role ===
    "assistant";

  const actions =
    Array.isArray(
      message.suggestedActions
    )
      ? message.suggestedActions
      : [];

  const evidence =
    Array.isArray(
      message.resumeEvidence
    )
      ? message.resumeEvidence
      : [];

  const questions =
    Array.isArray(
      message.followUpQuestions
    )
      ? message.followUpQuestions
      : [];

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 18,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.97,
      }}
      className={`flex items-start gap-3 ${
        isAssistant
          ? ""
          : "flex-row-reverse"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
          isAssistant
            ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white"
            : "bg-slate-700 text-white"
        }`}
      >
        {isAssistant ? (
          <Bot size={20} />
        ) : (
          <User size={20} />
        )}
      </div>

      <div
        className={`max-w-[88%] ${
          isAssistant
            ? ""
            : "text-right"
        }`}
      >
        <div
          className={`rounded-3xl px-5 py-4 ${
            isAssistant
              ? `border ${panelClass}`
              : "bg-gradient-to-br from-indigo-600 to-violet-600 text-white"
          }`}
        >
          <p className="whitespace-pre-wrap text-left leading-7">
            {message.content}
          </p>
        </div>

        {isAssistant &&
          (actions.length > 0 ||
            evidence.length >
              0 ||
            questions.length >
              0) && (
            <div className="mt-4 space-y-3 text-left">
              {actions.length >
                0 && (
                <MessageSection
                  title="Action plan"
                  icon={
                    Lightbulb
                  }
                  items={actions}
                  color="text-amber-500"
                  panelClass={
                    panelClass
                  }
                />
              )}

              {evidence.length >
                0 && (
                <MessageSection
                  title="Resume evidence"
                  icon={
                    CheckCircle2
                  }
                  items={
                    evidence
                  }
                  color="text-emerald-500"
                  panelClass={
                    panelClass
                  }
                />
              )}

              {questions.length >
                0 && (
                <MessageSection
                  title="Ask next"
                  icon={
                    MessageSquareText
                  }
                  items={
                    questions
                  }
                  color="text-indigo-500"
                  panelClass={
                    panelClass
                  }
                />
              )}
            </div>
          )}

        <p
          className={`mt-2 px-2 text-xs ${mutedTextClass}`}
        >
          {formatDate(
            message.createdAt
          )}
        </p>
      </div>
    </motion.div>
  );
}

function MessageSection({
  title,
  icon: Icon,
  items,
  color,
  panelClass,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className={`rounded-2xl border p-4 ${panelClass}`}
    >
      <h4
        className={`flex items-center gap-2 font-black ${color}`}
      >
        <Icon size={18} />
        {title}
      </h4>

      <div className="mt-3 space-y-2">
        {items.map(
          (item, index) => (
            <div
              key={`${title}-${index}`}
              className="flex items-start gap-2 text-sm leading-6"
            >
              <ChevronRight
                size={16}
                className={`mt-1 shrink-0 ${color}`}
              />

              <span>
                {item}
              </span>
            </div>
          )
        )}
      </div>
    </motion.div>
  );
}

export default AIResumeCoach;