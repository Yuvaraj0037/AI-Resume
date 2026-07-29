import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAppearance } from "../context/AppearanceContext";

function DashboardLayout({ children }) {
  const { theme, sleepMode } = useAppearance();

  const isDark = theme === "dark";

  const backgroundClass = sleepMode
    ? "bg-[#15130e] text-amber-50"
    : isDark
      ? "bg-slate-950 text-slate-100"
      : "bg-slate-100 text-slate-900";

  return (
    <div
      className={`dashboard-shell flex min-h-screen transition-colors duration-500 ${backgroundClass}`}
      data-dark={isDark}
      data-sleep={sleepMode}
    >
      <Sidebar />

      <main className="relative min-w-0 flex-1 overflow-hidden">
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

        <div className="relative z-10">
          <Topbar />

          <div className="dashboard-content p-5 sm:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;