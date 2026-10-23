import { Loader2, SearchX } from 'lucide-react';
import type { ReactNode } from 'react';

export function ViewLoading({ label = 'Loading view' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex h-full min-h-[50vh] items-center justify-center">
      <div className="flex items-center gap-3 font-mono text-xs text-fog-dim">
        <Loader2 aria-hidden className="h-4 w-4 animate-spin text-ember" />
        {label}…
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 px-6 py-12 text-center">
      <SearchX aria-hidden className="h-6 w-6 text-fog-muted" />
      <p className="font-medium text-fog-bright">{title}</p>
      {hint && <p className="max-w-sm text-sm text-fog-dim">{hint}</p>}
      {action}
    </div>
  );
}
