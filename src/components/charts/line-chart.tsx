"use client";

import * as React from "react";

interface LineChartProps {
  data: number[];
  compare?: number[] | null;
  labels?: readonly string[];
  height?: number;
  formatY?: (v: number) => string;
  formatX?: (l: string, i: number) => string;
  color?: string;
}

export function LineChart({
  data,
  compare,
  labels,
  height = 260,
  formatY,
  formatX,
  color = "var(--primary)",
}: LineChartProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [w, setW] = React.useState(600);
  const [hover, setHover] = React.useState<number | null>(null);
  const reactId = React.useId();

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
  if (data.length === 0) {
    return (
      <div ref={ref} style={{ width: "100%" }}>
        <svg width={w} height={height} style={{ display: "block" }}>
          <line
            x1={padL}
            y1={padT + ch}
            x2={padL + cw}
            y2={padT + ch}
            className="chart-grid"
          />
        </svg>
      </div>
    );
  }

  const all = [...data, ...(compare || [])];
  const max = Math.max(...all) * 1.08;
  const min = 0;
  const stepX = data.length > 1 ? cw / (data.length - 1) : 0;
  const y = (v: number) =>
    padT + ch - ((v - min) / (max - min || 1)) * ch;
  const x = (i: number) => padL + i * stepX;

  const path = data.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  const area = `${path} L${x(data.length - 1)},${padT + ch} L${x(0)},${padT + ch} Z`;
  const cmpPath = compare
    ? compare.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ")
    : null;

  const ticks = 4;
  const tArr = Array.from({ length: ticks + 1 }, (_, i) => (max / ticks) * i);

  const onMove: React.MouseEventHandler<SVGSVGElement> = (e) => {
    if (data.length < 2) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    let idx = Math.round((px - padL) / stepX);
    idx = Math.max(0, Math.min(data.length - 1, idx));
    setHover(idx);
  };
  const onLeave = () => setHover(null);

  const gradId = `ln-${reactId.replace(/:/g, "")}`;

  return (
    <div ref={ref} style={{ width: "100%", position: "relative" }}>
      <svg
        width={w}
        height={height}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity=".22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* y grid */}
        {tArr.map((tv, i) => (
          <g key={i}>
            <line
              x1={padL}
              y1={y(tv)}
              x2={padL + cw}
              y2={y(tv)}
              className="chart-grid"
            />
            <text
              x={padL - 8}
              y={y(tv)}
              className="chart-axis"
              textAnchor="end"
              dominantBaseline="middle"
            >
              {formatY ? formatY(tv) : Math.round(tv)}
            </text>
          </g>
        ))}

        {/* x labels (sparse) */}
        {labels &&
          labels.map((l, i) => {
            const every = Math.max(1, Math.ceil(data.length / 8));
            if (i % every !== 0 && i !== data.length - 1) return null;
            return (
              <text
                key={i}
                x={x(i)}
                y={padT + ch + 18}
                className="chart-axis"
                textAnchor="middle"
              >
                {formatX ? formatX(l, i) : l}
              </text>
            );
          })}

        {/* compare line */}
        {cmpPath && (
          <path
            d={cmpPath}
            fill="none"
            stroke="var(--muted-fg)"
            strokeWidth="1.5"
            strokeDasharray="3 4"
            opacity=".55"
          />
        )}

        {/* area */}
        <path d={area} fill={`url(#${gradId})`} />
        {/* main line */}
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {hover != null && (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={padT}
              y2={padT + ch}
              stroke="var(--border-strong)"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            <circle cx={x(hover)} cy={y(data[hover])} r="5" className="chart-pt" />
            {compare && (
              <circle
                cx={x(hover)}
                cy={y(compare[hover])}
                r="3.5"
                fill="#fff"
                stroke="var(--muted-fg)"
                strokeWidth="1.5"
              />
            )}
          </g>
        )}
      </svg>

      {hover != null && (
        <div
          style={{
            position: "absolute",
            left: Math.min(x(hover) + 12, w - 160),
            top: y(data[hover]) - 8,
            background: "var(--card)",
            border: "1px solid var(--border-strong)",
            borderRadius: 8,
            padding: "8px 10px",
            fontSize: 12,
            boxShadow: "var(--sh-2)",
            pointerEvents: "none",
            minWidth: 130,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{labels?.[hover]}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: color,
              }}
            />
            <span style={{ color: "var(--muted-fg)" }}>Now</span>
            <span
              className="num"
              style={{ marginLeft: "auto", fontWeight: 600 }}
            >
              {formatY ? formatY(data[hover]) : data[hover]}
            </span>
          </div>
          {compare && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 4,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: "var(--muted-fg)",
                  opacity: 0.55,
                }}
              />
              <span style={{ color: "var(--muted-fg)" }}>Prev</span>
              <span className="num" style={{ marginLeft: "auto" }}>
                {formatY ? formatY(compare[hover]) : compare[hover]}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
