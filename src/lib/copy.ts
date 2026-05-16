// All the meme copy, centralized.

export const LOADING_PHRASES = [
  "Applying lip gloss…",
  "Charging feminine energy…",
  "Synchronizing charms…",
  "Polishing the chain…",
  "Counting emotional support items…",
  "Connecting to the girlhood network…",
  "Restoring aura…",
  "Checking aesthetic compatibility…",
  "Verifying slay levels…",
  "Preparing luxury experience…",
];

export const COMBO_TEXTS = [
  "Slay detected.", "Attachment acquired.", "Chain reaction.",
  "Linked and loaded.", "Your aura expanded.", "Charm collected.",
  "She got accessorized.", "New obsession unlocked.", "Your phone got heavier.",
  "Maximum girlhood reached.", "This chain is getting expensive.",
  "Luxury combo.", "Emotionally attached.", "Charm hoarder.",
  "Pretty dangerous.", "Your setup is evolving.", "This is so Pinterest.",
  "Your attachment issues are winning.", "Main character inventory.",
  "Accessorize or die.", "Tiny object. Massive power.",
  "Your aesthetic is overpowering.", "The chain keeps growing.",
  "Pretty privilege activated.", "Rich girl combo.", "She's building lore.",
  "Soft girl domination.", "Hyperfeminine warfare.", "Coquette aggression.",
  "Girlypop destruction.", "Tactical femininity.", "Weaponized girlhood.",
  "Cute but strategic.", "Glamour strike.", "Luxury damage.",
  "Emotional support charm added.", "She ate that move.",
  "Feminine urge to collect more.", "This match smells like vanilla lip gloss.",
  "Girl math says this combo is worth it.", "Warning: excessive slay detected.",
  "Beauty accumulation phase.", "Attachment level critical.",
  "This board is becoming a purse.", "Inventory worth more than rent.",
  "You are now entering diva mode.", "That move was clinically iconic.",
];

export const CAPTURE_TEXTS = [
  "Clink.", "Attached.", "Added to the chain.", "Mine now.",
  "Collected with love.", "Acquired for the aesthetic.", "New charm unlocked.",
  "She got absorbed into the lore.", "Chain extended.", "Added to your emotional baggage.",
  "You stole her whole vibe.", "Luxury expansion successful.", "The collection grows.",
  "This belongs to you now, princess.", "Another item for the attachment shrine.",
];

export const KING_TEXTS = [
  "IT-GIRL MODE ACTIVATED.",
  "The phone has awakened. Final form unlocked.",
  "Main character has entered the chat.",
  "Attachment queen.", "Fully accessorized.", "Maximum slay achieved.",
  "The It-Phone arrives. You are no longer playing checkers.",
  "She became the aesthetic.", "Warning: uncontrollable glamour.",
  "Too iconic for standard gameplay.", "Final boss of femininity.",
  "The chain owns the board now.", "The aura is blinding.",
  "She's not a player anymore. She's a brand.",
];

export const MARKETING = [
  "Not a board game. A personality disorder.",
  "Build your dream attachment chain.",
  "The girliest strategy game alive.",
  "Weaponized accessorizing.",
  "Collect charms. Destroy friendships.",
  "Every move adds to the aesthetic.",
  "Your emotional support lip gloss is now a weapon.",
  "Chess is for kingdoms. This is for it-girls.",
  "Finally, a strategy game for girls who over-accessorize.",
  "Win the match. Steal the aesthetic.",
  "The first strategy game powered by attachment issues.",
  "Luxury warfare for girls with too many charms.",
  "Play cute. Strike hard.",
  "Built for girls who decorate everything.",
  "The board gets prettier the more dangerous you become.",
];

export const AURA_TIERS = [
  { min: 0,    name: "Soft Launch Intern" },
  { min: 400,  name: "Pinterest Threat" },
  { min: 900,  name: "Attachment Oracle" },
  { min: 1500, name: "Clinically Iconic" },
  { min: 2200, name: "Weaponized Girlhood" },
] as const;

export function tierFor(aura: number) {
  let t = AURA_TIERS[0];
  for (const tier of AURA_TIERS) if (aura >= tier.min) t = tier;
  return t;
}

export const CHARMS = [
  { id: "lipgloss",  name: "Glazed Lip Gloss",  emoji: "💄", rarity: "common"  as const },
  { id: "serum",     name: "Centella Serum",    emoji: "🧴", rarity: "common"  as const },
  { id: "airpods",   name: "AirPods Case",      emoji: "🎧", rarity: "common"  as const },
  { id: "teddy",     name: "Mini Teddy Charm",  emoji: "🧸", rarity: "rare"    as const },
  { id: "stanley",   name: "Pastel Stanley Cup",emoji: "🥤", rarity: "rare"    as const },
  { id: "ribbon",    name: "Coquette Ribbon",   emoji: "🎀", rarity: "common"  as const },
  { id: "jelly",     name: "Jelly Phone Case",  emoji: "📱", rarity: "common"  as const },
  { id: "chrome",    name: "Liquid Chrome Drop",emoji: "💧", rarity: "rare"    as const },
  { id: "pinko",     name: "Pinko Bag Tag",     emoji: "👛", rarity: "mythic"  as const },
  { id: "rhode",     name: "Rhode Peptide Pop", emoji: "🫧", rarity: "mythic"  as const },
] as const;

export type CharmId = typeof CHARMS[number]["id"];

export const rand = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
