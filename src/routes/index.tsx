import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LOADING_PHRASES, MARKETING, rand, tierFor } from "@/lib/copy";
import { loadProfile } from "@/lib/storage";
import { Nav } from "@/components/Nav";

export const Route = createFileRoute("/")({ component: Lobby });

const MODES = [
  { id: "soft",   name: "Soft Launch",       tag: "Casual",   blurb: "Drop into a queue. Low stakes, high aesthetic.", to: "/play" },
  { id: "hard",   name: "Hard Launch",       tag: "Ranked",   blurb: "Aura-matched matchmaking. Real consequences.",  to: "/play" },
  { id: "main",   name: "Main Character",    tag: "vs Bella", blurb: "Face AI Bella Hadid. Variable luxury detachment.", to: "/play" },
  { id: "math",   name: "Girl Math Ranked",  tag: "3-min blitz", blurb: "Fast, expensive, slightly unhinged.",          to: "/play" },
];

function Lobby() {
  const [phrase, setPhrase] = useState(LOADING_PHRASES[0]);
  const [marketing, setMarketing] = useState(MARKETING[0]);
  const [profile, setProfile] = useState(() => loadProfile());

  useEffect(() => {
    const t = setInterval(() => setPhrase(rand(LOADING_PHRASES)), 2400);
    const m = setInterval(() => setMarketing(rand(MARKETING)), 5000);
    const h = () => setProfile(loadProfile());
    window.addEventListener("attachment:profile", h);
    return () => { clearInterval(t); clearInterval(m); window.removeEventListener("attachment:profile", h); };
  }, []);

  const tier = tierFor(profile.aura);

  return (
    <div className="min-h-screen bg-noise">
      <Nav />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Hero */}
        <section className="grid lg:grid-cols-[1.2fr,1fr] gap-10 items-center">
          <div>
            <div className="text-[10px] uppercase tracking-[0.32em] text-mocha mb-5">
              The Attachment · Vol. 01
            </div>
            <h1 className="serif text-[44px] sm:text-[64px] leading-[0.98] tracking-[-0.02em]">
              A strategy game<br />
              <span className="italic">for girls who</span><br />
              over-accessorize.
            </h1>
            <p className="mt-6 text-mocha max-w-md text-[15px] leading-relaxed">
              Standard checkers, completely re-staged. You play with base charms. When you capture, they don't die — they chain onto you. Reach the other side and you become The It-Phone.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/play" className="px-5 py-2.5 rounded-full bg-ink text-ivory text-[13px] hover:bg-mocha transition">
                Enter the Vanity Board
              </Link>
              <Link to="/bag" className="px-5 py-2.5 rounded-full bg-cream border border-border text-[13px] hover:bg-champagne transition">
                Open My Bag
              </Link>
            </div>
            <motion.div
              key={marketing}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="mt-10 serif italic text-[15px] text-mocha"
            >
              “{marketing}”
            </motion.div>
          </div>

          {/* Loading-card hero ornament */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-square rounded-3xl glass border border-border/70 p-8 overflow-hidden"
          >
            <div className="absolute inset-0 bg-noise opacity-70" />
            <div className="relative h-full flex flex-col items-center justify-center text-center gap-6">
              <motion.div
                animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="text-5xl animate-floaty"
              >
                💄
              </motion.div>
              <div className="serif text-[18px]">{phrase}</div>
              <div className="text-[10px] uppercase tracking-[0.32em] text-mocha">
                spinning lip gloss wheel · do not refresh
              </div>

              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-[0.28em] text-mocha">Your Aura</div>
                  <div className="serif text-[20px]">{profile.aura}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-[0.28em] text-mocha">Tier</div>
                  <div className="serif text-[14px]">{tier.name}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Modes */}
        <section className="mt-20">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="serif text-2xl">Choose your delusion</h2>
            <span className="text-[11px] uppercase tracking-[0.24em] text-mocha">Game modes</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MODES.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link to={m.to} className="block group h-full p-5 rounded-2xl bg-card border border-border hover:border-ink/40 transition shadow-soft">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-mocha">{m.tag}</div>
                  <div className="serif text-[22px] mt-1 tracking-tight">{m.name}</div>
                  <p className="text-[13px] text-mocha mt-3 leading-relaxed">{m.blurb}</p>
                  <div className="mt-5 text-[12px] flex items-center gap-1 text-ink/80 group-hover:text-ink">
                    Open <span aria-hidden>→</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Side cards */}
        <section className="mt-16 grid md:grid-cols-3 gap-4">
          <Card title="Get Deluxe Charms" tag="Upgrade to Pro"
            body="Unlock Liquid Chrome drops, Pinko bag tags, custom chain links. Pure cosmetic damage."
            cta="Preview store"
            href="/bag" />
          <Card title="Lip Gloss Spectator League" tag="Spectator mode"
            body="Watch top-tier matches with ASMR clinks and glitter trails. No commentary, only ambience."
            cta="Find a match"
            href="/spectate" />
          <Card title="Bella Hadid Coaching" tag="AI review"
            body="After every match, Bella reads your mistakes with luxury detachment. You'll feel seen — and judged."
            cta="Try Main Character"
            href="/play" />
        </section>

        <footer className="mt-20 pb-10 text-[11px] uppercase tracking-[0.24em] text-mocha text-center">
          The Attachment · Built for girls who decorate everything.
        </footer>
      </main>
    </div>
  );
}

function Card({ title, tag, body, cta, href }: { title: string; tag: string; body: string; cta: string; href: string }) {
  return (
    <Link to={href} className="block p-5 rounded-2xl bg-card border border-border hover:border-ink/40 transition shadow-soft">
      <div className="text-[10px] uppercase tracking-[0.24em] text-mocha">{tag}</div>
      <div className="serif text-[18px] mt-1">{title}</div>
      <p className="text-[13px] text-mocha mt-3 leading-relaxed">{body}</p>
      <div className="mt-4 text-[12px] text-ink/80">{cta} →</div>
    </Link>
  );
}
