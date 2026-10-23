/** The fields the layout needs: an id, and optional explicit successors (else the next step). */
export interface LayoutStep {
  id: string;
  next?: { to: string; label?: string }[];
}

export interface PositionedStep<T extends LayoutStep = LayoutStep> {
  step: T;
  x: number;
  y: number;
  rank: number;
}

export interface StepEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

/** Resolve each step's successors: explicit `next`, else the following step. */
export function stepEdges(steps: LayoutStep[]): StepEdge[] {
  const edges: StepEdge[] = [];
  steps.forEach((s, i) => {
    const next = s.next ?? (i < steps.length - 1 ? [{ to: steps[i + 1].id }] : []);
    for (const n of next) {
      edges.push({ id: `${s.id}->${n.to}`, source: s.id, target: n.to, label: n.label });
    }
  });
  return edges;
}

/**
 * Small layered layout, enough for chains of a few branching steps.
 * Rank = longest path from the first step. Ranks wrap into rows of `cols`, snaking
 * left-to-right then right-to-left so consecutive steps stay adjacent. Steps off the
 * main line (alternate branches) sit in a lane below their rank.
 */
export function layoutSteps<T extends LayoutStep>(
  steps: T[],
  edges: StepEdge[],
  { dx = 270, dy = 120, cols = 3 }: { dx?: number; dy?: number; cols?: number } = {},
): PositionedStep<T>[] {
  const rank = new Map<string, number>(steps.map((s) => [s.id, 0]));
  // Relax edges until stable (graphs here are DAGs with < 10 nodes).
  for (let pass = 0; pass < steps.length; pass++) {
    let changed = false;
    for (const e of edges) {
      const r = (rank.get(e.source) ?? 0) + 1;
      if (r > (rank.get(e.target) ?? 0)) {
        rank.set(e.target, r);
        changed = true;
      }
    }
    if (!changed) break;
  }

  // Main line: follow the first successor from the first step.
  const main = new Set<string>();
  let cursor: string | undefined = steps[0]?.id;
  while (cursor && !main.has(cursor)) {
    main.add(cursor);
    cursor = edges.find((e) => e.source === cursor)?.target;
  }

  const laneOf = new Map<string, number>();
  const used = new Map<number, number>();
  for (const step of steps) {
    if (main.has(step.id)) continue;
    const r = rank.get(step.id) ?? 0;
    const lane = (used.get(r) ?? 0) + 1;
    used.set(r, lane);
    laneOf.set(step.id, lane);
  }
  const maxLane = Math.max(0, ...laneOf.values());
  const rowHeight = dy * (maxLane + 1) + dy * 0.6;

  return steps.map((step) => {
    const r = rank.get(step.id) ?? 0;
    const row = Math.floor(r / cols);
    const col = r % cols;
    const x = (row % 2 === 0 ? col : cols - 1 - col) * dx;
    const y = row * rowHeight + (laneOf.get(step.id) ?? 0) * dy;
    return { step, rank: r, x, y };
  });
}

export type Side = 'l' | 'r' | 't' | 'b';

/** Pick which sides of two nodes an edge should leave and enter. */
export function edgeSides(
  from: { x: number; y: number },
  to: { x: number; y: number },
  nodeW: number,
): { source: Side; target: Side } {
  const ddx = to.x - from.x;
  const ddy = to.y - from.y;
  if (Math.abs(ddx) < nodeW * 0.6) return ddy >= 0 ? { source: 'b', target: 't' } : { source: 't', target: 'b' };
  return ddx > 0 ? { source: 'r', target: 'l' } : { source: 'l', target: 'r' };
}
