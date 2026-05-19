export function Sparkline({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const w = 100;
  const step = w / (data.length - 1 || 1);
  const points = data
    .map((v, i) => {
      const y = height - ((v - min) / (max - min || 1)) * (height - 4) - 2;
      return `${i * step},${y}`;
    })
    .join(" ");
  const id = `g-${color.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="h-full w-full">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={`0,${height} ${points} ${w},${height}`}
        fill={`url(#${id})`}
        stroke="none"
      />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
