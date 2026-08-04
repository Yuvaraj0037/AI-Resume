import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileNavigation from "./MobileNavigation";

import {
  useAppearance,
} from "../context/AppearanceContext";

function DashboardLayout({
  children,
}) {
  const {
    theme,
    sleepMode,
  } = useAppearance();

  const isDark =
    theme === "dark";

  const backgroundClass =
    sleepMode
      ? "bg-[#15130e] text-amber-50"
      : isDark
        ? "bg-slate-950 text-slate-100"
        : "bg-slate-100 text-slate-900";

  return (
    <div
      className={`dashboard-shell flex min-h-screen overflow-x-hidden transition-colors duration-500 ${backgroundClass}`}
      data-dark={isDark}
      data-sleep={sleepMode}
    >
      {/* Desktop sidebar */}
      <Sidebar />

      <main className="relative min-w-0 flex-1 overflow-x-hidden">
        {/* Liquid background decorations */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            className={`liquid-orb liquid-orb-one ${
              sleepMode
                ? "bg-amber-500/10"
                : "bg-indigo-500/15"
            }`}
          />

          <div
            className={`liquid-orb liquid-orb-two ${
              sleepMode
                ? "bg-orange-400/10"
                : "bg-violet-500/15"
            }`}
          />

          <div
            className={`liquid-orb liquid-orb-three ${
              sleepMode
                ? "bg-yellow-300/5"
                : "bg-cyan-400/10"
            }`}
          />
        </div>

        <div className="relative z-10 min-h-screen">
          <Topbar />

          {/*
           * Extra bottom padding prevents the fixed
           * mobile navigation from covering content.
           */}
          <div className="dashboard-content w-full p-4 pb-28 sm:p-6 sm:pb-28 md:p-8 md:pb-28 lg:pb-8">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile-only bottom navigation */}
      <MobileNavigation />
    </div>
  );
}

export default DashboardLayout;