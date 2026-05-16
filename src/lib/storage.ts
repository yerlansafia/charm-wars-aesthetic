import type { CharmId } from "./copy";
import type { MatchRecord } from "./bella";

const KEY = "the-attachment/v1";
const HISTORY_KEY = "the-attachment/history/v1";

export type Profile = {
  name: string;
  city: string;
  aura: number;
  inventory: CharmId[];   // every captured charm, permanently kept
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

export function loadHistory(): MatchRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as MatchRecord[]) : [];
  } catch { return []; }
}

export function pushHistory(rec: MatchRecord) {
  if (typeof window === "undefined") return;
  const list = [rec, ...loadHistory()].slice(0, 30);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("attachment:history"));
}
