import type { Flow, NavGroup, Phase, Section } from './types';
import sectionsRaw from './legacy/sections.json';
import flowsRaw from './legacy/flows.json';
import navRaw from './legacy/nav.json';
import phasesRaw from './legacy/phases.json';

export * from './types';

// The v3 page prefixed every heading with "// "; titles drop it here, once, for every view.
const allSections = (sectionsRaw as Section[]).map((s) => ({ ...s, title: shortTitle(s.title) }));

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

/** Every phase that lists a section (a few sections, such as evasion, sit in two). */
export function phasesForSection(id: string): Phase[] {
  return phases.filter((p) => p.sections.includes(id));
}

/** Section title without the v3 "// " prefix, for compact labels. */
export function shortTitle(title: string): string {
  return title.replace(/^\/\/\s*/, '');
}

/** One line per phase for the ring and the phase cards: its section titles, in order. */
export function phaseTopics(phase: Phase): string[] {
  return phase.sections.map((id) => sectionById[id]).filter(Boolean).map((s) => shortTitle(s.title));
}

/** Reference cards across a phase's sections. */
export function phaseCardCount(phase: Phase): number {
  return phase.sections.reduce((n, id) => n + (sectionById[id]?.cards.length ?? 0), 0);
}

/** The next phase around the ring (the lifecycle wraps from impact back to infrastructure). */
export function nextPhase(phase: Phase): Phase {
  return phases[(phases.indexOf(phase) + 1) % phases.length];
}

export function prevPhase(phase: Phase): Phase {
  return phases[(phases.indexOf(phase) - 1 + phases.length) % phases.length];
}

/** Each phase has its own hue, so a flow step's hue names its phase. */
const phaseByHue: Partial<Record<Phase['hue'], Phase>> = Object.fromEntries(phases.map((p) => [p.hue, p]));
export function phaseForHue(hue: Phase['hue']): Phase | undefined {
  return phaseByHue[hue];
}

/** Phases a flow passes through, in lifecycle order. */
export function flowPhases(flow: Flow): Phase[] {
  const seen = new Set(flow.steps.map((s) => phaseForHue(s.hue)?.id).filter(Boolean));
  return phases.filter((p) => seen.has(p.id));
}

/** Flows with at least one step in a phase. */
export function flowsForPhase(phase: Phase): Flow[] {
  return flows.filter((f) => f.steps.some((s) => s.hue === phase.hue));
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
