import { useMemo, useState } from "react";
import { X, Bell } from "lucide-react";
import type { AppRow } from "@/lib/sheets";
import { statusKey } from "@/lib/sheets";

export function InterviewBanner({ rows }: { rows: AppRow[] }) {
  const [dismissed, setDismissed] = useState(false);

  const next = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return rows
      .filter(r => statusKey(r.category) === "interview" && r.interview_date)
      .map(r => ({ ...r, _d: new Date(r.interview_date + "T00:00:00") }))
      .filter(r => r._d.getTime() >= today.getTime())
      .sort((a, b) => a._d.getTime() - b._d.getTime())[0];
  }, [rows]);

  if (dismissed || !next) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diffDays = Math.round(((next as any)._d.getTime() - today.getTime()) / 86400000);
  const label =
    diffDays === 0 ? "TODAY! 🔥" :
    diffDays === 1 ? "Tomorrow!" :
    `in ${diffDays} days`;

  return (
    <div className="banner-gradient shimmer relative overflow-hidden rounded-2xl p-4 md:p-5 text-white shadow-[0_10px_40px_-10px_rgba(124,58,237,0.55)]">
      <div className="flex items-center gap-3 relative z-10">
        <div className="rounded-xl bg-white/15 backdrop-blur p-2">
          <Bell className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider opacity-80">Next Interview</p>
          <p className="font-semibold truncate">
            {next.company} — {new Date(next.interview_date! + "T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}
            {next.interview_time && ` at ${next.interview_time}`} · <span className="font-bold">{label}</span>
          </p>
        </div>
        <button onClick={() => setDismissed(true)} className="rounded-lg p-1.5 hover:bg-white/15">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
