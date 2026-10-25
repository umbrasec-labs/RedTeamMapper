/**
 * Renderers for the v3 reference content: expandable cards, callouts and code
 * blocks. Shared by the section reader and the phase panel.
 */
import { forwardRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, ChevronDown, Copy, Info, ShieldAlert, Sparkles } from 'lucide-react';
import type { Callout, CodeBlock, SectionCard as Card } from '@/data/types';
import { calloutHue, hueClass } from '@/lib/hues';
import { alignComments } from '@/lib/alignComments';
import { RichText } from './RichText';

export const SectionCard = forwardRef<
  HTMLElement,
  { card: Card; id?: string; defaultOpen?: boolean; highlight?: boolean }
>(function SectionCard({ card, id, defaultOpen = false, highlight = false }, ref) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = `${id ?? card.title}-body`;
  const hue = hueClass[card.hue];
  return (
    <article
      ref={ref}
      id={id}
      className={`glass scroll-mt-24 overflow-hidden transition-shadow ${highlight ? 'shadow-glow' : ''} ${
        open ? 'border-white/[0.12]' : ''
      }`}
    >
      <span aria-hidden className={`block h-0.5 w-full ${hue.dot}`} />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="group flex w-full items-start gap-3 p-4 text-left transition hover:bg-white/[0.02]"
      >
        <div className="min-w-0 flex-1">
          {card.tag && <div className={`eyebrow mb-1 ${hue.text}`}>{card.tag}</div>}
          <h3 className="font-display text-[15px] font-bold leading-snug">{card.title}</h3>
          {card.summary && <p className="mt-1 text-sm text-fog-dim">{card.summary}</p>}
        </div>
        <span className="mt-1 flex shrink-0 items-center gap-2">
          <span className="tabular font-mono text-2xs text-fog-muted">{card.items.length}</span>
          <ChevronDown
            aria-hidden
            className={`h-4 w-4 text-fog-dim transition-transform group-hover:text-ember ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && card.items.length > 0 && (
          <motion.div
            id={bodyId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <ul className="space-y-3 border-t border-white/[0.06] px-4 pb-4 pt-3">
              {card.items.map((item, i) => (
                <li key={i} className="text-[13px] leading-relaxed">
                  {item.lead && <span className="font-semibold text-fog-bright">{item.lead}</span>}
                  {item.lead && item.text && <span className="text-fog-muted"> - </span>}
                  <RichText text={item.text} />
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
});

const calloutIcon = { warn: AlertTriangle, success: Sparkles, info: Info, danger: ShieldAlert };

export function CalloutBox({ callout }: { callout: Callout }) {
  const c = hueClass[calloutHue[callout.tone]];
  const Icon = calloutIcon[callout.tone];
  return (
    <aside className={`flex gap-3 rounded-xl border ${c.border} ${c.bg} p-4`}>
      <Icon aria-hidden className={`mt-0.5 h-5 w-5 shrink-0 ${c.text}`} />
      <div className="min-w-0">
        {callout.title && <div className={`font-display font-bold ${c.text}`}>{callout.title}</div>}
        <p className="mt-1 text-[13px] leading-relaxed">
          <RichText text={callout.body} />
        </p>
      </div>
    </aside>
  );
}

export function CodeCard({ block }: { block: CodeBlock }) {
  const [copied, setCopied] = useState(false);
  // Reference text, not runnable code, so the copy matches what is shown.
  const text = alignComments(block.text);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <figure className="glass min-w-0 overflow-hidden">
      <figcaption className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-2">
        <span className="text-sm font-medium text-fog-bright">{block.title || 'Reference'}</span>
        <button type="button" onClick={copy} className="chip" aria-label={`Copy ${block.title}`}>
          {copied ? <Check aria-hidden className="h-3 w-3 text-sage" /> : <Copy aria-hidden className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </figcaption>
      <pre className="overflow-x-auto bg-ink-950/60 p-4 font-mono text-xs leading-relaxed text-teal">
        <code>{text}</code>
      </pre>
    </figure>
  );
}
