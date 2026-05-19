import { useMemo, useState } from "react";
import { Sparkline } from "./Sparkline";
import { CountUp } from "./CountUp";
import { Briefcase, Calendar as CalIcon, Trophy, XCircle } from "lucide-react";
import type { AppRow } from "@/lib/sheets";
import { statusKey } from "@/lib/sheets";

function cardGlow(color: string) {
  return { ["--ring-color" as any]: color } as React.CSSProperties;
}

type Stat = {
  label: string;
  icon: any;
  value: number;
  color: string;
  trend: string;
  bar: number[];
  emoji: string;
};

export function StatCards({ rows }: { rows: AppRow[] }) {
  const stats: Stat[] = useMemo(() => {
    const total = rows.length;
    const interviews = rows.filter((r) => statusKey(r.category) === "interview").length;
    const offers = rows.filter((r) => statusKey(r.category) === "offer").length;
    const rejected = rows.filter((r) => statusKey(r.category) === "rejected").length;
    const spark = (n: number) =>
      Array.from({ length: 10 }, (_, i) => Math.max(1, Math.round(n * (0.4 + 0.6 * Math.sin(i / 1.5 + n)))));
    return [
      { label: "Total Applications", emoji: "📁", icon: Briefcase, value: total, color: "#7c3aed", trend: "+12%", bar: spark(total || 5) },
      { label: "Interviews Scheduled", emoji: "🟢", icon: CalIcon, value: interviews, color: "#10b981", trend: "+8%", bar: spark(interviews || 3) },
      { label: "Offers Received", emoji: "🏆", icon: Trophy, value: offers, color: "#f59e0b", trend: "+2", bar: spark(offers || 1) },
      { label: "Rejected", emoji: "🔴", icon: XCircle, value: rejected, color: "#f43f5e", trend: "-3%", bar: spark(rejected || 2) },
    ];
  }, [rows]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <StatCard key={s.label} stat={s} delay={i * 80} />
      ))}
    </div>
  );
}

function StatCard({ stat, delay }: { stat: Stat; delay: number }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  return (
    <div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onMouseLeave={() => setPos(null)}
      className="glass glass-hover stat-card fade-up relative overflow-hidden p-5"
      style={{ ...cardGlow(stat.color), animationDelay: `${delay}ms` }}
    >
      <div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }}
      />
      {pos && (
        <div
          className="pointer-events-none absolute h-40 w-40 rounded-full opacity-40 blur-3xl transition-opacity"
          style={{
            left: pos.x - 80,
            top: pos.y - 80,
            background: stat.color,
          }}
        />
      )}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400">{stat.label}</p>
          <p className="mt-3 text-4xl font-bold" style={{ color: stat.color, textShadow: `0 0 22px ${stat.color}55` }}>
            <CountUp value={stat.value} />
          </p>
          <p className="mt-1 text-xs text-slate-400">
            <span style={{ color: stat.color }}>{stat.trend}</span> this month
          </p>
        </div>
        <div
          className="text-2xl rounded-xl p-2"
          style={{ background: `${stat.color}1f`, border: `1px solid ${stat.color}44` }}
        >
          {stat.emoji}
        </div>
      </div>
      <div className="mt-3 h-10">
        <Sparkline data={stat.bar} color={stat.color} />
      </div>
    </div>
  );
}
