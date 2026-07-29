import {
  Bot,
  FilePenLine,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  Upload,
  User,
} from "lucide-react";

import {
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import {
  useAuth,
} from "../context/AuthContext";

import {
  useAppearance,
} from "../context/AppearanceContext";



const menus = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    name: "Upload Resume",
    icon: Upload,
    path: "/upload",
  },
  {
    name: "Resume Builder",
    icon: FilePenLine,
    path: "/resume-builder",
  },
  {
    name: "AI Resume Coach",
    icon: Bot,
    path: "/ai-coach",
  },
  {
    name: "Resume History",
    icon: History,
    path: "/history",
  },
  {
    name: "Profile",
    icon: User,
    path: "/profile",
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

function Sidebar() {
  const navigate = useNavigate();

  const { logout } = useAuth();

  const {
    theme,
    sleepMode,
  } = useAppearance();

  const isDark = theme === "dark";

  const logoX = useMotionValue(0);
  const logoY = useMotionValue(0);

  const smoothLogoX = useSpring(
    logoX,
    {
      stiffness: 180,
      damping: 18,
      mass: 0.6,
    }
  );

  const smoothLogoY = useSpring(
    logoY,
    {
      stiffness: 180,
      damping: 18,
      mass: 0.6,
    }
  );

  function handleLogoMove(event) {
    const bounds =
      event.currentTarget.getBoundingClientRect();

    const centerX =
      bounds.left +
      bounds.width / 2;

    const centerY =
      bounds.top +
      bounds.height / 2;

    const distanceX =
      event.clientX - centerX;

    const distanceY =
      event.clientY - centerY;

    logoX.set(distanceX * 0.08);
    logoY.set(distanceY * 0.08);
  }

  function handleLogoLeave() {
    logoX.set(0);
    logoY.set(0);
  }

  function handleLogout() {
    logout();

    toast.success(
      "Logged out successfully"
    );

    navigate("/login", {
      replace: true,
    });
  }

  const sidebarClass = sleepMode
    ? "border-amber-400/10 bg-[#1d1a12]"
    : isDark
    ? "border-slate-700/50 bg-slate-950"
    : "border-indigo-500/10 bg-slate-900";

  return (
    <aside
      className={`group/sidebar sticky top-0 z-50 flex h-screen w-20 shrink-0 flex-col overflow-hidden border-r px-3 py-6 text-white shadow-2xl transition-[width,padding,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:w-72 hover:px-6 focus-within:w-72 focus-within:px-6 ${sidebarClass}`}
    >
      {/* ResumeAI liquid logo */}

      <motion.button
        type="button"
        onClick={() =>
          navigate("/dashboard")
        }
        onMouseMove={handleLogoMove}
        onMouseLeave={handleLogoLeave}
        initial={{
          opacity: 0,
          y: -18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}
        whileTap={{
          scale: 0.96,
        }}
        aria-label="Open dashboard"
        className="group/logo relative mb-10 w-full shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-2 text-left outline-none transition-colors duration-500 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        {/* Background glow */}

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/logo:opacity-100"
          style={{
            background:
              "radial-gradient(circle at center, rgba(99,102,241,0.30), transparent 68%)",
          }}
        />

        <motion.div
          style={{
            x: smoothLogoX,
            y: smoothLogoY,
          }}
          className="relative z-10 flex items-center justify-center gap-3 transition-all duration-500 group-hover/sidebar:justify-start group-focus-within/sidebar:justify-start"
        >
          {/* Liquid icon */}

          <motion.div
            animate={{
              borderRadius: [
                "35% 65% 60% 40% / 45% 35% 65% 55%",
                "60% 40% 35% 65% / 55% 65% 35% 45%",
                "45% 55% 65% 35% / 35% 45% 55% 65%",
                "35% 65% 60% 40% / 45% 35% 65% 55%",
              ],

              rotate: [
                0,
                3,
                -3,
                0,
              ],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{
              scale: 1.08,
              rotate: 5,
            }}
            className="relative flex h-12 w-12 shrink-0 items-center justify-center bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-[0_10px_35px_rgba(99,102,241,0.45)]"
          >
            <motion.div
              aria-hidden="true"
              animate={{
                opacity: [
                  0.25,
                  0.65,
                  0.25,
                ],

                scale: [
                  0.8,
                  1.18,
                  0.8,
                ],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-1 rounded-full bg-white/20 blur-md"
            />

            <span className="relative z-10 text-xl font-black text-white">
              R
            </span>

            <motion.span
              aria-hidden="true"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-indigo-300 shadow-lg"
            >
              <Sparkles size={11} />
            </motion.span>
          </motion.div>

          {/* Logo text */}

          <div className="pointer-events-none max-w-0 -translate-x-3 overflow-hidden whitespace-nowrap text-left opacity-0 transition-all duration-500 ease-out group-hover/sidebar:pointer-events-auto group-hover/sidebar:max-w-48 group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100 group-focus-within/sidebar:max-w-48 group-focus-within/sidebar:translate-x-0 group-focus-within/sidebar:opacity-100">
            <div className="flex items-center">
              <span className="text-2xl font-black tracking-tight text-white">
                Resume
              </span>

              <motion.span
                animate={{
                  backgroundPosition: [
                    "0% 50%",
                    "100% 50%",
                    "0% 50%",
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-cyan-300 bg-[length:200%_200%] bg-clip-text text-2xl font-black text-transparent"
              >
                AI
              </motion.span>
            </div>

            <motion.p
              initial={{
                opacity: 0.65,
              }}
              whileHover={{
                opacity: 1,
                x: 3,
              }}
              className="mt-1 truncate text-xs font-medium tracking-wide text-slate-400"
            >
              Build. Analyze. Improve.
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          aria-hidden="true"
          initial={{
            scaleX: 0,
          }}
          whileHover={{
            scaleX: 1,
          }}
          transition={{
            duration: 0.4,
          }}
          className="absolute bottom-0 left-3 right-3 h-px origin-center bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
        />
      </motion.button>

      {/* Navigation */}

      <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden">
        {menus.map(
          (item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.path}
                initial={{
                  opacity: 0,
                  x: -16,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay:
                    index * 0.05,
                }}
              >
                <NavLink
                  to={item.path}
                  title={item.name}
                  className={({
                    isActive,
                  }) =>
                    `group/item relative flex items-center justify-center gap-4 overflow-hidden rounded-2xl px-3 py-3.5 transition-all duration-300 group-hover/sidebar:justify-start group-focus-within/sidebar:justify-start ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-950/30"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  {({
                    isActive,
                  }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="active-sidebar-item"
                          className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}

                      <Icon
                        size={22}
                        className="relative z-10 shrink-0 transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-3"
                      />

                      <span className="relative z-10 max-w-0 -translate-x-3 overflow-hidden whitespace-nowrap font-semibold opacity-0 transition-all duration-500 group-hover/sidebar:max-w-44 group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100 group-focus-within/sidebar:max-w-44 group-focus-within/sidebar:translate-x-0 group-focus-within/sidebar:opacity-100">
                        {item.name}
                      </span>

                      {/* Collapsed tooltip */}

                      <span className="pointer-events-none fixed left-[76px] z-[100] hidden -translate-y-12 whitespace-nowrap rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover/item:opacity-100">
                        {item.name}
                      </span>
                    </>
                  )}
                </NavLink>
              </motion.div>
            );
          }
        )}
      </nav>

      {/* Logout */}

      <div className="border-t border-white/10 pt-5">
        <button
          type="button"
          onClick={handleLogout}
          title="Logout"
          className="group/logout flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl px-3 py-3.5 text-red-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-300 group-hover/sidebar:justify-start group-focus-within/sidebar:justify-start"
        >
          <LogOut
            size={22}
            className="shrink-0 transition-transform duration-300 group-hover/logout:-translate-x-1"
          />

          <span className="max-w-0 -translate-x-3 overflow-hidden whitespace-nowrap font-semibold opacity-0 transition-all duration-500 group-hover/sidebar:max-w-32 group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100 group-focus-within/sidebar:max-w-32 group-focus-within/sidebar:translate-x-0 group-focus-within/sidebar:opacity-100">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;