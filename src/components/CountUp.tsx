import { useEffect, useRef, useState } from "react";

export function CountUp({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [v, setV] = useState(0);
  const ref = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      // ease-out with slight bounce
      const eased = 1 - Math.pow(1 - p, 3);
      const bounced = p === 1 ? 1 : eased + Math.sin(p * Math.PI) * 0.03 * (1 - p);
      setV(Math.round(from + (value - from) * Math.min(1, bounced)));
      if (p < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [value, duration]);
  return <>{v.toLocaleString()}</>;
}
