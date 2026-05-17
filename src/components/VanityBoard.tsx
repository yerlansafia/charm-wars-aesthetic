import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  SIZE, initialBoard, allLegalMoves, legalMovesFrom, sideHasCapture,
  applyMove, bellaMove, winner, type Board, type Move, type Side, type Difficulty,
} from "@/lib/checkers";
import { CharmPiece } from "./CharmPiece";
import { ComboLayer, type FloatingText } from "./ComboLayer";
import { CAPTURE_TEXTS, COMBO_TEXTS, KING_TEXTS, rand } from "@/lib/copy";
import { loadProfile, saveProfile } from "@/lib/storage";
import type { GameEvent } from "@/lib/bella";

type Props = {
  difficulty: Difficulty;
  onMatchEnd: (result: "you" | "bella" | "draw", events: GameEvent[]) => void;
  onMetrics?: (m: { moves: number; yourCaptures: number; bellaCaptures: number }) => void;
  reactionSignal?: { id: number; text: string } | null;
};

export function VanityBoard({ difficulty, onMatchEnd, onMetrics, reactionSignal }: Props) {
  const [board, setBoard] = useState<Board>(() => initialBoard());
  const [turn, setTurn] = useState<Side>("you");
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [continuation, setContinuation] = useState<{ r: number; c: number } | null>(null);
  const [floats, setFloats] = useState<FloatingText[]>([]);
  const [kingOverlay, setKingOverlay] = useState<string | null>(null);
  const events = useRef<GameEvent[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);
  const fid = useRef(0);

  const mustCapture = useMemo(() => sideHasCapture(board, turn), [board, turn]);
  const legalForSelected = useMemo(() => {
    const src = continuation ?? selected;
    if (!src) return [];
    return legalMovesFrom(board, src.r, src.c, mustCapture).filter(
      m => continuation ? m.captures.length > 0 : true
    );
  }, [board, selected, continuation, mustCapture]);

  function pushFloat(text: string, r: number, c: number, tone: "soft" | "loud" = "soft") {
    const el = boardRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const cell = rect.width / SIZE;
    const id = ++fid.current;
    setFloats(f => [...f, { id, text, x: c * cell + cell / 2, y: r * cell + cell / 2, tone }]);
    setTimeout(() => setFloats(f => f.filter(t => t.id !== id)), 1500);
  }

  function endTurn(nextBoard: Board, nextSide: Side) {
    const w = winner(nextBoard);
    if (w) {
      onMatchEnd(w, events.current);
      return;
    }
    setTurn(nextSide);
  }

  function performMove(move: Move) {
    // ——— Tactical pre-analysis for "you" ———
    let missedDoubleCapture = false;
    if (turn === "you") {
      const allYour = allLegalMoves(board, "you");
      const maxCaps = allYour.reduce((m, x) => Math.max(m, x.captures.length), 0);
      if (maxCaps >= 2 && move.captures.length < 2) missedDoubleCapture = true;
    }

    const res = applyMove(board, move);
    setBoard(res.board);

    // Inventory: persist every charm captured by the player
    if (turn === "you" && res.capturedCharms.length) {
      const p = loadProfile();
      saveProfile({ ...p, inventory: [...p.inventory, ...res.capturedCharms] });
    }

    if (res.capturedCharms.length) {
      pushFloat(rand(CAPTURE_TEXTS), res.toR, res.toC, "soft");
      if (res.capturedCharms.length >= 2 || (turn === "you" && Math.random() < 0.5)) {
        setTimeout(() => pushFloat(rand(COMBO_TEXTS), res.toR, res.toC, "loud"), 220);
      }
    }
    if (res.promoted) {
      const txt = rand(KING_TEXTS);
      setKingOverlay(txt);
      setTimeout(() => setKingOverlay(null), 1600);
    }

    // ——— Post-move analysis ———
    let enabledOpponentPromotion = false;
    let baitedCapture = false;
    if (turn === "you" && !res.canContinue) {
      const bellaMoves = allLegalMoves(res.board, "bella");
      enabledOpponentPromotion = bellaMoves.some(
        m => !res.board[m.fromR][m.fromC]?.king && m.toR === SIZE - 1
      );
      if (res.capturedCharms.length > 0) {
        const bellaCaptures = bellaMoves.filter(m => m.captures.length > 0);
        if (bellaCaptures.length === 0) baitedCapture = true;
      }
    }

    events.current.push({
      turn: events.current.length + 1,
      side: turn,
      captures: res.capturedCharms.length,
      promoted: res.promoted,
      chainLengthAfter: res.movedPiece.chain.length + res.capturedCharms.length,
      missedDoubleCapture,
      enabledOpponentPromotion,
      baitedCapture,
    });

    if (res.canContinue) {
      setContinuation({ r: res.toR, c: res.toC });
      setSelected({ r: res.toR, c: res.toC });
    } else {
      setContinuation(null);
      setSelected(null);
      endTurn(res.board, turn === "you" ? "bella" : "you");
    }
  }

  useEffect(() => {
    if (turn !== "bella") return;
    const t = setTimeout(() => {
      let b = board; let safety = 0;
      const loop = () => {
        const m = bellaMove(b, difficulty);
        if (!m) { endTurn(b, "you"); return; }
        const res = applyMove(b, m);
        b = res.board;
        setBoard(b);
        if (res.capturedCharms.length) pushFloat(rand(CAPTURE_TEXTS), res.toR, res.toC, "soft");
        if (res.promoted) { setKingOverlay(rand(KING_TEXTS)); setTimeout(() => setKingOverlay(null), 1600); }
        events.current.push({
          turn: events.current.length + 1, side: "bella",
          captures: res.capturedCharms.length, promoted: res.promoted,
          chainLengthAfter: res.movedPiece.chain.length + res.capturedCharms.length,
        });
        if (res.canContinue && safety++ < 8) setTimeout(loop, 520);
        else endTurn(b, "you");
      };
      loop();
    }, 650);
    return () => clearTimeout(t);
  }, [turn, board, difficulty]);

  // Emit live metrics to parent
  useEffect(() => {
    if (!onMetrics) return;
    let moves = 0, you = 0, bella = 0;
    for (const e of events.current) {
      moves++;
      if (e.side === "you") you += e.captures;
      else bella += e.captures;
    }
    onMetrics({ moves, yourCaptures: you, bellaCaptures: bella });
  }, [board, onMetrics]);

  // Floating reaction text from external Quick Reactions
  useEffect(() => {
    if (!reactionSignal) return;
    const el = boardRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    pushFloat(reactionSignal.text, rect.height / 2 / (rect.width / SIZE) + 0.5, SIZE / 2, "loud");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactionSignal?.id]);

  function onCellClick(r: number, c: number) {
    if (turn !== "you") return;
    const piece = board[r][c];
    if (continuation) {
      const move = legalForSelected.find(m => m.toR === r && m.toC === c);
      if (move) performMove(move);
      return;
    }
    if (piece && piece.side === "you") {
      setSelected({ r, c });
      return;
    }
    if (selected) {
      const move = legalForSelected.find(m => m.toR === r && m.toC === c);
      if (move) performMove(move);
    }
  }

  const targets = new Set(legalForSelected.map(m => `${m.toR}-${m.toC}`));
  const youAllMoves = useMemo(() => allLegalMoves(board, "you"), [board]);
  const captureSources = new Set(
    mustCapture && turn === "you" ? youAllMoves.filter(m => m.captures.length).map(m => `${m.fromR}-${m.fromC}`) : []
  );

  return (
    <div className="relative w-full max-w-[640px] mx-auto">
      <div className="flex items-center justify-between text-[12px] text-mocha mb-3 px-1">
        <span className="uppercase tracking-[0.2em]">{turn === "you" ? "Your move" : "Bella is thinking…"}</span>
        {mustCapture && turn === "you" && (
          <span className="serif italic text-ink">Forced capture — accessorize or die.</span>
        )}
      </div>

      <div
        ref={boardRef}
        className="relative aspect-square w-full rounded-2xl overflow-hidden border border-border shadow-soft"
        style={{
          background: "var(--ivory)",
          boxShadow: "var(--shadow-soft), inset 0 0 0 1px color-mix(in oklab, var(--accent-rose) 35%, transparent)",
        }}
      >
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
          {Array.from({ length: SIZE * SIZE }).map((_, idx) => {
            const r = Math.floor(idx / SIZE), c = idx % SIZE;
            const dark = (r + c) % 2 === 1;
            const piece = board[r][c];
            const isSelected = selected?.r === r && selected?.c === c;
            const isTarget = targets.has(`${r}-${c}`);
            const isForcedSource = captureSources.has(`${r}-${c}`);
            return (
              <button
                key={idx}
                onClick={() => onCellClick(r, c)}
                className={`relative grid place-items-center transition-colors ${isTarget ? "ring-2 ring-inset ring-ink/40" : ""}`}
                style={{
                  background: dark ? "var(--tile-dark)" : "var(--tile-light)",
                  outline: "none",
                }}
              >
                {piece && (
                  <CharmPiece
                    piece={piece}
                    selected={isSelected}
                    hint={isForcedSource && !isSelected}
                    size={Math.min(56, 56)}
                  />
                )}
                {isTarget && !piece && (
                  <span className="block w-2.5 h-2.5 rounded-full pearl-trail bg-ink/30" />
                )}
              </button>
            );
          })}
        </div>

        <ComboLayer items={floats} />

        {kingOverlay && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 grid place-items-center pointer-events-none"
          >
            <div className="absolute inset-0 bg-ivory/70 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="relative serif text-center px-8"
            >
              <div className="text-[10px] uppercase tracking-[0.32em] text-mocha mb-2">It-Phone Awakening</div>
              <div className="text-2xl sm:text-4xl shimmer-text">{kingOverlay}</div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
