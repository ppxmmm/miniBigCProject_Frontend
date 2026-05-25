"use client";

import * as React from "react";

interface BarChartProps {
  data: number[];
  labels?: readonly string[];
  height?: number;
  formatY?: (v: number) => string;
  color?: string;
}

export function BarChart({
  data,
  labels,
  height = 220,
  formatY,
  color = "var(--primary)",
}: BarChartProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [w, setW] = React.useState(600);

  React.useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((es) => {
      for (const e of es) setW(e.contentRect.width);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const padL = 44,
    padR = 14,
    padT = 14,
    padB = 28;
  const cw = Math.max(200, w - padL - padR);
  const ch = height - padT - padB;
  const max = Math.max(...data) * 1.1;
  const barGap = 6;
  const barW = cw / data.length - barGap;

  const ticks = 4;
  const tArr = Array.from({ length: ticks + 1 }, (_, i) => (max / ticks) * i);

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <svg width={w} height={height} style={{ display: "block" }}>
        {tArr.map((tv, i) => (
          <g key={i}>
            <line
              x1={padL}
              y1={padT + ch - (tv / max) * ch}
              x2={padL + cw}
              y2={padT + ch - (tv / max) * ch}
              className="chart-grid"
            />
            <text
              x={padL - 8}
              y={padT + ch - (tv / max) * ch}
              className="chart-axis"
              textAnchor="end"
              dominantBaseline="middle"
            >
              {formatY ? formatY(tv) : Math.round(tv)}
            </text>
          </g>
        ))}
        {data.map((v, i) => {
          const h = (v / max) * ch;
          const xPos = padL + i * (barW + barGap) + barGap / 2;
          const yPos = padT + ch - h;
          return (
            <g key={i}>
              <rect
                x={xPos}
                y={yPos}
                width={barW}
                height={h}
                rx="3"
                fill={color}
                opacity=".88"
              />
              {labels && (
                <text
                  x={xPos + barW / 2}
                  y={padT + ch + 18}
                  className="chart-axis"
                  textAnchor="middle"
                >
                  {labels[i]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
