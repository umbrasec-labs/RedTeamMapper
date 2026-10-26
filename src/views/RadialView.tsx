import { useCallback, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowRight, Workflow } from 'lucide-react';
import { flows, flowsForPhase, phaseById, phases, phaseTopics, sectionById } from '@/data';
import { hueClass } from '@/lib/hues';
import { icons } from '@/lib/icons';
import { isTyping, useKeydown } from '@/lib/useKeyboard';
import { RingMap, type RingLink } from '@/kit/RingMap';
import { SegmentCard } from '@/kit/Cards';
import { DetailPanel } from '@/kit/DetailPanel';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
const phaseSummary = (sections: number, chains: number) =>
  chains ? `${plural(sections, 'section')} · ${plural(chains, 'flow chain')}` : plural(sections, 'section');

const segments = phases.map((p) => ({
  id: p.id,
  label: p.label,
  short: p.short,
  subtitle: phaseSummary(p.sections.length, flowsForPhase(p).length),
  icon: icons[p.icon],
  hue: p.hue,
}));

// Flow arrows run to the next phase; feedback loops are where an operation falls back a phase.
const links: RingLink[] = [
  ...phases.map((p, i) => ({ from: p.id, to: phases[(i + 1) % phases.length].id, kind: 'flow' as const })),
  { from: 'evade', to: 'infra', label: 'Burned infra', kind: 'feedback' },
  { from: 'lateral', to: 'exec', label: 'New foothold', kind: 'feedback' },
  { from: 'collect', to: 'lateral', label: 'Need more access', kind: 'feedback' },
];

/** Landing view: the radial operation lifecycle, with a panel for the selected phase. */
export default function RadialView() {
  const [params, setParams] = useSearchParams();
  const activeId = params.get('phase');
  const active = activeId ? phaseById[activeId] : undefined;

  const show = useCallback((id: string | null) => setParams(id ? { phase: id } : {}, { replace: true }), [setParams]);
  const select = (id: string) => show(id === activeId ? null : id);

  // 1-7 pick a phase, arrows cycle; the detail panel handles Esc.
  useKeydown(
    (e) => {
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.querySelector('[role="dialog"]')) return;
      const n = Number(e.key);
      if (n >= 1 && n <= phases.length) {
        show(phases[n - 1].id);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const i = phases.findIndex((p) => p.id === activeId);
        const step = e.key === 'ArrowRight' ? 1 : -1;
        show(phases[i < 0 ? (step > 0 ? 0 : phases.length - 1) : (i + step + phases.length) % phases.length].id);
      }
    },
    [activeId, show],
  );

  return (
    <div className="flex items-start gap-6">
      <div className="min-w-0 flex-1">
        <header className="mb-2 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <div className="eyebrow text-ember">UMBRASEC · Red Team Mapper v4</div>
            <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight sm:text-3xl">
              The offensive operation lifecycle, mapped end to end.
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-fog-dim">
              Seven phases, from infrastructure to impact. Select a phase to see the reference sections it covers, or
              jump straight to the operation flow chains. A planning and training aid for authorised testing and
              defenders.
            </p>
          </div>
          <div className="flex gap-5 font-mono text-2xs uppercase tracking-wider text-fog-muted">
            {(
              [
                ['Phases', phases.length, '/'],
                ['Sections', Object.keys(sectionById).length - 1, '/sections/recon'],
                ['Chains', flows.length, '/flows'],
              ] as const
            ).map(([label, n, to]) => (
              <Link key={label} to={to} className="group text-right">
                <span className="tabular block font-display text-xl font-bold normal-case tracking-normal text-fog-bright group-hover:text-ember">
                  {n}
                </span>
                <span className="block">{label}</span>
              </Link>
            ))}
          </div>
        </header>

        <div className="flex flex-col items-center py-2">
          <RingMap
            segments={segments}
            links={links}
            selected={activeId}
            onSelect={select}
            idleHub={{
              eyebrow: 'Operation lifecycle',
              title: `${phases.length} phases`,
              body: 'Select a phase to see its reference sections.',
            }}
            ariaLabel="Operation lifecycle. Use arrow keys or number keys 1 to 7 to select a phase."
          />
          <div className="mt-1 hidden flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-2xs text-fog-muted md:flex">
            <div className="flex items-center gap-2">
              <svg width="28" height="6" aria-hidden>
                <line x1="0" y1="3" x2="28" y2="3" stroke="#f25623" strokeWidth="2" />
              </svg>
              Flow to next phase
            </div>
            <div className="flex items-center gap-2">
              <svg width="28" height="6" aria-hidden>
                <line x1="0" y1="3" x2="28" y2="3" stroke="#5fb3a1" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 6" />
              </svg>
              Feedback loop
            </div>
            <div>
              <kbd className="kbd">1</kbd>-<kbd className="kbd">7</kbd> select · <kbd className="kbd">←</kbd>
              <kbd className="kbd">→</kbd> cycle · <kbd className="kbd">Esc</kbd> close
            </div>
          </div>
        </div>

        <section aria-label="All phases" className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
          {phases.map((p) => (
            <SegmentCard
              key={p.id}
              icon={icons[p.icon]}
              hue={p.hue}
              order={p.order}
              title={p.label}
              subtitle={phaseTopics(p).join(' · ')}
              active={p.id === activeId}
              onSelect={() => select(p.id)}
            />
          ))}
          <Link
            to="/flows"
            className="glass group flex flex-col justify-between gap-3 p-4 transition hover:border-ember/40 sm:col-span-2 xl:col-span-1 2xl:col-span-7 2xl:flex-row 2xl:items-center"
          >
            <span className="flex items-center gap-3">
              <Workflow aria-hidden className="h-5 w-5 text-ember" />
              <span>
                <span className="block font-display font-bold text-fog-bright">Operation flow chains</span>
                <span className="block text-xs text-fog-dim">{flows.length} end-to-end chains across the lifecycle.</span>
              </span>
            </span>
            <span className="flex items-center gap-1 text-sm text-ember">
              Open flow chains <ArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        </section>
      </div>

      <DetailPanel
        open={!!active}
        onClose={() => show(null)}
        label={active ? `${active.label} phase details` : 'Phase details'}
        contentKey={active?.id ?? 'none'}
      >
        {active && <PhasePanel key={active.id} id={active.id} />}
      </DetailPanel>
    </div>
  );
}

