import { Suspense } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Command, Menu, Search } from 'lucide-react';
import { useUi } from '@/store/ui';
import { isTyping, useKeydown } from '@/lib/useKeyboard';
import { sectionById } from '@/data';
import { ErrorBoundary } from './ErrorBoundary';
import { ViewLoading } from './Feedback';
import { SearchModal } from './SearchModal';
import { Sidebar } from './Sidebar';

/** Sidebar + top bar shell. Owns the global shortcuts. */
export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const openSearch = useUi((s) => s.openSearch);
  const toggleNav = useUi((s) => s.toggleNav);

  const title = (() => {
    const p = location.pathname;
    if (p === '/') return 'Operation Overview';
    if (p.startsWith('/flows')) return 'Operation Flow Chains';
    if (p.startsWith('/about')) return 'About';
    const m = p.match(/^\/sections\/([a-z0-9-]+)/);
    if (m) return sectionById[m[1]]?.title ?? 'Reference Section';
    return 'Red Team Mapper';
  })();

  useKeydown(
    (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
        return;
      }
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === '/') {
        e.preventDefault();
        openSearch();
      } else if (e.key === 'g') {
        const onNext = (n: KeyboardEvent) => {
          const routes: Record<string, string> = { o: '/', f: '/flows', a: '/about' };
          const to = routes[n.key.toLowerCase()];
          if (to) {
            n.preventDefault();
            navigate(to);
          }
        };
        window.addEventListener('keydown', onNext, { once: true });
      }
    },
    [navigate, openSearch],
  );

  return (
    <div className="min-h-full">
      <a
        href="#main"
        className="sr-only z-[70] rounded-md bg-ember px-3 py-2 text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-white/[0.06] bg-ink-900/75 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            onClick={() => toggleNav(true)}
            className="-ml-1 rounded-md p-1.5 text-fog-dim hover:bg-white/5 hover:text-fog-bright lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="min-w-0 truncate font-display text-[15px] font-bold">{title}</h1>
          <button
            type="button"
            onClick={openSearch}
            className="ml-auto flex h-9 w-full max-w-xs items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-left text-sm text-fog-muted transition hover:border-ember/50 hover:text-fog sm:w-72"
            aria-label="Search (Ctrl or Command + K)"
          >
            <Search aria-hidden className="h-4 w-4" />
            <span className="flex-1 truncate">Search the mapper…</span>
            <kbd className="kbd hidden items-center gap-0.5 sm:inline-flex">
              <Command aria-hidden className="h-2.5 w-2.5" />K
            </kbd>
          </button>
        </header>
        <main id="main" className="px-4 py-6 sm:px-6 lg:px-8">
          <ErrorBoundary resetKey={location.pathname}>
            <Suspense fallback={<ViewLoading />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      <SearchModal />
    </div>
  );
}
