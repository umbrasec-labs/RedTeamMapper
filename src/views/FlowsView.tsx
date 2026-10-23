import { useCallback, useMemo } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, MousePointerClick } from 'lucide-react';
import { flowById, flowPhases, flows, phaseForHue, sectionById, shortTitle, type Flow, type Phase } from '@/data';
import { hueClass, hueHex } from '@/lib/hues';
import { icons } from '@/lib/icons';
import { FlowGraph, type GraphStep } from '@/kit/FlowGraph';
import { DetailPanel, PanelSection } from '@/kit/DetailPanel';
import { Pill } from '@/kit/Cards';

/** Graph steps for a flow: ids s0..sN, each linked to the next with that arrow's label. */
function graphSteps(flow: Flow): GraphStep[] {
  return flow.steps.map((s, i) => {
    const phase = phaseForHue(s.hue);
    return {
      id: `s${i}`,
      label: s.label,
      hue: s.hue,
      tag: phase?.short,
      tagIcon: phase ? icons[phase.icon] : undefined,
      next: i < flow.steps.length - 1 ? [{ to: `s${i + 1}`, label: flow.arrows[i] || undefined }] : [],
    };
  });
}

const PhasePill = ({ phase }: { phase: Phase }) => (
  <Pill icon={icons[phase.icon]} hue={phase.hue} label={phase.short} to={`/?phase=${phase.id}`} />
);

/** Operation flow chains: chain picker, node graph, step detail panel. */
export default function FlowsView() {
  const { flowId } = useParams();
  const [params, setParams] = useSearchParams();
  const flow = flowId ? flowById[flowId] : undefined;
  const steps = useMemo(() => (flow ? graphSteps(flow) : []), [flow]);

  const selectStep = useCallback(
    (id: string | null) => setParams(id ? { step: id } : {}, { replace: true }),
    [setParams],
  );

  if (!flow) return <Navigate to={`/flows/${flows[0].id}`} replace />;

  const stepId = params.get('step');
  const index = steps.findIndex((s) => s.id === stepId);
  const step = index >= 0 ? steps[index] : null;
  const c = hueClass[flow.hue];

  return (
    <div className="flex items-start gap-6">
      <div className="min-w-0 flex-1">
        <nav aria-label="Flow chains" className="-mx-1 mb-5 overflow-x-auto pb-1">
          <ul className="flex min-w-max gap-1.5 px-1">
            {flows.map((f) => {
              const active = f.id === flow.id;
              return (
                <li key={f.id}>
                  <Link
                    to={`/flows/${f.id}`}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] transition ${
                      active
                        ? 'border-ember/60 bg-ember/10 text-fog-bright shadow-glow'
                        : 'border-white/[0.07] bg-ink-850/60 text-fog hover:border-white/20 hover:text-fog-bright'
                    }`}
                  >
                    <span aria-hidden className={`h-2 w-2 rounded-full ${hueClass[f.hue].dot}`} />
                    {f.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <header className="mb-4 flex flex-wrap items-start gap-4">
          <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border ${c.border} ${c.bg}`}>
            <span aria-hidden className={`h-3 w-3 rounded-full ${c.dot}`} />
          </span>
          <div className="min-w-0 flex-1 basis-80">
            <h2 className="font-display text-2xl font-extrabold">{flow.title}</h2>
            <p className="mt-0.5 font-mono text-xs text-fog-muted">
              {flow.steps.length} steps · {flowPhases(flow).length} phases
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {flowPhases(flow).map((p) => (
                <PhasePill key={p.id} phase={p} />
              ))}
            </div>
          </div>
        </header>

        <div className="glass relative h-[min(520px,62vh)] overflow-hidden">
          <FlowGraph steps={steps} graphKey={flow.id} selectedStep={step?.id ?? null} onSelectStep={selectStep} />
          <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1 font-mono text-2xs text-fog-muted">
            <MousePointerClick aria-hidden className="h-3 w-3" /> Click a step · scroll to zoom · drag to pan
          </div>
        </div>

        {/* Keyboard- and screen-reader-friendly list of the same steps. */}
        <ol className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3" aria-label={`${flow.title} steps`}>
          {steps.map((s, i) => {
            const active = s.id === step?.id;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => selectStep(active ? null : s.id)}
                  aria-pressed={active}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-[13px] transition ${
                    active ? 'border-ember/60 bg-ember/10' : 'border-white/[0.06] hover:border-white/20'
                  }`}
                >
                  <span className="tabular font-mono text-2xs text-fog-muted">{String(i + 1).padStart(2, '0')}</span>
                  <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: hueHex[s.hue] }} />
                  <span className="min-w-0 flex-1 truncate text-fog-bright">{s.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <DetailPanel
        open={step !== null}
        onClose={() => selectStep(null)}
        label={step ? `${step.label} step details` : 'Step details'}
        contentKey={`${flow.id}-${step?.id ?? 'none'}`}
      >
        {step && <StepPanel flow={flow} steps={steps} index={index} onSelect={selectStep} />}
      </DetailPanel>
    </div>
  );
}

function StepPanel({
  flow,
  steps,
  index,
  onSelect,
}: {
  flow: Flow;
  steps: GraphStep[];
  index: number;
  onSelect: (id: string) => void;
}) {
  const step = steps[index];
  const prev = steps[index - 1];
  const next = steps[index + 1];
  const phase = phaseForHue(step.hue);

  return (
    <div>
      <div className="font-mono text-2xs uppercase tracking-[0.16em] text-fog-muted">
        {flow.title} · step {index + 1} of {steps.length}
      </div>
      <h2 className="mt-1 font-display text-xl font-extrabold">{step.label}</h2>
      {phase && (
        <div className="mt-2">
          <PhasePill phase={phase} />
        </div>
      )}

      <PanelSection title="Path">
        <div className="space-y-1.5">
          {prev && (
            <button type="button" onClick={() => onSelect(prev.id)} className="chip w-full justify-start py-1.5">
              ← {prev.label}
            </button>
          )}
          {next ? (
            <button type="button" onClick={() => onSelect(next.id)} className="chip w-full justify-start py-1.5">
              <ArrowRight aria-hidden className="h-3 w-3 text-ember" />
              {flow.arrows[index] && <span className="text-ember">{flow.arrows[index]}:</span>} {next.label}
            </button>
          ) : (
            <p className="text-2xs text-fog-muted">End of chain.</p>
          )}
        </div>
      </PanelSection>

      {phase && (
        <PanelSection title={`${phase.label} reference`}>
          <div className="flex flex-wrap gap-1.5">
            {phase.sections.map((id) =>
              sectionById[id] ? (
                <Link key={id} to={`/sections/${id}`} className="chip">
                  <BookOpen aria-hidden className="h-3 w-3" />
                  {shortTitle(sectionById[id].title)}
                </Link>
              ) : null,
            )}
          </div>
        </PanelSection>
      )}
    </div>
  );
}
