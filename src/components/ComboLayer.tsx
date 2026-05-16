import { AnimatePresence, motion } from "framer-motion";

export type FloatingText = { id: number; text: string; x: number; y: number; tone?: "soft" | "loud" };

export function ComboLayer({ items }: { items: FloatingText[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence>
        {items.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: -28, scale: 1 }}
            exit={{ opacity: 0, y: -64 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute"
            style={{ left: t.x, top: t.y, transform: "translate(-50%,-50%)" }}
          >
            <div className={`serif px-3 py-1.5 rounded-full glass border border-border/60 text-[13px] tracking-tight ${t.tone === "loud" ? "text-ink font-medium" : "text-mocha"}`}>
              {t.text}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
