import { motion } from "framer-motion";

/** Stylized Bella Hadid coach card. Editorial silhouette, no real likeness. */
export function BellaAvatar({ size = 72, pulse = true }: { size?: number; pulse?: boolean }) {
  return (
    <motion.div
      animate={pulse ? { y: [0, -2, 0] } : undefined}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="relative grid place-items-center rounded-full overflow-hidden"
      style={{
        width: size, height: size,
        background: "radial-gradient(circle at 30% 30%, var(--accent-glow), var(--accent-rose) 70%, var(--ink))",
        boxShadow: "0 12px 30px -12px color-mix(in oklab, var(--accent-rose) 60%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.5)",
      }}
      aria-label="Bella, your AI coach"
    >
      {/* abstracted face silhouette */}
      <svg viewBox="0 0 100 100" width={size * 0.78} height={size * 0.78} aria-hidden="true">
        <defs>
          <linearGradient id="skin" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.93 0.04 40)" />
            <stop offset="100%" stopColor="oklch(0.76 0.07 30)" />
          </linearGradient>
          <linearGradient id="hair" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.22 0.02 40)" />
            <stop offset="100%" stopColor="oklch(0.12 0.01 40)" />
          </linearGradient>
        </defs>
        {/* hair back */}
        <path d="M20 55 C18 25, 82 25, 80 55 L80 95 L20 95 Z" fill="url(#hair)" />
        {/* face */}
        <ellipse cx="50" cy="52" rx="22" ry="28" fill="url(#skin)" />
        {/* sharp brow */}
        <path d="M38 45 L46 43" stroke="oklch(0.2 0.02 40)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M54 43 L62 45" stroke="oklch(0.2 0.02 40)" strokeWidth="1.6" strokeLinecap="round" />
        {/* eyes */}
        <ellipse cx="42" cy="50" rx="1.6" ry="2.2" fill="oklch(0.18 0.01 40)" />
        <ellipse cx="58" cy="50" rx="1.6" ry="2.2" fill="oklch(0.18 0.01 40)" />
        {/* lip */}
        <path d="M44 66 Q50 70 56 66 Q50 72 44 66 Z" fill="oklch(0.55 0.18 20)" />
        {/* cheek glow */}
        <circle cx="38" cy="60" r="3" fill="oklch(0.82 0.10 20)" opacity="0.45" />
        <circle cx="62" cy="60" r="3" fill="oklch(0.82 0.10 20)" opacity="0.45" />
      </svg>
    </motion.div>
  );
}
