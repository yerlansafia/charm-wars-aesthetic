import { motion, AnimatePresence } from "framer-motion";

export type Reaction = { id: number; text: string; tone: "good" | "bad" | "combo" };

type Props = {
  moves: number;
  yourCaptures: number;
  bellaCaptures: number;
  onReact: (text: string, tone: "good" | "bad" | "combo") => void;
  lastReaction?: Reaction | null;
};

const QUICK = [
  { label: "Slay.", tone: "good" as const, icon: "👜" },
  { label: "Rude.", tone: "bad" as const, icon: "💅" },
  { label: "Girl Math Approved.", tone: "combo" as const, icon: "✨" },
];

export function GameMetrics({ moves, yourCaptures, bellaCaptures, onReact, lastReaction }: Props) {
  return (
    <div className="p-5 rounded-2xl bg-card border border-border shadow-soft relative overflow-hidden">
      {/* Quick Reactions bar */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <div className="text-[10px] uppercase tracking-[0.24em] text-mocha">Quick Reactions</div>
        <div className="flex items-center gap-1.5">
          {QUICK.map((q) => (
            <button
              key={q.label}
              onClick={() => onReact(q.label, q.tone)}
              className="group grid place-items-center w-8 h-8 rounded-full glass border border-border/60 hover:border-ink/40 transition relative"
              title={q.label}
              aria-label={q.label}
            >
              <span className="text-[14px] leading-none">{q.icon}</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-ink text-ivory text-[8px] grid place-items-center font-medium">+</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-baseline justify-between mb-3">
        <h3 className="serif text-[15px] tracking-tight">Game Metrics</h3>
        <span className="text-[9px] uppercase tracking-[0.28em] text-mocha">Vibe Check</span>
      </div>

      <div className="space-y-2.5">
        <MetricRow label="Moves" value={moves} accent="ink" />
        <MetricRow label="Captures · You" value={yourCaptures} accent="rose" sub="merged into chain" />
        <MetricRow label="Captures · Bella" value={bellaCaptures} accent="cyber" sub="corruption data" />
      </div>

      <AnimatePresence>
        {lastReaction && (
          <motion.div
            key={lastReaction.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-4 pt-3 border-t border-border text-[11px] text-mocha flex items-center gap-2"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-ink" />
            <span>You reacted: <span className="serif italic text-ink">"{lastReaction.text}"</span></span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricRow({
  label, value, accent, sub,
}: { label: string; value: number; accent: "ink" | "rose" | "cyber"; sub?: string }) {
  const dot =
    accent === "ink"
      ? "bg-ink"
      : accent === "rose"
      ? "bg-[color:var(--accent-rose)]"
      : "bg-[oklch(0.45_0.20_290)]";
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-cream/70 border border-border/60">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${dot}`} />
          <span className="text-[11px] uppercase tracking-[0.18em] text-mocha">{label}</span>
        </div>
        {sub && <div className="text-[10px] text-mocha/70 mt-0.5 pl-3.5">{sub}</div>}
      </div>
      <div className="serif text-[22px] tabular-nums leading-none">{value}</div>
    </div>
  );
}
