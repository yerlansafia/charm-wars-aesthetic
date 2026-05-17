import { motion } from "framer-motion";
import type { Piece } from "@/lib/checkers";
import { CharmGlyph } from "./CharmGlyph";

/** A single playable charm (or stacked merged chain) on the Vanity Board. */
export function CharmPiece({
  piece, selected, hint, size,
}: { piece: Piece; selected?: boolean; hint?: boolean; size: number }) {
  const isYou = piece.side === "you";
  const ring = selected
    ? isYou ? "ring-2 ring-ink" : "ring-2 ring-[oklch(0.7_0.18_300)]"
    : hint ? "ring-2 ring-mocha/40" : "";

  return (
    <motion.div
      layoutId={piece.id}
      initial={false}
      animate={{ scale: selected ? 1.08 : 1 }}
      transition={{ type: "spring", stiffness: 360, damping: 26 }}
      className={`relative grid place-items-center rounded-full ${ring} ${!isYou ? "cyber-disc" : ""} ${!isYou && selected ? "cyber-glitch" : ""}`}
      style={{
        width: size, height: size,
        boxShadow: isYou
          ? "var(--shadow-charm)"
          : "0 1px 2px rgb(0 0 0 / 0.35), 0 10px 30px -10px oklch(0.35 0.18 290 / 0.6), inset 0 1px 0 oklch(0.85 0.15 290 / 0.4)",
        background: isYou
          ? "radial-gradient(circle at 35% 30%, oklch(0.99 0.01 80), oklch(0.92 0.03 60))"
          : "radial-gradient(circle at 30% 25%, oklch(0.35 0.12 285) 0%, oklch(0.22 0.14 275) 45%, oklch(0.14 0.10 290) 100%)",
      }}
    >
      {!isYou && (
        <span
          aria-hidden
          className="absolute -inset-2 -z-10 rounded-full pointer-events-none cyber-trail"
        />
      )}
      {piece.king ? (
        // The It-Phone — accessorized luxury smartphone
        <div className="relative" style={{ width: size * 0.62, height: size * 0.78 }}>
          <div className="absolute inset-0 rounded-[28%] bg-ink shadow-inner" />
          <div className="absolute inset-[10%] rounded-[22%] bg-gradient-to-br from-pearl to-blush opacity-90" />
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-champagne" />
          <div className="absolute -bottom-2 -right-2 text-[10px]">🎀</div>
          <div className="absolute -bottom-3 -left-2 text-[10px]">💎</div>
        </div>
      ) : (
        <CharmGlyph id={piece.charm} size={size} variant={isYou ? "clean" : "cyber"} />
      )}

      {/* Merged chain visualization — luxury metallic links trailing off */}
      {piece.chain.length > 0 && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-[2px] pointer-events-none">
          {piece.chain.slice(0, 6).map((cid, i) => (
            <div
              key={i}
              className="chain-link rounded-full grid place-items-center"
              style={{ width: size * 0.28, height: size * 0.28, boxShadow: "var(--shadow-chain)" }}
            >
              <span style={{ fontSize: size * 0.16 }}>
                <CharmGlyph id={cid} size={size * 0.28} variant={isYou ? "clean" : "cyber"} />
              </span>
            </div>
          ))}
          {piece.chain.length > 6 && (
            <span className="text-[9px] text-mocha font-medium ml-1">+{piece.chain.length - 6}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
