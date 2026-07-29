import { useState } from "react";
import { motion } from "framer-motion";
import {
  BellOff,
  BrainCircuit,
  Check,
  Database,
  Loader2,
  Moon,
  Save,
  Sparkles,
  Sun,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import DashboardLayout from "../component/DashboardLayout";
import {
  useAppearance,
} from "../context/AppearanceContext";
import {
  savePreferences as savePreferencesToServer,
} from "../services/preferencesApi";
import DeleteAccountSection from "../component/settings/DeleteAccountSection";

function LiquidSwitch({
  enabled,
  onChange,
  color = "indigo",
  disabled = false,
}) {
  const enabledColor =
    color === "amber"
      ? "bg-amber-500"
      : color === "rose"
        ? "bg-rose-500"
        : "bg-indigo-600";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`relative h-8 w-14 shrink-0 overflow-hidden rounded-full p-1 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
        enabled
          ? `${enabledColor} shadow-lg`
          : "bg-slate-300"
      }`}
    >
      <motion.span
        animate={{
          x: enabled ? 24 : 0,
          rotate: enabled ? 180 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 450,
          damping: 28,
        }}
        className="relative block h-6 w-6 rounded-full bg-white shadow-md"
      >
        <span className="absolute inset-1 rounded-full bg-gradient-to-br from-white to-slate-200" />
      </motion.span>
    </button>
  );
}

