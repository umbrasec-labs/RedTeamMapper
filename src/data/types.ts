/**
 * Content model for the Red Team Mapper v4.
 *
 * The v3 page is carried across by scripts/extract_legacy.py into the JSON files
 * in ./legacy. Section bodies are preserved as sanitised HTML and rendered inside
 * a `.rtm` wrapper (see src/styles/legacy.css); flows are modelled as step chains.
 */

/** The eight-hue coding set. Each maps to a Tailwind color in tailwind.config.js. */
export type Hue = 'ember' | 'gold' | 'khaki' | 'sage' | 'teal' | 'slate' | 'mauve' | 'rose';

/** One reference section from the v3 page (Recon, C2, Credential Access, ...). */
export interface Section {
  id: string;
  title: string;
  desc: string;
  /** Sanitised inner HTML of the section body, rendered under `.rtm`. */
  html: string;
}

export interface FlowStep {
  label: string;
  hue: Hue;
}

/** An end-to-end operation chain (node → node → node). */
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
