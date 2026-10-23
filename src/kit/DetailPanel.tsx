import { useEffect, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the panel. */
  label: string;
  /** Changing this re-runs the enter animation and resets scroll. */
  contentKey: string;
  children: ReactNode;
}

/**
 * Right-hand detail panel (kit copy of components/DetailPanel). Docked beside the content on wide screens (xl+),
 * an overlay drawer on smaller ones. Esc closes it.
 */
export function DetailPanel({ open, onClose, label, contentKey, children }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [contentKey]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.querySelector('[aria-label="Search the mapper"]')) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            role="complementary"
            aria-label={label}
            className="fixed inset-y-0 right-0 z-40 flex w-[min(420px,92vw)] flex-col border-l border-white/10 bg-ink-850/95 shadow-panel backdrop-blur-xl xl:sticky xl:top-[4.5rem] xl:z-0 xl:h-[calc(100vh-6rem)] xl:w-[400px] xl:shrink-0 xl:rounded-2xl xl:border xl:bg-ink-850/80"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 rounded-md p-1.5 text-fog-dim transition hover:bg-white/5 hover:text-fog-bright"
              aria-label="Close details"
            >
              <X className="h-4 w-4" />
            </button>
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              <motion.div
                key={contentKey}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="p-5 pr-10"
              >
                {children}
              </motion.div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="eyebrow mb-2">{title}</h3>
      {children}
    </section>
  );
}
