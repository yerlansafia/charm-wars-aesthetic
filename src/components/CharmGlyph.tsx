import { CHARMS, type CharmId } from "@/lib/copy";

export const charmFor = (id: CharmId) => CHARMS.find(c => c.id === id)!;

export function CharmGlyph({
  id,
  size = 40,
  variant = "clean",
}: {
  id: CharmId;
  size?: number;
  /** "clean" = pastel girl aesthetic. "cyber" = dark oil-slick chrome opponent. */
  variant?: "clean" | "cyber";
}) {
  const c = charmFor(id);
  return (
    <span
      aria-label={c.name}
      style={{
        fontSize: size * 0.72,
        lineHeight: 1,
        filter:
          variant === "cyber"
            ? "grayscale(1) brightness(0.55) contrast(1.4) drop-shadow(0 0 6px oklch(0.6 0.22 290 / 0.7)) drop-shadow(0 0 1px oklch(0.85 0.18 320 / 0.8))"
            : undefined,
      }}
      className={`select-none ${variant === "cyber" ? "cyber-glyph" : ""}`}
    >
      {c.emoji}
    </span>
  );
}
