// Full checkers engine with forced captures, multi-jumps, king ("It-Phone") promotion.
// Board: 8x8. Pieces only on dark tiles ((r+c)%2===1).
// Player "you" moves UP (row decreases). Player "bella" moves DOWN.

import type { CharmId } from "./copy";

export type Side = "you" | "bella";
export type Piece = {
  id: string;
  side: Side;
  king: boolean;       // "It-Phone"
  charm: CharmId;      // base charm identity
  chain: CharmId[];    // charms merged onto it via captures
};
export type Cell = Piece | null;
export type Board = Cell[][];

export type Move = {
  fromR: number; fromC: number;
  toR: number;   toC: number;
  captures: { r: number; c: number }[]; // squares jumped over
};

export const SIZE = 8;

let pid = 0;
const newId = () => `p${++pid}`;

const STARTING_CHARMS_YOU: CharmId[]   = ["lipgloss","serum","airpods","ribbon","jelly","stanley","teddy","chrome"];
const STARTING_CHARMS_BELLA: CharmId[] = ["rhode","pinko","chrome","stanley","teddy","airpods","serum","lipgloss"];

export function initialBoard(): Board {
  const b: Board = Array.from({ length: SIZE }, () => Array<Cell>(SIZE).fill(null));
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < SIZE; c++) {
      if ((r + c) % 2 === 1) {
        b[r][c] = { id: newId(), side: "bella", king: false, charm: STARTING_CHARMS_BELLA[c], chain: [] };
      }
    }
  }
  for (let r = SIZE - 3; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if ((r + c) % 2 === 1) {
        b[r][c] = { id: newId(), side: "you", king: false, charm: STARTING_CHARMS_YOU[c], chain: [] };
      }
    }
  }
  return b;
}

const inBounds = (r: number, c: number) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;

function directionsFor(p: Piece): [number, number][] {
  if (p.king) return [[-1,-1],[-1,1],[1,-1],[1,1]];
  const dr = p.side === "you" ? -1 : 1;
  return [[dr,-1],[dr,1]];
}
function captureDirs(): [number, number][] {
  return [[-1,-1],[-1,1],[1,-1],[1,1]];
}

function findCaptures(board: Board, r: number, c: number): Move[] {
  const p = board[r][c]; if (!p) return [];
  const out: Move[] = [];
  // Kings can capture in 4 dirs; men only forward (per standard checkers).
  const dirs = p.king ? captureDirs() : directionsFor(p);
  for (const [dr, dc] of dirs) {
    const mr = r + dr, mc = c + dc;
    const lr = r + 2*dr, lc = c + 2*dc;
    if (!inBounds(lr, lc)) continue;
    const mid = board[mr][mc];
    if (mid && mid.side !== p.side && board[lr][lc] === null) {
      out.push({ fromR: r, fromC: c, toR: lr, toC: lc, captures: [{ r: mr, c: mc }] });
    }
  }
  return out;
}

function findSimple(board: Board, r: number, c: number): Move[] {
  const p = board[r][c]; if (!p) return [];
  const out: Move[] = [];
  for (const [dr, dc] of directionsFor(p)) {
    const nr = r + dr, nc = c + dc;
    if (inBounds(nr, nc) && board[nr][nc] === null) {
      out.push({ fromR: r, fromC: c, toR: nr, toC: nc, captures: [] });
    }
  }
  return out;
}

/** Returns multi-jump sequences as a flat list of single-jump steps available from (r,c).
 * The UI handles chained jumps step-by-step: after a capture, if more captures exist
 * from the landing square and the piece didn't promote, the same side keeps moving. */
export function legalMovesFrom(board: Board, r: number, c: number, mustCapture: boolean): Move[] {
  if (mustCapture) return findCaptures(board, r, c);
  const caps = findCaptures(board, r, c);
  return caps.length ? caps : findSimple(board, r, c);
}

export function sideHasCapture(board: Board, side: Side): boolean {
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    const p = board[r][c];
    if (p && p.side === side && findCaptures(board, r, c).length) return true;
  }
  return false;
}

