import { STATUS_META, statusKey } from "@/lib/sheets";

export function StatusBadge({ category }: { category: string }) {
  const k = statusKey(category);
  const m = STATUS_META[k] ?? STATUS_META.default;
  const isGradient = k === "offer";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider ${m.cls ?? ""}`}
      style={{
        background: isGradient ? m.bg : m.bg,
        color: isGradient ? "#1a1500" : m.color,
        border: `1px solid ${m.ring}`,
      }}
    >
      {m.label}
    </span>
  );
}
