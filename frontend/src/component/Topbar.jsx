import { useState } from "react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  Bell,
  BellOff,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
  useAppearance,
} from "../context/AppearanceContext";

const SEARCH_ROUTES = [
  {
    keywords: ["dashboard", "home"],
    path: "/dashboard",
  },
  {
    keywords: ["upload", "resume", "analyze"],
    path: "/upload",
  },
  {
    keywords: ["history", "previous"],
    path: "/history",
  },
  {
    keywords: ["profile", "account"],
    path: "/profile",
  },
  {
    keywords: ["settings", "theme", "dark", "sleep"],
    path: "/settings",
  },
  {
    keywords: ["job", "match"],
    path: "/job-match",
  },
  {
    keywords: ["improve", "suggestion"],
    path: "/resume-improve",
  },
];

function Topbar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    theme,
    sleepMode,
    doNotDisturb,
  } = useAppearance();

  const [search, setSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const isDark = theme === "dark" || sleepMode;

  const displayName = user?.name || "ResumeAI User";
  const displayEmail = user?.email || "Account";

  const avatarUrl =
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName
    )}&background=6366f1&color=ffffff&bold=true`;

  function handleSearch(event) {
    event.preventDefault();

    const query = search.trim().toLowerCase();

    if (!query) return;

    const result = SEARCH_ROUTES.find((item) =>
      item.keywords.some((keyword) =>
        query.includes(keyword)
      )
    );

    if (result) {
      navigate(result.path);
      setSearch("");
    }
  }

  function toggleNotifications() {
    setNotificationsOpen((current) => !current);
  }

  return (
    <header
      className={`relative z-40 flex items-center justify-between gap-5 border-b px-5 py-4 backdrop-blur-xl transition-colors duration-500 sm:px-8 ${
        sleepMode
          ? "border-amber-400/10 bg-[#211d14]/85"
          : isDark
            ? "border-slate-700/50 bg-slate-900/80"
            : "border-white/60 bg-white/75"
      }`}
    >
      <form
        onSubmit={handleSearch}
        className="relative hidden sm:block"
      >
        <Search
          size={19}
          className={`absolute left-3 top-1/2 -translate-y-1/2 ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search dashboard..."
          className={`w-72 rounded-xl border py-2.5 pl-10 pr-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 ${
            isDark
              ? "border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500"
              : "border-slate-200 bg-white/80 text-slate-900"
          }`}
        />
      </form>

      <div className="ml-auto flex items-center gap-3 sm:gap-5">
        <div className="relative">
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleNotifications}
            title={
              doNotDisturb
                ? "Do Not Disturb is active"
                : "Notifications"
            }
            className={`relative rounded-xl p-2.5 transition ${
              doNotDisturb
                ? "bg-rose-500/10 text-rose-500"
                : isDark
                  ? "bg-slate-800 text-slate-300 hover:text-white"
                  : "bg-white/80 text-slate-600 shadow-sm hover:text-indigo-600"
            }`}
          >
            {doNotDisturb ? (
              <BellOff size={21} />
            ) : (
              <Bell size={21} />
            )}

            {!doNotDisturb && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="notification-indicator absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"
              />
            )}
          </motion.button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -8,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                  scale: 0.96,
                }}
                className={`fixed left-4 right-4 top-20 overflow-hidden rounded-2xl border shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-14 sm:w-80${
                  isDark
                    ? "border-slate-700 bg-slate-900 text-white"
                    : "border-white bg-white text-slate-900"
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-200/20 p-4">
                  <div>
                    <h3 className="font-bold">
                      Notifications
                    </h3>

                    <p className="text-xs text-slate-500">
                      ResumeAI activity
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setNotificationsOpen(false)
                    }
                    className="rounded-lg p-1.5 hover:bg-slate-500/10"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-4">
                  {doNotDisturb ? (
                    <div className="rounded-xl bg-rose-500/10 p-4 text-sm text-rose-500">
                      Do Not Disturb is active. Notification
                      indicators are paused.
                    </div>
                  ) : (
                    <div className="rounded-xl bg-indigo-500/10 p-4">
                      <p className="font-semibold text-indigo-500">
                        ResumeAI is ready
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Upload a resume to generate your latest ATS
                        analysis.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => navigate("/settings")}
          className={`hidden rounded-xl p-2.5 transition sm:block ${
            isDark
              ? "bg-slate-800 text-slate-300 hover:text-white"
              : "bg-white/80 text-slate-600 shadow-sm hover:text-indigo-600"
          }`}
          title="Settings"
        >
          <Settings size={21} />
        </button>

        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="flex items-center gap-3 rounded-xl p-1.5 text-left transition hover:bg-indigo-500/10"
        >
          <img
            src={avatarUrl}
            className="h-10 w-10 rounded-xl object-cover shadow-sm"
            alt={`${displayName} avatar`}
          />

          <div className="hidden max-w-40 md:block">
            <p
              className={`truncate text-sm font-bold ${
                isDark
                  ? "text-slate-100"
                  : "text-slate-900"
              }`}
            >
              {displayName}
            </p>

            <p className="truncate text-xs text-slate-500">
              {displayEmail}
            </p>
          </div>

          <User
            size={16}
            className="hidden text-slate-400 lg:block"
          />
        </button>
      </div>
    </header>
  );
}

export default Topbar;