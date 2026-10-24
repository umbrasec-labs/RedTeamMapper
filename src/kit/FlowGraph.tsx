import { memo, useEffect, useMemo } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useNodesInitialized,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { LucideIcon } from 'lucide-react';
import { kitHex, type KitHue } from './hues';
import { edgeSides, layoutSteps, stepEdges } from './graphLayout';

export interface GraphStep {
  id: string;
  label: string;
  hue: KitHue;
  /** Small caption above the label. */
  tag?: string;
  tagIcon?: LucideIcon;
  /** Explicit successors; omitted means the next step in the list. */
  next?: { to: string; label?: string }[];
}

type StepNodeData = {
  step: GraphStep;
  order: number;
  selected: boolean;
  related: boolean;
  dimmed: boolean;
};
type StepNode = Node<StepNodeData, 'step'>;

const NODE_W = 220;
/** Edge label glyph width: JetBrains Mono at 11px. */
const LABEL_CHAR_W = 6.8;

/** Gap between columns, wide enough that the longest edge label still leaves its line and arrowhead visible. */
function columnGap(edges: { label?: string }[]) {
  const longest = Math.max(0, ...edges.map((e) => e.label?.length ?? 0));
  return Math.min(220, Math.max(64, Math.round(longest * LABEL_CHAR_W + 60)));
}

/** Every node exposes a source and target handle on each side; edges pick the sides. */
const handles: [string, Position][] = [
  ['l', Position.Left],
  ['r', Position.Right],
  ['t', Position.Top],
  ['b', Position.Bottom],
];

/** A single step, in its hue, with an optional tag line. */
const StepNodeView = memo(function StepNodeView({ data }: NodeProps<StepNode>) {
  const { step, order, selected, related, dimmed } = data;
  const color = kitHex[step.hue];
  const Icon = step.tagIcon;
  return (
    <div
      className="group relative rounded-xl border bg-ink-850/95 px-3.5 py-3 backdrop-blur transition-all duration-200"
      style={{
        width: NODE_W,
        borderColor: selected ? '#f25623' : related ? `${color}aa` : `${color}55`,
        boxShadow: selected
          ? '0 0 0 1px #f25623, 0 0 28px -4px rgba(242,86,35,0.6)'
          : related
            ? `0 0 20px -8px ${color}`
            : 'none',
        opacity: dimmed ? 0.5 : 1,
      }}
    >
      {handles.map(([id, pos]) => (
        <Handle key={`t-${id}`} id={`t-${id}`} type="target" position={pos} className="!h-1.5 !w-1.5 !min-h-0 !min-w-0 !border-0 !bg-ink-600" />
      ))}
      {handles.map(([id, pos]) => (
        <Handle key={`s-${id}`} id={`s-${id}`} type="source" position={pos} className="!h-1.5 !w-1.5 !min-h-0 !min-w-0 !border-0 !bg-ink-600" />
      ))}
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider" style={{ color }}>
          {Icon && <Icon aria-hidden className="h-3 w-3" />}
          {step.tag}
        </span>
        <span className="tabular font-mono text-[10px] text-fog-muted">{String(order).padStart(2, '0')}</span>
      </div>
      <div className="mt-1.5 text-[13px] font-medium leading-snug text-fog-bright">{step.label}</div>
    </div>
  );
});

const nodeTypes = { step: StepNodeView };

interface Props {
  steps: GraphStep[];
  /** Changing this refits the view (use the chain id). */
  graphKey: string;
  selectedStep: string | null;
  onSelectStep: (id: string | null) => void;
}

function Graph({ steps, graphKey, selectedStep, onSelectStep }: Props) {
  const { fitView } = useReactFlow();
  const measured = useNodesInitialized();

  const { nodes, edges } = useMemo(() => {
    const rawEdges = stepEdges(steps);
    // Only side-by-side edges need room for their label; vertical ones already have the row gap.
    const rowOf = new Map(layoutSteps(steps, rawEdges).map((p) => [p.step.id, p.y]));
    const sideBySide = rawEdges.filter((e) => rowOf.get(e.source) === rowOf.get(e.target));
    const positioned = layoutSteps(steps, rawEdges, { dx: NODE_W + columnGap(sideBySide) });
    const posById = Object.fromEntries(positioned.map((p) => [p.step.id, p]));
    const neighbours = new Set<string>();
    for (const e of rawEdges) {
      if (e.source === selectedStep) neighbours.add(e.target);
      if (e.target === selectedStep) neighbours.add(e.source);
    }

    const nodes: StepNode[] = positioned.map(({ step, x, y }, i) => ({
      id: step.id,
      type: 'step',
      position: { x, y },
      data: {
        step,
        order: i + 1,
        selected: step.id === selectedStep,
        related: neighbours.has(step.id),
        dimmed: selectedStep !== null && step.id !== selectedStep && !neighbours.has(step.id),
      },
      draggable: false,
      ariaLabel: `Step ${i + 1}: ${step.label}`,
    }));

    const edges: Edge[] = rawEdges.map((e) => {
      const active = selectedStep !== null && (e.source === selectedStep || e.target === selectedStep);
      const color = active ? '#f25623' : '#4a4a4a';
      const sides = edgeSides(posById[e.source], posById[e.target], NODE_W);
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: `s-${sides.source}`,
        targetHandle: `t-${sides.target}`,
        type: 'smoothstep',
        animated: true,
        label: e.label,
        labelStyle: { fill: active ? '#fb8a5c' : '#959c95', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
        labelBgStyle: { fill: '#141414' },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 6,
        style: { stroke: color, strokeWidth: active ? 2 : 1.4 },
        markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
      };
    });
    return { nodes, edges };
  }, [steps, selectedStep]);

  // Refit once nodes are measured, and whenever the graph changes.
  useEffect(() => {
    if (!measured) return;
    const t = requestAnimationFrame(() => fitView({ padding: 0.15, duration: 350, maxZoom: 1.1 }));
    return () => cancelAnimationFrame(t);
  }, [graphKey, measured, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={(_, n) => onSelectStep(n.id === selectedStep ? null : n.id)}
      onPaneClick={() => onSelectStep(null)}
      fitView
      fitViewOptions={{ padding: 0.18 }}
      minZoom={0.3}
      maxZoom={1.75}
      nodesConnectable={false}
      nodesDraggable={false}
      elementsSelectable
      proOptions={{ hideAttribution: false }}
    >
      <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#2a2a2a" />
      <Controls showInteractive={false} position="bottom-right" />
    </ReactFlow>
  );
}

/** Zoomable, pannable node graph of one flow chain. */
export function FlowGraph(props: Props) {
  return (
    <ReactFlowProvider>
      <Graph {...props} />
    </ReactFlowProvider>
  );
}
