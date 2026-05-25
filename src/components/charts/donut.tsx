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

/** Stable SVG numbers — avoids SSR/client float drift in path `d`. */
function svgNum(n: number): string {
  return (Math.round(n * 1e4) / 1e4).toString();
}

export function Donut({ data, size = 160, thickness = 18 }: DonutProps) {
  const r = size / 2 - thickness / 2;
  const cx = size / 2;
  const cy = size / 2;
  const total = data.reduce((s, d) => s + d.value, 0);

  const segs = data.reduce<{ path: string; color: string; endAngle: number }[]>(
    (segments, d) => {
      const a = segments.at(-1)?.endAngle ?? -Math.PI / 2;
      const pct = total > 0 ? d.value / total : 0;
      const a2 = a + pct * Math.PI * 2;
      const x1 = cx + r * Math.cos(a);
      const y1 = cy + r * Math.sin(a);
      const x2 = cx + r * Math.cos(a2);
      const y2 = cy + r * Math.sin(a2);
      const large = pct > 0.5 ? 1 : 0;
      const path = `M${svgNum(x1)},${svgNum(y1)} A${svgNum(r)},${svgNum(r)} 0 ${large} 1 ${svgNum(x2)},${svgNum(y2)}`;
      return [...segments, { path, color: d.color, endAngle: a2 }];
    },
    [],
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={svgNum(cx)}
        cy={svgNum(cy)}
        r={svgNum(r)}
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
