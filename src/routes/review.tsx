import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Nav } from "@/components/Nav";
import { BellaAvatar } from "@/components/BellaAvatar";
import { loadHistory } from "@/lib/storage";
import { CHARMS, type CharmId } from "@/lib/copy";
import type { MatchRecord } from "@/lib/bella";

export const Route = createFileRoute("/review")({ component: ReviewPage });

function ReviewPage() {
  const [history, setHistory] = useState<MatchRecord[]>(() => loadHistory());
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const h = () => setHistory(loadHistory());
    window.addEventListener("attachment:history", h);
    return () => window.removeEventListener("attachment:history", h);
  }, []);

  const stats = useMemo(() => {
    const wins = history.filter(h => h.result === "you").length;
    const losses = history.filter(h => h.result === "bella").length;
    const slay = history.length ? Math.round(history.reduce((a, h) => a + h.slayPercent, 0) / history.length) : 0;
    const totalCaptures = history.reduce((a, h) => a + h.yourCaptures, 0);
    return { wins, losses, slay, totalCaptures, total: history.length };
  }, [history]);

  const open = history.find(h => h.id === openId) ?? null;

  return (
    <div className="min-h-screen bg-noise">
      <Nav />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Bella header card */}
        <section className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-soft flex items-center gap-5 mb-10"
          style={{ boxShadow: "0 16px 50px -20px color-mix(in oklab, var(--accent-rose) 50%, transparent)" }}>
          <BellaAvatar size={96} />
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.28em] text-mocha">Your AI Coach</div>
            <h1 className="serif text-3xl sm:text-4xl tracking-tight mt-1">Bella's Verdict</h1>
            <p className="text-mocha text-[14px] mt-2 max-w-xl serif italic">
              "I've watched every move, princess. Some were clinically iconic. Some lowered the aura. Let's review."
            </p>
          </div>
        </section>

        {/* Headline stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          <Stat k="Matches" v={`${stats.total}`} />
          <Stat k="Wins" v={`${stats.wins}`} />
          <Stat k="Losses" v={`${stats.losses}`} />
          <Stat k="Avg Slay %" v={`${stats.slay}%`} />
        </section>

        {/* Match history */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="serif text-2xl">Match history</h2>
            <Link to="/play" className="text-[12px] text-mocha hover:text-ink">+ New match</Link>
          </div>

          {history.length === 0 ? (
            <div className="p-10 rounded-2xl bg-card border border-border text-center">
              <div className="serif italic text-mocha">No matches yet. Bella has nothing to read you for.</div>
              <Link to="/play" className="inline-block mt-4 px-4 py-2 rounded-full bg-ink text-ivory text-[13px]">
                Play the Vanity Board
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {history.map(rec => (
                <li key={rec.id}>
                  <button
                    onClick={() => setOpenId(rec.id)}
                    className="text-left w-full p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-soft hover:border-ink/40 transition flex items-center gap-4"
                  >
                    <div
                      className="h-10 w-10 rounded-full grid place-items-center serif text-[12px]"
                      style={{
                        background: rec.result === "you" ? "var(--accent-glow)" : rec.result === "bella" ? "var(--cream)" : "var(--champagne)",
                        color: "var(--ink)",
                      }}
                    >
                      {rec.result === "you" ? "W" : rec.result === "bella" ? "L" : "D"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="serif text-[16px] truncate">{rec.mode}</div>
                      <div className="text-[11px] text-mocha mt-0.5">
                        {new Date(rec.at).toLocaleString()} · Slay {rec.slayPercent}% · Combo {rec.biggestCombo}× · Chain {rec.maxChain}
                      </div>
                    </div>
                    <div className={`tabular-nums serif text-[18px] ${rec.auraDelta >= 0 ? "" : "text-destructive"}`}>
                      {rec.auraDelta >= 0 ? "+" : ""}{rec.auraDelta}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center p-4 bg-ink/40 backdrop-blur-sm"
            onClick={() => setOpenId(null)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full bg-ivory rounded-3xl border border-border shadow-soft p-6 sm:p-8 max-h-[88vh] overflow-y-auto"
            >
              <div className="flex items-center gap-3 mb-4">
                <BellaAvatar size={56} />
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-mocha">Bella's Verdict</div>
                  <h3 className="serif text-2xl tracking-tight">{open.mode}</h3>
                  <div className="text-[11px] text-mocha mt-0.5">{new Date(open.at).toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                <Stat k="Aura Δ" v={`${open.auraDelta >= 0 ? "+" : ""}${open.auraDelta}`} />
                <Stat k="Slay %" v={`${open.slayPercent}%`} />
                <Stat k="Combo" v={`${open.biggestCombo}×`} />
                <Stat k="Chain" v={`${open.maxChain}`} />
              </div>

              <div className="space-y-2 mb-5">
                {open.notes.map((n, i) => (
                  <div key={i} className="p-3 rounded-xl bg-cream border border-border serif italic text-[14px]">
                    "{n}"
                  </div>
                ))}
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-mocha mb-2">Charms absorbed</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(open.capturedCharms).length === 0 && (
                    <div className="text-[12px] text-mocha italic serif">None. We don't talk about this match.</div>
                  )}
                  {Object.entries(open.capturedCharms).map(([id, count]) => {
                    const charm = CHARMS.find(c => c.id === (id as CharmId));
                    if (!charm) return null;
                    return (
                      <div key={id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream border border-border text-[12px]">
                        <span>{charm.emoji}</span>
                        <span>{charm.name}</span>
                        <span className="tabular-nums text-mocha">×{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button onClick={() => setOpenId(null)} className="px-4 py-2 rounded-full bg-ink text-ivory text-[13px]">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="p-3 rounded-2xl bg-cream border border-border">
      <div className="text-[10px] uppercase tracking-[0.24em] text-mocha">{k}</div>
      <div className="serif text-[22px] mt-0.5 tabular-nums">{v}</div>
    </div>
  );
}
