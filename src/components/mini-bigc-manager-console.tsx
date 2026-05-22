// @ts-nocheck
"use client";

/* eslint-disable */
import React from "react";

declare global {
  interface Window { [key: string]: any }
}


// ---- tweaks-panel.jsx ----

// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null
      ? keyOrEdits : { [keyOrEdits]: val };
    setValues((prev) => ({ ...prev, ...edits }));
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', { detail: edits }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({ title = 'Tweaks', children }) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({ x: 16, y: 16 });
  const PAD = 16;

  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth, h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y)),
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);

  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);

  React.useEffect(() => {
    const onMsg = (e) => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);
      else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
  };

  const onDragStart = (e) => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = (ev) => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy),
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  if (!open) return null;
  return (
    <>
      <style>{__TWEAKS_STYLE}</style>
      <div ref={dragRef} className="twk-panel" data-omelette-chrome=""
           style={{ right: offsetRef.current.x, bottom: offsetRef.current.y }}>
        <div className="twk-hd" onMouseDown={onDragStart}>
          <b>{title}</b>
          <button className="twk-x" aria-label="Close tweaks"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={dismiss}>✕</button>
        </div>
        <div className="twk-body">
          {children}
        </div>
      </div>
    </>
  );
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({ label, children }) {
  return (
    <>
      <div className="twk-sect">{label}</div>
      {children}
    </>
  );
}

function TweakRow({ label, value, children, inline = false }) {
  return (
    <div className={inline ? 'twk-row twk-row-h' : 'twk-row'}>
      <div className="twk-lbl">
        <span>{label}</span>
        {value != null && <span className="twk-val">{value}</span>}
      </div>
      {children}
    </div>
  );
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({ label, value, min = 0, max = 100, step = 1, unit = '', onChange }) {
  return (
    <TweakRow label={label} value={`${value}${unit}`}>
      <input type="range" className="twk-slider" min={min} max={max} step={step}
             value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </TweakRow>
  );
}

function TweakToggle({ label, value, onChange }) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl"><span>{label}</span></div>
      <button type="button" className="twk-toggle" data-on={value ? '1' : '0'}
              role="switch" aria-checked={!!value}
              onClick={() => onChange(!value)}><i /></button>
    </div>
  );
}

function TweakRadio({ label, value, options, onChange }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = (o) => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({ 2: 16, 3: 10 }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = (s) => {
      const m = options.find((o) => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return <TweakSelect label={label} value={value} options={options}
                        onChange={(s) => onChange(resolve(s))} />;
  }
  const opts = options.map((o) => (typeof o === 'object' ? o : { value: o, label: o }));
  const idx = Math.max(0, opts.findIndex((o) => o.value === value));
  const n = opts.length;

  const segAt = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor(((clientX - r.left - 2) / inner) * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };

  const onPointerDown = (e) => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = (ev) => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <TweakRow label={label}>
      <div ref={trackRef} role="radiogroup" onPointerDown={onPointerDown}
           className={dragging ? 'twk-seg dragging' : 'twk-seg'}>
        <div className="twk-seg-thumb"
             style={{ left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
                      width: `calc((100% - 4px) / ${n})` }} />
        {opts.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={o.value === value}>
            {o.label}
          </button>
        ))}
      </div>
    </TweakRow>
  );
}

function TweakSelect({ label, value, options, onChange }) {
  return (
    <TweakRow label={label}>
      <select className="twk-field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => {
          const v = typeof o === 'object' ? o.value : o;
          const l = typeof o === 'object' ? o.label : o;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </TweakRow>
  );
}

function TweakText({ label, value, placeholder, onChange }) {
  return (
    <TweakRow label={label}>
      <input className="twk-field" type="text" value={value} placeholder={placeholder}
             onChange={(e) => onChange(e.target.value)} />
    </TweakRow>
  );
}

