import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { BLUE_TEAM_MAPPER_URL } from '@/lib/links';
import { flows, navGroups } from '@/data';

export default function AboutView() {
  const sectionCount = navGroups.reduce((n, g) => n + g.ids.length, 0);
  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="font-display text-2xl font-extrabold text-fog-bright">About this mapper</h2>

      <div className="mt-5 space-y-4 text-sm leading-relaxed text-fog">
        <p>
          The Red Team Mapper is a structured reference for offensive security operations, covering the operator
          lifecycle from infrastructure and initial access through to escalation, movement and impact. It is the
          offensive counterpart to the UMBRASEC Blue Team Mapper.
        </p>
        <p>
          This is v4: the original single-page reference, rebuilt as an interactive map. It holds {sectionCount}{' '}
          reference sections grouped by operational phase and {flows.length} end-to-end flow chains, with a command
          palette (press <kbd className="kbd">/</kbd> or <kbd className="kbd">⌘K</kbd>) that searches across all of it.
          The section content is carried across unchanged from the original page.
        </p>
        <p className="rounded-xl border border-gold/30 bg-gold/[0.06] p-4 text-fog-bright">
          <strong className="text-gold">Intended use.</strong> This material is a planning and training aid for
          authorised red team, purple team and detection-engineering work: knowing how operations are structured is
          what lets defenders build coverage against them. Use it only where you have explicit permission to test.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/flows" className="btn btn-primary">
          Explore flow chains
        </Link>
        <a
          href={BLUE_TEAM_MAPPER_URL}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost"
        >
          <ExternalLink aria-hidden className="h-4 w-4" /> Blue Team Mapper
        </a>
      </div>
    </div>
  );
}
