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
  const fmt = (n: number) => Number(n.toFixed(3));

  const segs = data.reduce<{
    angle: number;
    segments: { path: string; color: string }[];
  }>(
    (acc, d) => {
      const pct = total > 0 ? d.value / total : 0;
      const startAngle = acc.angle;
      const endAngle = startAngle + pct * Math.PI * 2;
      const x1 = fmt(cx + r * Math.cos(startAngle));
      const y1 = fmt(cy + r * Math.sin(startAngle));
      const x2 = fmt(cx + r * Math.cos(endAngle));
      const y2 = fmt(cy + r * Math.sin(endAngle));
      const large = pct > 0.5 ? 1 : 0;

      return {
        angle: endAngle,
        segments: [
          ...acc.segments,
          {
            path: `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2}`,
            color: d.color,
          },
        ],
      };
    },
    { angle: -Math.PI / 2, segments: [] },
  ).segments;

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