function ThemeCard({
  icon: Icon,
  title,
  description,
  active,
  onClick,
  gradient,
  disabled,
}) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileHover={
        disabled
          ? undefined
          : {
              y: -4,
              scale: 1.01,
            }
      }
      whileTap={
        disabled
          ? undefined
          : {
              scale: 0.98,
            }
      }
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border p-5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? "border-indigo-500 ring-4 ring-indigo-500/10"
          : "border-slate-200 hover:border-indigo-300"
      }`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="rounded-xl bg-white/80 p-3 text-slate-800 shadow-sm backdrop-blur">
            <Icon size={24} />
          </div>

          {active && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="rounded-full bg-indigo-600 p-1.5 text-white"
            >
              <Check size={15} strokeWidth={3} />
            </motion.div>
          )}
        </div>

        <h3 className="mt-8 text-lg font-bold text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          {description}
        </p>
      </div>
    </motion.button>
  );
}

function PreferenceRow({
  icon: Icon,
  title,
  description,
  enabled,
  onChange,
  color,
  disabled,
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-slate-200/70 py-5 last:border-0">
      <div className="flex min-w-0 items-start gap-4">
        <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
          <Icon size={21} />
        </div>

        <div>
          <h3 className="font-semibold text-slate-900">
            {title}
          </h3>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <LiquidSwitch
        enabled={enabled}
        onChange={onChange}
        color={color}
        disabled={disabled}
      />
    </div>
  );
}

function Settings() {
  const {
    theme,
    sleepMode,
    doNotDisturb,
    analysisTips,
    saveAnalysisLocally,
    loadingPreferences,
    setTheme,
    toggleSleepMode,
    toggleDoNotDisturb,
    updatePreference,
    applyPreferences,
  } = useAppearance();

  const [saving, setSaving] = useState(false);

  async function handleSavePreferences() {
    try {
      setSaving(true);

      const response =
        await savePreferencesToServer({
          theme,
          sleepMode,
          doNotDisturb,
          analysisTips,
          saveAnalysisLocally,
        });

      applyPreferences(response.preferences);

      toast.success(
        response.message ||
          "Preferences saved successfully"
      );
    } catch (error) {
      console.error(
        "Save preferences error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to save preferences"
      );
    } finally {
      setSaving(false);
    }
  }

  function handleLocalStorageChange(value) {
    updatePreference(
      "saveAnalysisLocally",
      value
    );

    if (!value) {
      localStorage.removeItem("analysis");
    }
  }

  function clearAnalysis() {
    const hasCachedAnalysis =
      localStorage.getItem("analysis");

    localStorage.removeItem("analysis");

    if (hasCachedAnalysis) {
      toast.success(
        "Local analysis cache cleared"
      );
    } else {
      toast("No cached analysis was found");
    }
  }

  const controlsDisabled =
    loadingPreferences || saving;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        <motion.header
          initial={{
            opacity: 0,
            y: -18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="liquid-glass rounded-3xl p-6 sm:p-8"
        >
          <div className="relative z-10 flex items-center gap-5">
            <div className="liquid-logo flex h-16 w-16 shrink-0 items-center justify-center text-white">
              <Sparkles
                className="relative z-10"
                size={30}
              />
            </div>
           
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
                Personalize ResumeAI
              </p>

              <h1 className="mt-1 text-3xl font-black text-slate-900 sm:text-4xl">
                Settings
              </h1>

              <p className="mt-2 text-slate-500">
                Your saved preferences follow your
                account across devices.
              </p>
            </div>
          </div>
        </motion.header>

        {loadingPreferences && (
          <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-indigo-500/10 px-4 py-3 text-sm font-semibold text-indigo-600">
            <Loader2
              size={18}
              className="animate-spin"
            />
            Loading account preferences...
          </div>
        )}

        <motion.section
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.08,
          }}
          className="mt-7 rounded-3xl bg-white/90 p-6 shadow-sm backdrop-blur-xl sm:p-8"
        >
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Appearance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select the primary dashboard color mode.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <ThemeCard
              icon={Sun}
              title="Light mode"
              description="Bright, clean colors for daytime use."
              active={theme === "light"}
              onClick={() => setTheme("light")}
              gradient="from-sky-100 via-white to-indigo-100"
              disabled={controlsDisabled}
            />

            <ThemeCard
              icon={Moon}
              title="Dark mode"
              description="Deep colors with reduced screen brightness."
              active={theme === "dark"}
              onClick={() => setTheme("dark")}
              gradient="from-slate-300 via-indigo-200 to-violet-300"
              disabled={controlsDisabled}
            />
          </div>
        </motion.section>

        <div className="mt-7 grid gap-7 lg:grid-cols-2">
          <motion.section
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.14,
            }}
            className="rounded-3xl bg-white/90 p-6 shadow-sm backdrop-blur-xl"
          >
            <h2 className="text-xl font-bold text-slate-900">
              Focus modes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Reduce visual strain and interruptions.
            </p>

            <div className="mt-3">
              <PreferenceRow
                icon={Moon}
                title="Sleep mode"
                description="Use warmer colors and lower contrast for night-time work."
                enabled={sleepMode}
                onChange={toggleSleepMode}
                color="amber"
                disabled={controlsDisabled}
              />

              <PreferenceRow
                icon={BellOff}
                title="Do Not Disturb"
                description="Hide notification indicators while you focus."
                enabled={doNotDisturb}
                onChange={toggleDoNotDisturb}
                color="rose"
                disabled={controlsDisabled}
              />
            </div>
          </motion.section>

          <motion.section
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="rounded-3xl bg-white/90 p-6 shadow-sm backdrop-blur-xl"
          >
            <h2 className="text-xl font-bold text-slate-900">
              AI and storage
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Control analysis suggestions and browser
              storage.
            </p>

            <div className="mt-3">
              <PreferenceRow
                icon={BrainCircuit}
                title="AI improvement tips"
                description="Display targeted improvement suggestions after analysis."
                enabled={analysisTips}
                onChange={(value) =>
                  updatePreference(
                    "analysisTips",
                    value
                  )
                }
                disabled={controlsDisabled}
              />

              <PreferenceRow
                icon={Database}
                title="Cache latest analysis"
                description="Keep your latest analysis available in this browser."
                enabled={saveAnalysisLocally}
                onChange={
                  handleLocalStorageChange
                }
                disabled={controlsDisabled}
              />
            </div>
          </motion.section>
        </div>

        <motion.section
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.24,
          }}
          className="mt-7 rounded-3xl bg-white/90 p-6 shadow-sm backdrop-blur-xl"
        >
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-red-100 p-3 text-red-600">
              <Trash2 size={21} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Local browser cache
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                This removes only the latest analysis
                cached in this browser. It does not delete
                MongoDB resume history.
              </p>
            </div>
            
          </div>

          <button
            type="button"
            onClick={clearAnalysis}
            className="mt-5 flex items-center gap-2 rounded-xl border border-red-200 bg-white/70 px-5 py-3 font-semibold text-red-600 backdrop-blur transition hover:bg-red-50"
          >
            <Trash2 size={18} />
            Clear local cache
          </button>
        </motion.section>
<motion.div
  initial={{
    opacity: 0,
    y: 20,
  }}
  animate={{
    opacity: 1,
    y: 0,
  }}
  transition={{
    delay: 0.36,
    duration: 0.45,
  }}
  className="mt-10 border-t border-red-500/15 pt-8"
>
  <DeleteAccountSection />
</motion.div>
        <motion.div
  initial={{
    opacity: 0,
    y: 16,
  }}
  animate={{
    opacity: 1,
    y: 0,
  }}
  transition={{
    delay: 0.28,
  }}
  className="mt-7 flex justify-end"
>
  <button
    type="button"
    onClick={handleSavePreferences}
    disabled={controlsDisabled}
    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
  >
    {saving ? (
      <Loader2
        size={19}
        className="animate-spin"
      />
    ) : (
      <Save size={19} />
    )}

    {saving
      ? "Saving..."
      : loadingPreferences
        ? "Loading preferences..."
        : "Save preferences"}
  </button>
</motion.div>


        
      </div>
    </DashboardLayout>
  );
}

export default Settings;