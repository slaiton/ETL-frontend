import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

/** Clave en localStorage (no se borra al cerrar sesión: es preferencia del equipo). */
export const THEME_STORAGE_KEY = "theme";

const listeners = new Set<() => void>();

function readStored(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#0b1220" : "#0087f6");
}

export function setTheme(theme: Theme) {
  apply(theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* almacenamiento bloqueado: el tema aplica solo en esta sesión */
  }
  listeners.forEach((listener) => listener());
}

/** index.html ya lo aplica antes de pintar; esto cubre el caso en que no corrió. */
export function initTheme() {
  if (!document.documentElement.dataset.theme) {
    apply(readStored() ?? "light");
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Sincroniza otras pestañas abiertas
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY && (e.newValue === "dark" || e.newValue === "light")) {
      apply(e.newValue);
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light" as Theme);
  const toggleTheme = useCallback(() => setTheme(getTheme() === "dark" ? "light" : "dark"), []);
  return { theme, toggleTheme };
}
