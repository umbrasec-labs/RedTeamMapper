import type { Flow, NavGroup, Phase, Section } from './types';
import sectionsRaw from './legacy/sections.json';
import flowsRaw from './legacy/flows.json';
import navRaw from './legacy/nav.json';
import phasesRaw from './legacy/phases.json';

export * from './types';

const allSections = sectionsRaw as Section[];

/** Content sections (everything except the 'flows' section, which backs the Flows view). */
export const sections = allSections.filter((s) => s.id !== 'flows');
export const sectionById: Record<string, Section> = Object.fromEntries(
  allSections.map((s) => [s.id, s]),
);

export const flows = flowsRaw as Flow[];
export const flowById: Record<string, Flow> = Object.fromEntries(flows.map((f) => [f.id, f]));

export const phases = phasesRaw as Phase[];
export const phaseById: Record<string, Phase> = Object.fromEntries(phases.map((p) => [p.id, p]));

/** The phase a section belongs to, if any. */
export function phaseForSection(id: string): Phase | undefined {
  return phases.find((p) => p.sections.includes(id));
}

export const navGroups = navRaw as NavGroup[];

/** Stable slug for a card, for deep links and search jumps. */
export function cardSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
