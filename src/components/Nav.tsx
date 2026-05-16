import { Link, useLocation } from "@tanstack/react-router";
import { loadProfile } from "@/lib/storage";
import { tierFor } from "@/lib/copy";
import { useEffect, useState } from "react";

const links = [
  { to: "/",            label: "Lobby" },
  { to: "/play",        label: "Vanity Board" },
  { to: "/bag",         label: "My Bag" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/spectate",    label: "Spectate" },
];

export function Nav() {
  const loc = useLocation();
  const [p, setP] = useState(() => loadProfile());
  useEffect(() => {
    const h = () => setP(loadProfile());
    window.addEventListener("attachment:profile", h);
    return () => window.removeEventListener("attachment:profile", h);
  }, []);
  const tier = tierFor(p.aura);

  return (
    <header className="sticky top-0 z-40 glass border-b border-border/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full chain-link grid place-items-center text-[10px]">🎀</div>
          <span className="serif text-[15px] tracking-tight">The Attachment</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => {
            const active = loc.pathname === l.to;
            return (
              <Link
                key={l.to} to={l.to}
                className={`px-3 py-1.5 text-[13px] rounded-full transition ${active ? "bg-ink text-ivory" : "text-mocha hover:bg-cream"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="serif text-[13px]">{tier.name}</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-mocha">{p.aura} aura · {p.city}</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-champagne grid place-items-center text-[12px] font-medium">
            {p.name.slice(0,1)}
          </div>
        </div>
      </div>
      {/* mobile nav */}
      <nav className="md:hidden flex items-center gap-1 overflow-x-auto px-4 pb-2 -mt-1">
        {links.map(l => {
          const active = loc.pathname === l.to;
          return (
            <Link key={l.to} to={l.to}
              className={`shrink-0 px-3 py-1 text-[12px] rounded-full transition ${active ? "bg-ink text-ivory" : "text-mocha bg-cream"}`}>
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
