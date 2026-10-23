import { Link } from 'react-router-dom';
import { ArrowRight, Workflow } from 'lucide-react';
import { flows, navGroups, sectionById } from '@/data';
import { hueClass } from '@/lib/hues';

/** Landing view: a short intro, the section groups as a grid, and the flow chains. */
export default function HomeView() {
  return (
    <div className="mx-auto max-w-6xl">
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-ink-850/60 px-6 py-10 sm:px-10">
        <div className="eyebrow mb-3 text-ember">UMBRASEC · Red Team Mapper v4</div>
        <h2 className="max-w-3xl font-display text-2xl font-extrabold leading-tight text-fog-bright sm:text-3xl">
          An interactive map of offensive operations, from infrastructure to impact.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fog">
          The same reference as the single-page original, rebuilt as a navigable map: {sectionCount()} reference
          sections grouped by operational phase, {flows.length} end-to-end operation chains, and search across all of
          it. Built as a learning and planning aid for authorised red team and purple team work.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/flows" className="btn btn-primary">
            <Workflow aria-hidden className="h-4 w-4" /> Explore flow chains
          </Link>
          <Link to="/about" className="btn btn-ghost">
            About this mapper
          </Link>
        </div>
      </section>

      {navGroups.map((g) => (
        <section key={g.label} className="mt-10">
          <h3 className="eyebrow mb-3">{g.label}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {g.ids.map((id) => {
              const s = sectionById[id];
              if (!s) return null;
              return (
                <Link
                  key={id}
                  to={`/sections/${id}`}
                  className="group flex flex-col rounded-2xl border border-white/[0.07] bg-ink-850/50 p-5 transition hover:border-ember/40 hover:bg-ink-850"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-[15px] font-bold text-fog-bright">{s.title}</span>
                    <ArrowRight
                      aria-hidden
                      className="h-4 w-4 text-fog-muted transition group-hover:translate-x-0.5 group-hover:text-ember"
                    />
                  </div>
                  {s.desc && <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-fog-dim">{s.desc}</p>}
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      <section className="mt-12">
        <h3 className="eyebrow mb-3">Operation flow chains</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {flows.map((f) => {
            const hue = hueClass[f.hue];
            return (
              <Link
                key={f.id}
                to={`/flows/${f.id}`}
                className={`group rounded-2xl border bg-ink-850/50 p-5 transition hover:bg-ink-850 ${hue.border}`}
              >
                <div className="flex items-center gap-2">
                  <span aria-hidden className={`h-2 w-2 rounded-full ${hue.dot}`} />
                  <span className="font-display text-sm font-bold text-fog-bright">{f.title}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-fog-dim">
                  {f.steps.map((s) => s.label).join(' → ')}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function sectionCount(): number {
  return navGroups.reduce((n, g) => n + g.ids.length, 0);
}
