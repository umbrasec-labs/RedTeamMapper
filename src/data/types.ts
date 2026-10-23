/**
 * Content model for the Red Team Mapper v4.
 *
 * The v3 page is carried across by scripts/extract_legacy.py into the JSON files
 * in ./legacy. Nothing here is hand-authored content: the components render these
 * shapes generically.
 */
import type { IconKey } from '@/lib/icons';

export type { IconKey };

/** The eight-hue coding set. Each maps to a Tailwind color in tailwind.config.js. */
export type Hue = 'ember' | 'gold' | 'khaki' | 'sage' | 'teal' | 'slate' | 'mauve' | 'rose';

export type CalloutTone = 'warn' | 'success' | 'info' | 'danger';

export interface CardItem {
  /** Bold lead-in. */
  lead: string;
  /** Body text. Inline code is wrapped in `backticks`. */
  text: string;
}

export interface SectionCard {
  hue: Hue;
  tag: string;
  title: string;
  summary: string;
  items: CardItem[];
}

export interface Callout {
  tone: CalloutTone;
  title: string;
  body: string;
}

export interface CodeBlock {
  title: string;
  text: string;
}

export interface Section {
  id: string;
  /** Short kicker above the title - the operational group it belongs to. */
  eyebrow: string;
  title: string;
  description: string;
  callouts: Callout[];
  cards: SectionCard[];
  code: CodeBlock[];
}

/** One phase of the operation lifecycle, shown on the radial map. */
export interface Phase {
  id: string;
  order: number;
  label: string;
  short: string;
  icon: IconKey;
  hue: Hue;
  /** Section ids that belong to this phase. */
  sections: string[];
}

export interface FlowStep {
  label: string;
  hue: Hue;
}

export interface Flow {
  id: string;
  title: string;
  hue: Hue;
  steps: FlowStep[];
  /** Labels on the arrows between steps; length is steps.length - 1. */
  arrows: string[];
}

export interface NavGroup {
  label: string;
  ids: string[];
}
