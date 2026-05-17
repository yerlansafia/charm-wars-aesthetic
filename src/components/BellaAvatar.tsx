import { motion } from "framer-motion";
import bellaPortrait from "@/assets/bella-coach.jpg";

/** Coach Bella Hadid — editorial portrait avatar, elegantly cropped into a circle. */
export function BellaAvatar({ size = 72, pulse = true }: { size?: number; pulse?: boolean }) {
  return (
    <motion.div
      animate={pulse ? { y: [0, -2, 0] } : undefined}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="relative rounded-full overflow-hidden shrink-0"
      style={{
        width: size,
        height: size,
        boxShadow:
          "0 12px 30px -12px color-mix(in oklab, var(--accent-rose) 60%, transparent), inset 0 0 0 1.5px color-mix(in oklab, var(--accent-glow) 70%, transparent)",
        background: "var(--cream)",
      }}
      aria-label="Bella, your AI coach"
    >
      <img
        src={bellaPortrait}
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          // Crop tight on the face (image generator added magazine text in the upper corners)
          objectPosition: "50% 38%",
          transform: "scale(1.65)",
          transformOrigin: "50% 45%",
        }}
        draggable={false}
      />
      {/* subtle warm vignette to blend the crop into the UI */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 110%, color-mix(in oklab, var(--accent-rose) 28%, transparent) 0%, transparent 55%)",
        }}
      />
    </motion.div>
  );
}
