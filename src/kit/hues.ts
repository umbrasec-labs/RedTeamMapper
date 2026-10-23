/**
 * Colour tokens for the kit. Self-contained so the kit folder copies between the
 * mappers as one unit; both share the same eight hues in tailwind.config.js.
 */
export type KitHue = 'ember' | 'gold' | 'khaki' | 'sage' | 'teal' | 'slate' | 'mauve' | 'rose';

/** Raw hex values, for SVG and React Flow where Tailwind classes can't reach. */
export const kitHex: Record<KitHue, string> = {
  ember: '#f25623',
  gold: '#d9a441',
  khaki: '#aeab94',
  sage: '#88a57d',
  teal: '#5fb3a1',
  slate: '#8fa3b8',
  mauve: '#b48ead',
  rose: '#cf8a78',
};

/** Tailwind class sets per hue, written out in full so the JIT compiler sees them. */
export const kitClass: Record<KitHue, { text: string; bg: string; border: string; dot: string }> = {
  ember: { text: 'text-ember', bg: 'bg-ember/10', border: 'border-ember/40', dot: 'bg-ember' },
  gold: { text: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/40', dot: 'bg-gold' },
  khaki: { text: 'text-khaki', bg: 'bg-khaki/10', border: 'border-khaki/40', dot: 'bg-khaki' },
  sage: { text: 'text-sage', bg: 'bg-sage/10', border: 'border-sage/40', dot: 'bg-sage' },
  teal: { text: 'text-teal', bg: 'bg-teal/10', border: 'border-teal/40', dot: 'bg-teal' },
  slate: { text: 'text-slate', bg: 'bg-slate/10', border: 'border-slate/40', dot: 'bg-slate' },
  mauve: { text: 'text-mauve', bg: 'bg-mauve/10', border: 'border-mauve/40', dot: 'bg-mauve' },
  rose: { text: 'text-rose', bg: 'bg-rose/10', border: 'border-rose/40', dot: 'bg-rose' },
};
