import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { flows } from '@/data';
import { hueClass } from '@/lib/hues';
import type { Flow } from '@/data/types';

/** All operation flow chains, each as a node → node → node sequence. */
export default function FlowsView() {
  const { flowId } = useParams();
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (flowId && targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [flowId]);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h2 className="font-display text-2xl font-extrabold text-fog-bright">Operation Flow Chains</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fog">
          End-to-end chains showing how operations connect from infrastructure through to impact. Each node is a stage;
          the labels between them name the transition.
        </p>
      </header>

      <div className="space-y-4">
        {flows.map((f) => (
          <FlowCard key={f.id} flow={f} active={f.id === flowId} innerRef={f.id === flowId ? targetRef : undefined} />
        ))}
      </div>
    </div>
  );
}

const FlowCard = ({
  flow,
  active,
  innerRef,
}: {
  flow: Flow;
  active: boolean;
  innerRef?: React.Ref<HTMLElement>;
}) => {
  const hue = hueClass[flow.hue];
  return (
    <section
      ref={innerRef}
      id={`flow-${flow.id}`}
      className={`scroll-mt-20 rounded-2xl border bg-ink-850/50 p-5 transition ${
        active ? `${hue.border} ring-1 ring-ember/30` : 'border-white/[0.07]'
      }`}
    >
      <div className="mb-4 flex items-center gap-2">
        <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${hue.dot}`} />
        <h3 className="font-display text-[15px] font-bold text-fog-bright">{flow.title}</h3>
      </div>

      <ol className="flex flex-wrap items-stretch gap-y-3">
        {flow.steps.map((step, i) => {
          const sh = hueClass[step.hue];
          return (
            <li key={i} className="flex items-center gap-2">
              <span
                className={`inline-flex min-h-[2.5rem] items-center rounded-lg border px-3 py-1.5 text-center text-xs font-medium text-fog-bright ${sh.border} ${sh.bg}`}
              >
                {step.label}
              </span>
              {i < flow.steps.length - 1 && (
                <span className="flex shrink-0 flex-col items-center px-0.5 text-fog-muted">
                  <ChevronRight aria-hidden className="h-4 w-4" />
                  {flow.arrows[i] && (
                    <span className="mt-0.5 max-w-[5rem] text-center font-mono text-[10px] leading-tight text-fog-muted">
                      {flow.arrows[i]}
                    </span>
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
};
