// Bella Hadid post-match commentary + tactical analysis.
import type { CharmId } from "./copy";

export type GameEvent = {
  turn: number;
  side: "you" | "bella";
  captures: number;
  promoted: boolean;
  chainLengthAfter: number;
  // Tactical flags (only meaningful for "you" turns)
  missedDoubleCapture?: boolean;       // had a double+ available, didn't take it
  enabledOpponentPromotion?: boolean;  // bella can now reach the king row
  baitedCapture?: boolean;             // captured and left bella with no replies
};

export type MatchSummary = {
  events: GameEvent[];
  result: "you" | "bella" | "draw";
  totalTurns: number;
  yourCaptures: number;
  bellaCaptures: number;
  maxChain: number;
  biggestCombo: number;
  yourMoves: number;
  yourCaptureMoves: number;
  missedDoubles: number;
  enabledPromotions: number;
  baits: number;
};

export function summarize(events: GameEvent[], result: MatchSummary["result"]): MatchSummary {
  let yourCaptures = 0, bellaCaptures = 0, maxChain = 0, biggestCombo = 0;
  let yourMoves = 0, yourCaptureMoves = 0;
  let missedDoubles = 0, enabledPromotions = 0, baits = 0;
  for (const e of events) {
    if (e.side === "you") {
      yourMoves++;
      yourCaptures += e.captures;
      if (e.captures > 0) yourCaptureMoves++;
      if (e.captures > biggestCombo) biggestCombo = e.captures;
      if (e.missedDoubleCapture) missedDoubles++;
      if (e.enabledOpponentPromotion) enabledPromotions++;
      if (e.baitedCapture) baits++;
    } else {
      bellaCaptures += e.captures;
    }
    if (e.chainLengthAfter > maxChain) maxChain = e.chainLengthAfter;
  }
  return {
    events, result, totalTurns: events.length,
    yourCaptures, bellaCaptures, maxChain, biggestCombo,
    yourMoves, yourCaptureMoves,
    missedDoubles, enabledPromotions, baits,
  };
}

export function auraDelta(s: MatchSummary): number {
  const base = s.result === "you" ? 80 : s.result === "draw" ? 10 : -45;
  const bonus = s.yourCaptures * 6 + s.biggestCombo * 12 + s.maxChain * 4;
  const penalty = s.missedDoubles * 8 + s.enabledPromotions * 14;
  return Math.round(base + bonus - penalty);
}

export function slayPercent(s: MatchSummary): number {
  if (!s.yourMoves) return 0;
  const captureRate = s.yourCaptureMoves / s.yourMoves;
  const result = s.result === "you" ? 1 : s.result === "draw" ? 0.5 : 0.25;
  return Math.round(Math.min(100, (captureRate * 0.6 + result * 0.4) * 100));
}

/** Hyper-feminine tactical commentary. Injects required exact phrases when warranted. */
export function bellaNotes(s: MatchSummary): string[] {
  const notes: string[] = [];

  // Required exact tactical phrases (highest priority)
  if (s.missedDoubles > 0) {
    notes.push("Babe, that move lowered your aura. You missed a double capture there.");
  }
  if (s.baits > 0) {
    notes.push("Clinically iconic move. You protected the lip gloss and baited her.");
  }
  if (s.enabledPromotions > 0) {
    notes.push("This move opened up a King/It-Phone for your opponent. Not chic at all.");
  }

  // Result framing
  if (s.result === "you") notes.push("Match result: clinically iconic. You ate.");
  if (s.result === "bella") notes.push("Match result: babe, we need to talk. We can rebuild the aura.");
  if (s.result === "draw") notes.push("A draw. Tasteful, but I expected more glamour.");

  // Combo color
  if (s.biggestCombo >= 3) notes.push(`A ${s.biggestCombo}-chain combo. Borderline rude.`);
  else if (s.biggestCombo === 2) notes.push("A double capture. Cute, but you could've tripled.");

  // Chain color
  if (s.maxChain >= 5) notes.push("Your chain was getting expensive. I respect that.");
  else if (s.maxChain <= 1 && s.totalTurns > 6) notes.push("Your chain was emotionally underdeveloped.");

  return notes.slice(0, 5);
}

/** Per-move review for the "AI Review" dashboard. */
export function moveReview(e: GameEvent): { tone: "good" | "bad" | "neutral"; text: string } | null {
  if (e.side !== "you") return null;
  if (e.missedDoubleCapture)
    return { tone: "bad", text: "Babe, that move lowered your aura. You missed a double capture there." };
  if (e.enabledOpponentPromotion)
    return { tone: "bad", text: "This move opened up a King/It-Phone for your opponent. Not chic at all." };
  if (e.baitedCapture)
    return { tone: "good", text: "Clinically iconic move. You protected the lip gloss and baited her." };
  if (e.captures >= 3) return { tone: "good", text: `Triple+ chain. ${e.captures} charms absorbed. Slay confirmed.` };
  if (e.captures === 2) return { tone: "good", text: "Double capture. Tactical femininity activated." };
  if (e.promoted) return { tone: "good", text: "Promotion. The It-Phone has been awakened, princess." };
  return null;
}

// ——— Persisted match history (for AI Review screen) ———
export type CapturedRecord = Partial<Record<CharmId, number>>;
export type MatchRecord = {
  id: string;
  at: number;                       // epoch ms
  mode: string;                     // e.g. "Main Character (Mid Aesthetic)"
  difficulty: string;
  result: "you" | "bella" | "draw";
  auraDelta: number;
  slayPercent: number;
  biggestCombo: number;
  maxChain: number;
  yourCaptures: number;
  bellaCaptures: number;
  notes: string[];
  capturedCharms: CapturedRecord;
};
