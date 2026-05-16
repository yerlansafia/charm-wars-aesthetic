import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { CHARMS, type CharmId } from "@/lib/copy";
import { CharmGlyph } from "@/components/CharmGlyph";
import { loadProfile } from "@/lib/storage";
import { VanityDrop } from "@/components/VanityDrop";

export const Route = createFileRoute("/bag")({ component: BagPage });

const RARITY_ORDER = { common: 0, rare: 1, mythic: 2 } as const;
const RARITY_LABEL = { common: "Common", rare: "Rare", mythic: "Mythic" } as const;

function BagPage() {
  const [profile, setProfile] = useState(() => loadProfile());
  const [filter, setFilter] = useState<"all" | "common" | "rare" | "mythic">("all");
  const [shopOpen, setShopOpen] = useState(false);

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

  const unlockedCount = Object.values(counts).filter(n => n > 0).length;

  return (
    <div className="min-h-screen bg-noise">
      <Nav />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <header className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-mocha">Retention loop</div>
            <h1 className="serif text-4xl tracking-tight mt-1">My Bag</h1>
            <p className="text-mocha text-[14px] mt-2 max-w-md">
              Every charm you've ever captured. <span className="tabular-nums text-ink">{unlockedCount}</span>/{CHARMS.length} unlocked, princess.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShopOpen(true)}
              className="px-4 py-2 rounded-full text-[12px] text-ivory"
              style={{ background: "var(--accent-rose)" }}
            >
              Get Deluxe Charms
            </button>
            <div className="flex items-center gap-1 p-1 rounded-full bg-cream border border-border">
              {(["all","common","rare","mythic"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-[12px] rounded-full capitalize transition ${filter === f ? "bg-ink text-ivory" : "text-mocha hover:bg-ivory"}`}
                >{f}</button>
              ))}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(c => {
            const owned = counts[c.id] ?? 0;
            const unlocked = owned > 0;
            return (
              <div
                key={c.id}
                className={`group relative p-5 rounded-2xl border overflow-hidden transition ${unlocked ? "gloss-card border-border" : "locked-card border-border"}`}
              >
                <div className="aspect-square rounded-xl grid place-items-center mb-4 relative"
                  style={{ background: unlocked ? "color-mix(in oklab, var(--accent-soft) 60%, var(--cream))" : "var(--cream)" }}
                >
                  <div className={unlocked ? "" : "grayscale opacity-40"}>
                    <CharmGlyph id={c.id} size={88} />
                  </div>
                  {!unlocked && (
                    <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-ivory/90 border border-border grid place-items-center text-[13px]">
                      🔒
                    </div>
                  )}
                </div>
                <div className="flex items-start justify-between relative">
                  <div>
                    <div className="serif text-[16px] tracking-tight">{c.name}</div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-mocha mt-1">{RARITY_LABEL[c.rarity]}</div>
                  </div>
                  <div className={`text-[11px] tabular-nums ${unlocked ? "text-ink serif text-[14px]" : "text-mocha"}`}>×{owned}</div>
                </div>
                {!unlocked && (
                  <p className="mt-3 text-[11px] text-mocha leading-snug serif italic relative">
                    "Capture this item in battle to unlock, princess."
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Pro upsell */}
        <section className="mt-12 p-6 sm:p-8 rounded-3xl bg-ink text-ivory">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-md">
              <div className="text-[10px] uppercase tracking-[0.28em] text-ivory/60">Get Deluxe Charms</div>
              <h3 className="serif text-3xl mt-2">The Vanity Drop</h3>
              <p className="text-ivory/70 text-[14px] mt-3">
                Liquid Chrome, Pinko bag tags, full Rhode unlock. Pure cosmetic damage. Cheaper than a real lip gloss, so technically you're saving.
              </p>
            </div>
            <button onClick={() => setShopOpen(true)} className="px-5 py-2.5 rounded-full bg-ivory text-ink text-[13px]">
              Open store →
            </button>
          </div>
        </section>
      </main>

      <VanityDrop open={shopOpen} onClose={() => setShopOpen(false)} />
    </div>
  );
}
