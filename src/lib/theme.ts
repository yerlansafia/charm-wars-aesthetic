// Aesthetic Mode toggle — Coquette Pink ↔ Clean Girl Blue.
export type Theme = "pink" | "blue";
const KEY = "the-attachment/theme";

export function loadTheme(): Theme {
  if (typeof window === "undefined") return "pink";
  return (localStorage.getItem(KEY) as Theme) || "pink";
}

export function saveTheme(t: Theme) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, t);
  applyTheme(t);
  window.dispatchEvent(new CustomEvent("attachment:theme", { detail: t }));
}

export function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("theme-pink", "theme-blue");
  root.classList.add(t === "blue" ? "theme-blue" : "theme-pink");
}

export const THEME_LABEL: Record<Theme, string> = {
  pink: "Coquette Pink",
  blue: "Clean Girl Blue",
};
