import type { Flow, NavGroup, Section } from './types';
import sectionsRaw from './legacy/sections.json';
import flowsRaw from './legacy/flows.json';
import navRaw from './legacy/nav.json';

export * from './types';

/** All v3 sections, in page order. The first ('flows') backs the Flow Chains view. */
export const sections = (sectionsRaw as Section[]).filter((s) => s.id !== 'flows');
export const sectionById: Record<string, Section> = Object.fromEntries(
  (sectionsRaw as Section[]).map((s) => [s.id, s]),
);

export const flows = flowsRaw as Flow[];
export const flowById: Record<string, Flow> = Object.fromEntries(flows.map((f) => [f.id, f]));

export const navGroups = navRaw as NavGroup[];
