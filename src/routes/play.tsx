import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import { Nav } from "@/components/Nav";
import { VanityBoard } from "@/components/VanityBoard";
import { Receipt } from "@/components/Receipt";
import { BellaAvatar } from "@/components/BellaAvatar";
import { GameMetrics, type Reaction } from "@/components/GameMetrics";
import type { Difficulty } from "@/lib/checkers";
import {
  summarize, bellaNotes, auraDelta, slayPercent, moveReview,
  type GameEvent, type MatchSummary, type MatchRecord, type CapturedRecord,
} from "@/lib/bella";
import { loadProfile, saveProfile, pushHistory } from "@/lib/storage";
import type { CharmId } from "@/lib/copy";

export const Route = createFileRoute("/play")({ component: PlayPage });

const DIFFICULTIES: Difficulty[] = ["Easy Skin Care", "Mid Aesthetic", "High Fashion Master"];

const DIFF_QUOTES: Record<Difficulty, string> = {
  "Easy Skin Care":      "Easy Skin Care? Let's fix that moisture barrier first, babe.",
  "Mid Aesthetic":       "Mid Aesthetic. Balanced. Beautiful. A little boring. We accept it.",
  "High Fashion Master": "High Fashion Master? Bold. Let's see if you can handle the runway.",
};

function PlayPage() {
  const [diff, setDiff] = useState<Difficulty>("Mid Aesthetic");
  const [matchKey, setMatchKey] = useState(0);
  const [summary, setSummary] = useState<MatchSummary | null>(null);
  const [bellaToast, setBellaToast] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({ moves: 0, yourCaptures: 0, bellaCaptures: 0 });
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [reactionSignal, setReactionSignal] = useState<{ id: number; text: string } | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number | null>(null);

  function triggerReaction(text: string, tone: "good" | "bad" | "combo") {
    const id = Date.now();
    setReaction({ id, text, tone });
    setReactionSignal({ id, text });
  }

  function showBellaToast(text: string) {
    setBellaToast(text);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setBellaToast(null), 3200);
  }

  useEffect(() => () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); }, []);

  function changeDifficulty(d: Difficulty) {
    setDiff(d);
    setSummary(null);
    setMatchKey(k => k + 1);
    setMetrics({ moves: 0, yourCaptures: 0, bellaCaptures: 0 });
    showBellaToast(DIFF_QUOTES[d]);
  }

  function handleEnd(result: "you" | "bella" | "draw", events: GameEvent[]) {
    const s = summarize(events, result);
    setSummary(s);
    const d = auraDelta(s);
    const p = loadProfile();

    // Tally captured charms for the match record
    const captured: CapturedRecord = {};
    let inv: CharmId[] = [...p.inventory];
    for (const e of events) {
      if (e.side === "you" && e.captures > 0) {
        // captures already merged into inventory by board; we re-derive last N
        const recent = inv.slice(-e.captures);
        for (const id of recent) captured[id] = (captured[id] ?? 0) + 1;
      }
    }

    saveProfile({
      ...p,
      aura: Math.max(0, p.aura + d),
      wins: p.wins + (result === "you" ? 1 : 0),
      losses: p.losses + (result === "bella" ? 1 : 0),
    });

    const rec: MatchRecord = {
      id: `${Date.now()}`,
      at: Date.now(),
      mode: `Main Character (${diff})`,
      difficulty: diff,
      result,
      auraDelta: d,
      slayPercent: slayPercent(s),
      biggestCombo: s.biggestCombo,
      maxChain: s.maxChain,
      yourCaptures: s.yourCaptures,
      bellaCaptures: s.bellaCaptures,
      notes: bellaNotes(s),
      capturedCharms: captured,
    };
    pushHistory(rec);
  }

  async function downloadReceipt() {
    if (!receiptRef.current) return;
    const url = await toPng(receiptRef.current, { pixelRatio: 2, cacheBust: true });
    const a = document.createElement("a");
    a.href = url; a.download = "the-attachment-receipt.png"; a.click();
  }

  return (
    <div className="min-h-screen bg-noise">
      <Nav />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-[1fr,300px] gap-8">
        <section>
          <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-mocha">Main Character Mode</div>
              <h1 className="serif text-3xl tracking-tight">You vs Bella Hadid</h1>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-full bg-cream border border-border">
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  onClick={() => changeDifficulty(d)}
                  className={`px-3 py-1.5 text-[12px] rounded-full transition ${diff === d ? "bg-ink text-ivory" : "text-mocha hover:bg-ivory"}`}
                >{d}</button>
              ))}
            </div>
          </div>

          <VanityBoard
            key={matchKey}
            difficulty={diff}
            onMatchEnd={handleEnd}
            onMetrics={setMetrics}
            reactionSignal={reactionSignal}
          />

          <div className="mt-5 flex items-center justify-between text-[12px] text-mocha">
            <span className="italic serif">"This board is becoming a purse."</span>
            <button
              onClick={() => { setSummary(null); setMatchKey(k => k + 1); setMetrics({ moves: 0, yourCaptures: 0, bellaCaptures: 0 }); }}
              className="px-3 py-1.5 rounded-full bg-ivory border border-border hover:bg-cream"
            >
              Restart match
            </button>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="p-5 rounded-2xl bg-card border border-border shadow-soft flex items-center gap-4">
            <BellaAvatar size={64} />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.24em] text-mocha">Coach</div>
              <div className="serif text-[16px]">Bella Hadid</div>
              <div className="text-[11px] text-mocha italic serif">"Don't embarrass the chain."</div>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border shadow-soft">
            <div className="text-[10px] uppercase tracking-[0.24em] text-mocha">Rules, briefly</div>
            <ul className="mt-3 text-[13px] text-mocha space-y-2 leading-relaxed">
              <li>· Diagonal moves only. Forced captures.</li>
              <li>· Captured charms <em className="text-ink not-italic">merge</em> onto you.</li>
              <li>· Reach the far row → become The It-Phone.</li>
              <li>· Every charm you take is yours forever (My Bag).</li>
            </ul>
          </div>
          <Link to="/bag" className="block p-5 rounded-2xl bg-cream border border-border text-[13px] hover:bg-champagne transition">
            <div className="text-[10px] uppercase tracking-[0.24em] text-mocha">Retention</div>
            <div className="serif text-[16px] mt-1">Open My Bag →</div>
          </Link>
        </aside>
      </main>

      {/* Bella difficulty toast */}
      <AnimatePresence>
        {bellaToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[92%] sm:w-auto"
          >
            <div className="flex items-start gap-3 p-3 pr-4 rounded-2xl bg-ivory border border-border shadow-soft"
              style={{ boxShadow: "0 16px 40px -16px color-mix(in oklab, var(--accent-rose) 50%, transparent)" }}>
              <BellaAvatar size={40} pulse={false} />
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.24em] text-mocha">Bella reacts</div>
                <div className="serif italic text-[13px] mt-0.5 leading-snug">"{bellaToast}"</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {summary && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center p-4 bg-ink/40 backdrop-blur-sm"
            onClick={() => setSummary(null)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full bg-ivory rounded-3xl border border-border shadow-soft p-6 sm:p-8 grid md:grid-cols-[1fr,360px] gap-6 max-h-[90vh] overflow-y-auto"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <BellaAvatar size={56} />
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.28em] text-mocha">Bella Hadid · Post-Match Review</div>
                    <h2 className="serif text-2xl sm:text-3xl mt-0.5 tracking-tight">
                      {summary.result === "you" ? "Clinically iconic." : summary.result === "bella" ? "Babe. We need to talk." : "A tie. How European."}
                    </h2>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-4">
                  <Stat k="Aura Δ" v={`${auraDelta(summary) >= 0 ? "+" : ""}${auraDelta(summary)}`} />
                  <Stat k="Slay %" v={`${slayPercent(summary)}%`} />
                  <Stat k="Biggest Combo" v={`${summary.biggestCombo}×`} />
                  <Stat k="Max Chain" v={`${summary.maxChain}`} />
                </div>

                <div className="mt-6 space-y-2">
                  {bellaNotes(summary).map((n, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 + 0.1 }}
                      className="p-3 rounded-xl bg-cream border border-border serif italic text-[14px]"
                    >"{n}"</motion.div>
                  ))}
                </div>

                {/* Per-move highlights */}
                {(() => {
                  const reviews = summary.events.map((e, i) => ({ i, r: moveReview(e) })).filter(x => x.r);
                  if (!reviews.length) return null;
                  return (
                    <div className="mt-6">
                      <div className="text-[10px] uppercase tracking-[0.24em] text-mocha mb-2">Move highlights</div>
                      <ul className="space-y-1.5">
                        {reviews.slice(0, 5).map(({ i, r }) => (
                          <li key={i} className="text-[12px] flex items-start gap-2">
                            <span className={`mt-0.5 inline-block w-1.5 h-1.5 rounded-full ${r!.tone === "good" ? "bg-ink" : r!.tone === "bad" ? "bg-destructive" : "bg-mocha"}`} />
                            <span className="text-mocha"><span className="tabular-nums text-ink">#{i + 1}</span> · {r!.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}

                <div className="mt-6 flex flex-wrap gap-2">
                  <button onClick={downloadReceipt} className="px-4 py-2 rounded-full bg-ink text-ivory text-[13px]">
                    Download Receipt
                  </button>
                  <button
                    onClick={() => { setSummary(null); setMatchKey(k => k + 1); }}
                    className="px-4 py-2 rounded-full bg-cream border border-border text-[13px]"
                  >Rematch</button>
                  <Link to="/review" className="px-4 py-2 rounded-full bg-cream border border-border text-[13px]">
                    Open AI Review →
                  </Link>
                  <Link to="/bag" className="px-4 py-2 rounded-full bg-cream border border-border text-[13px]">
                    See loot →
                  </Link>
                </div>
              </div>

              <div className="grid place-items-center">
                <Receipt ref={receiptRef} summary={summary} mode={`Main Character (${diff})`} />
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
    <div className="p-4 rounded-2xl bg-cream border border-border">
      <div className="text-[10px] uppercase tracking-[0.24em] text-mocha">{k}</div>
      <div className="serif text-[26px] mt-1 tabular-nums">{v}</div>
    </div>
  );
}
