import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Tier = {
  id: string; name: string; price: number; tag: string; blurb: string; perks: string[];
};

const TIERS: Tier[] = [
  {
    id: "chrome",
    name: "Liquid Chrome Skin Pack",
    price: 4.99,
    tag: "Starter drop",
    blurb: "Basically free if you use your dad's card.",
    perks: ["Liquid Chrome charm skin", "Glazed board overlay", "Mirror-finish It-Phone"],
  },
  {
    id: "pinko",
    name: "Pinko Bag Tag & Silk Ribbons Set",
    price: 2.99,
    tag: "Aura essential",
    blurb: "An absolute long-term investment into your digital aura.",
    perks: ["Pinko bag tag charm", "Silk ribbon chain links", "Coquette capture VFX"],
  },
  {
    id: "diva",
    name: "Diva Mode Unlock (All Mythic Rhode Charms)",
    price: 9.99,
    tag: "Mythic",
    blurb: "Cheaper than buying a real lip gloss, so you actually saved money.",
    perks: ["All mythic Rhode charms", "Diva-mode capture audio", "Custom Bella commentary"],
  },
];

export function VanityDrop({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tier, setTier] = useState<Tier>(TIERS[2]);
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");

  function pay() {
    setStatus("processing");
    setTimeout(() => setStatus("success"), 1100);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm grid place-items-end sm:place-items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-3xl bg-ivory sm:rounded-3xl rounded-t-3xl border border-border shadow-soft overflow-hidden"
          >
            <header className="px-6 sm:px-8 pt-6 pb-4 flex items-end justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-mocha">Limited drop · cosmetic only</div>
                <h2 className="serif text-3xl tracking-tight mt-1">The Vanity Drop</h2>
              </div>
              <button onClick={onClose} className="text-mocha text-[12px] underline-offset-4 hover:underline">Close</button>
            </header>

            <div className="grid md:grid-cols-[1.1fr,1fr] gap-6 px-6 sm:px-8 pb-8">
              {/* tiers */}
              <div className="space-y-3">
                {TIERS.map(t => {
                  const active = t.id === tier.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => { setTier(t); setStatus("idle"); }}
                      className={`text-left w-full p-4 rounded-2xl border transition relative overflow-hidden ${active ? "border-ink bg-card gloss-card" : "border-border bg-card hover:border-ink/40"}`}
                      style={{ boxShadow: active ? "0 10px 30px -14px color-mix(in oklab, var(--accent-rose) 50%, transparent)" : undefined }}
                    >
                      <div className="flex items-start justify-between gap-3 relative">
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.24em] text-mocha">{t.tag}</div>
                          <div className="serif text-[18px] mt-1 tracking-tight">{t.name}</div>
                          <div className="serif italic text-[13px] text-mocha mt-1">“{t.blurb}”</div>
                          <ul className="mt-3 text-[12px] text-mocha space-y-1">
                            {t.perks.map(p => <li key={p}>· {p}</li>)}
                          </ul>
                        </div>
                        <div className="serif text-[22px] tabular-nums shrink-0">${t.price.toFixed(2)}</div>
                      </div>
                    </button>
                  );
                })}
                <p className="text-[11px] text-mocha leading-relaxed pt-1">
                  Girl math disclosure: prices are USD. Cosmetic items only — no gameplay advantage. You can re-justify the purchase later.
                </p>
              </div>

              {/* checkout */}
              <div className="p-5 rounded-2xl bg-card border border-border shadow-soft self-start">
                <div className="text-[10px] uppercase tracking-[0.24em] text-mocha">Checkout</div>
                <div className="mt-1 serif text-[18px]">{tier.name}</div>
                <div className="mt-1 text-[12px] text-mocha tabular-nums">Total · <span className="serif text-ink text-[16px]">${tier.price.toFixed(2)}</span></div>

                <button
                  onClick={pay}
                  disabled={status === "processing"}
                  className="mt-4 w-full h-11 rounded-xl bg-ink text-ivory text-[13px] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <span aria-hidden></span> Pay
                </button>

                <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-mocha">
                  <span className="flex-1 h-px bg-border" /> or card <span className="flex-1 h-px bg-border" />
                </div>

                <div className="space-y-2">
                  <input
                    value={card} onChange={e => setCard(formatCard(e.target.value))}
                    inputMode="numeric" placeholder="Card number"
                    className="w-full h-11 px-3 rounded-xl bg-cream border border-border text-[13px] tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={exp} onChange={e => setExp(formatExp(e.target.value))}
                      inputMode="numeric" placeholder="MM / YY"
                      className="h-11 px-3 rounded-xl bg-cream border border-border text-[13px] tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                      value={cvc} onChange={e => setCvc(e.target.value.replace(/\D/g,'').slice(0,4))}
                      inputMode="numeric" placeholder="CVC"
                      className="h-11 px-3 rounded-xl bg-cream border border-border text-[13px] tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <button
                    onClick={pay}
                    disabled={status === "processing"}
                    className="w-full h-11 rounded-xl text-[13px] mt-1 disabled:opacity-60"
                    style={{ background: "var(--accent-rose)", color: "var(--ivory)" }}
                  >
                    {status === "processing" ? "Processing…" : status === "success" ? "Paid ✓" : `Confirm $${tier.price.toFixed(2)}`}
                  </button>
                </div>

                <AnimatePresence>
                  {status === "success" && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-4 p-3 rounded-xl bg-cream border border-border text-[12px] serif italic"
                    >
                      “Receipt pinned to your aura. Your charm wallet just got heavier, princess.” — Bella
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="mt-3 text-[10px] text-mocha leading-relaxed">
                  Demo checkout. No real charge. We'll wire live billing when you connect a payment provider.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function formatCard(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}
function formatExp(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  if (d.length < 3) return d;
  return d.slice(0, 2) + " / " + d.slice(2);
}
