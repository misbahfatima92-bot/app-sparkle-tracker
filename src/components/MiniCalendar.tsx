import { useMemo, useState } from "react";
import type { AppRow } from "@/lib/sheets";
import { statusKey, STATUS_META } from "@/lib/sheets";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export function MiniCalendar({ rows }: { rows: AppRow[] }) {
  const today = new Date();
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
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

  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{MONTHS[view.m]} {view.y}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setView(v => v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 })}
            className="rounded-lg p-1.5 hover:bg-white/5"
          ><ChevronLeft className="h-4 w-4" /></button>
          <button
            onClick={() => setView(v => v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 })}
            className="rounded-lg p-1.5 hover:bg-white/5"
          ><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-500 mb-2">
        {DOW.map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} className="aspect-square" />;
          const dateStr = `${view.y}-${String(view.m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
          const isToday = dateStr === `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
          const dayEvents = events.get(dateStr) ?? [];
          const dow = (startDow + d - 1) % 7;
          const weekend = dow === 0 || dow === 6;
          return (
            <div
              key={i}
              title={dayEvents.map(e => `${e.company} · ${e.role} · ${e.interview_time}`).join("\n")}
              className={`group relative aspect-square rounded-lg border p-1.5 text-left text-[11px] transition-colors cursor-default ${
                isToday
                  ? "border-cyan-400/50 today-glow bg-cyan-500/5"
                  : weekend
                  ? "border-white/[0.03] bg-black/20"
                  : "border-white/5 hover:border-violet-500/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={isToday ? "text-cyan-300 font-bold" : "text-slate-300"}>{d}</span>
                {dayEvents.length > 0 && (
                  <span
                    className="cal-dot h-1.5 w-1.5 rounded-full"
                    style={{ background: STATUS_META[statusKey(dayEvents[0].category)]?.color ?? "#7c3aed" }}
                  />
                )}
              </div>
              {dayEvents[0] && (
                <div className="mt-0.5 truncate text-[9px] text-slate-400 leading-tight">
                  {dayEvents[0].company}
                  {dayEvents[0].interview_time && <div className="text-cyan-400">{dayEvents[0].interview_time}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
