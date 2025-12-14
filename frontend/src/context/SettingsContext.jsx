import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSettings } from "../../api/settingApi"; // عدّل المسار إذا عندك مختلف

const SettingsContext = createContext(null);

function applyFavicon(faviconUrl) {
  if (!faviconUrl) return;

  let link = document.querySelector("link[rel='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = faviconUrl;
}

function hexToRgbParts(hex) {
  if (!hex) return null;
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  if (full.length !== 6) return null;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return `${r} ${g} ${b}`; // مهم لتيلويند rgb(var(--primary-rgb) / alpha)
}

function applyPrimaryColor(primaryColor) {
  const rgb = hexToRgbParts(primaryColor) || "37 99 235";
  document.documentElement.style.setProperty("--primary-rgb", rgb);
}

function applyDarkMode(enabled) {
  const root = document.documentElement;
  if (enabled) root.classList.add("dark");
  else root.classList.remove("dark");
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getSettings();
      setSettings(data);

      applyFavicon(data?.faviconUrl);
      applyPrimaryColor(data?.primaryColor);
      applyDarkMode(!!data?.darkMode);
    } catch (err) {
      console.error("Failed to load settings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const value = useMemo(
    () => ({ settings, loading, reloadSettings: loadSettings }),
    [settings, loading]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    return { settings: null, loading: true, reloadSettings: async () => {} };
  }
  return ctx;
}
