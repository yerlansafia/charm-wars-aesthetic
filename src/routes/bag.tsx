import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { CHARMS, type CharmId } from "@/lib/copy";
import { CharmGlyph } from "@/components/CharmGlyph";
import { loadProfile } from "@/lib/storage";

export const Route = createFileRoute("/bag")({ component: BagPage });

const RARITY_ORDER = { common: 0, rare: 1, mythic: 2 } as const;
const RARITY_LABEL = { common: "Common", rare: "Rare", mythic: "Mythic" } as const;

function BagPage() {
  const [profile, setProfile] = useState(() => loadProfile());
  const [filter, setFilter] = useState<"all" | "common" | "rare" | "mythic">("all");

  useEffect(() => {
    const h = () => setProfile(loadProfile());
    window.addEventListener("attachment:profile", h);
    return () => window.removeEventListener("attachment:profile", h);
  }, []);

  const counts = useMemo(() => {
    const m: Record<CharmId, number> = {} as Record<CharmId, number>;
    for (const id of profile.inventory) m[id] = (m[id] ?? 0) + 1;
    return m;
  }, [profile.inventory]);

  const items = useMemo(() => {
    return [...CHARMS]
      .sort((a, b) => RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity])
      .filter(c => filter === "all" ? true : c.rarity === filter);
  }, [filter]);

  return (
    <div className="min-h-screen bg-noise">
      <Nav />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <header className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-mocha">Retention loop</div>
            <h1 className="serif text-4xl tracking-tight mt-1">My Bag</h1>
            <p className="text-mocha text-[14px] mt-2 max-w-md">
              Every charm you've ever captured. Drag-and-drop coming soon, princess.
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-full bg-cream border border-border">
            {(["all","common","rare","mythic"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-[12px] rounded-full capitalize transition ${filter === f ? "bg-ink text-ivory" : "text-mocha hover:bg-ivory"}`}
              >{f}</button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(c => {
            const owned = counts[c.id] ?? 0;
            return (
              <div key={c.id} className="group relative p-5 rounded-2xl bg-card border border-border shadow-soft">
                <div className="aspect-square rounded-xl bg-cream grid place-items-center mb-4">
                  <div className={owned ? "" : "grayscale opacity-30"}>
                    <CharmGlyph id={c.id} size={88} />
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="serif text-[16px] tracking-tight">{c.name}</div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-mocha mt-1">{RARITY_LABEL[c.rarity]}</div>
                  </div>
                  <div className="text-[11px] tabular-nums text-mocha">×{owned}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pro upsell */}
        <section className="mt-12 p-6 sm:p-8 rounded-3xl bg-ink text-ivory">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-md">
              <div className="text-[10px] uppercase tracking-[0.28em] text-ivory/60">Get Deluxe Charms</div>
              <h3 className="serif text-3xl mt-2">Upgrade to Pro</h3>
              <p className="text-ivory/70 text-[14px] mt-3">
                Unlock Liquid Chrome drops, Pinko bag tags, custom chain links, and the Rhode peptide pop. Pure cosmetic damage. Your bag, but expensive.
              </p>
            </div>
            <button className="px-5 py-2.5 rounded-full bg-ivory text-ink text-[13px]">
              Open store · $8.99
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
