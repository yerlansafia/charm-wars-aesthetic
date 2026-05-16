import type { CharmId } from "./copy";

const KEY = "the-attachment/v1";

export type Profile = {
  name: string;
  city: string;
  aura: number;          // ELO replacement
  inventory: CharmId[];  // every captured charm, permanently kept
  wins: number;
  losses: number;
};

const DEFAULTS: Profile = {
  name: "Safi",
  city: "Almaty",
  aura: 420,
  inventory: [],
  wins: 0,
  losses: 0,
};

export function loadProfile(): Profile {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { return DEFAULTS; }
}

export function saveProfile(p: Profile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new Event("attachment:profile"));
}

export function useProfileSync(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const h = () => cb();
  window.addEventListener("attachment:profile", h);
  return () => window.removeEventListener("attachment:profile", h);
}
