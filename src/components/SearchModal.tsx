import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  CornerDownLeft,
  FileText,
  GitCommitHorizontal,
  Search,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { kindLabel, kindOrder, search, type SearchDoc, type SearchKind } from '@/lib/search';
import { useUi } from '@/store/ui';

const kindIcon: Record<SearchKind, LucideIcon> = {
  section: BookOpen,
  card: FileText,
  flow: Workflow,
  step: GitCommitHorizontal,
};

/** ⌘K command palette over sections, flow chains and flow steps. */
export function SearchModal() {
  const open = useUi((s) => s.searchOpen);
  const close = useUi((s) => s.closeSearch);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Group results by kind, then flatten so arrow keys walk them in display order.
  const { groups, flat } = useMemo(() => {
    if (!open) return { groups: [] as [SearchKind, SearchDoc[]][], flat: [] as SearchDoc[] };
    const results = search(query);
    const byKind = new Map<SearchKind, SearchDoc[]>();
    for (const r of results) {
      const list = byKind.get(r.kind) ?? [];
      if (list.length < 6) list.push(r);
      byKind.set(r.kind, list);
    }
    const order = query.trim() ? [...byKind.keys()] : kindOrder.filter((k) => byKind.has(k));
    const g = order.map((k) => [k, byKind.get(k)!] as [SearchKind, SearchDoc[]]);
    return { groups: g, flat: g.flatMap(([, docs]) => docs) };
  }, [query, open]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const go = (doc: SearchDoc | undefined) => {
    if (!doc) return;
    close();
    navigate(doc.to);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(flat[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  let index = -1;
  const activeId = flat[active] ? `search-opt-${active}` : undefined;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[10vh]">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search the mapper"
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-ink-850/95 shadow-panel backdrop-blur-xl"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-4">
              <Search aria-hidden className="h-4 w-4 shrink-0 text-ember" />
              <input
                id="global-search"
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sections, flow chains and steps…"
                className="h-14 w-full bg-transparent text-[15px] text-fog-bright outline-none placeholder:text-fog-muted"
                role="combobox"
                aria-expanded="true"
                aria-controls="search-results"
                aria-activedescendant={activeId}
                aria-autocomplete="list"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="kbd hidden sm:inline">Esc</kbd>
            </div>

            <ul
              id="search-results"
              ref={listRef}
              role="listbox"
              aria-label="Search results"
              className="max-h-[60vh] overflow-y-auto p-2"
            >
              {flat.length === 0 && (
                <li className="px-4 py-10 text-center text-sm text-fog-dim">
                  Nothing matches “{query}”. Try a section like{' '}
                  <span className="font-mono text-teal">Infrastructure</span> or a chain name.
                </li>
              )}
              {groups.map(([kind, docs]) => (
                <li key={kind} role="presentation" className="mb-1">
                  <div className="eyebrow px-3 pb-1 pt-2">
                    {query ? kindLabel[kind] : `Jump to ${kindLabel[kind].toLowerCase()}`}
                  </div>
                  <ul role="presentation">
                    {docs.map((doc) => {
                      index += 1;
                      const i = index;
                      const Icon = kindIcon[doc.kind];
                      const selected = i === active;
                      return (
                        <li
                          key={doc.id}
                          id={`search-opt-${i}`}
                          data-index={i}
                          role="option"
                          aria-selected={selected}
                          onMouseMove={() => setActive(i)}
                          onClick={() => go(doc)}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 ${
                            selected ? 'bg-ember/10 ring-1 ring-ember/30' : ''
                          }`}
                        >
                          <span
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${
                              selected ? 'border-ember/40 text-ember' : 'border-white/10 text-fog-dim'
                            }`}
                          >
                            <Icon aria-hidden className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm text-fog-bright">{doc.title}</span>
                            <span className="block truncate text-xs text-fog-muted">{doc.subtitle}</span>
                          </span>
                          {selected && <CornerDownLeft aria-hidden className="h-3.5 w-3.5 text-ember" />}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-4 border-t border-white/[0.07] px-4 py-2 text-2xs text-fog-muted">
              <span className="flex items-center gap-1">
                <kbd className="kbd">↑</kbd>
                <kbd className="kbd">↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="kbd">↵</kbd> open
              </span>
              <span className="ml-auto tabular">{flat.length} results</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
