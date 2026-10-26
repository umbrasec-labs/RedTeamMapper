import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { kitHex, type KitHue } from './hues';

export interface RingSegment {
  id: string;
  label: string;
  /** Very short label drawn on the ring. */
  short: string;
  /** Hub body line when focused. The full label only appears in the hub, never on the ring. */
  subtitle?: string;
  icon: LucideIcon;
  hue: KitHue;
}

export interface RingLink {
  from: string;
  to: string;
  /** 'flow' arcs run clockwise just outside the segments; 'feedback' arcs run back on the outer orbits. */
  kind: 'flow' | 'feedback';
  /** Shown in a pill while either end is focused. Omit for a bare arrow. */
  label?: string;
}

export interface HubText {
  eyebrow: string;
  title: string;
  body?: string;
}

interface Props {
  segments: RingSegment[];
  /** Defaults to a clockwise flow arrow from each segment to the next, wrapping around. */
  links?: RingLink[];
  selected: string | null;
  onSelect: (id: string) => void;
  /** Hub text when nothing is hovered or selected. */
  idleHub: HubText;
  /** Hub text for the hovered or selected segment. Defaults to its number, label and subtitle. */
  focusHub?: (segment: RingSegment, index: number) => HubText;
  ariaLabel: string;
}

/*
 * Geometry. Angles are degrees clockwise from 12 o'clock; the SVG is centered on 0,0.
 * Rings from the inside out: hub, segments, flow orbit, feedback orbits.
 */
const R_HUB = 118;
const R_IN = 168;
const R_OUT = 286;
const R_FLOW = 318;
const R_FEEDBACK = [344, 360, 376];
const GAP = 1.6;
const VIEW = 405;

const toXY = (r: number, deg: number): [number, number] => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [r * Math.cos(rad), r * Math.sin(rad)];
};

function sectorPath(a0: number, a1: number, ri: number, ro: number) {
  const large = a1 - a0 > 180 ? 1 : 0;
  const [x0, y0] = toXY(ro, a0);
  const [x1, y1] = toXY(ro, a1);
  const [x2, y2] = toXY(ri, a1);
  const [x3, y3] = toXY(ri, a0);
  return `M${x0} ${y0} A${ro} ${ro} 0 ${large} 1 ${x1} ${y1} L${x2} ${y2} A${ri} ${ri} 0 ${large} 0 ${x3} ${y3}Z`;
}

/** Arc along radius r from a0 to a1, clockwise or counter-clockwise. */
function arcPath(r: number, a0: number, a1: number, clockwise: boolean) {
  const sweep = clockwise ? 1 : 0;
  const delta = clockwise ? (a1 - a0 + 360) % 360 : (a0 - a1 + 360) % 360;
  const large = delta > 180 ? 1 : 0;
  const [x0, y0] = toXY(r, a0);
  const [x1, y1] = toXY(r, a1);
  return `M${x0} ${y0} A${r} ${r} 0 ${large} ${sweep} ${x1} ${y1}`;
}

