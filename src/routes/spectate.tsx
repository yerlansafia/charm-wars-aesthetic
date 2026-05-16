import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { COMBO_TEXTS, rand } from "@/lib/copy";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/spectate")({ component: SpectatePage });

const MATCHES = [
  { id: "m1", a: "Aisulu", b: "Dana", aTier: "Weaponized Girlhood", bTier: "Clinically Iconic", viewers: 1284, city: "Almaty ↔ Astana" },
  { id: "m2", a: "Inzhu", b: "Aruzhan", aTier: "Attachment Oracle", bTier: "Attachment Oracle", viewers: 612, city: "Shymkent ↔ Almaty" },
  { id: "m3", a: "Madina", b: "Tomiris", aTier: "Pinterest Threat", bTier: "Soft Launch Intern", viewers: 188, city: "Astana ↔ Astana" },
];

function SpectatePage() {
  const [ticker, setTicker] = useState(COMBO_TEXTS.slice(0, 6));
  useEffect(() => {
    const t = setInterval(() => setTicker(prev => [rand(COMBO_TEXTS), ...prev].slice(0, 6)), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-noise">
      <Nav />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <header className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-mocha">Aesthetic chaos · live</div>
            <h1 className="serif text-4xl tracking-tight mt-1">Lip Gloss Spectator League</h1>
            <p className="text-mocha text-[14px] mt-2 max-w-md">
              ASMR clinks. Glitter trails. No commentary, only ambience.
            </p>
          </div>
          <span className="text-[11px] uppercase tracking-[0.24em] text-mocha">
            🔊 ASMR audio enabled — adjust volume
          </span>
        </header>

        <div className="grid lg:grid-cols-[1fr,280px] gap-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {MATCHES.map(m => (
              <div key={m.id} className="p-5 rounded-2xl bg-card border border-border shadow-soft">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-mocha">
                  <span>● live</span><span>{m.viewers.toLocaleString()} watching</span>
                </div>
                <div className="mt-3 serif text-[20px] tracking-tight">{m.a} <span className="text-mocha">vs</span> {m.b}</div>
                <div className="text-[12px] text-mocha mt-1 italic serif">{m.aTier} ↔ {m.bTier}</div>
                <div className="text-[11px] text-mocha mt-1">{m.city}</div>

                {/* mini-board ornament */}
                <div className="mt-4 aspect-square rounded-xl overflow-hidden border border-border grid grid-cols-8">
                  {Array.from({ length: 64 }).map((_, i) => {
                    const r = Math.floor(i/8), c = i%8;
                    const dark = (r+c) % 2 === 1;
                    return <div key={i} className={dark ? "bg-tile-dark" : "bg-tile-light"} />;
                  })}
                </div>

                <button className="mt-4 w-full px-4 py-2 rounded-full bg-ink text-ivory text-[13px]">
                  Enter spectator booth
                </button>
              </div>
            ))}
          </div>

          <aside className="p-5 rounded-2xl bg-card border border-border shadow-soft h-fit">
            <div className="text-[10px] uppercase tracking-[0.24em] text-mocha">Live floating combos</div>
            <ul className="mt-3 space-y-2">
              {ticker.map((t, i) => (
                <li key={i} className="serif italic text-[13px] text-ink animate-floaty" style={{ animationDelay: `${i * 0.2}s` }}>
                  “{t}”
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </main>
    </div>
  );
}
