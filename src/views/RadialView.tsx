import { useSearchParams, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Workflow } from 'lucide-react';
import { flows, phaseById, phases, sectionById } from '@/data';
import { hueClass } from '@/lib/hues';
import { icons } from '@/lib/icons';
import { RadialMap } from '@/components/RadialMap';

/** Landing view: the radial operation lifecycle, with a panel for the selected phase. */
export default function RadialView() {
  const [params, setParams] = useSearchParams();
  const activeId = params.get('phase');
  const active = activeId ? phaseById[activeId] : undefined;

  const select = (id: string) => {
    setParams(id === activeId ? {} : { phase: id }, { replace: true });
  };

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 max-w-3xl">
        <div className="eyebrow text-ember">UMBRASEC · Red Team Mapper v4</div>
        <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight sm:text-3xl">
          The offensive operation lifecycle, mapped end to end.
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-fog-dim">
          Seven phases, from infrastructure to impact. Select a phase to see the reference sections it covers, or jump
          straight to the operation flow chains. A planning and training aid for authorised testing and defenders.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="glass p-4 sm:p-6">
          <RadialMap phases={phases} activeId={activeId} onSelect={select} />
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {phases.map((p) => {
              const c = hueClass[p.hue];
              const on = p.id === activeId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => select(p.id)}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-2xs font-medium transition ${c.text} ${c.border} ${
                    on ? c.bg : 'hover:bg-white/[0.04]'
                  }`}
                >
                  <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${c.dot}`} /> {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <aside className="lg:sticky lg:top-20">
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="glass p-5"
              >
                <PhasePanel id={active.id} />
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass p-5 text-sm text-fog-dim"
              >
                <p>Select a phase on the map to see its reference sections.</p>
                <Link to="/flows" className="btn btn-primary mt-4">
                  <Workflow aria-hidden className="h-4 w-4" /> Operation flow chains
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}

function PhasePanel({ id }: { id: string }) {
  const phase = phaseById[id];
  const c = hueClass[phase.hue];
  const Icon = icons[phase.icon];
  const related = flows.filter((f) => f.hue === phase.hue).slice(0, 4);
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-xl border ${c.border} ${c.bg} ${c.text}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="eyebrow text-fog-muted">Phase {phase.order}</div>
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
          <h4 className="eyebrow mt-5 mb-2">Related flow chains</h4>
          <ul className="space-y-1">
            {related.map((f) => (
              <li key={f.id}>
                <Link to={`/flows/${f.id}`} className="flex items-center gap-1.5 text-[13px] text-fog hover:text-ember">
                  <Workflow aria-hidden className="h-3.5 w-3.5 shrink-0" /> {f.title}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
