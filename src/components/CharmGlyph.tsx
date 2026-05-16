import { CHARMS, type CharmId } from "@/lib/copy";

export const charmFor = (id: CharmId) => CHARMS.find(c => c.id === id)!;

export function CharmGlyph({ id, size = 40 }: { id: CharmId; size?: number }) {
  const c = charmFor(id);
  return (
    <span
      aria-label={c.name}
      style={{ fontSize: size * 0.72, lineHeight: 1 }}
      className="select-none"
    >
      {c.emoji}
    </span>
  );
}
