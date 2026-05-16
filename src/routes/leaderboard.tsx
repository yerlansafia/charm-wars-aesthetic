import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { AURA_TIERS, tierFor } from "@/lib/copy";
import { loadProfile } from "@/lib/storage";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/leaderboard")({ component: LBPage });

const SEED = [
  { name: "Aisulu", city: "Almaty", aura: 2480 },
  { name: "Dana", city: "Astana", aura: 2110 },
  { name: "Inzhu", city: "Shymkent", aura: 1820 },
  { name: "Aruzhan", city: "Almaty", aura: 1640 },
  { name: "Madina", city: "Astana", aura: 1520 },
  { name: "Saule", city: "Shymkent", aura: 1380 },
  { name: "Aizere", city: "Almaty", aura: 1190 },
  { name: "Tomiris", city: "Astana", aura: 980 },
  { name: "Zarina", city: "Shymkent", aura: 760 },
  { name: "Asem", city: "Almaty", aura: 540 },
];

function LBPage() {
  const [profile, setProfile] = useState(() => loadProfile());
  const [scope, setScope] = useState<"global" | "city">("global");
  useEffect(() => {
    const h = () => setProfile(loadProfile());
    window.addEventListener("attachment:profile", h);
    return () => window.removeEventListener("attachment:profile", h);
  }, []);

  const rows = [...SEED, { name: profile.name, city: profile.city, aura: profile.aura }]
    .filter(r => scope === "global" ? true : r.city === profile.city)
    .sort((a, b) => b.aura - a.aura);

  return (
    <div className="min-h-screen bg-noise">
      <Nav />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <header className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-mocha">Aura Score</div>
            <h1 className="serif text-4xl tracking-tight mt-1">Leaderboard</h1>
            <p className="text-mocha text-[14px] mt-2">Real consequences. Tasteful violence.</p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-full bg-cream border border-border">
            {(["global","city"] as const).map(s => (
              <button key={s} onClick={() => setScope(s)}
                className={`px-3 py-1.5 text-[12px] rounded-full capitalize transition ${scope === s ? "bg-ink text-ivory" : "text-mocha hover:bg-ivory"}`}>
                {s === "city" ? profile.city : "Global"}
              </button>
            ))}
          </div>
        </header>

        <div className="grid lg:grid-cols-[1fr,260px] gap-6">
          <div className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
            <div className="grid grid-cols-[40px,1fr,80px,1fr,80px] px-5 py-3 text-[10px] uppercase tracking-[0.24em] text-mocha border-b border-border">
              <span>#</span><span>Player</span><span>City</span><span>Tier</span><span className="text-right">Aura</span>
            </div>
            {rows.map((r, i) => {
              const me = r.name === profile.name && r.city === profile.city && r.aura === profile.aura;
              const t = tierFor(r.aura);
              return (
                <div key={i} className={`grid grid-cols-[40px,1fr,80px,1fr,80px] items-center px-5 py-3 text-[13px] border-b border-border/60 last:border-b-0 ${me ? "bg-champagne/40" : ""}`}>
                  <span className="serif tabular-nums text-mocha">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-cream border border-border grid place-items-center text-[10px]">{r.name.slice(0,1)}</span>
                    <span className="font-medium">{r.name}{me && <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-mocha">you</span>}</span>
                  </span>
                  <span className="text-mocha">{r.city}</span>
                  <span className="serif italic">{t.name}</span>
                  <span className="text-right tabular-nums">{r.aura}</span>
                </div>
              );
            })}
          </div>

          <aside className="p-5 rounded-2xl bg-card border border-border shadow-soft h-fit">
            <div className="text-[10px] uppercase tracking-[0.24em] text-mocha">Tier Ladder</div>
            <ul className="mt-3 space-y-2">
              {AURA_TIERS.map(t => (
                <li key={t.name} className="flex items-center justify-between text-[13px]">
                  <span className="serif italic">{t.name}</span>
                  <span className="tabular-nums text-mocha">{t.min}+</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 pt-4 border-t border-border text-[12px] text-mocha italic serif">
              “Chess is for kingdoms. This is for it-girls.”
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
