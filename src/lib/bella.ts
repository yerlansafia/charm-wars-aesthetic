// Bella Hadid post-match commentary. Luxury detachment + meta-humor.
import type { Move } from "./checkers";

export type GameEvent = {
  turn: number;
  side: "you" | "bella";
  captures: number;     // captures in that turn
  promoted: boolean;
  chainLengthAfter: number;
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
};

export function summarize(events: GameEvent[], result: MatchSummary["result"]): MatchSummary {
  let yourCaptures = 0, bellaCaptures = 0, maxChain = 0, biggestCombo = 0;
  let yourMoves = 0, yourCaptureMoves = 0;
  for (const e of events) {
    if (e.side === "you") {
      yourMoves++;
      yourCaptures += e.captures;
      if (e.captures > 0) yourCaptureMoves++;
      if (e.captures > biggestCombo) biggestCombo = e.captures;
    } else {
      bellaCaptures += e.captures;
    }
    if (e.chainLengthAfter > maxChain) maxChain = e.chainLengthAfter;
  }
  return {
    events, result, totalTurns: events.length,
    yourCaptures, bellaCaptures, maxChain, biggestCombo,
    yourMoves, yourCaptureMoves,
  };
}

export function auraDelta(s: MatchSummary): number {
  const base = s.result === "you" ? 80 : s.result === "draw" ? 10 : -45;
  const bonus = s.yourCaptures * 6 + s.biggestCombo * 12 + s.maxChain * 4;
  return Math.round(base + bonus);
}

export function slayPercent(s: MatchSummary): number {
  if (!s.yourMoves) return 0;
  const captureRate = s.yourCaptureMoves / s.yourMoves;
  const result = s.result === "you" ? 1 : s.result === "draw" ? 0.5 : 0.25;
  return Math.round(Math.min(100, (captureRate * 0.6 + result * 0.4) * 100));
}

export function bellaNotes(s: MatchSummary): string[] {
  const notes: string[] = [];
  if (s.result === "you") notes.push("Clinically iconic. You protected the lip gloss.");
  if (s.result === "bella") notes.push("Babe, that match lowered your aura. We can rebuild.");
  if (s.result === "draw") notes.push("A draw. Tasteful, but I expected more glamour.");

  if (s.biggestCombo >= 3) notes.push(`A ${s.biggestCombo}-chain combo. Borderline rude.`);
  else if (s.biggestCombo === 2) notes.push("A double capture. Cute, but you could've tripled.");
  else notes.push("Not a single combo. We need to talk about your forced captures.");

  if (s.maxChain >= 5) notes.push("Your chain was getting expensive. I respect that.");
  else if (s.maxChain >= 3) notes.push("Mid-length chain. Pinterest-coded, not Pinko-coded.");
  else notes.push("Your chain was emotionally underdeveloped.");

  if (s.yourCaptureMoves / Math.max(1, s.yourMoves) < 0.25)
    notes.push("You missed too many captures. Forced moves are not optional, princess.");

  if (s.yourCaptures > s.bellaCaptures + 4) notes.push("You absolutely accessorized me. Disrespectful.");
  if (s.bellaCaptures > s.yourCaptures + 4) notes.push("I took your charms with restraint. Try harder.");

  return notes.slice(0, 4);
}