/** Keep a w by h label box centered at x,y inside the viewBox, so a label near the edge is not clipped. */
function clampLabel([x, y]: [number, number], w: number, h: number): [number, number] {
  const mx = VIEW - 4 - w / 2;
  const my = VIEW - 4 - h / 2;
  return [Math.max(-mx, Math.min(mx, x)), Math.max(-my, Math.min(my, y))];
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * Radial map: clickable segments around a hub, with animated flow arrows between them
 * and optional feedback loops on the outer orbits. Each segment is a focusable button;
 * keyboard selection (arrows, number keys) is left to the parent view.
 */
export function RingMap({ segments, links, selected, onSelect, idleHub, focusHub, ariaLabel }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const span = 360 / segments.length;
  const mid = (i: number) => i * span + span / 2;

  const geometry = useMemo(() => {
    const indexOf = new Map(segments.map((s, i) => [s.id, i]));
    const all: RingLink[] =
      links ?? segments.map((s, i) => ({ from: s.id, to: segments[(i + 1) % segments.length].id, kind: 'flow' }));
    let lane = 0;
    return all
      .filter((l) => indexOf.has(l.from) && indexOf.has(l.to))
      .map((link) => {
        const a0 = mid(indexOf.get(link.from)!);
        const a1 = mid(indexOf.get(link.to)!);
        if (link.kind === 'flow') {
          // Inset so the arrowhead lands just before the next segment's center.
          const inset = Math.min(7, span / 4);
          return { link, d: arcPath(R_FLOW, a0 + inset, a1 - inset, true), labelAt: toXY(R_FLOW, a0 + span / 2) };
        }
        const r = R_FEEDBACK[lane++ % R_FEEDBACK.length];
        const s = a0 - 4;
        const e = a1 + 4;
        const sweep = (s - e + 360) % 360;
        return { link, d: arcPath(r, s, e, false), labelAt: toXY(r + 10, s - sweep / 2) };
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments, links, span]);

  const focus = hovered ?? selected;
  const focusIndex = segments.findIndex((s) => s.id === focus);
  const focusSeg = focusIndex >= 0 ? segments[focusIndex] : null;
  const hub: HubText = focusSeg
    ? (focusHub?.(focusSeg, focusIndex) ?? {
        eyebrow: `Phase ${pad2(focusIndex + 1)} / ${pad2(segments.length)}`,
        title: focusSeg.label,
        body: focusSeg.subtitle !== focusSeg.label ? focusSeg.subtitle : undefined,
      })
    : idleHub;
  const hubColor = focusSeg ? kitHex[focusSeg.hue] : kitHex.ember;
  const isActive = (l: RingLink) => focus !== null && (l.from === focus || l.to === focus);
  const selectedSeg = segments.find((s) => s.id === selected);

  return (
    <svg
      viewBox={`${-VIEW} ${-VIEW} ${VIEW * 2} ${VIEW * 2}`}
      className="h-auto w-full max-w-[min(100%,clamp(600px,calc(100vh-15rem),860px))] select-none"
      role="group"
      aria-label={ariaLabel}
    >
      <defs>
        <filter id="kit-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="kit-hub-fill" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#262626" />
          <stop offset="100%" stopColor="#141414" />
        </radialGradient>
        {(
          [
            ['kit-arrow-idle', '#525252'],
            ['kit-arrow-active', '#f25623'],
            ['kit-arrow-feedback', '#36524b'],
            ['kit-arrow-feedback-active', '#5fb3a1'],
          ] as const
        ).map(([id, color]) => (
          <marker key={id} id={id} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 1 L9 5 L0 9 z" fill={color} />
          </marker>
        ))}
      </defs>

      {/* Tick ring and full guide tracks, so the drawing stays concentric however the links fall. */}
      <g aria-hidden>
        {Array.from({ length: 84 }, (_, i) => {
          const a = (i * 360) / 84;
          const [x0, y0] = toXY(R_OUT + 8, a);
          const [x1, y1] = toXY(R_OUT + (i % 12 === 0 ? 16 : 12), a);
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#2e2e2e" strokeWidth={1} />;
        })}
        <circle r={R_IN - 8} fill="none" stroke="#242424" strokeDasharray="2 6" />
        <circle r={R_FLOW} fill="none" stroke="#2a2a2a" strokeWidth={1} />
        {R_FEEDBACK.map((r) => (
          <circle key={r} r={r} fill="none" stroke="#242a29" strokeWidth={1} />
        ))}
      </g>

      {/* Links */}
      <g aria-hidden>
        {geometry.map(({ link, d }) => {
          const active = isActive(link);
          const feedback = link.kind === 'feedback';
          const color = feedback ? (active ? '#5fb3a1' : '#2c403b') : active ? '#f25623' : '#3a3a3a';
          const marker = feedback
            ? active
              ? 'kit-arrow-feedback-active'
              : 'kit-arrow-feedback'
            : active
              ? 'kit-arrow-active'
              : 'kit-arrow-idle';
          return (
            <g key={`${link.kind}-${link.from}-${link.to}`}>
              <motion.path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={active ? 2.2 : 1.4}
                strokeLinecap="round"
                markerEnd={`url(#${marker})`}
                strokeDasharray={feedback ? '3 6' : undefined}
                // Animating pathLength makes framer-motion write its own stroke-dasharray,
                // which would wipe out the feedback dash, so feedback arcs only fade in.
                initial={feedback ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
                animate={feedback ? { opacity: 1 } : { pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.25, ease: 'easeOut' }}
              />
              {active && !feedback && (
                <path d={d} fill="none" stroke="#fb8a5c" strokeWidth={2.2} strokeLinecap="round" strokeDasharray="4 20" className="animate-dash" />
              )}
            </g>
          );
        })}
      </g>

      {/* Segments */}
      {segments.map((seg, i) => {
        const a0 = i * span + GAP;
        const a1 = (i + 1) * span - GAP;
        const color = kitHex[seg.hue];
        const isSel = selected === seg.id;
        const isHover = hovered === seg.id;
        const dim = focus !== null && focus !== seg.id;
        const Icon = seg.icon;
        const [cx, cy] = toXY((R_IN + R_OUT) / 2, mid(i));
        const [nx, ny] = toXY(R_OUT + 30, mid(i));
        // Selected and hovered segments slide outward along their bisector.
        const pop = toXY(isSel ? 10 : isHover ? 5 : 0, mid(i));
        return (
          <motion.g
            key={seg.id}
            role="button"
            tabIndex={0}
            aria-pressed={isSel}
            aria-label={`${i + 1}: ${seg.label}${seg.subtitle ? `. ${seg.subtitle}` : ''}`}
            onClick={() => onSelect(seg.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(seg.id);
              }
            }}
            onMouseEnter={() => setHovered(seg.id)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(seg.id)}
            onBlur={() => setHovered(null)}
            className="cursor-pointer outline-none [&:focus-visible>path.seg]:stroke-[#f25623] [&:focus-visible>path.seg]:[stroke-width:2.5]"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: dim ? 0.62 : 1, scale: 1, x: pop[0], y: pop[1] }}
            transition={{ type: 'spring', stiffness: 300, damping: 26, opacity: { duration: 0.2 } }}
          >
            <title>{seg.label}</title>
            {isSel && <path d={sectorPath(a0, a1, R_OUT + 2, R_OUT + 7)} fill={color} filter="url(#kit-glow)" aria-hidden />}
            <path
              className="seg"
              d={sectorPath(a0, a1, R_IN, R_OUT)}
              fill={color}
              fillOpacity={isSel ? 0.2 : isHover ? 0.14 : 0.07}
              stroke={color}
              strokeOpacity={isSel ? 0.9 : isHover ? 0.6 : 0.32}
              strokeWidth={isSel ? 1.6 : 1}
            />
            <g transform={`translate(${cx - 12} ${cy - 24})`} aria-hidden>
              <Icon width={24} height={24} color={color} strokeWidth={1.75} />
            </g>
            <text
              x={cx}
              y={cy + 16}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-display"
              fontSize={15}
              fontWeight={700}
              fill={isSel || isHover ? '#ffffff' : '#ccd0cf'}
              aria-hidden
            >
              {seg.short}
            </text>
            <text x={nx} y={ny} textAnchor="middle" dominantBaseline="middle" className="font-mono" fontSize={10} fill={isSel ? color : '#525252'} aria-hidden>
              {pad2(i + 1)}
            </text>
          </motion.g>
        );
      })}

      {/* Labels for highlighted links */}
      <g aria-hidden pointerEvents="none">
        {geometry
          .filter(({ link }) => link.label && isActive(link))
          .map(({ link, labelAt }) => {
            const feedback = link.kind === 'feedback';
            const w = link.label!.length * 6 + 16;
            const [x, y] = clampLabel(labelAt, w, 20);
            return (
              <motion.g key={`label-${link.kind}-${link.from}-${link.to}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transform={`translate(${x} ${y})`}>
                <rect x={-w / 2} y={-10} width={w} height={20} rx={10} fill="#141414" stroke={feedback ? '#5fb3a1' : '#f25623'} strokeOpacity={0.6} />
                <text textAnchor="middle" dominantBaseline="central" fontSize={10} className="font-mono" fill={feedback ? '#5fb3a1' : '#fb8a5c'}>
                  {link.label}
                </text>
              </motion.g>
            );
          })}
      </g>

      {/* Hub */}
      <g aria-hidden>
        {selectedSeg && (
          <circle
            r={R_HUB + 6}
            fill="none"
            stroke={kitHex[selectedSeg.hue]}
            strokeOpacity={0.5}
            className="animate-pulse-ring [transform-box:fill-box] [transform-origin:center]"
          />
        )}
        <circle r={R_HUB} fill="url(#kit-hub-fill)" stroke="#2f2f2f" />
        <foreignObject x={-R_HUB + 14} y={-R_HUB + 14} width={(R_HUB - 14) * 2} height={(R_HUB - 14) * 2}>
          <div className="flex h-full flex-col items-center justify-center px-2 text-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: hubColor }}>
              {hub.eyebrow}
            </span>
            <span className="mt-1 font-display text-[22px] font-extrabold leading-tight text-white">{hub.title}</span>
            {hub.body && <span className="mt-1.5 text-[11px] leading-snug text-fog">{hub.body}</span>}
          </div>
        </foreignObject>
      </g>
    </svg>
  );
}
