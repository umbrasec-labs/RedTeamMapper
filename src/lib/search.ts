import Fuse, { type IFuseOptions } from 'fuse.js';
import { flows, sections } from '@/data';

export type SearchKind = 'section' | 'flow' | 'step';

export interface SearchDoc {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  body: string;
  /** Router location to jump to. */
  to: string;
}

export const kindLabel: Record<SearchKind, string> = {
  section: 'Section',
  flow: 'Flow chain',
  step: 'Flow step',
};

/** Order result groups appear in. */
export const kindOrder: SearchKind[] = ['section', 'flow', 'step'];

/** Strip HTML to plain text for indexing section bodies. */
function plain(htmlStr: string): string {
  return htmlStr
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  for (const s of sections) {
    docs.push({
      id: `section:${s.id}`,
      kind: 'section',
      title: s.title,
      subtitle: s.desc,
      body: plain(s.html).slice(0, 4000),
      to: `/sections/${s.id}`,
    });
  }

  for (const f of flows) {
    docs.push({
      id: `flow:${f.id}`,
      kind: 'flow',
      title: f.title,
      subtitle: f.steps.map((st) => st.label).join(' → '),
      body: [...f.steps.map((st) => st.label), ...f.arrows].join(' '),
      to: `/flows/${f.id}`,
    });
    for (const st of f.steps) {
      docs.push({
        id: `step:${f.id}:${st.label}`,
        kind: 'step',
        title: st.label,
        subtitle: `${f.title} chain`,
        body: st.label,
        to: `/flows/${f.id}`,
      });
    }
  }

  return docs;
}

const options: IFuseOptions<SearchDoc> = {
  keys: [
    { name: 'title', weight: 3 },
    { name: 'subtitle', weight: 1.2 },
    { name: 'body', weight: 1 },
  ],
  threshold: 0.34,
  ignoreLocation: true,
  minMatchCharLength: 2,
};

let fuse: Fuse<SearchDoc> | null = null;
let allDocs: SearchDoc[] | null = null;

function index() {
  if (!fuse) {
    allDocs = buildDocs();
    fuse = new Fuse(allDocs, options);
  }
  return { fuse, docs: allDocs! };
}

export function search(query: string, limit = 40): SearchDoc[] {
  const q = query.trim();
  const { fuse: f, docs } = index();
  if (!q) return docs.filter((d) => d.kind === 'section' || d.kind === 'flow');
  return f.search(q, { limit }).map((r) => r.item);
}
