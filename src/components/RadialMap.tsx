import { memo } from 'react';
import { icons } from '@/lib/icons';
import { hueHex } from '@/lib/hues';
import type { Phase } from '@/data/types';

interface Props {
  phases: Phase[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

const SIZE = 440;
const C = SIZE / 2;
const R = 158; // node ring radius
const NODE = 30; // node circle radius

/** Angle (radians) for phase i, starting at the top and going clockwise. */
function angle(i: number, n: number): number {
  return -Math.PI / 2 + (i / n) * Math.PI * 2;
}

function pointOnRing(i: number, n: number, radius = R): { x: number; y: number } {
  const a = angle(i, n);
  return { x: C + radius * Math.cos(a), y: C + radius * Math.sin(a) };
}

/**
 * The operation lifecycle as a ring of phase nodes, connected in order. SVG so
 * it scales cleanly; each node is a button that selects the phase.
 */
export const RadialMap = memo(function RadialMap({ phases, activeId, onSelect }: Props) {
  const n = phases.length;
  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="mx-auto h-auto w-full max-w-[440px]"
      role="group"
      aria-label="Operation lifecycle map"
    >
      <defs>
        <marker id="rm-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#525252" />
        </marker>
      </defs>

      {/* connecting arcs between consecutive phases */}
      {phases.map((p, i) => {
        const from = pointOnRing(i, n);
        const to = pointOnRing((i + 1) % n, n);
        // Shorten so the arrow sits outside the node circles.
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        const x1 = from.x + ux * (NODE + 4);
        const y1 = from.y + uy * (NODE + 4);
        const x2 = to.x - ux * (NODE + 10);
        const y2 = to.y - uy * (NODE + 10);
        return (
          <line
            key={`edge-${p.id}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#3a3a3a"
            strokeWidth={1.5}
            markerEnd="url(#rm-arrow)"
          />
        );
      })}

      {/* hub */}
      <circle cx={C} cy={C} r={54} fill="#1b1b1b" stroke="#2a2a2a" strokeWidth={1.5} />
      <text x={C} y={C - 6} textAnchor="middle" fill="#686c69" className="font-mono" style={{ fontSize: 10, letterSpacing: 1.5 }}>
        OPERATION
      </text>
      <text x={C} y={C + 12} textAnchor="middle" fill="#ccd0cf" className="font-display" style={{ fontSize: 15, fontWeight: 800 }}>
        Lifecycle
      </text>

      {/* phase nodes */}
      {phases.map((p, i) => {
        const { x, y } = pointOnRing(i, n);
        const hex = hueHex[p.hue];
        const active = p.id === activeId;
        const Icon = icons[p.icon];
        const labelBelow = y > C + 10;
        return (
          <g
            key={p.id}
            role="button"
            tabIndex={0}
            aria-label={p.label}
            aria-pressed={active}
            className="cursor-pointer outline-none"
            onClick={() => onSelect(p.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(p.id);
              }
            }}
          >
            <circle
              cx={x}
              cy={y}
              r={NODE}
              fill={active ? hex : '#222222'}
              stroke={hex}
              strokeWidth={active ? 3 : 1.75}
              opacity={active ? 1 : 0.9}
            />
            <foreignObject x={x - 11} y={y - 18} width={22} height={22}>
              <Icon size={20} color={active ? '#111111' : hex} />
            </foreignObject>
            <text
              x={x}
              y={y + (labelBelow ? NODE + 14 : -NODE - 7)}
              textAnchor="middle"
              fill="#959c95" className="font-mono"
              style={{ fontSize: 10.5, fontWeight: active ? 700 : 500 }}
            >
              {p.short}
            </text>
            <text x={x} y={y + 5} textAnchor="middle" fill="#686c69" className="font-mono" style={{ fontSize: 9 }}>
              {p.order}
            </text>
          </g>
        );
      })}
    </svg>
  );
});
