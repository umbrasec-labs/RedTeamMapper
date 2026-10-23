import type { CalloutTone, Hue } from '@/data/types';

/** Raw hex values, for SVG and inline styles where Tailwind classes can't reach. */
export const hueHex: Record<Hue, string> = {
  ember: '#f25623',
  gold: '#d9a441',
  khaki: '#aeab94',
  sage: '#88a57d',
  teal: '#5fb3a1',
  slate: '#8fa3b8',
  mauve: '#b48ead',
  rose: '#cf8a78',
};

/** Tailwind class sets per hue, written in full so the JIT compiler sees them. */
export const hueClass: Record<
  Hue,
  { text: string; bg: string; border: string; ring: string; dot: string }
> = {
  ember: { text: 'text-ember', bg: 'bg-ember/10', border: 'border-ember/40', ring: 'ring-ember/50', dot: 'bg-ember' },
  gold: { text: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/40', ring: 'ring-gold/50', dot: 'bg-gold' },
  khaki: { text: 'text-khaki', bg: 'bg-khaki/10', border: 'border-khaki/40', ring: 'ring-khaki/50', dot: 'bg-khaki' },
  sage: { text: 'text-sage', bg: 'bg-sage/10', border: 'border-sage/40', ring: 'ring-sage/50', dot: 'bg-sage' },
  teal: { text: 'text-teal', bg: 'bg-teal/10', border: 'border-teal/40', ring: 'ring-teal/50', dot: 'bg-teal' },
  slate: { text: 'text-slate', bg: 'bg-slate/10', border: 'border-slate/40', ring: 'ring-slate/50', dot: 'bg-slate' },
  mauve: { text: 'text-mauve', bg: 'bg-mauve/10', border: 'border-mauve/40', ring: 'ring-mauve/50', dot: 'bg-mauve' },
  rose: { text: 'text-rose', bg: 'bg-rose/10', border: 'border-rose/40', ring: 'ring-rose/50', dot: 'bg-rose' },
};

export const calloutHue: Record<CalloutTone, Hue> = {
  warn: 'gold',
  success: 'sage',
  info: 'mauve',
  danger: 'ember',
};
