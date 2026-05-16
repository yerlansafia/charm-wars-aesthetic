import { forwardRef } from "react";
import type { MatchSummary } from "@/lib/bella";
import { auraDelta, slayPercent } from "@/lib/bella";
import { loadProfile } from "@/lib/storage";

type Props = { summary: MatchSummary; mode: string };

export const Receipt = forwardRef<HTMLDivElement, Props>(function Receipt({ summary, mode }, ref) {
  const p = loadProfile();
  const delta = auraDelta(summary);
  const slay = slayPercent(summary);
  const verb = summary.result === "you" ? "emotionally destroyed someone"
              : summary.result === "draw" ? "tied the aesthetic war"
              : "got accessorized by Bella Hadid";

  return (
    <div ref={ref} className="w-[360px] bg-ivory text-ink p-7 rounded-2xl border border-border shadow-soft serif">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-mocha sans" style={{ fontFamily: "var(--font-sans)" }}>
        <span>The Attachment</span><span>Receipt · {new Date().toLocaleDateString()}</span>
      </div>
      <h2 className="mt-4 text-[22px] leading-[1.15] tracking-tight">
        {p.name} {verb} in <em className="not-italic underline decoration-champagne underline-offset-4">{mode}</em>.
      </h2>

      <div className="mt-6 grid grid-cols-2 gap-y-3 gap-x-4 text-[13px]" style={{ fontFamily: "var(--font-sans)" }}>
        <Row k="Aura Δ" v={`${delta >= 0 ? "+" : ""}${delta}`} />
        <Row k="Slay %" v={`${slay}%`} />
        <Row k="Biggest Combo" v={`${summary.biggestCombo}×`} />
        <Row k="Chain Length" v={`${summary.maxChain}`} />
        <Row k="Charms Taken" v={`${summary.yourCaptures}`} />
        <Row k="Turns" v={`${summary.totalTurns}`} />
      </div>

      <div className="mt-6 pt-5 border-t border-dashed border-border text-[11px] text-mocha italic">
        “Your emotional support lip gloss is now a weapon.”
      </div>
    </div>
  );
});

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-dotted border-border/70 pb-1">
      <span className="uppercase tracking-[0.18em] text-mocha text-[10px]">{k}</span>
      <span className="font-medium tabular-nums">{v}</span>
    </div>
  );
}
