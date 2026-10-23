import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { kitClass, type KitHue } from './hues';

/** Compact summary card for one ring segment, used in the grid below the ring. */
export function SegmentCard({
  icon: Icon,
  hue,
  order,
  title,
  subtitle,
  active,
  onSelect,
}: {
  icon: LucideIcon;
  hue: KitHue;
  order: number;
  title: string;
  subtitle?: string;
  active: boolean;
  onSelect: () => void;
}) {
  const c = kitClass[hue];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`glass group flex flex-col gap-2 p-4 text-left transition hover:-translate-y-0.5 hover:border-white/20 ${
        active ? `${c.border} shadow-glow` : ''
      }`}
    >
      <span className="flex items-center justify-between">
        <span className={`grid h-8 w-8 place-items-center rounded-lg border ${c.border} ${c.bg}`}>
          <Icon aria-hidden className={`h-4 w-4 ${c.text}`} />
        </span>
        <span className="tabular font-mono text-2xs text-fog-muted">{String(order).padStart(2, '0')}</span>
      </span>
      <span className="font-display font-bold text-fog-bright">{title}</span>
      {subtitle && <span className="font-mono text-2xs leading-relaxed text-fog-dim">{subtitle}</span>}
    </button>
  );
}

/** Rounded hue pill, linked when `to` is given. */
export function Pill({ icon: Icon, hue, label, to }: { icon?: LucideIcon; hue: KitHue; label: string; to?: string }) {
  const c = kitClass[hue];
  const cls = `inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-2xs font-medium ${c.text} ${c.bg} ${c.border}`;
  const body = (
    <>
      {Icon && <Icon aria-hidden className="h-3 w-3" />}
      {label}
    </>
  );
  return to ? (
    <Link to={to} className={`${cls} transition hover:brightness-125`}>
      {body}
    </Link>
  ) : (
    <span className={cls}>{body}</span>
  );
}

/** Header block for a detail panel: icon tile, eyebrow line and title. */
export function PanelHeader({
  icon: Icon,
  hue,
  eyebrow,
  title,
  children,
}: {
  icon: LucideIcon;
  hue: KitHue;
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  const c = kitClass[hue];
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-xl border ${c.border} ${c.bg}`}>
          <Icon aria-hidden className={`h-5 w-5 ${c.text}`} />
        </span>
        <div>
          <div className={`font-mono text-2xs uppercase tracking-[0.16em] ${c.text}`}>{eyebrow}</div>
          <h2 className="font-display text-xl font-extrabold">{title}</h2>
        </div>
      </div>
      {children}
    </div>
  );
}

/** Bordered row link, as used for "related" lists in the detail panels. */
export function RowLink({ to, icon: Icon, title, meta }: { to: string; icon?: LucideIcon; title: string; meta?: ReactNode }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-2 rounded-lg border border-white/[0.06] px-3 py-2 transition hover:border-ember/40 hover:bg-ember/5"
    >
      {Icon && <Icon aria-hidden className="h-3.5 w-3.5 shrink-0 text-fog-dim group-hover:text-ember" />}
      <span className="min-w-0 flex-1 truncate text-[13px] text-fog-bright">{title}</span>
      {meta}
    </Link>
  );
}
