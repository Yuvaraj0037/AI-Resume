import {
  Bot,
  FilePenLine,
  History,
  LayoutDashboard,
  Settings,
  Upload,
  User,
} from "lucide-react";

import {
  NavLink,
} from "react-router-dom";

import {
  useAppearance,
} from "../context/AppearanceContext";

const primaryItems = [
  {
    name: "Home",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    name: "Upload",
    icon: Upload,
    path: "/upload",
  },
  {
    name: "Builder",
    icon: FilePenLine,
    path: "/resume-builder",
  },
  {
    name: "Coach",
    icon: Bot,
    path: "/ai-coach",
  },
  {
    name: "Profile",
    icon: User,
    path: "/profile",
  },
];

function MobileNavigation() {
  const {
    theme,
    sleepMode,
  } = useAppearance();

  const isDark =
    theme === "dark";

  const navigationClass =
    sleepMode
      ? "border-amber-400/15 bg-[#211d14]/95"
      : isDark
        ? "border-slate-700 bg-slate-950/95"
        : "border-slate-200 bg-white/95";

  return (
    <nav
      aria-label="Mobile navigation"
      className={`fixed inset-x-3 bottom-3 z-[100] grid grid-cols-5 rounded-2xl border p-2 shadow-2xl backdrop-blur-2xl lg:hidden ${navigationClass}`}
    >
      {primaryItems.map(
        (item) => {
          const Icon =
            item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({
                isActive,
              }) =>
                `relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold transition ${
                  isActive
                    ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg"
                    : isDark ||
                        sleepMode
                      ? "text-slate-400 active:bg-white/10"
                      : "text-slate-500 active:bg-indigo-50"
                }`
              }
            >
              <Icon
                size={20}
                strokeWidth={2.2}
              />

              <span className="max-w-full truncate">
                {item.name}
              </span>
            </NavLink>
          );
        }
      )}
    </nav>
  );
}

export default MobileNavigation;