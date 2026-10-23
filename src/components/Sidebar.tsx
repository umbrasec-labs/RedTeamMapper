import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Info, Workflow, X } from 'lucide-react';
import { navGroups, sectionById } from '@/data';
import { useUi } from '@/store/ui';

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition ${
    isActive
      ? 'bg-ember/10 text-fog-bright before:absolute before:inset-y-1.5 before:-left-3 before:w-0.5 before:rounded-full before:bg-ember'
      : 'text-fog hover:bg-white/[0.04] hover:text-fog-bright'
  }`;

function NavContents() {
  const close = () => useUi.getState().toggleNav(false);
  return (
    <div className="flex h-full flex-col">
      <NavLink to="/" onClick={close} className="flex items-center gap-3 px-5 pb-5 pt-5">
        <span aria-hidden className="relative grid h-9 w-9 place-items-center rounded-xl bg-ink-750 ring-1 ring-white/10">
          <span className="absolute inset-1.5 rounded-full border-2 border-ink-600 border-l-ember border-t-ember" />
          <span className="h-2 w-2 rounded-full bg-ember" />
        </span>
        <span>
          <span className="block font-display text-[15px] font-extrabold leading-none text-fog-bright">
            Red Team Mapper
          </span>
          <span className="mt-1 block font-mono text-2xs uppercase tracking-[0.16em] text-fog-muted">
            Operator reference · v4
          </span>
        </span>
      </NavLink>

      <nav aria-label="Primary" className="flex-1 space-y-6 overflow-y-auto px-5 pb-6">
        <div>
          <div className="eyebrow mb-2 px-2.5">Map</div>
          <ul className="space-y-0.5">
            <li>
              <NavLink to="/flows" onClick={close} className={linkCls}>
                <Workflow aria-hidden className="h-4 w-4 shrink-0 text-fog-dim group-hover:text-ember" />
                Flow Chains
              </NavLink>
            </li>
          </ul>
        </div>

        {navGroups.map((g) => (
          <div key={g.label}>
            <div className="eyebrow mb-2 px-2.5">{g.label}</div>
            <ul className="space-y-0.5">
              {g.ids.map((id) => (
                <li key={id}>
                  <NavLink to={`/sections/${id}`} onClick={close} className={linkCls}>
                    <span aria-hidden className="h-1 w-1 shrink-0 rounded-full bg-fog-muted group-hover:bg-ember" />
                    {sectionById[id]?.title ?? id}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <footer className="space-y-2 border-t border-white/[0.06] px-5 py-4 text-2xs text-fog-muted">
        <NavLink to="/about" onClick={close} className="flex items-center gap-1.5 hover:text-fog-bright">
          <Info aria-hidden className="h-3 w-3" /> About this mapper
        </NavLink>
        <a
          href="https://umbrasec-labs.github.io/BlueTeamMapper/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 hover:text-fog-bright"
        >
          <ExternalLink aria-hidden className="h-3 w-3" /> Blue Team Mapper
        </a>
        <p className="leading-snug">The offensive counterpart to the UMBRASEC Blue Team Mapper.</p>
      </footer>
    </div>
  );
}

export function Sidebar() {
  const navOpen = useUi((s) => s.navOpen);
  const toggleNav = useUi((s) => s.toggleNav);
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/[0.06] bg-ink-900/90 backdrop-blur-xl lg:block">
        <NavContents />
      </aside>

      <AnimatePresence>
        {navOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
            <motion.div
              className="absolute inset-0 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => toggleNav(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-white/10 bg-ink-900 shadow-panel"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            >
              <button
                type="button"
                onClick={() => toggleNav(false)}
                className="absolute right-3 top-4 rounded-md p-1.5 text-fog-dim hover:bg-white/5 hover:text-fog-bright"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
              <NavContents />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