function TweakNumber({ label, value, min, max, step = 1, unit = '', onChange }) {
  const clamp = (n) => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({ x: 0, val: 0 });
  const onScrubStart = (e) => {
    e.preventDefault();
    startRef.current = { x: e.clientX, val: value };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = (ev) => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return (
    <div className="twk-num">
      <span className="twk-num-lbl" onPointerDown={onScrubStart}>{label}</span>
      <input type="number" value={value} min={min} max={max} step={step}
             onChange={(e) => onChange(clamp(Number(e.target.value)))} />
      {unit && <span className="twk-num-unit">{unit}</span>}
    </div>
  );
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}

const __TwkCheck = ({ light }) => (
  <svg viewBox="0 0 14 14" aria-hidden="true">
    <path d="M3 7.2 5.8 10 11 4.2" fill="none" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
          stroke={light ? 'rgba(0,0,0,.78)' : '#fff'} />
  </svg>
);

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({ label, value, options, onChange }) {
  if (!options || !options.length) {
    return (
      <div className="twk-row twk-row-h">
        <div className="twk-lbl"><span>{label}</span></div>
        <input type="color" className="twk-swatch" value={value}
               onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = (o) => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return (
    <TweakRow label={label}>
      <div className="twk-chips" role="radiogroup">
        {options.map((o, i) => {
          const colors = Array.isArray(o) ? o : [o];
          const [hero, ...rest] = colors;
          const sup = rest.slice(0, 4);
          const on = key(o) === cur;
          return (
            <button key={i} type="button" className="twk-chip" role="radio"
                    aria-checked={on} data-on={on ? '1' : '0'}
                    aria-label={colors.join(', ')} title={colors.join(' · ')}
                    style={{ background: hero }}
                    onClick={() => onChange(o)}>
              {sup.length > 0 && (
                <span>
                  {sup.map((c, j) => <i key={j} style={{ background: c }} />)}
                </span>
              )}
              {on && <__TwkCheck light={__twkIsLight(hero)} />}
            </button>
          );
        })}
      </div>
    </TweakRow>
  );
}

function TweakButton({ label, onClick, secondary = false }) {
  return (
    <button type="button" className={secondary ? 'twk-btn secondary' : 'twk-btn'}
            onClick={onClick}>{label}</button>
  );
}

Object.assign(window, {
  useTweaks, TweaksPanel, TweakSection, TweakRow,
  TweakSlider, TweakToggle, TweakRadio, TweakSelect,
  TweakText, TweakNumber, TweakColor, TweakButton,
});


// ---- icons.jsx ----
// src/icons.jsx — minimal stroke icon set (lucide-style)
// Usage: <Icon name="home" /> or <Icon name="home" size={20} />

const ICONS = {
  home: <><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/></>,
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></>,
  chart: <><path d="M3 3v18h18"/><path d="M7 14l4-4 4 3 5-6"/></>,
  alert: <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>,
  truck: <><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
  sparkle: <><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M19 14l.7 2.1L22 17l-2.3.9L19 20l-.7-2.1L16 17l2.3-.9z"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>,
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>,
  menu: <><path d="M3 6h18M3 12h18M3 18h18"/></>,
  x: <><path d="M18 6 6 18M6 6l12 12"/></>,
  chevronDown: <><path d="m6 9 6 6 6-6"/></>,
  chevronRight: <><path d="m9 6 6 6-6 6"/></>,
  chevronLeft: <><path d="m15 6-6 6 6 6"/></>,
  arrowUp: <><path d="M12 19V5M5 12l7-7 7 7"/></>,
  arrowDown: <><path d="M12 5v14M19 12l-7 7-7-7"/></>,
  arrowRight: <><path d="M5 12h14M12 5l7 7-7 7"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  check: <><path d="M20 6 9 17l-5-5"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
  package: <><path d="m7.5 4.27 9 5.15"/><path d="M21 8 12 3 3 8l9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></>,
  pin: <><path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></>,
  filter: <><path d="M3 4h18l-7 9v7l-4-2v-5z"/></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></>,
  store: <><path d="M3 9 4 4h16l1 5"/><path d="M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/></>,
  refresh: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></>,
  trending: <><path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></>,
  baht: <><path d="M7 4v16"/><path d="M7 4h5a4 4 0 0 1 0 8H7"/><path d="M7 12h6a4 4 0 0 1 0 8H7"/><path d="M10 2v3"/><path d="M10 19v3"/></>,
  bag: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6L18 2z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
  gift: <><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/></>,
  shield: <><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>,
  eyeOff: <><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="m2 2 20 20"/></>,
  more: <><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></>,
  edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></>,
  trash: <><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
  flame: <><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></>,
  star: <><path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345z"/></>,
  lock: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 7 10-7"/></>,
  phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></>,
  moon: <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
  panel: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></>,
  badge: <><circle cx="12" cy="8" r="5"/><path d="M8.21 13.89 7 22l5-3 5 3-1.21-8.12"/></>,
  helpcircle: <><circle cx="12" cy="12" r="9"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></>,
};

function Icon({ name, size, className = "", style }) {
  const path = ICONS[name];
  if (!path) return null;
  const s = size || undefined;
  return (
    <svg className={`icon ${className}`} viewBox="0 0 24 24"
         style={s ? { width: s, height: s, ...style } : style}
         aria-hidden="true">
      {path}
    </svg>
  );
}



// ---- data.jsx ----
// src/data.jsx — mock data + i18n
// Realistic Thai retail data: products, alerts, deliveries, revenue series, etc.

const I18N = {
  th: {
    appName: "Mini BigC",
    appSub: "ระบบจัดการสาขา",
    nav: {
      dashboard: "หน้าหลัก", revenue: "รายได้", alerts: "การแจ้งเตือนสต็อก",
      delivery: "การจัดส่ง", suggestions: "ข้อเสนอแนะ", profile: "โปรไฟล์",
      settings: "ตั้งค่า", main: "เมนูหลัก", account: "บัญชี",
    },
    role: { manager: "ผู้จัดการสาขา", staff: "พนักงานสาขา" },
    common: {
      search: "ค้นหาสินค้า, ออเดอร์, ลูกค้า…",
      today: "วันนี้", yesterday: "เมื่อวาน", thisWeek: "สัปดาห์นี้",
      thisMonth: "เดือนนี้", thisYear: "ปีนี้",
      day: "วัน", week: "สัปดาห์", month: "เดือน", year: "ปี",
      compareYesterday: "เทียบกับเมื่อวาน", compareLastWeek: "เทียบกับสัปดาห์ก่อน",
      compareLastMonth: "เทียบกับเดือนก่อน",
      viewAll: "ดูทั้งหมด", filter: "ตัวกรอง", export: "ส่งออก",
      details: "รายละเอียด", refresh: "รีเฟรช", actions: "การจัดการ",
      acknowledge: "รับทราบ", dismiss: "ปิด", apply: "ดำเนินการ",
      cancel: "ยกเลิก", save: "บันทึก", confirm: "ยืนยัน", edit: "แก้ไข",
      noData: "ไม่มีข้อมูล", showing: "แสดง", of: "จาก",
      restricted: "ฟีเจอร์นี้สำหรับผู้จัดการสาขาเท่านั้น",
      restrictedHint: "กรุณาติดต่อผู้จัดการเพื่อขอสิทธิ์เพิ่มเติม",
      lastUpdated: "อัปเดตล่าสุด",
    },
    dash: {
      welcome: "สวัสดี", welcomeSub: "ภาพรวมการดำเนินงานสาขาของคุณ",
      revenueToday: "รายได้วันนี้", transactions: "จำนวนรายการ",
      basket: "ค่าเฉลี่ยต่อบิล", visitors: "ลูกค้าเข้าร้าน",
      revenueChart: "รายได้รายชั่วโมง", alertsTitle: "การแจ้งเตือนเร่งด่วน",
      alertsSub: "สินค้าที่ต้องดำเนินการภายในวันนี้",
      topProducts: "สินค้าขายดี", deliveriesToday: "การจัดส่งวันนี้",
      hourly: "รายชั่วโมง", weekly: "รายวัน", monthly: "รายเดือน",
      categoryBreakdown: "ยอดขายตามหมวด",
    },
    rev: {
      title: "ภาพรวมรายได้",
      sub: "วิเคราะห์รายได้ตามช่วงเวลา หมวดหมู่ และวิธีการชำระเงิน",
      total: "รายได้รวม", trxs: "จำนวนรายการ", avg: "ค่าเฉลี่ยต่อบิล",
      growth: "อัตราการเติบโต",
      byCategory: "ยอดขายตามหมวดสินค้า",
      byHour: "ยอดขายตามช่วงเวลา",
      byPayment: "วิธีการชำระเงิน",
      forecast: "พยากรณ์ยอดขาย (7 วัน)",
    },
    alert: {
      title: "การแจ้งเตือนสต็อก",
      sub: "สินค้าที่หมดอายุใกล้ถึงและคงเหลือต่ำกว่าเกณฑ์",
      expired: "หมดอายุ / ใกล้หมดอายุ",
      low: "สต็อกต่ำ",
      all: "ทั้งหมด",
      sku: "รหัสสินค้า", product: "สินค้า", category: "หมวด",
      expiry: "วันหมดอายุ", daysLeft: "เหลือ", stock: "คงเหลือ",
      reorder: "จุดสั่งซื้อ", location: "ตำแหน่ง",
      severity: "ระดับ", urgent: "เร่งด่วน", warning: "เตือน", info: "ปกติ",
      markdown: "ลดราคา", returnSupplier: "คืนซัพพลายเออร์",
      reorderNow: "สั่งซื้อทันที", days: "วัน",
    },
    deliv: {
      title: "การจัดส่งสินค้า",
      sub: "ติดตามสถานะการส่งสินค้าให้ลูกค้า",
      active: "กำลังจัดส่ง", scheduled: "นัดส่ง",
      completed: "จัดส่งสำเร็จ", failed: "จัดส่งไม่สำเร็จ",
      orderId: "เลขออเดอร์", customer: "ลูกค้า", driver: "พนักงานส่ง",
      status: "สถานะ", eta: "ถึงประมาณ", value: "มูลค่า",
      onTime: "ตรงเวลา", late: "ล่าช้า", preparing: "กำลังจัดสินค้า",
      enRoute: "อยู่ระหว่างทาง", delivered: "ส่งแล้ว",
      from: "จากสาขา", to: "ปลายทาง",
    },
    sug: {
      title: "ข้อเสนอแนะการดำเนินงาน",
      sub: "โอกาสในการจัดโปรโมชันและกิจกรรมเพื่อเพิ่มยอดขาย",
      promotions: "โปรโมชันแนะนำ",
      events: "กิจกรรมแนะนำ",
      potential: "ผลตอบแทนคาดการณ์", confidence: "ความเชื่อมั่น",
      duration: "ระยะเวลา", target: "กลุ่มเป้าหมาย",
      reasoning: "เหตุผลที่แนะนำ", launch: "เปิดใช้งาน", review: "ขอตรวจสอบ",
    },
    profile: {
      title: "โปรไฟล์ของฉัน", sub: "ข้อมูลส่วนตัวและความปลอดภัย",
      personal: "ข้อมูลส่วนตัว", security: "ความปลอดภัย",
      name: "ชื่อ-นามสกุล", email: "อีเมล", phone: "เบอร์โทร",
      branch: "สาขา", employeeId: "รหัสพนักงาน", roleField: "ตำแหน่ง",
      changePw: "เปลี่ยนรหัสผ่าน", current: "รหัสผ่านปัจจุบัน",
      newPw: "รหัสผ่านใหม่", confirmPw: "ยืนยันรหัสผ่านใหม่",
      lastChanged: "เปลี่ยนล่าสุด", twoFa: "การยืนยันสองชั้น", twoFaSub: "ปกป้องบัญชีของคุณด้วยรหัสจากแอป",
    },
    login: {
      welcomeBack: "ยินดีต้อนรับกลับ", subtitle: "เข้าสู่ระบบเพื่อจัดการสาขาของคุณ",
      email: "อีเมลหรือรหัสพนักงาน", password: "รหัสผ่าน", remember: "จดจำฉันไว้",
      forgot: "ลืมรหัสผ่าน?", signIn: "เข้าสู่ระบบ", or: "หรือ",
      ssoMs: "เข้าสู่ระบบด้วย Microsoft", ssoG: "เข้าสู่ระบบด้วย Google",
      tagline: "บริหารสาขาของคุณ ตั้งแต่ยอดขายจนถึงสต็อก ในที่เดียว",
      footer: "© 2026 Mini BigC. สงวนลิขสิทธิ์.",
    },
    weekdays: ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"],
    months: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
  },
  en: {
    appName: "Mini BigC", appSub: "Branch Operations",
    nav: {
      dashboard: "Dashboard", revenue: "Revenue", alerts: "Stock Alerts",
      delivery: "Delivery", suggestions: "Suggestions", profile: "Profile",
      settings: "Settings", main: "Main", account: "Account",
    },
    role: { manager: "Branch Manager", staff: "Branch Staff" },
    common: {
      search: "Search products, orders, customers…",
      today: "Today", yesterday: "Yesterday", thisWeek: "This week",
      thisMonth: "This month", thisYear: "This year",
      day: "Day", week: "Week", month: "Month", year: "Year",
      compareYesterday: "vs yesterday", compareLastWeek: "vs last week", compareLastMonth: "vs last month",
      viewAll: "View all", filter: "Filter", export: "Export",
      details: "Details", refresh: "Refresh", actions: "Actions",
      acknowledge: "Acknowledge", dismiss: "Dismiss", apply: "Apply",
      cancel: "Cancel", save: "Save", confirm: "Confirm", edit: "Edit",
      noData: "No data", showing: "Showing", of: "of",
      restricted: "This feature is for branch managers only",
      restrictedHint: "Please contact your manager to request access",
      lastUpdated: "Last updated",
    },
    dash: {
      welcome: "Hello", welcomeSub: "Here's how your branch is doing today",
      revenueToday: "Revenue today", transactions: "Transactions",
      basket: "Avg basket", visitors: "Store visitors",
      revenueChart: "Hourly revenue", alertsTitle: "Urgent alerts",
      alertsSub: "Items that need attention today",
      topProducts: "Top products", deliveriesToday: "Today's deliveries",
      hourly: "Hourly", weekly: "Daily", monthly: "Monthly",
      categoryBreakdown: "Sales by category",
    },
    rev: {
      title: "Revenue overview",
      sub: "Analyse revenue by period, category and payment method",
      total: "Total revenue", trxs: "Transactions", avg: "Avg basket",
      growth: "Growth rate",
      byCategory: "Sales by category", byHour: "Sales by hour",
      byPayment: "Payment method", forecast: "7-day forecast",
    },
    alert: {
      title: "Stock alerts",
      sub: "Items near expiry or below reorder threshold",
      expired: "Expiring soon", low: "Low stock", all: "All",
      sku: "SKU", product: "Product", category: "Category",
      expiry: "Expires", daysLeft: "Left", stock: "On hand",
      reorder: "Reorder pt", location: "Location",
      severity: "Severity", urgent: "Urgent", warning: "Warning", info: "Info",
      markdown: "Markdown", returnSupplier: "Return to supplier",
      reorderNow: "Reorder now", days: "d",
    },
    deliv: {
      title: "Customer delivery",
      sub: "Track customer deliveries from your branch",
      active: "Active", scheduled: "Scheduled",
      completed: "Completed", failed: "Failed",
      orderId: "Order #", customer: "Customer", driver: "Driver",
      status: "Status", eta: "ETA", value: "Value",
      onTime: "On time", late: "Late", preparing: "Preparing",
      enRoute: "En route", delivered: "Delivered",
      from: "From", to: "To",
    },
    sug: {
      title: "Operational suggestions",
      sub: "Opportunities to run promotions and events that lift sales",
      promotions: "Promotions", events: "Events",
      potential: "Est. upside", confidence: "Confidence",
      duration: "Duration", target: "Target",
      reasoning: "Why we suggest this", launch: "Launch", review: "Request review",
    },
    profile: {
      title: "My profile", sub: "Personal details and security",
      personal: "Personal info", security: "Security",
      name: "Full name", email: "Email", phone: "Phone",
      branch: "Branch", employeeId: "Employee ID", roleField: "Role",
      changePw: "Change password", current: "Current password",
      newPw: "New password", confirmPw: "Confirm new password",
      lastChanged: "Last changed", twoFa: "Two-factor authentication",
      twoFaSub: "Protect your account with an authenticator app",
    },
    login: {
      welcomeBack: "Welcome back", subtitle: "Sign in to manage your branch",
      email: "Email or employee ID", password: "Password", remember: "Remember me",
      forgot: "Forgot password?", signIn: "Sign in", or: "or",
      ssoMs: "Continue with Microsoft", ssoG: "Continue with Google",
      tagline: "Run your branch — from sales to stock — from one place",
      footer: "© 2026 Mini BigC. All rights reserved.",
    },
    weekdays: ["M", "T", "W", "T", "F", "S", "S"],
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
};

// ─── Mock store + user ────────────────────────────────────────────────
const STORE = {
  code: "MBC-0421",
  name: { th: "มินิ บิ๊กซี สาขาทองหล่อ ซอย 13", en: "Mini BigC · Thonglor Soi 13" },
  short: { th: "ทองหล่อ ซ.13", en: "Thonglor 13" },
  address: { th: "121/4 ซ.สุขุมวิท 55, แขวงคลองตันเหนือ, วัฒนา, กรุงเทพฯ 10110",
             en: "121/4 Sukhumvit 55, Khlong Tan Nuea, Watthana, Bangkok 10110" },
  manager: { th: "ปริญญา ทวีศักดิ์", en: "Parinya Taweesak" },
  managerInitials: "PT",
  staff: { th: "ณัฐวุฒิ สมบูรณ์", en: "Nattawut Somboon" },
  staffInitials: "NS",
};

// ─── Revenue series ───────────────────────────────────────────────────
// Hourly today (06:00 → 23:00)
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6);
const HOURLY = [
  3200, 4100, 5800, 8400, 11200, 9800, 12400, 15600, 14200, 11800,
  9400, 13200, 18900, 21400, 19200, 14800, 11600, 8200
];
const HOURLY_YEST = [
  2900, 3800, 5200, 7900, 10400, 9100, 11600, 14200, 13100, 10800,
  8900, 12100, 17400, 19800, 17600, 13900, 10900, 7800
];
// Daily this week (M-Su)
const DAILY = [184000, 168000, 192000, 211000, 248000, 296000, 264000];
const DAILY_LAST = [172000, 161000, 178000, 199000, 226000, 274000, 248000];
// Monthly this year
const MONTHLY = [5.42, 5.18, 5.96, 6.18, 6.74, 6.92, 7.18, 7.04, 6.88, 7.32, 7.86, 8.14].map(v => v * 1e6);

const CATEGORY = [
  { th: "อาหารและเครื่องดื่ม", en: "Food & Beverage", v: 142800, share: 0.38, trend: 6.2, color: "oklch(0.58 0.16 150)" },
  { th: "ของใช้ในบ้าน", en: "Household", v: 78400, share: 0.21, trend: -2.1, color: "oklch(0.62 0.14 200)" },
  { th: "ของใช้ส่วนตัว", en: "Personal Care", v: 56200, share: 0.15, trend: 4.8, color: "oklch(0.62 0.14 280)" },
  { th: "ขนมและของว่าง", en: "Snacks", v: 49100, share: 0.13, trend: 11.3, color: "oklch(0.72 0.15 65)" },
  { th: "อาหารแช่แข็ง", en: "Frozen", v: 28400, share: 0.075, trend: -1.4, color: "oklch(0.66 0.14 320)" },
  { th: "อื่น ๆ", en: "Other", v: 21100, share: 0.055, trend: 2.0, color: "oklch(0.70 0.04 95)" },
];

const PAYMENTS = [
  { th: "เงินสด", en: "Cash", v: 0.38 },
  { th: "พร้อมเพย์ / QR", en: "PromptPay / QR", v: 0.34 },
  { th: "บัตรเครดิต", en: "Credit card", v: 0.18 },
  { th: "เดบิต", en: "Debit", v: 0.07 },
  { th: "True Money / Wallet", en: "True Money / Wallet", v: 0.03 },
];

// ─── Products ─────────────────────────────────────────────────────────
const TOP_PRODUCTS = [
  { sku: "FB-0102", th: "ลีโอ เบียร์ กระป๋อง 320 มล.", en: "Leo beer can 320ml", sold: 184, value: 9568, trend: 12 },
  { sku: "FB-2284", th: "เลย์ คลาสสิค 75 ก.", en: "Lays Classic 75g", sold: 162, value: 4374, trend: 8 },
  { sku: "FB-0411", th: "นมไทย-เดนมาร์ค จืด 200 มล.", en: "Foremost milk plain 200ml", sold: 148, value: 2516, trend: 5 },
  { sku: "FB-0099", th: "น้ำดื่ม คริสตัล 600 มล. (6 ขวด)", en: "Crystal water 600ml × 6", sold: 121, value: 8470, trend: -2 },
  { sku: "PC-0331", th: "หน้ากากอนามัย 4 ชั้น (50 ชิ้น)", en: "Surgical mask 4-ply × 50", sold: 96, value: 11520, trend: 18 },
  { sku: "HH-1820", th: "ผงซักฟอก เปา 800 ก.", en: "Pao detergent 800g", sold: 88, value: 7392, trend: 3 },
];

// ─── Alerts ───────────────────────────────────────────────────────────
const today = new Date(2026, 4, 22); // May 22, 2026
function dPlus(n) { const d = new Date(today); d.setDate(d.getDate() + n); return d; }
function fmtD(d, lang = "th") {
  const m = I18N[lang].months[d.getMonth()];
  return `${d.getDate()} ${m}`;
}

const EXPIRING = [
  { sku: "FB-0411", th: "นมไทย-เดนมาร์ค จืด 200 มล.", en: "Foremost milk 200ml", cat: { th: "อาหาร", en: "Food" }, exp: dPlus(1), stock: 24, loc: "F-12-B", price: 17 },
  { sku: "FB-1140", th: "ขนมปังฟาร์มเฮ้าส์ โฮลวีท", en: "Farmhouse wholewheat bread", cat: { th: "อาหาร", en: "Food" }, exp: dPlus(2), stock: 11, loc: "A-04-C", price: 45 },
  { sku: "FB-0822", th: "ไส้กรอกบีทาโกร 250 ก.", en: "Betagro sausage 250g", cat: { th: "แช่เย็น", en: "Chilled" }, exp: dPlus(3), stock: 18, loc: "C-01-A", price: 89 },
  { sku: "FB-1990", th: "โยเกิร์ตดัชชี่ รสกล้วยหอม", en: "Dutchie banana yoghurt", cat: { th: "แช่เย็น", en: "Chilled" }, exp: dPlus(0), stock: 6, loc: "C-02-A", price: 19 },
  { sku: "FB-2210", th: "ส้มสายน้ำผึ้ง 1 กก.", en: "Honey oranges 1kg", cat: { th: "ผัก-ผลไม้", en: "Produce" }, exp: dPlus(2), stock: 14, loc: "P-01-A", price: 79 },
  { sku: "FB-3084", th: "เต้าหู้ขาวอ่อน คาวบอย", en: "Cowboy soft tofu", cat: { th: "แช่เย็น", en: "Chilled" }, exp: dPlus(4), stock: 22, loc: "C-03-B", price: 18 },
  { sku: "FB-0188", th: "น้ำพริกแม่ประนอม", en: "Mae Pranom chilli paste", cat: { th: "อาหาร", en: "Food" }, exp: dPlus(6), stock: 9, loc: "A-09-D", price: 32 },
];

const LOW_STOCK = [
  { sku: "PC-0331", th: "หน้ากากอนามัย 4 ชั้น (50 ชิ้น)", en: "Surgical mask 4-ply × 50", cat: { th: "ของใช้ส่วนตัว", en: "Personal" }, stock: 4, reorder: 30, loc: "G-02-A" },
  { sku: "HH-1820", th: "ผงซักฟอก เปา 800 ก.", en: "Pao detergent 800g", cat: { th: "ของใช้บ้าน", en: "Household" }, stock: 7, reorder: 24, loc: "H-04-B" },
  { sku: "FB-0099", th: "น้ำดื่มคริสตัล 600 มล. (6 ขวด)", en: "Crystal water 600ml × 6", cat: { th: "เครื่องดื่ม", en: "Beverage" }, stock: 12, reorder: 36, loc: "B-01-A" },
  { sku: "PC-0470", th: "ผ้าอนามัยลอริเอะ ขนาดกลาง", en: "Laurier sanitary pads M", cat: { th: "ของใช้ส่วนตัว", en: "Personal" }, stock: 5, reorder: 18, loc: "G-05-B" },
  { sku: "FB-2284", th: "เลย์ คลาสสิค 75 ก.", en: "Lays Classic 75g", cat: { th: "ขนม", en: "Snacks" }, stock: 18, reorder: 40, loc: "S-02-A" },
  { sku: "HH-2201", th: "กระดาษทิชชู่ Cellox 12 ม้วน", en: "Cellox tissue × 12", cat: { th: "ของใช้บ้าน", en: "Household" }, stock: 3, reorder: 15, loc: "H-06-C" },
];

// ─── Deliveries ───────────────────────────────────────────────────────
const DELIVERIES = [
  { id: "BC-26052201", customer: { th: "คุณณัฐกานต์ ม.", en: "K. Natthakarn M." }, addr: { th: "ทองหล่อ ซ.10", en: "Thonglor Soi 10" }, items: 8, value: 487, driver: { th: "วินัย", en: "Winai" }, status: "enRoute", eta: "14:25", late: false, distance: 1.2 },
  { id: "BC-26052202", customer: { th: "คุณปานทิพย์ ส.", en: "K. Panthip S." }, addr: { th: "เอกมัย ซ.12", en: "Ekkamai Soi 12" }, items: 22, value: 1284, driver: { th: "สมชาย", en: "Somchai" }, status: "enRoute", eta: "14:35", late: true, distance: 2.4 },
  { id: "BC-26052203", customer: { th: "คุณภาสกร ว.", en: "K. Phasakorn W." }, addr: { th: "ทองหล่อ ซ.5", en: "Thonglor Soi 5" }, items: 14, value: 892, driver: { th: "บุญส่ง", en: "Boonsong" }, status: "preparing", eta: "15:00", late: false, distance: 0.8 },
  { id: "BC-26052204", customer: { th: "คุณกัลยา ก.", en: "K. Kanlaya K." }, addr: { th: "พร้อมพงษ์", en: "Phrom Phong" }, items: 31, value: 1872, driver: { th: "วินัย", en: "Winai" }, status: "preparing", eta: "15:15", late: false, distance: 1.8 },
  { id: "BC-26052205", customer: { th: "คุณธีรพล ต.", en: "K. Teeraphol T." }, addr: { th: "ทองหล่อ ซ.8", en: "Thonglor Soi 8" }, items: 6, value: 320, driver: { th: "สมชาย", en: "Somchai" }, status: "delivered", eta: "13:50", late: false, distance: 1.0 },
  { id: "BC-26052206", customer: { th: "คุณวรินทร ก.", en: "K. Warintorn K." }, addr: { th: "เอกมัย ซ.4", en: "Ekkamai Soi 4" }, items: 12, value: 654, driver: { th: "บุญส่ง", en: "Boonsong" }, status: "delivered", eta: "13:20", late: false, distance: 2.0 },
  { id: "BC-26052207", customer: { th: "คุณพิชชา ม.", en: "K. Phichcha M." }, addr: { th: "ทองหล่อ ซ.23", en: "Thonglor Soi 23" }, items: 4, value: 198, driver: { th: "วินัย", en: "Winai" }, status: "delivered", eta: "12:45", late: false, distance: 1.5 },
];

// ─── Suggestions ──────────────────────────────────────────────────────
const PROMOS = [
  {
    id: "p1", icon: "flame",
    title: { th: "ลด 30% ขนมปังฟาร์มเฮ้าส์ใกล้หมดอายุ", en: "30% off Farmhouse bread near expiry" },
    desc: { th: "มีสินค้า 11 ชิ้นที่หมดอายุภายใน 2 วัน ลดราคา 30% ภายในวันนี้คาดว่าจะลดมูลค่าสูญเสียได้ ฿245",
            en: "11 units expire in 2 days. A 30% same-day markdown would recover an estimated ฿245" },
    upside: 245, confidence: 0.92, duration: { th: "1 วัน", en: "1 day" },
    target: { th: "ลูกค้าทุกคน", en: "All customers" }, type: "markdown",
  },
  {
    id: "p2", icon: "gift",
    title: { th: "ซื้อ 2 แถม 1 — บะหมี่กึ่งสำเร็จรูป", en: "Buy 2 get 1 free — instant noodles" },
    desc: { th: "ยอดขายบะหมี่ MAMA เพิ่ม 23% ในสัปดาห์นี้ จับคู่กับสินค้าเสริมเพื่อเพิ่มขนาดบิล",
            en: "MAMA noodle sales up 23% this week. Bundle to lift basket size" },
    upside: 1840, confidence: 0.78, duration: { th: "1 สัปดาห์", en: "1 week" },
    target: { th: "ลูกค้าประจำ", en: "Repeat customers" }, type: "bundle",
  },
  {
    id: "p3", icon: "trending",
    title: { th: "Happy Hour 17:00 - 19:00 เครื่องดื่มเย็น", en: "Happy hour 17:00 - 19:00, cold drinks" },
    desc: { th: "ช่วง 17:00-19:00 มียอดขายเครื่องดื่มต่ำกว่าค่าเฉลี่ย 18% ลด 10% เพื่อกระตุ้นทราฟฟิก",
            en: "Cold drink sales 18% below average in 17:00-19:00 window. A 10% promo could lift footfall" },
    upside: 980, confidence: 0.65, duration: { th: "2 สัปดาห์", en: "2 weeks" },
    target: { th: "ลูกค้าหลังเลิกงาน", en: "After-work crowd" }, type: "discount",
  },
];

const EVENTS = [
  {
    id: "e1", icon: "calendar",
    title: { th: "เทศกาลวิสาขบูชา 31 พ.ค.", en: "Visakha Bucha · May 31" },
    desc: { th: "วันหยุดนักขัตฤกษ์ ลูกค้าซื้อของไหว้พระและของแห้งเพิ่มขึ้น แนะนำให้สต็อกเทียน-ดอกไม้-น้ำดื่ม",
            en: "Public holiday. Customers stock up on offerings and dry goods — boost candles, flowers, water" },
    upside: 8600, confidence: 0.88, duration: { th: "5 วัน", en: "5 days" },
    target: { th: "ครอบครัว", en: "Families" }, type: "event",
  },
  {
    id: "e2", icon: "gift",
    title: { th: "วันแม่ 12 ส.ค. — กระเช้าของขวัญ", en: "Mother's Day · Aug 12 — gift baskets" },
    desc: { th: "เริ่มเตรียมการแสดงสินค้ากระเช้าและของขวัญ 14 วันก่อนวันแม่ ดึงดูดลูกค้าที่กำลังมองหา",
            en: "Start gift-basket merchandising 14 days ahead to capture early shoppers" },
    upside: 14200, confidence: 0.81, duration: { th: "3 สัปดาห์", en: "3 weeks" },
    target: { th: "ลูกค้าที่ต้องการของขวัญ", en: "Gift shoppers" }, type: "event",
  },
  {
    id: "e3", icon: "sparkle",
    title: { th: "เปิดเทอม 16 พ.ค. — ของใช้นักเรียน", en: "Back to school · May 16" },
    desc: { th: "ครัวเรือนใกล้สาขามีเด็กวัยเรียน ~38% เสนอจัดมุมเครื่องเขียน-นม-ขนมตอนเช้า",
            en: "~38% of households nearby have school-age kids. Set up a stationery + breakfast bundle corner" },
    upside: 6400, confidence: 0.74, duration: { th: "4 สัปดาห์", en: "4 weeks" },
    target: { th: "ผู้ปกครอง", en: "Parents" }, type: "event",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────
function fmtMoney(v, opts = {}) {
  const { compact = false, sign = false } = opts;
  let s;
  if (compact && v >= 1e6) s = "฿" + (v / 1e6).toFixed(2) + "M";
  else if (compact && v >= 1e3) s = "฿" + (v / 1e3).toFixed(1) + "k";
  else s = "฿" + Math.round(v).toLocaleString("en-US");
  if (sign && v > 0) s = "+" + s;
  return s;
}
function fmtNum(v) { return Math.round(v).toLocaleString("en-US"); }
function fmtPct(v, opts = {}) {
  const { sign = false, dp = 1 } = opts;
  const s = (v * 100).toFixed(dp) + "%";
  return sign && v > 0 ? "+" + s : s;
}

function daysBetween(d) {
  return Math.round((d - today) / (1000 * 60 * 60 * 24));
}

Object.assign(window, {
  I18N, STORE, HOURS, HOURLY, HOURLY_YEST, DAILY, DAILY_LAST, MONTHLY,
  CATEGORY, PAYMENTS, TOP_PRODUCTS, EXPIRING, LOW_STOCK, DELIVERIES,
  PROMOS, EVENTS, fmtMoney, fmtNum, fmtPct, fmtD, daysBetween, today,
});


// ---- ui.jsx ----
// src/ui.jsx — shadcn-style React primitives + simple charts

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ─── Button ───────────────────────────────────────────────────────────
function Button({ variant = "outline", size, icon, children, className = "", onClick, ...rest }) {
  const cls = [
    "btn",
    variant === "primary" ? "btn-primary" :
    variant === "ghost" ? "btn-ghost" :
    variant === "danger" ? "btn-danger" : "btn-outline",
    size === "sm" ? "btn-sm" : "",
    !children ? "btn-icon" : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <button className={cls} onClick={onClick} {...rest}>
      {icon && <Icon name={icon} className={size === "sm" ? "icon-sm" : ""} />}
      {children}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────
function Card({ children, className = "", style }) {
  return <div className={`card ${className}`} style={style}>{children}</div>;
}
function CardHeader({ title, sub, action, children }) {
  return (
    <div className="card-hd">
      <div style={{ minWidth: 0, flex: 1 }}>
        {title && <h3 className="card-title">{title}</h3>}
        {sub && <p className="card-sub">{sub}</p>}
        {children}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
function CardBody({ children, className = "", style }) {
  return <div className={`card-bd ${className}`} style={style}>{children}</div>;
}

// ─── Badge ────────────────────────────────────────────────────────────
function Badge({ variant = "muted", dot = false, children, className = "" }) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────
function Tabs({ value, onChange, options }) {
  return (
    <div className="tabs" role="tablist">
      {options.map(o => (
        <button key={o.value} className={`tab ${value === o.value ? "active" : ""}`}
                onClick={() => onChange(o.value)} role="tab" aria-selected={value === o.value}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Switch ───────────────────────────────────────────────────────────
function Switch({ on, onChange }) {
  return <div className={`switch ${on ? "on" : ""}`} onClick={() => onChange?.(!on)} role="switch" aria-checked={on} />;
}

// ─── Progress ─────────────────────────────────────────────────────────
function Progress({ value, max = 100, variant = "default" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={`progress ${variant === "warn" ? "warn" : variant === "danger" ? "danger" : ""}`}>
      <div style={{ width: pct + "%" }} />
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────
function Avatar({ initials, size = 32, color }) {
  return (
    <span className="avatar"
          style={{ width: size, height: size, fontSize: size * 0.4,
                   ...(color ? { background: color.bg, color: color.fg } : {}) }}>
      {initials}
    </span>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────
function Sparkline({ data, width = 90, height = 34, color, fill = true, trend }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pts = data.map((v, i) => [i * stepX, height - ((v - min) / range) * (height - 4) - 2]);
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const area = `${path} L${width},${height} L0,${height} Z`;
  const stroke = color || (trend && trend < 0 ? "var(--danger)" : "var(--primary)");
  const id = useMemo(() => "spk-" + Math.random().toString(36).slice(2, 7), []);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="kpi-spark">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity=".25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${id})`} />}
      <path d={path} fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────
function KPI({ label, value, sub, delta, deltaLabel, spark, sparkData, icon, restricted, lang }) {
  const positive = delta != null && delta >= 0;
  const t = I18N[lang].common;
  return (
    <Card>
      <CardBody style={{ position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted-fg)", fontSize: 12.5, fontWeight: 500 }}>
              {icon && <Icon name={icon} className="icon-sm" />}
              {label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 600, marginTop: 8, letterSpacing: "-0.02em" }} className="num">
              {restricted ? "•••••" : value}
            </div>
            {sub && !restricted && (
              <div style={{ fontSize: 12, color: "var(--muted-fg)", marginTop: 4 }}>{sub}</div>
            )}
          </div>
          {sparkData && !restricted && (
            <Sparkline data={sparkData} trend={delta} />
          )}
        </div>
        {delta != null && !restricted && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: 12 }}>
            <Badge variant={positive ? "primary" : "danger"}>
              <Icon name={positive ? "arrowUp" : "arrowDown"} className="icon-sm" />
              {fmtPct(Math.abs(delta), { dp: 1 })}
            </Badge>
            <span style={{ color: "var(--muted-fg)" }}>{deltaLabel}</span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ─── LineChart ────────────────────────────────────────────────────────
function LineChart({ data, compare, labels, height = 260, formatY, formatX, color = "var(--primary)" }) {
  const ref = useRef(null);
  const [w, setW] = useState(600);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(es => { for (const e of es) setW(e.contentRect.width); });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const padL = 44, padR = 14, padT = 14, padB = 28;
  const cw = Math.max(200, w - padL - padR);
  const ch = height - padT - padB;
  const all = [...data, ...(compare || [])];
  const max = Math.max(...all) * 1.08;
  const min = 0;
  const stepX = data.length > 1 ? cw / (data.length - 1) : 0;
  const y = v => padT + ch - ((v - min) / (max - min || 1)) * ch;
  const x = i => padL + i * stepX;

  const path = data.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  const area = `${path} L${x(data.length - 1)},${padT + ch} L${x(0)},${padT + ch} Z`;
  const cmpPath = compare ? compare.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ") : null;

  // y ticks
  const ticks = 4;
  const tArr = Array.from({ length: ticks + 1 }, (_, i) => (max / ticks) * i);

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    let idx = Math.round((px - padL) / stepX);
    idx = Math.max(0, Math.min(data.length - 1, idx));
    setHover(idx);
  };
  const onLeave = () => setHover(null);

  const gradId = useMemo(() => "ln-" + Math.random().toString(36).slice(2, 7), []);

  return (
    <div ref={ref} style={{ width: "100%", position: "relative" }}>
      <svg width={w} height={height} onMouseMove={onMove} onMouseLeave={onLeave} style={{ display: "block" }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity=".22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* y grid */}
        {tArr.map((tv, i) => (
          <g key={i}>
            <line x1={padL} y1={y(tv)} x2={padL + cw} y2={y(tv)} className="chart-grid" />
            <text x={padL - 8} y={y(tv)} className="chart-axis" textAnchor="end" dominantBaseline="middle">
              {formatY ? formatY(tv) : Math.round(tv)}
            </text>
          </g>
        ))}
        {/* x labels */}
        {labels && labels.map((l, i) => {
          // sparse labels for many points
          const every = Math.max(1, Math.ceil(data.length / 8));
          if (i % every !== 0 && i !== data.length - 1) return null;
          return (
            <text key={i} x={x(i)} y={padT + ch + 18} className="chart-axis" textAnchor="middle">
              {formatX ? formatX(l, i) : l}
            </text>
          );
        })}
        {/* compare line */}
        {cmpPath && (
          <path d={cmpPath} fill="none" stroke="var(--muted-fg)" strokeWidth="1.5"
                strokeDasharray="3 4" opacity=".55" />
        )}
        {/* area */}
        <path d={area} fill={`url(#${gradId})`} />
        {/* main line */}
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {/* hover */}
        {hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + ch}
                  stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="2 3" />
            <circle cx={x(hover)} cy={y(data[hover])} r="5" className="chart-pt" />
            {compare && (
              <circle cx={x(hover)} cy={y(compare[hover])} r="3.5" fill="#fff" stroke="var(--muted-fg)" strokeWidth="1.5" />
            )}
          </g>
        )}
      </svg>
      {hover != null && (
        <div style={{
          position: "absolute",
          left: Math.min(x(hover) + 12, w - 160),
          top: y(data[hover]) - 8,
          background: "var(--card)", border: "1px solid var(--border-strong)",
          borderRadius: 8, padding: "8px 10px", fontSize: 12,
          boxShadow: "var(--sh-2)", pointerEvents: "none", minWidth: 130,
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{labels?.[hover]}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
            <span style={{ color: "var(--muted-fg)" }}>Now</span>
            <span className="num" style={{ marginLeft: "auto", fontWeight: 600 }}>{formatY ? formatY(data[hover]) : data[hover]}</span>
          </div>
          {compare && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--muted-fg)", opacity: .55 }} />
              <span style={{ color: "var(--muted-fg)" }}>Prev</span>
              <span className="num" style={{ marginLeft: "auto" }}>{formatY ? formatY(compare[hover]) : compare[hover]}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── BarChart (vertical, simple) ──────────────────────────────────────
function BarChart({ data, labels, height = 220, formatY, color = "var(--primary)" }) {
  const ref = useRef(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(es => { for (const e of es) setW(e.contentRect.width); });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const padL = 44, padR = 14, padT = 14, padB = 28;
  const cw = Math.max(200, w - padL - padR);
  const ch = height - padT - padB;
  const max = Math.max(...data) * 1.1;
  const barGap = 6;
  const barW = (cw / data.length) - barGap;

  const ticks = 4;
  const tArr = Array.from({ length: ticks + 1 }, (_, i) => (max / ticks) * i);

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <svg width={w} height={height} style={{ display: "block" }}>
        {tArr.map((tv, i) => (
          <g key={i}>
            <line x1={padL} y1={padT + ch - (tv / max) * ch}
                  x2={padL + cw} y2={padT + ch - (tv / max) * ch} className="chart-grid" />
            <text x={padL - 8} y={padT + ch - (tv / max) * ch} className="chart-axis"
                  textAnchor="end" dominantBaseline="middle">
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
              <rect x={xPos} y={yPos} width={barW} height={h} rx="3" fill={color} opacity=".88" />
              {labels && (
                <text x={xPos + barW / 2} y={padT + ch + 18} className="chart-axis" textAnchor="middle">
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

// ─── Donut ────────────────────────────────────────────────────────────
function Donut({ data, size = 160, thickness = 18 }) {
  const r = size / 2 - thickness / 2;
  const cx = size / 2, cy = size / 2;
  const total = data.reduce((s, d) => s + d.value, 0);
  let a = -Math.PI / 2;
  const segs = data.map(d => {
    const pct = d.value / total;
    const a2 = a + pct * Math.PI * 2;
    const x1 = cx + r * Math.cos(a), y1 = cy + r * Math.sin(a);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const large = pct > 0.5 ? 1 : 0;
    const path = `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2}`;
    const seg = { path, color: d.color, label: d.label, pct, value: d.value };
    a = a2;
    return seg;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--muted)" strokeWidth={thickness} />
      {segs.map((s, i) => (
        <path key={i} d={s.path} fill="none" stroke={s.color} strokeWidth={thickness} strokeLinecap="butt" />
      ))}
    </svg>
  );
}

// ─── Toast (very simple) ──────────────────────────────────────────────
function useToasts() {
  const [list, setList] = useState([]);
  const push = useCallback((msg, variant = "primary") => {
    const id = Math.random().toString(36).slice(2);
    setList(l => [...l, { id, msg, variant }]);
    setTimeout(() => setList(l => l.filter(t => t.id !== id)), 2800);
  }, []);
  const Toaster = () => (
    <div style={{
      position: "fixed", bottom: 18, left: "50%", transform: "translateX(-50%)",
      display: "flex", flexDirection: "column", gap: 8, zIndex: 2000, pointerEvents: "none",
    }}>
      {list.map(t => (
        <div key={t.id} className="fade-in" style={{
          background: "var(--card)", border: "1px solid var(--border-strong)",
          borderLeft: `3px solid var(--${t.variant === "danger" ? "danger" : "primary"})`,
          boxShadow: "var(--sh-2)", padding: "10px 14px", borderRadius: 8,
          fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8,
        }}>
          <Icon name={t.variant === "danger" ? "alert" : "check"} className="icon-sm" />
          {t.msg}
        </div>
      ))}
    </div>
  );
  return { push, Toaster };
}

// ─── Skeleton placeholder ─────────────────────────────────────────────
function PHImage({ label, height = 80, style }) {
  return <div className="ph" style={{ height, ...style }}>{label || "image"}</div>;
}

// ─── Empty state ──────────────────────────────────────────────────────
function Empty({ icon = "alert", title, sub }) {
  return (
    <div style={{ padding: 36, textAlign: "center", color: "var(--muted-fg)" }}>
      <div style={{ display: "inline-flex", padding: 14, borderRadius: 999, background: "var(--muted)" }}>
        <Icon name={icon} className="icon-lg" />
      </div>
      <div style={{ marginTop: 12, fontWeight: 600, color: "var(--fg)" }}>{title}</div>
      {sub && <div style={{ marginTop: 4, fontSize: 13 }}>{sub}</div>}
    </div>
  );
}

// ─── Restricted screen (for staff role) ───────────────────────────────
function Restricted({ lang }) {
  const t = I18N[lang].common;
  return (
    <Card>
      <CardBody style={{ textAlign: "center", padding: "60px 40px" }}>
        <div style={{ display: "inline-flex", padding: 16, borderRadius: 999, background: "var(--muted)" }}>
          <Icon name="lock" className="icon-lg" />
        </div>
        <div style={{ marginTop: 14, fontSize: 16, fontWeight: 600 }}>{t.restricted}</div>
        <div style={{ marginTop: 6, fontSize: 13, color: "var(--muted-fg)" }}>{t.restrictedHint}</div>
      </CardBody>
    </Card>
  );
}

// ─── Page header (top of each page) ───────────────────────────────────
function PageHeader({ title, sub, right }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between",
                  gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>{title}</h1>
        {sub && <p style={{ margin: "4px 0 0", color: "var(--muted-fg)", fontSize: 13.5 }}>{sub}</p>}
      </div>
      {right && <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>{right}</div>}
    </div>
  );
}

Object.assign(window, {
  Button, Card, CardHeader, CardBody, Badge, Tabs, Switch, Progress, Avatar,
  Sparkline, KPI, LineChart, BarChart, Donut, useToasts, PHImage, Empty,
  Restricted, PageHeader,
});


// ---- pages-dashboard.jsx ----
// src/pages-dashboard.jsx — main dashboard

function DashboardPage({ lang, role, goto }) {
  const t = I18N[lang];
  const isStaff = role === "staff";
  const [chartRange, setChartRange] = React.useState("hourly");

  // Daily totals
  const todayTotal = HOURLY.reduce((s, v) => s + v, 0);
  const yestTotal = HOURLY_YEST.reduce((s, v) => s + v, 0);
  const trxs = 412;
  const trxsY = 387;
  const basket = todayTotal / trxs;
  const basketY = yestTotal / trxsY;
  const visitors = 1284;
  const visitorsY = 1198;

  const urgentAlerts = [...EXPIRING.filter(e => daysBetween(e.exp) <= 1), ...LOW_STOCK.filter(l => l.stock / l.reorder < 0.25)].slice(0, 5);

  const chartData = chartRange === "hourly" ? HOURLY : chartRange === "weekly" ? DAILY : MONTHLY;
  const chartCompare = chartRange === "hourly" ? HOURLY_YEST : chartRange === "weekly" ? DAILY_LAST : null;
  const chartLabels = chartRange === "hourly"
    ? HOURS.map(h => `${String(h).padStart(2, "0")}:00`)
    : chartRange === "weekly"
      ? t.weekdays
      : t.months;

  const greeting = (() => {
    const h = 14; // pretend current hour
    if (lang === "th") return h < 12 ? "อรุณสวัสดิ์" : h < 17 ? "สวัสดียามบ่าย" : "สวัสดียามเย็น";
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();
  const userName = isStaff ? STORE.staff[lang] : STORE.manager[lang];

  return (
    <div className="fade-in" data-screen-label="Dashboard">
      <PageHeader
        title={`${greeting}, ${userName.split(" ")[0]} 👋`}
        sub={t.dash.welcomeSub + " · " + STORE.name[lang]}
        right={<>
          <Badge variant="muted"><Icon name="clock" className="icon-sm" />{t.common.lastUpdated} 14:02</Badge>
          <Button size="sm" variant="outline" icon="refresh">{t.common.refresh}</Button>
          <Button size="sm" variant="outline" icon="download">{t.common.export}</Button>
        </>}
      />

      {/* KPIs */}
      <div className="grid-kpi" style={{ marginBottom: 14 }}>
        <KPI
          lang={lang}
          icon="baht"
          label={t.dash.revenueToday}
          value={fmtMoney(todayTotal, { compact: true })}
          sub={t.common.compareYesterday + " · " + fmtMoney(yestTotal)}
          delta={(todayTotal - yestTotal) / yestTotal}
          deltaLabel={t.common.compareYesterday}
          sparkData={HOURLY}
          restricted={isStaff}
        />
        <KPI
          lang={lang}
          icon="bag"
          label={t.dash.transactions}
          value={fmtNum(trxs)}
          sub={`${trxsY} ${t.common.yesterday.toLowerCase()}`}
          delta={(trxs - trxsY) / trxsY}
          deltaLabel={t.common.compareYesterday}
          sparkData={[28, 31, 35, 32, 38, 42, 48, 52, 49, 44, 40, 51, 62, 71, 64, 51, 39, 28]}
        />
        <KPI
          lang={lang}
          icon="package"
          label={t.dash.basket}
          value={fmtMoney(basket)}
          sub={fmtMoney(basketY) + " " + t.common.yesterday.toLowerCase()}
          delta={(basket - basketY) / basketY}
          deltaLabel={t.common.compareYesterday}
          sparkData={[110, 118, 132, 119, 124, 128, 142, 138, 145, 134, 128, 138]}
          restricted={isStaff}
        />
        <KPI
          lang={lang}
          icon="user"
          label={t.dash.visitors}
          value={fmtNum(visitors)}
          sub={fmtNum(visitorsY) + " " + t.common.yesterday.toLowerCase()}
          delta={(visitors - visitorsY) / visitorsY}
          deltaLabel={t.common.compareYesterday}
          sparkData={[42, 51, 68, 84, 96, 88, 102, 121, 116, 98, 89, 124, 156, 168, 142, 118, 96, 78]}
        />
      </div>

      {/* Chart + Alerts row */}
      <div className="grid-2" style={{ marginBottom: 14 }}>
        <Card>
          <CardHeader
            title={t.dash.revenueChart}
            sub={STORE.name[lang]}
            action={
              <Tabs value={chartRange} onChange={setChartRange}
                options={[
                  { value: "hourly", label: t.dash.hourly },
                  { value: "weekly", label: t.dash.weekly },
                  { value: "monthly", label: t.dash.monthly },
                ]} />
            }
          />
          <CardBody>
            <LineChart
              data={chartData}
              compare={chartCompare}
              labels={chartLabels}
              height={264}
              formatY={v => fmtMoney(v, { compact: true })}
            />
            <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12, color: "var(--muted-fg)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 3, background: "var(--primary)", borderRadius: 2 }} />
                {t.common.today}
              </div>
              {chartCompare && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 3, background: "var(--muted-fg)", opacity: .55, borderRadius: 2,
                                 borderTop: "2px dashed currentColor" }} />
                  {chartRange === "hourly" ? t.common.yesterday : t.common.thisWeek}
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span className="pulse" />{t.dash.alertsTitle}
            </span>}
            sub={t.dash.alertsSub}
            action={<Button size="sm" variant="ghost" onClick={() => goto("alerts")}>{t.common.viewAll}<Icon name="chevronRight" className="icon-sm" /></Button>}
          />
          <CardBody style={{ paddingTop: 6 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {urgentAlerts.map((a, i) => {
                const isExpiry = "exp" in a;
                const days = isExpiry ? daysBetween(a.exp) : null;
                return (
                  <div key={a.sku + i} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 0", borderTop: i ? "1px solid var(--border)" : "none",
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: isExpiry ? "var(--danger-50)" : "var(--warn-50)",
                      color: isExpiry ? "var(--danger)" : "oklch(0.45 0.13 70)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon name={isExpiry ? "clock" : "package"} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden",
                                    textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a[lang]}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--muted-fg)", marginTop: 2, display: "flex", gap: 8 }}>
                        <span className="mono">{a.sku}</span>
                        <span>·</span>
                        {isExpiry
                          ? <span>{lang === "th" ? "หมดอายุใน" : "expires in"} <b style={{ color: "var(--danger)" }}>{days === 0 ? (lang === "th" ? "วันนี้" : "today") : `${days}${t.alert.days}`}</b></span>
                          : <span>{lang === "th" ? "เหลือ" : "only"} <b style={{ color: "oklch(0.45 0.13 70)" }}>{a.stock}</b>{lang === "th" ? "" : " left"}</span>
                        }
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Bottom row: deliveries + top products */}
      <div className="grid-2">
        <Card className="table-card">
          <CardHeader
            title={t.dash.deliveriesToday}
            sub={`${DELIVERIES.filter(d => d.status !== "delivered").length} ${lang === "th" ? "กำลังดำเนินการ" : "in progress"} · ${DELIVERIES.filter(d => d.status === "delivered").length} ${lang === "th" ? "เสร็จสิ้น" : "completed"}`}
            action={<Button size="sm" variant="ghost" onClick={() => goto("delivery")}>{t.common.viewAll}<Icon name="chevronRight" className="icon-sm" /></Button>}
          />
          <table className="tbl" style={{ marginTop: 10 }}>
            <thead>
              <tr>
                <th>{t.deliv.orderId}</th>
                <th>{t.deliv.customer}</th>
                <th>{t.deliv.status}</th>
                <th style={{ textAlign: "right" }}>{t.deliv.eta}</th>
              </tr>
            </thead>
            <tbody>
              {DELIVERIES.slice(0, 5).map(d => (
                <tr key={d.id}>
                  <td className="mono" style={{ fontSize: 12 }}>{d.id.slice(-6)}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{d.customer[lang]}</div>
                    <div style={{ fontSize: 11.5, color: "var(--muted-fg)" }}>
                      {d.addr[lang]} · {d.items} {lang === "th" ? "ชิ้น" : "items"}
                    </div>
                  </td>
                  <td>
                    {d.status === "delivered" && <Badge variant="primary" dot>{t.deliv.delivered}</Badge>}
                    {d.status === "enRoute" && <Badge variant={d.late ? "warn" : "info"} dot>{t.deliv.enRoute}</Badge>}
                    {d.status === "preparing" && <Badge variant="muted" dot>{t.deliv.preparing}</Badge>}
                  </td>
                  <td style={{ textAlign: "right" }} className="num">
                    {d.eta}
                    {d.late && <Badge variant="danger" className="badge" style={{ marginLeft: 6 }}>{t.deliv.late}</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader
            title={t.dash.topProducts}
            sub={t.common.today}
            action={<Badge variant="primary"><Icon name="flame" className="icon-sm" />{lang === "th" ? "ขายดี" : "Trending"}</Badge>}
          />
          <CardBody style={{ paddingTop: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {TOP_PRODUCTS.slice(0, 5).map((p, i) => (
                <div key={p.sku} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 7, background: "var(--muted)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 600, color: "var(--muted-fg)", flexShrink: 0,
                  }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden",
                                  textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p[lang]}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--muted-fg)" }}>
                      <span className="mono">{p.sku}</span> · {p.sold} {lang === "th" ? "ชิ้น" : "sold"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="num" style={{ fontSize: 13, fontWeight: 600 }}>
                      {isStaff ? "—" : fmtMoney(p.value)}
                    </div>
                    <div style={{ fontSize: 11, color: p.trend > 0 ? "var(--primary)" : "var(--danger)",
                                  fontWeight: 600 }} className="num">
                      {p.trend > 0 ? "+" : ""}{p.trend}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Cat breakdown for manager only */}
      {!isStaff && (
        <Card style={{ marginTop: 14 }}>
          <CardHeader title={t.dash.categoryBreakdown} sub={t.common.today} />
          <CardBody style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 28, alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Donut data={CATEGORY.map(c => ({ value: c.v, color: c.color, label: c[lang] }))} size={160} />
              <div style={{ fontSize: 12, color: "var(--muted-fg)" }}>
                <span className="num" style={{ fontSize: 22, fontWeight: 600, color: "var(--fg)", letterSpacing: "-0.02em" }}>
                  {fmtMoney(CATEGORY.reduce((s, c) => s + c.v, 0), { compact: true })}
                </span>
                <div>{lang === "th" ? "ยอดรวม" : "Total"}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
              {CATEGORY.map((c, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "16px 1fr auto auto", gap: 12,
                                       alignItems: "center" }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: c.color }} />
                  <div style={{ fontSize: 13 }}>{c[lang]}</div>
                  <div className="num" style={{ fontSize: 13, fontWeight: 500 }}>{fmtMoney(c.v)}</div>
                  <Badge variant={c.trend >= 0 ? "primary" : "danger"}>
                    <Icon name={c.trend >= 0 ? "arrowUp" : "arrowDown"} className="icon-sm" />
                    {Math.abs(c.trend).toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}



// ---- pages-alerts.jsx ----
// src/pages-alerts.jsx — stock alerts

function AlertsPage({ lang, role, pushToast }) {
  const t = I18N[lang];
  const [tab, setTab] = React.useState("expired");
  const [q, setQ] = React.useState("");
  const [acknowledged, setAcknowledged] = React.useState(new Set());

  const expiringList = EXPIRING.map(e => ({
    ...e,
    daysLeft: daysBetween(e.exp),
    severity: daysBetween(e.exp) <= 1 ? "urgent" : daysBetween(e.exp) <= 3 ? "warning" : "info",
  }));
  const lowList = LOW_STOCK.map(l => ({
    ...l,
    pct: l.stock / l.reorder,
    severity: l.stock / l.reorder < 0.2 ? "urgent" : l.stock / l.reorder < 0.4 ? "warning" : "info",
  }));

  const list = tab === "expired" ? expiringList : tab === "low" ? lowList : [];
  const filtered = q
    ? list.filter(x => (x[lang] || "").toLowerCase().includes(q.toLowerCase())
                    || x.sku.toLowerCase().includes(q.toLowerCase()))
    : list;

  const counts = {
    expired: expiringList.filter(e => e.severity !== "info").length,
    low: lowList.filter(l => l.severity !== "info").length,
  };

  const sevBadge = (s) => {
    if (s === "urgent") return <Badge variant="danger" dot>{t.alert.urgent}</Badge>;
    if (s === "warning") return <Badge variant="warn" dot>{t.alert.warning}</Badge>;
    return <Badge variant="muted" dot>{t.alert.info}</Badge>;
  };

  const ack = (sku) => {
    setAcknowledged(s => new Set([...s, sku]));
    pushToast(lang === "th" ? `รับทราบ ${sku} แล้ว` : `Acknowledged ${sku}`);
  };

  return (
    <div className="fade-in" data-screen-label="Stock Alerts">
      <PageHeader
        title={t.alert.title}
        sub={t.alert.sub}
        right={<>
          <Button size="sm" variant="outline" icon="filter">{t.common.filter}</Button>
          <Button size="sm" variant="outline" icon="download">{t.common.export}</Button>
          {role === "manager" && <Button size="sm" variant="primary" icon="refresh">{lang === "th" ? "ซิงค์สต็อก" : "Sync stock"}</Button>}
        </>}
      />

      {/* KPI summary */}
      <div className="grid-3" style={{ marginBottom: 14 }}>
        <Card>
          <CardBody>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--danger-50)",
                            color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="clock" className="icon-lg" />
              </div>
              <div>
                <div style={{ fontSize: 12.5, color: "var(--muted-fg)" }}>{lang === "th" ? "หมดอายุภายใน 1 วัน" : "Expiring within 1 day"}</div>
                <div className="num" style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em" }}>
                  {expiringList.filter(e => e.daysLeft <= 1).length}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--muted-fg)" }}>
                  {lang === "th" ? "มูลค่าเสี่ยงสูญเสีย" : "Value at risk"} ·{" "}
                  <span style={{ fontWeight: 600, color: "var(--danger)" }} className="num">
                    {fmtMoney(expiringList.filter(e => e.daysLeft <= 1).reduce((s, e) => s + e.stock * e.price, 0))}
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--warn-50)",
                            color: "oklch(0.45 0.13 70)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="package" className="icon-lg" />
              </div>
              <div>
                <div style={{ fontSize: 12.5, color: "var(--muted-fg)" }}>{lang === "th" ? "สต็อกต่ำกว่าจุดสั่งซื้อ" : "Below reorder point"}</div>
                <div className="num" style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em" }}>{lowList.length}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted-fg)" }}>
                  {lang === "th" ? "ต้องสั่งทันที" : "Need immediate reorder"} ·{" "}
                  <span style={{ fontWeight: 600, color: "var(--danger)" }} className="num">
                    {lowList.filter(l => l.pct < 0.2).length}
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--primary-50)",
                            color: "var(--primary-600)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="check" className="icon-lg" />
              </div>
              <div>
                <div style={{ fontSize: 12.5, color: "var(--muted-fg)" }}>{lang === "th" ? "ดำเนินการแล้ว วันนี้" : "Resolved today"}</div>
                <div className="num" style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em" }}>
                  {12 + acknowledged.size}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--muted-fg)" }}>
                  {lang === "th" ? "เฉลี่ยเวลา" : "Avg resolution"} · 8 {lang === "th" ? "น." : "min"}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="table-card">
        <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Tabs value={tab} onChange={setTab} options={[
            { value: "expired", label: `${t.alert.expired} · ${counts.expired}` },
            { value: "low", label: `${t.alert.low} · ${counts.low}` },
          ]} />
          <div style={{ position: "relative", minWidth: 240, flex: 1, maxWidth: 360 }}>
            <Icon name="search" className="icon-sm" style={{
              position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
              color: "var(--muted-fg)" }} />
            <input className="input" style={{ paddingLeft: 32 }}
                   placeholder={t.common.search}
                   value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--muted-fg)" }}>
            {t.common.showing} <b>{filtered.length}</b> {t.common.of} <b>{list.length}</b>
          </div>
        </div>
        <hr className="sep" />
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>{t.alert.sku}</th>
                <th>{t.alert.product}</th>
                <th>{t.alert.category}</th>
                {tab === "expired" ? <>
                  <th>{t.alert.expiry}</th>
                  <th>{t.alert.daysLeft}</th>
                </> : <>
                  <th>{t.alert.stock}</th>
                  <th>{t.alert.reorder}</th>
                </>}
                <th>{t.alert.location}</th>
                <th>{t.alert.severity}</th>
                <th style={{ textAlign: "right" }}>{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const isAcked = acknowledged.has(item.sku);
                return (
                  <tr key={item.sku} style={{ opacity: isAcked ? 0.5 : 1 }}>
                    <td className="mono" style={{ fontSize: 12 }}>{item.sku}</td>
                    <td style={{ fontWeight: 500 }}>{item[lang]}</td>
                    <td><Badge variant="outline">{item.cat[lang]}</Badge></td>
                    {tab === "expired" ? <>
                      <td className="num">{fmtD(item.exp, lang)}</td>
                      <td>
                        <span className="num" style={{
                          fontWeight: 600,
                          color: item.daysLeft <= 1 ? "var(--danger)" :
                                 item.daysLeft <= 3 ? "oklch(0.45 0.13 70)" : "var(--fg)"
                        }}>
                          {item.daysLeft === 0 ? (lang === "th" ? "วันนี้" : "today") :
                           `${item.daysLeft} ${t.alert.days}`}
                        </span>
                      </td>
                    </> : <>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span className="num" style={{ fontWeight: 600, minWidth: 26 }}>{item.stock}</span>
                          <div style={{ flex: 1, maxWidth: 80 }}>
                            <Progress value={item.pct * 100}
                                      variant={item.pct < 0.2 ? "danger" : item.pct < 0.4 ? "warn" : "default"} />
                          </div>
                        </div>
                      </td>
                      <td className="num">{item.reorder}</td>
                    </>}
                    <td className="mono" style={{ fontSize: 12, color: "var(--muted-fg)" }}>{item.loc}</td>
                    <td>{sevBadge(item.severity)}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        {!isAcked && role === "manager" && (
                          <Button size="sm" variant="outline">
                            {tab === "expired" ? t.alert.markdown : t.alert.reorderNow}
                          </Button>
                        )}
                        {!isAcked ? (
                          <Button size="sm" variant="ghost" onClick={() => ack(item.sku)}>
                            <Icon name="check" className="icon-sm" />
                            {t.common.acknowledge}
                          </Button>
                        ) : (
                          <Badge variant="primary"><Icon name="check" className="icon-sm" />{lang === "th" ? "รับทราบแล้ว" : "Acknowledged"}</Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan="8"><Empty title={t.common.noData} sub={lang === "th" ? "ไม่พบสินค้าตามคำค้นหา" : "No items match your search"} /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}



// ---- pages-delivery.jsx ----
// src/pages-delivery.jsx — customer delivery tracking

function DeliveryPage({ lang, role, pushToast }) {
  const t = I18N[lang];
  const [tab, setTab] = React.useState("active");
  const [selected, setSelected] = React.useState(null);

  const active = DELIVERIES.filter(d => d.status === "enRoute" || d.status === "preparing");
  const completed = DELIVERIES.filter(d => d.status === "delivered");

  const list = tab === "active" ? active : completed;

  const stat = (d) => {
    if (d.status === "delivered") return <Badge variant="primary" dot>{t.deliv.delivered}</Badge>;
    if (d.status === "enRoute") return <Badge variant={d.late ? "warn" : "info"} dot>{t.deliv.enRoute}</Badge>;
    if (d.status === "preparing") return <Badge variant="muted" dot>{t.deliv.preparing}</Badge>;
  };

  return (
    <div className="fade-in" data-screen-label="Delivery">
      <PageHeader
        title={t.deliv.title}
        sub={`${t.deliv.from} ${STORE.short[lang]} · ${t.common.today}`}
        right={<>
          <Button size="sm" variant="outline" icon="filter">{t.common.filter}</Button>
          <Button size="sm" variant="outline" icon="refresh">{t.common.refresh}</Button>
        </>}
      />

      {/* Stat row */}
      <div className="grid-3" style={{ marginBottom: 14 }}>
        <Card>
          <CardBody>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--info-50)",
                            color: "var(--info)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="truck" className="icon-lg" />
              </div>
              <div>
                <div style={{ fontSize: 12.5, color: "var(--muted-fg)" }}>{t.deliv.active}</div>
                <div className="num" style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em" }}>
                  {active.length}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--muted-fg)" }}>
                  {active.filter(d => d.late).length > 0 &&
                    <><span style={{ color: "var(--warn)", fontWeight: 600 }} className="num">{active.filter(d => d.late).length}</span> {lang === "th" ? "ล่าช้า" : "running late"} · </>
                  }
                  {active.filter(d => d.status === "preparing").length} {lang === "th" ? "กำลังจัด" : "preparing"}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--primary-50)",
                            color: "var(--primary-600)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="check" className="icon-lg" />
              </div>
              <div>
                <div style={{ fontSize: 12.5, color: "var(--muted-fg)" }}>{t.deliv.completed}</div>
                <div className="num" style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em" }}>
                  {completed.length}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--muted-fg)" }}>
                  {lang === "th" ? "ตรงเวลา" : "On-time"} <span style={{ fontWeight: 600, color: "var(--primary)" }} className="num">{Math.round((completed.filter(d => !d.late).length / completed.length) * 100)}%</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--muted)",
                            color: "var(--fg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="baht" className="icon-lg" />
              </div>
              <div>
                <div style={{ fontSize: 12.5, color: "var(--muted-fg)" }}>{lang === "th" ? "ยอดส่งวันนี้" : "Delivery value today"}</div>
                <div className="num" style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em" }}>
                  {role === "staff" ? "—" : fmtMoney(DELIVERIES.reduce((s, d) => s + d.value, 0))}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--muted-fg)" }}>
                  {DELIVERIES.length} {lang === "th" ? "ออเดอร์" : "orders"} · {lang === "th" ? "เฉลี่ย" : "avg"}{" "}
                  <span className="num" style={{ fontWeight: 600 }}>{role === "staff" ? "—" : fmtMoney(DELIVERIES.reduce((s, d) => s + d.value, 0) / DELIVERIES.length)}</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Map + list */}
      <div className="grid-2">
        <Card>
          <CardHeader title={lang === "th" ? "พื้นที่จัดส่ง" : "Delivery area"} sub={`${STORE.short[lang]} · 3 km radius`} />
          <CardBody>
            <DeliveryMap deliveries={DELIVERIES} selected={selected} onSelect={setSelected} lang={lang} />
          </CardBody>
        </Card>

        <Card className="table-card">
          <div style={{ padding: "14px 18px" }}>
            <Tabs value={tab} onChange={setTab} options={[
              { value: "active", label: `${t.deliv.active} · ${active.length}` },
              { value: "completed", label: `${t.deliv.completed} · ${completed.length}` },
            ]} />
          </div>
          <hr className="sep" />
          <div style={{ maxHeight: 520, overflowY: "auto" }}>
            <table className="tbl">
              <tbody>
                {list.map(d => (
                  <tr key={d.id} onClick={() => setSelected(d.id)}
                      style={{
                        cursor: "default",
                        background: selected === d.id ? "var(--primary-50)" : undefined
                      }}>
                    <td style={{ padding: "12px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                          background: d.status === "delivered" ? "var(--primary-50)" :
                                      d.status === "preparing" ? "var(--muted)" :
                                      d.late ? "var(--warn-50)" : "var(--info-50)",
                          color: d.status === "delivered" ? "var(--primary-600)" :
                                 d.status === "preparing" ? "var(--muted-fg)" :
                                 d.late ? "oklch(0.45 0.13 70)" : "var(--info)",
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                          <Icon name="truck" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{d.customer[lang]}</div>
                            <div className="mono" style={{ fontSize: 11.5, color: "var(--muted-fg)" }}>{d.id.slice(-8)}</div>
                          </div>
                          <div style={{ fontSize: 12, color: "var(--muted-fg)", marginTop: 2 }}>
                            <Icon name="pin" className="icon-sm" style={{ verticalAlign: "-2px", marginRight: 2 }} />
                            {d.addr[lang]} · {d.distance} km
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, fontSize: 12 }}>
                            {stat(d)}
                            <span style={{ color: "var(--muted-fg)" }}>
                              {t.deliv.driver}: <b style={{ color: "var(--fg)" }}>{d.driver[lang]}</b>
                            </span>
                            <span style={{ color: "var(--muted-fg)", marginLeft: "auto" }}>
                              <Icon name="clock" className="icon-sm" style={{ verticalAlign: "-2px" }} /> {d.eta}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Detail panel */}
      {selected && (() => {
        const d = DELIVERIES.find(x => x.id === selected);
        if (!d) return null;
        const stages = ["preparing", "enRoute", "delivered"];
        const stageIdx = stages.indexOf(d.status);
        return (
          <Card style={{ marginTop: 14 }} className="fade-in">
            <CardHeader
              title={<span className="mono">{d.id}</span>}
              sub={d.customer[lang]}
              action={<Button variant="ghost" size="sm" icon="x" onClick={() => setSelected(null)} />}
            />
            <CardBody>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 18 }}>
                <Field label={t.deliv.customer} value={d.customer[lang]} icon="user" />
                <Field label={lang === "th" ? "ที่อยู่จัดส่ง" : "Delivery address"} value={d.addr[lang]} icon="pin" />
                <Field label={t.deliv.driver} value={d.driver[lang]} icon="truck" />
                <Field label={lang === "th" ? "จำนวนสินค้า" : "Items"} value={`${d.items} ${lang === "th" ? "ชิ้น" : "items"}`} icon="package" />
                <Field label={t.deliv.value} value={role === "staff" ? "—" : fmtMoney(d.value)} icon="baht" />
                <Field label={t.deliv.eta} value={d.eta + (d.late ? ` · ${t.deliv.late}` : "")} icon="clock" valueColor={d.late ? "var(--warn)" : null} />
              </div>
              <div style={{ marginTop: 22 }}>
                <div style={{ fontSize: 12.5, color: "var(--muted-fg)", marginBottom: 12, fontWeight: 500 }}>
                  {lang === "th" ? "ความคืบหน้า" : "Progress"}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 24px 1fr 24px 1fr", alignItems: "center", gap: 0 }}>
                  {stages.map((s, i) => (
                    <React.Fragment key={s}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%", margin: "0 auto",
                          background: i <= stageIdx ? "var(--primary)" : "var(--muted)",
                          color: i <= stageIdx ? "var(--primary-fg)" : "var(--muted-fg)",
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                          <Icon name={s === "preparing" ? "package" : s === "enRoute" ? "truck" : "check"} className="icon-sm" />
                        </div>
                        <div style={{ fontSize: 12, marginTop: 8, fontWeight: i === stageIdx ? 600 : 400,
                                       color: i <= stageIdx ? "var(--fg)" : "var(--muted-fg)" }}>
                          {s === "preparing" ? t.deliv.preparing : s === "enRoute" ? t.deliv.enRoute : t.deliv.delivered}
                        </div>
                      </div>
                      {i < stages.length - 1 && (
                        <div style={{ height: 2, background: i < stageIdx ? "var(--primary)" : "var(--border)",
                                       margin: "0 -8px", alignSelf: "flex-start", marginTop: 16 }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              {role === "manager" && d.status !== "delivered" && (
                <div style={{ marginTop: 22, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <Button size="sm" variant="outline">{lang === "th" ? "ติดต่อพนักงานส่ง" : "Contact driver"}</Button>
                  <Button size="sm" variant="primary">{lang === "th" ? "ปรับสถานะ" : "Update status"}</Button>
                </div>
              )}
            </CardBody>
          </Card>
        );
      })()}
    </div>
  );
}

function Field({ label, value, icon, valueColor }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted-fg)", fontSize: 11.5, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".04em" }}>
        {icon && <Icon name={icon} className="icon-sm" />}
        {label}
      </div>
      <div style={{ marginTop: 4, fontSize: 14, fontWeight: 500, color: valueColor || "var(--fg)" }}>{value}</div>
    </div>
  );
}

// Stylised map placeholder using SVG (no real map tiles needed)
function DeliveryMap({ deliveries, selected, onSelect, lang }) {
  // Place pins around the store center based on distance + a stable hash of order id
  const cx = 50, cy = 50;
  const pinPos = (d, i) => {
    let h = 0;
    for (let k = 0; k < d.id.length; k++) h = (h * 31 + d.id.charCodeAt(k)) >>> 0;
    const ang = (h % 1000) / 1000 * Math.PI * 2;
    const r = 10 + d.distance * 8;
    return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r];
  };

  return (
    <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", height: 320,
                  background: "linear-gradient(180deg, oklch(0.97 0.01 95) 0%, oklch(0.95 0.012 95) 100%)",
                  border: "1px solid var(--border)" }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
        <defs>
          <pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M 6 0 L 0 0 0 6" fill="none" stroke="var(--border)" strokeWidth=".2"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)"/>
        {/* roads */}
        <path d="M0 50 L100 50" stroke="var(--border-strong)" strokeWidth="1.5" opacity=".6"/>
        <path d="M50 0 L50 100" stroke="var(--border-strong)" strokeWidth="1.5" opacity=".6"/>
        <path d="M0 25 L100 25" stroke="var(--border-strong)" strokeWidth=".7" opacity=".4"/>
        <path d="M0 75 L100 75" stroke="var(--border-strong)" strokeWidth=".7" opacity=".4"/>
        <path d="M25 0 L25 100" stroke="var(--border-strong)" strokeWidth=".7" opacity=".4"/>
        <path d="M75 0 L75 100" stroke="var(--border-strong)" strokeWidth=".7" opacity=".4"/>
        <path d="M0 0 L100 100" stroke="var(--border-strong)" strokeWidth=".5" opacity=".3"/>
        {/* Service area */}
        <circle cx={cx} cy={cy} r="30" fill="var(--primary)" opacity=".05" stroke="var(--primary)" strokeWidth=".3" strokeDasharray="1 1.5" />
        <circle cx={cx} cy={cy} r="20" fill="none" stroke="var(--primary)" strokeWidth=".25" strokeDasharray="1 1.5" opacity=".4" />
        {/* Routes for en route */}
        {deliveries.filter(d => d.status === "enRoute").map((d, i) => {
          const [px, py] = pinPos(d, i);
          return <line key={d.id} x1={cx} y1={cy} x2={px} y2={py}
                       stroke={d.late ? "var(--warn)" : "var(--info)"}
                       strokeWidth=".4" strokeDasharray="1 1" opacity=".7" />;
        })}
        {/* Store pin */}
        <circle cx={cx} cy={cy} r="2.6" fill="var(--primary)" />
        <circle cx={cx} cy={cy} r="4" fill="none" stroke="var(--primary)" strokeWidth=".4" opacity=".4" />
        {/* Customer pins */}
        {deliveries.map((d, i) => {
          const [px, py] = pinPos(d, i);
          const isSel = selected === d.id;
          const color = d.status === "delivered" ? "var(--primary)" :
                        d.status === "preparing" ? "var(--muted-fg)" :
                        d.late ? "var(--warn)" : "var(--info)";
          return (
            <g key={d.id} onClick={() => onSelect(d.id)} style={{ cursor: "default" }}>
              <circle cx={px} cy={py} r={isSel ? 3 : 2} fill={color} stroke="#fff" strokeWidth=".5" />
              {isSel && <circle cx={px} cy={py} r="5" fill="none" stroke={color} strokeWidth=".5" opacity=".5" />}
            </g>
          );
        })}
      </svg>
      {/* Center label */}
      <div style={{
        position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -180%)",
        background: "var(--card)", border: "1px solid var(--border-strong)", padding: "4px 8px",
        borderRadius: 6, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", boxShadow: "var(--sh-1)"
      }}>
        <Icon name="store" className="icon-sm" style={{ verticalAlign: "-2px", marginRight: 4, color: "var(--primary-600)" }} />
        {STORE.short[lang]}
      </div>
      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 10, left: 10, background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(8px)", border: "1px solid var(--border)", borderRadius: 8,
        padding: "8px 10px", fontSize: 11, display: "flex", flexDirection: "column", gap: 4
      }}>
        <LegendDot color="var(--info)" label={lang === "th" ? "อยู่ระหว่างทาง" : "En route"} />
        <LegendDot color="var(--warn)" label={lang === "th" ? "ล่าช้า" : "Late"} />
        <LegendDot color="var(--muted-fg)" label={lang === "th" ? "กำลังจัด" : "Preparing"} />
        <LegendDot color="var(--primary)" label={lang === "th" ? "ส่งแล้ว" : "Delivered"} />
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
      <span>{label}</span>
    </div>
  );
}



// ---- pages-revenue.jsx ----
// src/pages-revenue.jsx — revenue detail

function RevenuePage({ lang, role }) {
  const t = I18N[lang];
  if (role === "staff") return <><PageHeader title={t.rev.title} sub={t.rev.sub} /><Restricted lang={lang} /></>;

  const [range, setRange] = React.useState("day");

  const series = range === "day" ? HOURLY : range === "week" ? DAILY : range === "month" ? null : MONTHLY;
  const compare = range === "day" ? HOURLY_YEST : range === "week" ? DAILY_LAST : null;
  const labels = range === "day" ? HOURS.map(h => `${String(h).padStart(2, "0")}:00`) :
                 range === "week" ? t.weekdays :
                 range === "year" ? t.months :
                 Array.from({ length: 31 }, (_, i) => String(i + 1));

  // synthesize month data
  const monthly = range === "month"
    ? Array.from({ length: 22 }, (_, i) => 180000 + Math.sin(i * 0.6) * 38000 + i * 4200 + Math.random() * 8000)
    : null;
  const monthlyData = monthly ? monthly.map(v => Math.round(v)) : null;

  const total = (series || monthlyData).reduce((s, v) => s + v, 0);
  const compTotal = compare ? compare.reduce((s, v) => s + v, 0) : null;
  const trxs = Math.round(total / 480);
  const growth = compTotal ? (total - compTotal) / compTotal : 0.082;

  return (
    <div className="fade-in" data-screen-label="Revenue">
      <PageHeader
        title={t.rev.title}
        sub={t.rev.sub}
        right={<>
          <Tabs value={range} onChange={setRange} options={[
            { value: "day", label: t.common.day },
            { value: "week", label: t.common.week },
            { value: "month", label: t.common.month },
            { value: "year", label: t.common.year },
          ]} />
          <Button size="sm" variant="outline" icon="calendar">22 {t.months[4]} 2026</Button>
          <Button size="sm" variant="outline" icon="download">{t.common.export}</Button>
        </>}
      />

      {/* KPIs */}
      <div className="grid-kpi" style={{ marginBottom: 14 }}>
        <KPI lang={lang} icon="baht" label={t.rev.total} value={fmtMoney(total, { compact: true })}
             sub={compTotal ? `vs ${fmtMoney(compTotal, { compact: true })}` : null}
             delta={growth} deltaLabel={t.common.compareYesterday}
             sparkData={series || monthlyData} />
        <KPI lang={lang} icon="bag" label={t.rev.trxs} value={fmtNum(trxs)}
             sub={`${(trxs / (series || monthlyData).length).toFixed(0)} ${lang === "th" ? "ต่อชั่วโมง" : "per hour"}`}
             delta={0.067} deltaLabel={t.common.compareYesterday} />
        <KPI lang={lang} icon="package" label={t.rev.avg} value={fmtMoney(total / trxs)}
             delta={0.024} deltaLabel={t.common.compareYesterday} />
        <KPI lang={lang} icon="trending" label={t.rev.growth} value={fmtPct(growth, { sign: true })}
             delta={0.012} deltaLabel={lang === "th" ? "เทียบเดือนก่อน" : "vs last month"}
             sparkData={[2.1, 3.4, 4.8, 5.2, 6.4, 7.1, 8.2]} />
      </div>

      {/* Main chart */}
      <Card style={{ marginBottom: 14 }}>
        <CardHeader title={t.rev.byHour} sub={range === "day" ? t.common.today : range === "week" ? t.common.thisWeek : range === "month" ? t.common.thisMonth : t.common.thisYear} />
        <CardBody>
          <LineChart
            data={series || monthlyData}
            compare={compare}
            labels={labels}
            height={300}
            formatY={v => fmtMoney(v, { compact: true })}
          />
        </CardBody>
      </Card>

      {/* Category + Payment */}
      <div className="grid-2" style={{ marginBottom: 14 }}>
        <Card>
          <CardHeader title={t.rev.byCategory} sub={t.common.today} />
          <CardBody>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {CATEGORY.map((c, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: c.color }} />
                      {c[lang]}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span className="num" style={{ fontSize: 13, fontWeight: 600 }}>{fmtMoney(c.v)}</span>
                      <Badge variant={c.trend >= 0 ? "primary" : "danger"}>
                        {c.trend >= 0 ? "+" : ""}{c.trend.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <div style={{ height: 6, background: "var(--muted)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: (c.share * 100) + "%", height: "100%", background: c.color, borderRadius: "inherit" }} />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t.rev.byPayment} sub={t.common.today} />
          <CardBody style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 22, alignItems: "center" }}>
            <Donut data={PAYMENTS.map((p, i) => ({
              value: p.v, color: i === 0 ? "var(--primary)" :
                i === 1 ? "oklch(0.62 0.14 200)" :
                i === 2 ? "oklch(0.62 0.14 280)" :
                i === 3 ? "oklch(0.72 0.15 65)" : "oklch(0.66 0.04 95)"
            }))} size={150} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PAYMENTS.map((p, i) => {
                const color = i === 0 ? "var(--primary)" :
                  i === 1 ? "oklch(0.62 0.14 200)" :
                  i === 2 ? "oklch(0.62 0.14 280)" :
                  i === 3 ? "oklch(0.72 0.15 65)" : "oklch(0.66 0.04 95)";
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "12px 1fr auto", gap: 10, alignItems: "center" }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
                    <span style={{ fontSize: 13 }}>{p[lang]}</span>
                    <span className="num" style={{ fontSize: 13, fontWeight: 600 }}>{(p.v * 100).toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Forecast + Top products */}
      <div className="grid-2">
        <Card>
          <CardHeader
            title={t.rev.forecast}
            sub={lang === "th" ? "พยากรณ์รายวัน · ความเชื่อมั่น 84%" : "Daily forecast · 84% confidence"}
            action={<Badge variant="info"><Icon name="sparkle" className="icon-sm" />AI</Badge>}
          />
          <CardBody>
            <BarChart
              data={[268000, 282000, 296000, 318000, 304000, 286000, 312000]}
              labels={t.weekdays.slice(0, 7)}
              height={200}
              formatY={v => fmtMoney(v, { compact: true })}
            />
          </CardBody>
        </Card>

        <Card className="table-card">
          <CardHeader title={lang === "th" ? "สินค้าทำรายได้สูงสุด" : "Top revenue products"} sub={t.common.today} />
          <table className="tbl" style={{ marginTop: 10 }}>
            <thead>
              <tr>
                <th>{t.alert.product}</th>
                <th style={{ textAlign: "right" }}>{lang === "th" ? "จำนวน" : "Qty"}</th>
                <th style={{ textAlign: "right" }}>{t.rev.total}</th>
              </tr>
            </thead>
            <tbody>
              {TOP_PRODUCTS.map(p => (
                <tr key={p.sku}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{p[lang]}</div>
                    <div className="mono" style={{ fontSize: 11.5, color: "var(--muted-fg)" }}>{p.sku}</div>
                  </td>
                  <td className="num" style={{ textAlign: "right", fontWeight: 500 }}>{p.sold}</td>
                  <td className="num" style={{ textAlign: "right", fontWeight: 600 }}>{fmtMoney(p.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}



// ---- pages-other.jsx ----
// src/pages-other.jsx — Suggestions, Profile, Login pages

function SuggestionsPage({ lang, role, pushToast }) {
  const t = I18N[lang];
  if (role === "staff") return <><PageHeader title={t.sug.title} sub={t.sug.sub} /><Restricted lang={lang} /></>;

  const [tab, setTab] = React.useState("promotions");
  const [launched, setLaunched] = React.useState(new Set());
  const items = tab === "promotions" ? PROMOS : EVENTS;

  return (
    <div className="fade-in" data-screen-label="Suggestions">
      <PageHeader
        title={t.sug.title}
        sub={t.sug.sub}
        right={<>
          <Badge variant="info"><Icon name="sparkle" className="icon-sm" />{lang === "th" ? "ขับเคลื่อนด้วย AI" : "AI-powered"}</Badge>
        </>}
      />

      {/* Headline */}
      <Card style={{ marginBottom: 14, background: "linear-gradient(135deg, var(--primary-50) 0%, oklch(0.96 0.02 200) 100%)",
                      border: "1px solid var(--primary-50)" }}>
        <CardBody style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 13, color: "var(--primary-600)", fontWeight: 600, letterSpacing: ".02em",
                          textTransform: "uppercase", marginBottom: 6 }}>
              {lang === "th" ? "โอกาสประจำสัปดาห์" : "This week's opportunity"}
            </div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>
              {lang === "th" ? "เปิดใช้งานข้อเสนอแนะทั้งหมดอาจเพิ่มยอด" : "Launching all suggestions could lift sales by"}{" "}
              <span style={{ color: "var(--primary-600)" }} className="num">
                {fmtMoney([...PROMOS, ...EVENTS].reduce((s, x) => s + x.upside, 0))}
              </span>{" "}
              {lang === "th" ? "ต่อสัปดาห์" : "per week"}
            </h2>
            <div style={{ marginTop: 6, fontSize: 13, color: "var(--muted-fg)" }}>
              {lang === "th" ? "ระบบวิเคราะห์จากข้อมูลย้อนหลัง 90 วันของสาขา ปฏิทินกิจกรรม และสภาพอากาศ"
                              : "Based on 90-day branch history, event calendar and local weather"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outline" icon="filter">{t.common.filter}</Button>
            <Button variant="primary" icon="check">{lang === "th" ? "ดำเนินการทั้งหมด" : "Apply all"}</Button>
          </div>
        </CardBody>
      </Card>

      <div style={{ marginBottom: 14 }}>
        <Tabs value={tab} onChange={setTab} options={[
          { value: "promotions", label: `${t.sug.promotions} · ${PROMOS.length}` },
          { value: "events", label: `${t.sug.events} · ${EVENTS.length}` },
        ]} />
      </div>

      <div className="grid-3">
        {items.map(s => {
          const isLaunched = launched.has(s.id);
          return (
            <Card key={s.id} style={{ position: "relative" }}>
              <CardBody style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: "var(--primary-50)",
                    color: "var(--primary-600)", display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0
                  }}>
                    <Icon name={s.icon} className="icon-lg" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, marginBottom: 4 }}>
                      {s.title[lang]}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <Badge variant="outline"><Icon name="clock" className="icon-sm" />{s.duration[lang]}</Badge>
                      <Badge variant="muted">{s.target[lang]}</Badge>
                    </div>
                  </div>
                </div>

                <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.5, color: "var(--muted-fg)", flex: 1 }}>
                  {s.desc[lang]}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "12px 0",
                              borderTop: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--muted-fg)", textTransform: "uppercase",
                                   letterSpacing: ".04em", fontWeight: 500 }}>{t.sug.potential}</div>
                    <div className="num" style={{ fontSize: 18, fontWeight: 600, color: "var(--primary-600)",
                                                   letterSpacing: "-0.01em", marginTop: 2 }}>
                      +{fmtMoney(s.upside, { compact: true })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--muted-fg)", textTransform: "uppercase",
                                   letterSpacing: ".04em", fontWeight: 500 }}>{t.sug.confidence}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <Progress value={s.confidence * 100} variant={s.confidence > 0.8 ? "default" : s.confidence > 0.65 ? "warn" : "danger"} />
                      <span className="num" style={{ fontSize: 12, fontWeight: 600, minWidth: 30 }}>
                        {Math.round(s.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
                  <Button size="sm" variant="outline" style={{ flex: 1 }}>{t.common.details}</Button>
                  {!isLaunched ? (
                    <Button size="sm" variant="primary" style={{ flex: 1 }} icon="check"
                            onClick={() => {
                              setLaunched(prev => new Set([...prev, s.id]));
                              pushToast(lang === "th" ? `เปิดใช้งาน "${s.title.th}" แล้ว` : `Launched "${s.title.en}"`);
                            }}>
                      {t.sug.launch}
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" style={{ flex: 1, color: "var(--primary-600)", borderColor: "var(--primary)" }}
                            icon="check">
                      {lang === "th" ? "เปิดใช้งานแล้ว" : "Launched"}
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────
function ProfilePage({ lang, role, currentUser }) {
  const t = I18N[lang];
  const [tab, setTab] = React.useState("personal");
  const [pwOpen, setPwOpen] = React.useState(false);
  const [twoFa, setTwoFa] = React.useState(true);

  return (
    <div className="fade-in" data-screen-label="Profile">
      <PageHeader title={t.profile.title} sub={t.profile.sub} />

      <Card style={{ marginBottom: 14 }}>
        <CardBody style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <Avatar initials={currentUser.initials} size={64} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>{currentUser.name}</div>
            <div style={{ fontSize: 13, color: "var(--muted-fg)", marginTop: 2 }}>
              {currentUser.role} · <span className="mono">{currentUser.employeeId}</span>
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Badge variant="primary"><Icon name="store" className="icon-sm" />{STORE.short[lang]}</Badge>
              <Badge variant="outline"><Icon name="check" className="icon-sm" />{lang === "th" ? "ยืนยันแล้ว" : "Verified"}</Badge>
            </div>
          </div>
          <Button variant="outline" icon="edit">{t.common.edit}</Button>
        </CardBody>
      </Card>

      <div style={{ marginBottom: 14 }}>
        <Tabs value={tab} onChange={setTab} options={[
          { value: "personal", label: t.profile.personal },
          { value: "security", label: t.profile.security },
        ]} />
      </div>

      {tab === "personal" && (
        <Card>
          <CardBody>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18 }}>
              <FormField label={t.profile.name} value={currentUser.name} />
              <FormField label={t.profile.email} value={currentUser.email} icon="mail" />
              <FormField label={t.profile.phone} value="+66 81 234 5678" icon="phone" />
              <FormField label={t.profile.employeeId} value={currentUser.employeeId} mono />
              <FormField label={t.profile.roleField} value={currentUser.role} disabled />
              <FormField label={t.profile.branch} value={STORE.name[lang]} disabled />
            </div>
            <div style={{ marginTop: 22, display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button variant="ghost">{t.common.cancel}</Button>
              <Button variant="primary">{t.common.save}</Button>
            </div>
          </CardBody>
        </Card>
      )}

      {tab === "security" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <CardHeader title={t.profile.changePw} sub={`${t.profile.lastChanged} · 28 ${t.months[3]} 2026`} />
            <CardBody>
              {!pwOpen ? (
                <Button variant="outline" onClick={() => setPwOpen(true)}>{t.profile.changePw}</Button>
              ) : (
                <div style={{ maxWidth: 420, display: "flex", flexDirection: "column", gap: 14 }}>
                  <PwInput label={t.profile.current} />
                  <PwInput label={t.profile.newPw} showStrength />
                  <PwInput label={t.profile.confirmPw} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="primary" style={{ flex: 1 }}>{t.common.save}</Button>
                    <Button variant="outline" onClick={() => setPwOpen(false)}>{t.common.cancel}</Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t.profile.twoFa} sub={t.profile.twoFaSub}
                        action={<Switch on={twoFa} onChange={setTwoFa} />} />
            <CardBody>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14,
                            background: "var(--muted)", borderRadius: 8 }}>
                <Icon name={twoFa ? "shield" : "alert"} className="icon-lg"
                      style={{ color: twoFa ? "var(--primary)" : "var(--warn)" }} />
                <div style={{ flex: 1, fontSize: 13 }}>
                  {twoFa
                    ? (lang === "th" ? "เปิดใช้งานอยู่ · เชื่อมต่อกับ Google Authenticator" : "Enabled · linked to Google Authenticator")
                    : (lang === "th" ? "ยังไม่ได้เปิดใช้งาน — แนะนำให้เปิดเพื่อความปลอดภัย" : "Not enabled — recommended for security")}
                </div>
                {twoFa && <Button size="sm" variant="ghost">{lang === "th" ? "ตั้งค่าใหม่" : "Reconfigure"}</Button>}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={lang === "th" ? "เซสชันที่ใช้งานอยู่" : "Active sessions"}
                        sub={lang === "th" ? "อุปกรณ์ที่เข้าสู่ระบบบัญชีนี้" : "Devices signed into this account"} />
            <CardBody>
              <SessionRow device={lang === "th" ? "MacBook Pro · ทองหล่อ" : "MacBook Pro · Thonglor"} ip="118.172.49.x" current />
              <SessionRow device={lang === "th" ? "iPhone 15 · กรุงเทพฯ" : "iPhone 15 · Bangkok"} ip="171.97.32.x" time="2h" />
              <SessionRow device={lang === "th" ? "เครื่อง POS-04" : "POS-04 terminal"} ip="10.0.4.7" time="6h" last />
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

function FormField({ label, value, icon, mono, disabled }) {
  const [v, setV] = React.useState(value);
  return (
    <div>
      <label className="label">{label}</label>
      <div style={{ position: "relative" }}>
        {icon && <Icon name={icon} className="icon-sm" style={{
          position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
          color: "var(--muted-fg)" }} />}
        <input className={`input ${mono ? "mono" : ""}`} value={v}
               onChange={e => setV(e.target.value)} disabled={disabled}
               style={{ paddingLeft: icon ? 32 : undefined,
                        opacity: disabled ? 0.6 : 1 }} />
      </div>
    </div>
  );
}

function PwInput({ label, showStrength }) {
  const [v, setV] = React.useState("");
  const [shown, setShown] = React.useState(false);
  const strength = Math.min(4, Math.floor(v.length / 3) + (/[A-Z]/.test(v) ? 1 : 0) + (/[0-9]/.test(v) ? 1 : 0));
  return (
    <div>
      <label className="label">{label}</label>
      <div style={{ position: "relative" }}>
        <input className="input" type={shown ? "text" : "password"}
               value={v} onChange={e => setV(e.target.value)}
               style={{ paddingRight: 36 }} />
        <button onClick={() => setShown(!shown)} className="btn-ghost"
                style={{ position: "absolute", right: 4, top: 4, width: 28, height: 28, padding: 0,
                         border: 0, background: "transparent", color: "var(--muted-fg)" }}>
          <Icon name={shown ? "eyeOff" : "eye"} className="icon-sm" />
        </button>
      </div>
      {showStrength && v && (
        <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i < strength
                ? (strength <= 1 ? "var(--danger)" : strength <= 2 ? "var(--warn)" : "var(--primary)")
                : "var(--muted)"
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionRow({ device, ip, time, current, last }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
                  borderTop: "1px solid var(--border)" }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--muted)",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted-fg)" }}>
        <Icon name="user" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{device}</div>
        <div style={{ fontSize: 11.5, color: "var(--muted-fg)" }} className="mono">{ip}</div>
      </div>
      {current ? <Badge variant="primary" dot>Current</Badge>
               : <span style={{ fontSize: 12, color: "var(--muted-fg)" }}>{time} ago</span>}
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────
function LoginPage({ lang, onLogin }) {
  const t = I18N[lang].login;
  const [u, setU] = React.useState("");
  const [p, setP] = React.useState("");
  const [shown, setShown] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(null);

  const submit = (e) => {
    e?.preventDefault?.();
    if (!u || !p) { setError(lang === "th" ? "กรุณากรอกข้อมูลให้ครบ" : "Please fill in all fields"); return; }
    setBusy(true);
    setTimeout(() => { setBusy(false); onLogin(); }, 600);
  };

  return (
    <div className="login-wrap" data-screen-label="Login">
      <div className="login-art">
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600, fontSize: 18 }}>
          <BrandMark size={36} inverse />
          <div>
            <div style={{ letterSpacing: "-0.01em" }}>{I18N[lang].appName}</div>
            <div style={{ fontSize: 11.5, opacity: .7, fontWeight: 400 }}>{I18N[lang].appSub}</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, opacity: .85, fontWeight: 500, marginBottom: 14, letterSpacing: ".04em",
                         textTransform: "uppercase" }}>
            {lang === "th" ? "บริหารสาขาง่ายขึ้น" : "Run your branch with ease"}
          </div>
          <h1 style={{ margin: 0, fontSize: 42, fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.025em",
                       maxWidth: 460 }}>
            {t.tagline}
          </h1>
          <div style={{ display: "flex", gap: 18, marginTop: 36, maxWidth: 480 }}>
            <Highlight icon="trending" label={lang === "th" ? "ยอดขายเรียลไทม์" : "Real-time sales"} />
            <Highlight icon="alert" label={lang === "th" ? "เตือนสต็อกอัตโนมัติ" : "Smart stock alerts"} />
            <Highlight icon="truck" label={lang === "th" ? "ติดตามการส่ง" : "Delivery tracking"} />
          </div>
        </div>
        <div style={{ fontSize: 12, opacity: .6 }}>{t.footer}</div>
      </div>

      <div className="login-form">
        <div style={{ width: "100%", maxWidth: 360, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>{t.welcomeBack}</h2>
            <p style={{ margin: "6px 0 0", color: "var(--muted-fg)", fontSize: 13.5 }}>{t.subtitle}</p>
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="label">{t.email}</label>
              <div style={{ position: "relative" }}>
                <Icon name="user" className="icon-sm" style={{
                  position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                  color: "var(--muted-fg)" }} />
                <input className="input" type="text" value={u} onChange={e => setU(e.target.value)}
                       placeholder={lang === "th" ? "เช่น EMP-0421" : "e.g. EMP-0421"}
                       style={{ paddingLeft: 32 }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label className="label" style={{ margin: 0 }}>{t.password}</label>
                <a href="#" style={{ fontSize: 12, color: "var(--primary-600)", textDecoration: "none", fontWeight: 500 }}>
                  {t.forgot}
                </a>
              </div>
              <div style={{ position: "relative" }}>
                <Icon name="lock" className="icon-sm" style={{
                  position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                  color: "var(--muted-fg)" }} />
                <input className="input" type={shown ? "text" : "password"}
                       value={p} onChange={e => setP(e.target.value)}
                       placeholder="••••••••"
                       style={{ paddingLeft: 32, paddingRight: 36 }} />
                <button type="button" onClick={() => setShown(!shown)} className="btn-ghost"
                        style={{ position: "absolute", right: 4, top: 4, width: 28, height: 28, padding: 0,
                                 border: 0, background: "transparent", color: "var(--muted-fg)" }}>
                  <Icon name={shown ? "eyeOff" : "eye"} className="icon-sm" />
                </button>
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "default" }}>
              <input type="checkbox" defaultChecked style={{ accentColor: "var(--primary)" }} />
              {t.remember}
            </label>

            {error && (
              <div style={{ background: "var(--danger-50)", color: "var(--danger)",
                            padding: "8px 12px", borderRadius: 8, fontSize: 12.5, fontWeight: 500 }}>
                <Icon name="alert" className="icon-sm" style={{ verticalAlign: "-2px", marginRight: 6 }} />
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" onClick={submit}
                    style={{ height: 42, fontSize: 14 }}>
              {busy
                ? <><Icon name="refresh" className="icon-sm" /> {lang === "th" ? "กำลังเข้าสู่ระบบ…" : "Signing in…"}</>
                : <>{t.signIn} <Icon name="arrowRight" className="icon-sm" /></>}
            </Button>

            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--muted-fg)",
                          fontSize: 12, margin: "4px 0" }}>
              <hr className="sep" style={{ flex: 1 }} />
              <span>{t.or}</span>
              <hr className="sep" style={{ flex: 1 }} />
            </div>

            <Button variant="outline" style={{ height: 42 }}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
                <path fill="#F25022" d="M11 11H2V2h9z"/><path fill="#7FBA00" d="M22 11h-9V2h9z"/>
                <path fill="#00A4EF" d="M11 22H2v-9h9z"/><path fill="#FFB900" d="M22 22h-9v-9h9z"/>
              </svg>
              {t.ssoMs}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Highlight({ icon, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,.15)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={icon} className="icon-sm" />
      </div>
      <span style={{ opacity: .92 }}>{label}</span>
    </div>
  );
}

// ─── BrandMark (original mark for Mini BigC) ──────────────────────────
function BrandMark({ size = 28, inverse = false }) {
  const stroke = inverse ? "#fff" : "var(--primary)";
  const bg = inverse ? "rgba(255,255,255,.15)" : "var(--primary-50)";
  const fg = inverse ? "#fff" : "var(--primary-600)";
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.26,
      background: inverse ? "var(--primary)" : "var(--primary)",
      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, position: "relative", boxShadow: inverse ? "0 0 0 1px rgba(255,255,255,.2) inset" : "var(--sh-1)"
    }}>
      <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} aria-hidden>
        <path d="M5 7h14l-1 11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M9 9V6a3 3 0 0 1 6 0v3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="13.5" r="1.3" fill="currentColor"/>
      </svg>
    </div>
  );
}



// ---- app.jsx ----
// src/app.jsx — main shell

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "lang": "th",
  "role": "manager",
  "density": "regular",
  "dark": false,
  "primary": "#2c8a5a",
  "showTopbarSearch": true
}/*EDITMODE-END*/;

const PRIMARY_TO_OKLCH = {
  "#2c8a5a": ["oklch(0.58 0.16 150)", "oklch(0.52 0.17 150)", "oklch(0.96 0.04 150)"],
  "#0e6f9e": ["oklch(0.56 0.13 230)", "oklch(0.50 0.14 230)", "oklch(0.96 0.03 230)"],
  "#c1462a": ["oklch(0.58 0.16 35)", "oklch(0.52 0.17 35)", "oklch(0.97 0.04 35)"],
  "#5d3fbc": ["oklch(0.55 0.18 295)", "oklch(0.50 0.19 295)", "oklch(0.96 0.04 295)"],
};

function App({ initialPage, initialRole, initialLang, initialSignedIn, hideChrome } = {}) {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [page, setPage] = React.useState(initialPage || "dashboard");
  const [signedIn, setSignedIn] = React.useState(initialSignedIn != null ? initialSignedIn : true);
  const [sbOpen, setSbOpen] = React.useState(false);
  const [sbCollapsed, setSbCollapsed] = React.useState(false);
  const toasts = useToasts();

  const lang = (initialLang || (t.lang === "th" ? "th" : "en"));
  const role = (initialRole || (t.role === "staff" ? "staff" : "manager"));
  const tx = I18N[lang];

  // apply theme color
  React.useEffect(() => {
    const root = document.documentElement;
    const [p, p6, p5] = PRIMARY_TO_OKLCH[t.primary] || PRIMARY_TO_OKLCH["#2c8a5a"];
    root.style.setProperty("--primary", p);
    root.style.setProperty("--primary-600", p6);
    root.style.setProperty("--primary-50", p5);
  }, [t.primary]);

  // dark mode
  React.useEffect(() => {
    document.body.classList.toggle("dark", !!t.dark);
  }, [t.dark]);

  // density
  React.useEffect(() => {
    document.body.classList.remove("density-compact", "density-spacious", "density-regular");
    document.body.classList.add("density-" + t.density);
  }, [t.density]);

  const currentUser = {
    name: role === "manager" ? STORE.manager[lang] : STORE.staff[lang],
    initials: role === "manager" ? STORE.managerInitials : STORE.staffInitials,
    email: role === "manager" ? "parinya.t@minibigc.example" : "nattawut.s@minibigc.example",
    employeeId: role === "manager" ? "EMP-0421-M" : "EMP-0421-S",
    role: I18N[lang].role[role],
  };

  // Expose a tiny helper so PPTX export can drive screen changes
  React.useEffect(() => {
    window.__app = {
      goto: (id) => setPage(id),
      signIn: () => setSignedIn(true),
      signOut: () => setSignedIn(false),
      setRole: (r) => setTweak("role", r),
      setLang: (l) => setTweak("lang", l),
      collapseSidebar: (c) => setSbCollapsed(!!c),
    };
  }, [setTweak]);

  if (!signedIn) {
    return (
      <>
        <LoginPage lang={lang} onLogin={() => setSignedIn(true)} />
        <toasts.Toaster />
        {!hideChrome && <TweaksUI t={t} setTweak={setTweak} />}
      </>
    );
  }

  const NAV = [
    { id: "dashboard", icon: "dashboard", label: tx.nav.dashboard, allow: ["manager", "staff"] },
    { id: "revenue", icon: "trending", label: tx.nav.revenue, allow: ["manager"] },
    { id: "alerts", icon: "alert", label: tx.nav.alerts, allow: ["manager", "staff"], badge: 7 },
    { id: "delivery", icon: "truck", label: tx.nav.delivery, allow: ["manager", "staff"], badge: 4 },
    { id: "suggestions", icon: "sparkle", label: tx.nav.suggestions, allow: ["manager"] },
  ];
  const ACCOUNT = [
    { id: "profile", icon: "user", label: tx.nav.profile, allow: ["manager", "staff"] },
  ];

  const goto = (id) => {
    setPage(id);
    setSbOpen(false);
  };

  const renderPage = () => {
    if (page === "dashboard") return <DashboardPage lang={lang} role={role} goto={goto} />;
    if (page === "revenue") return <RevenuePage lang={lang} role={role} />;
    if (page === "alerts") return <AlertsPage lang={lang} role={role} pushToast={toasts.push} />;
    if (page === "delivery") return <DeliveryPage lang={lang} role={role} pushToast={toasts.push} />;
    if (page === "suggestions") return <SuggestionsPage lang={lang} role={role} pushToast={toasts.push} />;
    if (page === "profile") return <ProfilePage lang={lang} role={role} currentUser={currentUser} />;
    return null;
  };

  return (
    <div className={`shell ${sbCollapsed ? "collapsed" : ""}`}>
      {/* Sidebar */}
      <aside className={`sb ${sbOpen ? "open" : ""}`}>
        {/* Brand */}
        <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "center", gap: 10 }}>
          <BrandMark size={32} />
          <div className="sb-brand-text" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, letterSpacing: "-0.01em", fontSize: 15 }}>{tx.appName}</div>
            <div style={{ fontSize: 11, color: "var(--muted-fg)", fontWeight: 500 }}>{tx.appSub}</div>
          </div>
          <button className="btn btn-ghost btn-sm btn-icon mobile-only"
                  onClick={() => setSbOpen(false)}>
            <Icon name="x" className="icon-sm" />
          </button>
        </div>

        {/* Store selector */}
        <div style={{ padding: "0 12px 12px" }} className="sb-label">
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
            background: "var(--muted)", border: "1px solid var(--border)",
            borderRadius: 8, fontSize: 12.5,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {STORE.short[lang]}
              </div>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--muted-fg)" }}>{STORE.code}</div>
            </div>
            <Icon name="chevronDown" className="icon-sm" />
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
          <div className="sb-section" style={{
            fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em",
            color: "var(--muted-fg)", padding: "10px 12px 6px"
          }}>
            {tx.nav.main}
          </div>
          {NAV.map(n => (
            <NavItem key={n.id} item={n} active={page === n.id} disabled={!n.allow.includes(role)}
                     collapsed={sbCollapsed} onClick={() => goto(n.id)} lang={lang} />
          ))}

          <div className="sb-section" style={{
            fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em",
            color: "var(--muted-fg)", padding: "16px 12px 6px"
          }}>
            {tx.nav.account}
          </div>
          {ACCOUNT.map(n => (
            <NavItem key={n.id} item={n} active={page === n.id} collapsed={sbCollapsed}
                     onClick={() => goto(n.id)} lang={lang} />
          ))}
        </div>

        {/* User */}
        <div style={{ borderTop: "1px solid var(--border)", padding: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar initials={currentUser.initials} />
            <div className="sb-user-text" style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden",
                            textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted-fg)" }}>{currentUser.role}</div>
            </div>
            <button className="btn btn-ghost btn-sm btn-icon sb-user-text"
                    onClick={() => setSignedIn(false)} title="Sign out">
              <Icon name="logout" className="icon-sm" />
            </button>
          </div>
        </div>

        {/* Collapse toggle (desktop) */}
        <button className="btn btn-ghost desktop-only"
                onClick={() => setSbCollapsed(!sbCollapsed)}
                style={{
                  position: "absolute", right: -14, top: 28, width: 26, height: 26,
                  padding: 0, borderRadius: "50%", background: "var(--card)",
                  border: "1px solid var(--border)", boxShadow: "var(--sh-1)", zIndex: 5,
                }}>
          <Icon name={sbCollapsed ? "chevronRight" : "chevronLeft"} className="icon-sm" />
        </button>
      </aside>
      <div className={`sb-scrim ${sbOpen ? "show" : ""}`} onClick={() => setSbOpen(false)} />

      <div className="main">
        {/* Topbar */}
        <header className="topbar">
          <button className="btn btn-ghost btn-icon mobile-only" onClick={() => setSbOpen(true)}>
            <Icon name="menu" />
          </button>

          {/* Search */}
          {t.showTopbarSearch && (
            <div style={{ position: "relative", flex: 1, maxWidth: 480 }} className="desktop-only">
              <Icon name="search" className="icon-sm" style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                color: "var(--muted-fg)" }} />
              <input className="input" placeholder={tx.common.search}
                     style={{ paddingLeft: 34, height: 38, background: "var(--muted)",
                              border: "1px solid var(--border)" }} />
              <kbd style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                            background: "var(--card)", border: "1px solid var(--border)",
                            borderRadius: 4, padding: "2px 5px", fontSize: 11,
                            fontFamily: '"Geist Mono",monospace', color: "var(--muted-fg)" }}>⌘K</kbd>
            </div>
          )}
          <div style={{ flex: 1 }} className="mobile-only" />

          {/* Right cluster */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
            <Button size="sm" variant="ghost" onClick={() => setTweak("lang", lang === "th" ? "en" : "th")}
                    title="Language">
              <Icon name="globe" className="icon-sm" />
              <span style={{ textTransform: "uppercase", fontFamily: '"Geist Mono",monospace', fontSize: 11 }}>
                {lang}
              </span>
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setTweak("dark", !t.dark)} title="Theme">
              <Icon name={t.dark ? "sun" : "moon"} className="icon-sm" />
            </Button>
            <div style={{ position: "relative" }}>
              <Button size="sm" variant="ghost">
                <Icon name="bell" className="icon-sm" />
              </Button>
              <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7,
                              borderRadius: "50%", background: "var(--danger)",
                              border: "2px solid var(--card)" }} />
            </div>
            <div className="vsep desktop-only" style={{ height: 22, margin: "0 4px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="desktop-only">
              <Avatar initials={currentUser.initials} size={28} />
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{currentUser.name.split(" ")[0]}</div>
                <div style={{ fontSize: 10.5, color: "var(--muted-fg)" }}>{currentUser.role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="content">
          {renderPage()}
        </main>
      </div>

      <toasts.Toaster />
      {!hideChrome && <TweaksUI t={t} setTweak={setTweak} />}
    </div>
  );
}

function NavItem({ item, active, disabled, collapsed, onClick, lang }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={collapsed ? item.label : undefined}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        width: "100%", padding: "9px 12px", border: 0,
        background: active ? "var(--primary-50)" : "transparent",
        color: active ? "var(--primary-600)" : disabled ? "var(--muted-fg)" : "var(--fg)",
        fontWeight: active ? 600 : 500, fontSize: 13.5, borderRadius: 8,
        cursor: "default", marginBottom: 2, fontFamily: "inherit",
        opacity: disabled ? 0.5 : 1, textAlign: "left",
        position: "relative",
      }}
      onMouseEnter={e => !active && !disabled && (e.currentTarget.style.background = "var(--muted)")}
      onMouseLeave={e => !active && (e.currentTarget.style.background = "transparent")}
    >
      <Icon name={item.icon} />
      <span className="sb-label" style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {item.label}
      </span>
      {item.badge && (
        <span className="sb-label" style={{
          background: active ? "var(--primary)" : "var(--danger)", color: "#fff",
          fontSize: 10.5, fontWeight: 600, padding: "1px 6px", borderRadius: 10, minWidth: 18, textAlign: "center"
        }}>
          {item.badge}
        </span>
      )}
      {disabled && !collapsed && (
        <Icon name="lock" className="icon-sm sb-label" style={{ opacity: .6 }} />
      )}
    </button>
  );
}

// ─── Tweaks panel UI ──────────────────────────────────────────────────
function TweaksUI({ t, setTweak }) {
  return (
    <TweaksPanel>
      <TweakSection label="Account" />
      <TweakRadio label="Role" value={t.role} options={["manager", "staff"]}
                  onChange={v => setTweak("role", v)} />
      <TweakRadio label="Language" value={t.lang} options={["th", "en"]}
                  onChange={v => setTweak("lang", v)} />

      <TweakSection label="Appearance" />
      <TweakColor label="Primary color" value={t.primary}
                  options={["#2c8a5a", "#0e6f9e", "#c1462a", "#5d3fbc"]}
                  onChange={v => setTweak("primary", v)} />
      <TweakRadio label="Density" value={t.density}
                  options={["compact", "regular", "spacious"]}
                  onChange={v => setTweak("density", v)} />
      <TweakToggle label="Dark mode" value={t.dark}
                   onChange={v => setTweak("dark", v)} />

      <TweakSection label="Layout" />
      <TweakToggle label="Topbar search" value={t.showTopbarSearch}
                   onChange={v => setTweak("showTopbarSearch", v)} />
    </TweaksPanel>
  );
}



export default function MiniBigCManagerConsole() {
  return <App />;
}
