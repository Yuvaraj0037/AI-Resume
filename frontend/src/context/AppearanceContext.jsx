import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import {
  getPreferences,
} from "../services/preferencesApi";

const AppearanceContext = createContext(null);

const STORAGE_KEY = "resumeai_appearance";

const DEFAULT_PREFERENCES = {
  theme: "light",
  sleepMode: false,
  doNotDisturb: false,
  analysisTips: true,
  saveAnalysisLocally: true,
};

function sanitizePreferences(preferences = {}) {
  return {
    theme:
      preferences.theme === "dark"
        ? "dark"
        : "light",

    sleepMode:
      typeof preferences.sleepMode === "boolean"
        ? preferences.sleepMode
        : false,

    doNotDisturb:
      typeof preferences.doNotDisturb === "boolean"
        ? preferences.doNotDisturb
        : false,

    analysisTips:
      typeof preferences.analysisTips === "boolean"
        ? preferences.analysisTips
        : true,

    saveAnalysisLocally:
      typeof preferences.saveAnalysisLocally ===
      "boolean"
        ? preferences.saveAnalysisLocally
        : true,
  };
}

function getInitialPreferences() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return DEFAULT_PREFERENCES;
    }

    return sanitizePreferences(
      JSON.parse(saved)
    );
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function AppearanceProvider({
  children,
}) {
  const { user } = useAuth();

  const [preferences, setPreferences] =
    useState(getInitialPreferences);

  const [
    loadingPreferences,
    setLoadingPreferences,
  ] = useState(false);

  // Load the logged-in user's MongoDB preferences.
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadServerPreferences() {
      try {
        setLoadingPreferences(true);

        const serverPreferences =
          await getPreferences();

        if (!cancelled) {
          setPreferences(
            sanitizePreferences(serverPreferences)
          );
        }
      } catch (error) {
        // Keep locally cached preferences if the API is
        // temporarily unavailable.
        console.error(
          "Failed to load server preferences:",
          error.response?.data?.message ||
            error.message
        );
      } finally {
        if (!cancelled) {
          setLoadingPreferences(false);
        }
      }
    }

    loadServerPreferences();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Apply preferences to the document and local cache.
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(preferences)
    );

    const root = document.documentElement;

    root.dataset.theme = preferences.theme;

    root.classList.toggle(
      "sleep-mode",
      preferences.sleepMode
    );

    root.classList.toggle(
      "dnd-mode",
      preferences.doNotDisturb
    );
  }, [preferences]);

  const updatePreference = useCallback(
    (name, value) => {
      if (!(name in DEFAULT_PREFERENCES)) {
        return;
      }

      setPreferences((current) => ({
        ...current,
        [name]: value,
      }));
    },
    []
  );

  const applyPreferences = useCallback(
    (nextPreferences) => {
      setPreferences(
        sanitizePreferences(nextPreferences)
      );
    },
    []
  );

  const setTheme = useCallback((theme) => {
    updatePreference("theme", theme);
  }, [updatePreference]);

  const toggleTheme = useCallback(() => {
    setPreferences((current) => ({
      ...current,
      theme:
        current.theme === "dark"
          ? "light"
          : "dark",
    }));
  }, []);

  const toggleSleepMode = useCallback(() => {
    setPreferences((current) => ({
      ...current,
      sleepMode: !current.sleepMode,
    }));
  }, []);

  const toggleDoNotDisturb =
    useCallback(() => {
      setPreferences((current) => ({
        ...current,
        doNotDisturb:
          !current.doNotDisturb,
      }));
    }, []);

  const value = useMemo(
    () => ({
      ...preferences,
      loadingPreferences,
      setTheme,
      toggleTheme,
      toggleSleepMode,
      toggleDoNotDisturb,
      updatePreference,
      applyPreferences,
    }),
    [
      preferences,
      loadingPreferences,
      setTheme,
      toggleTheme,
      toggleSleepMode,
      toggleDoNotDisturb,
      updatePreference,
      applyPreferences,
    ]
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = useContext(
    AppearanceContext
  );

  if (!context) {
    throw new Error(
      "useAppearance must be used inside AppearanceProvider"
    );
  }

  return context;
}