export function allLegalMoves(board: Board, side: Side): Move[] {
  const forced = sideHasCapture(board, side);
  const moves: Move[] = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    const p = board[r][c];
    if (p && p.side === side) moves.push(...legalMovesFrom(board, r, c, forced));
  }
  return moves;
}

export type ApplyResult = {
  board: Board;
  capturedCharms: CharmId[];   // charms absorbed (for chain + inventory)
  promoted: boolean;
  canContinue: boolean;        // multi-jump opportunity from new square
  movedPiece: Piece;
  toR: number; toC: number;
};

export function applyMove(board: Board, move: Move): ApplyResult {
  const b = board.map(row => row.slice());
  const p = b[move.fromR][move.fromC]!;
  b[move.fromR][move.fromC] = null;
  const absorbed: CharmId[] = [];
  for (const cap of move.captures) {
    const dead = b[cap.r][cap.c];
    if (dead) {
      absorbed.push(dead.charm, ...dead.chain);
      b[cap.r][cap.c] = null;
    }
  }
  // chain absorption — merged charms ride along
  const newPiece: Piece = { ...p, chain: [...p.chain, ...absorbed] };

  // promotion
  const wasKing = newPiece.king;
  if (!newPiece.king) {
    if (newPiece.side === "you" && move.toR === 0) newPiece.king = true;
    if (newPiece.side === "bella" && move.toR === SIZE - 1) newPiece.king = true;
  }
  const promoted = !wasKing && newPiece.king;

  b[move.toR][move.toC] = newPiece;

  // Continuation only on capture, and only if no fresh promotion (standard rule).
  let canContinue = false;
  if (move.captures.length && !promoted) {
    canContinue = findCaptures(b, move.toR, move.toC).length > 0;
  }

  return { board: b, capturedCharms: absorbed, promoted, canContinue, movedPiece: newPiece, toR: move.toR, toC: move.toC };
}

export function winner(board: Board): Side | null {
  let you = 0, bella = 0;
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    const p = board[r][c]; if (!p) continue;
    if (p.side === "you") you++; else bella++;
  }
  if (you === 0) return "bella";
  if (bella === 0) return "you";
  if (!allLegalMoves(board, "you").length) return "bella";
  if (!allLegalMoves(board, "bella").length) return "you";
  return null;
}

// ——— Bella AI ———
// Difficulty drives search depth and noise.
export type Difficulty = "Easy Skin Care" | "Mid Aesthetic" | "High Fashion Master";

export function bellaMove(board: Board, diff: Difficulty): Move | null {
  const moves = allLegalMoves(board, "bella");
  if (!moves.length) return null;
  const depth = diff === "Easy Skin Care" ? 1 : diff === "Mid Aesthetic" ? 3 : 5;
  const noise = diff === "Easy Skin Care" ? 1.4 : diff === "Mid Aesthetic" ? 0.4 : 0.05;
  let best = moves[0]; let bestScore = -Infinity;
  for (const m of moves) {
    const { board: nb } = applyMove(board, m);
    const s = -negamax(nb, depth - 1, -Infinity, Infinity, "you") + (Math.random() - 0.5) * noise * 2;
    if (s > bestScore) { bestScore = s; best = m; }
  }
  return best;
}

function evaluate(board: Board): number {
  // From bella's perspective.
  let s = 0;
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    const p = board[r][c]; if (!p) continue;
    const base = p.king ? 3 : 1;
    const advance = p.side === "bella" ? r : (SIZE - 1 - r);
    const v = base + advance * 0.06 + p.chain.length * 0.2;
    s += p.side === "bella" ? v : -v;
  }
  return s;
}

function negamax(board: Board, depth: number, alpha: number, beta: number, toMove: Side): number {
  const w = winner(board);
  if (w) return (w === "bella" ? 1 : -1) * 1000;
  if (depth <= 0) return evaluate(board) * (toMove === "bella" ? 1 : -1);
  const moves = allLegalMoves(board, toMove);
  if (!moves.length) return -1000;
  let best = -Infinity;
  for (const m of moves) {
    const { board: nb } = applyMove(board, m);
    const s = -negamax(nb, depth - 1, -beta, -alpha, toMove === "bella" ? "you" : "bella");
    if (s > best) best = s;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}