/** Related chains listed before "Show all"; busy phases appear in a dozen or more. */
const RELATED_SHOWN = 6;

function PhasePanel({ id }: { id: string }) {
  const phase = phaseById[id];
  const c = hueClass[phase.hue];
  const Icon = icons[phase.icon];
  const [showAll, setShowAll] = useState(false);
  const allRelated = flowsForPhase(phase);
  const related = showAll ? allRelated : allRelated.slice(0, RELATED_SHOWN);
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-xl border ${c.border} ${c.bg} ${c.text}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className={`font-mono text-2xs uppercase tracking-[0.16em] ${c.text}`}>
            Phase {String(phase.order).padStart(2, '0')} of {String(phases.length).padStart(2, '0')}
          </div>
          <h3 className="font-display text-lg font-bold text-fog-bright">{phase.label}</h3>
        </div>
      </div>

      <h4 className="eyebrow mt-5 mb-2">Reference sections</h4>
      <ul className="space-y-1.5">
        {phase.sections.map((sid) => {
          const s = sectionById[sid];
          if (!s) return null;
          return (
            <li key={sid}>
              <Link
                to={`/sections/${sid}`}
                className="group flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[13px] transition hover:border-ember/40"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-fog-bright">{s.title}</span>
                  <span className="block truncate text-2xs text-fog-muted">{s.cards.length} cards</span>
                </span>
                <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-fog-muted transition group-hover:translate-x-0.5 group-hover:text-ember" />
              </Link>
            </li>
          );
        })}
      </ul>

      {related.length > 0 && (
        <>
          <h4 className="eyebrow mt-5 mb-2">Related flow chains · {allRelated.length}</h4>
          <ul id="related-chains" className="space-y-1">
            {related.map((f) => (
              <li key={f.id}>
                <Link to={`/flows/${f.id}`} className="flex items-center gap-1.5 text-[13px] text-fog hover:text-ember">
                  <Workflow aria-hidden className="h-3.5 w-3.5 shrink-0" /> {f.title}
                </Link>
              </li>
            ))}
          </ul>
          {allRelated.length > RELATED_SHOWN && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              aria-expanded={showAll}
              aria-controls="related-chains"
              className="mt-2 font-mono text-2xs uppercase tracking-wider text-fog-muted transition hover:text-ember"
            >
              {showAll ? 'Show fewer' : `Show all ${allRelated.length}`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
