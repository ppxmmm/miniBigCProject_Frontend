"use client";

import * as React from "react";

interface DonutSegment {
  value: number;
  color: string;
  label?: string;
}

interface DonutProps {
  data: DonutSegment[];
  size?: number;
  thickness?: number;
}

export function Donut({ data, size = 160, thickness = 18 }: DonutProps) {
  const r = size / 2 - thickness / 2;
  const cx = size / 2;
  const cy = size / 2;
  const total = data.reduce((s, d) => s + d.value, 0);

  let a = -Math.PI / 2;
  const segs = data.map((d) => {
    const pct = d.value / total;
    const a2 = a + pct * Math.PI * 2;
    const x1 = cx + r * Math.cos(a);
    const y1 = cy + r * Math.sin(a);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy + r * Math.sin(a2);
    const large = pct > 0.5 ? 1 : 0;
    const path = `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2}`;
    const seg = { path, color: d.color };
    a = a2;
    return seg;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--muted)"
        strokeWidth={thickness}
      />
      {segs.map((s, i) => (
        <path
          key={i}
          d={s.path}
          fill="none"
          stroke={s.color}
          strokeWidth={thickness}
          strokeLinecap="butt"
        />
      ))}
    </svg>
  );
}
