import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import { Nav } from "@/components/Nav";
import { VanityBoard } from "@/components/VanityBoard";
import { Receipt } from "@/components/Receipt";
import type { Difficulty } from "@/lib/checkers";
import { summarize, bellaNotes, auraDelta, slayPercent, type GameEvent, type MatchSummary } from "@/lib/bella";
import { loadProfile, saveProfile } from "@/lib/storage";

export const Route = createFileRoute("/play")({ component: PlayPage });

const DIFFICULTIES: Difficulty[] = ["Easy Skin Care", "Mid Aesthetic", "High Fashion Master"];

function PlayPage() {
  const [diff, setDiff] = useState<Difficulty>("Mid Aesthetic");
  const [matchKey, setMatchKey] = useState(0);
  const [summary, setSummary] = useState<MatchSummary | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  function handleEnd(result: "you" | "bella" | "draw", events: GameEvent[]) {
    const s = summarize(events, result);
    setSummary(s);
    const d = auraDelta(s);
    const p = loadProfile();
    saveProfile({
      ...p,
      aura: Math.max(0, p.aura + d),
      wins: p.wins + (result === "you" ? 1 : 0),
      losses: p.losses + (result === "bella" ? 1 : 0),
    });
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
                  onClick={() => { setDiff(d); setSummary(null); setMatchKey(k => k + 1); }}
                  className={`px-3 py-1.5 text-[12px] rounded-full transition ${diff === d ? "bg-ink text-ivory" : "text-mocha hover:bg-ivory"}`}
                >{d}</button>
              ))}
            </div>
          </div>

          <VanityBoard key={matchKey} difficulty={diff} onMatchEnd={handleEnd} />

          <div className="mt-5 flex items-center justify-between text-[12px] text-mocha">
            <span className="italic serif">“This board is becoming a purse.”</span>
            <button
              onClick={() => { setSummary(null); setMatchKey(k => k + 1); }}
              className="px-3 py-1.5 rounded-full bg-ivory border border-border hover:bg-cream"
            >
              Restart match
            </button>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="p-5 rounded-2xl bg-card border border-border shadow-soft">
            <div className="text-[10px] uppercase tracking-[0.24em] text-mocha">Rules, briefly</div>
            <ul className="mt-3 text-[13px] text-mocha space-y-2 leading-relaxed">
              <li>· Diagonal moves only. Forced captures.</li>
              <li>· Captured charms <em className="text-ink not-italic">merge</em> onto you.</li>
              <li>· Reach the far row → become The It-Phone.</li>
              <li>· Every charm you take is yours forever (My Bag).</li>
            </ul>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border shadow-soft">
            <div className="text-[10px] uppercase tracking-[0.24em] text-mocha">Bella, pre-match</div>
            <p className="mt-3 serif italic text-[14px] leading-snug">
              “I'll be nice. Mostly. Don't embarrass the chain.”
            </p>
          </div>
          <Link to="/bag" className="block p-5 rounded-2xl bg-cream border border-border text-[13px] hover:bg-champagne transition">
            <div className="text-[10px] uppercase tracking-[0.24em] text-mocha">Retention</div>
            <div className="serif text-[16px] mt-1">Open My Bag →</div>
          </Link>
        </aside>
      </main>

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
              className="max-w-4xl w-full bg-ivory rounded-3xl border border-border shadow-soft p-6 sm:p-8 grid md:grid-cols-[1fr,360px] gap-6"
            >
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-mocha">Bella Hadid · Post-Match Review</div>
                <h2 className="serif text-3xl mt-1 tracking-tight">
                  {summary.result === "you" ? "Clinically iconic." : summary.result === "bella" ? "Babe. We need to talk." : "A tie. How European."}
                </h2>

                <div className="mt-6 grid grid-cols-2 gap-4">
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
                    >“{n}”</motion.div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <button onClick={downloadReceipt} className="px-4 py-2 rounded-full bg-ink text-ivory text-[13px]">
                    Download Receipt
                  </button>
                  <button
                    onClick={() => { setSummary(null); setMatchKey(k => k + 1); }}
                    className="px-4 py-2 rounded-full bg-cream border border-border text-[13px]"
                  >Rematch</button>
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
