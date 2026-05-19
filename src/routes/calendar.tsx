import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useApplications } from "@/lib/useApplications";
import { STATUS_META, statusKey, type AppRow } from "@/lib/sheets";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/calendar")({
  component: CalendarPage,
  head: () => ({ meta: [{ title: "Calendar — JobTrack" }] }),
});

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function CalendarPage() {
  const { data: rows = [] } = useApplications();
  const today = new Date();
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [active, setActive] = useState<AppRow | null>(null);

  const events = useMemo(() => {
    const map = new Map<string, AppRow[]>();
    rows.forEach((r) => {
      if (!r.interview_date) return;
      const arr = map.get(r.interview_date) ?? [];
      arr.push(r);
      map.set(r.interview_date, arr);
    });
    return map;
  }, [rows]);

  const first = new Date(view.y, view.m, 1);
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const startDow = first.getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Calendar</h1>
          <p className="text-sm text-slate-400 mt-1">All your interviews in one view.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass flex items-center gap-1 p-1">
            {["Month","Week","Day"].map((v, i) => (
              <button key={v} className={`rounded-lg px-3 py-1.5 text-xs ${i===0 ? "bg-violet-500/20 text-violet-200" : "text-slate-400 hover:text-white"}`}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{MONTHS[view.m]} {view.y}</h2>
          <div className="flex items-center gap-1">
            <button onClick={() => setView(v => v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 })} className="rounded-lg p-2 hover:bg-white/5"><ChevronLeft className="h-4 w-4"/></button>
            <button onClick={() => setView({ y: today.getFullYear(), m: today.getMonth() })} className="rounded-lg px-3 py-1.5 text-xs hover:bg-white/5">Today</button>
            <button onClick={() => setView(v => v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 })} className="rounded-lg p-2 hover:bg-white/5"><ChevronRight className="h-4 w-4"/></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-2">
          {DOW.map(d => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (d === null) return <div key={i} className="aspect-[5/4] rounded-lg bg-black/10" />;
            const dateStr = `${view.y}-${String(view.m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
            const isToday = dateStr === `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
            const dayEvents = events.get(dateStr) ?? [];
            const dow = (startDow + d - 1) % 7;
            const weekend = dow === 0 || dow === 6;
            return (
              <div
                key={i}
                className={`group aspect-[5/4] rounded-lg border p-2 text-left text-xs transition-all ${
                  isToday ? "border-cyan-400/60 today-glow bg-cyan-500/5" :
                  weekend ? "border-white/[0.03] bg-black/20" :
                  "border-white/5 hover:border-violet-500/40"
                }`}
              >
                <div className={`mb-1 ${isToday ? "text-cyan-300 font-bold" : "text-slate-300"}`}>{d}</div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((e) => {
                    const meta = STATUS_META[statusKey(e.category)] ?? STATUS_META.default;
                    return (
                      <button
                        key={e.id}
                        onClick={() => setActive(e)}
                        className="block w-full truncate rounded-md px-1.5 py-1 text-left text-[10px] font-medium transition-transform hover:scale-[1.02]"
                        style={{ background: `${meta.color}1a`, color: meta.color, borderLeft: `2px solid ${meta.color}` }}
                      >
                        🟢 {e.company}
                        {e.interview_time && <div className="text-[9px] opacity-80">🕐 {e.interview_time}</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setActive(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="glass relative max-w-md w-full p-6 fade-up" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActive(null)} className="absolute top-3 right-3 rounded-lg p-2 hover:bg-white/5"><X className="h-4 w-4"/></button>
            <p className="text-xs uppercase tracking-wider text-slate-400">Interview</p>
            <h3 className="text-2xl font-bold mt-1">{active.company}</h3>
            <p className="text-slate-300 mt-1">{active.role}</p>
            <div className="mt-4"><StatusBadge category={active.category} /></div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <Info label="Date" value={active.interview_date ? new Date(active.interview_date+"T00:00:00").toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}) : "—"} />
              <Info label="Time" value={active.interview_time || "—"} />
            </div>
            {active.summary && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Summary</p>
                <p className="text-sm text-slate-300">{active.summary}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
