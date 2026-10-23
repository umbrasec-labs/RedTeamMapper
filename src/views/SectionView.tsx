import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { navGroups, sectionById, sections } from '@/data';
import { EmptyState } from '@/components/Feedback';

/**
 * Renders one reference section. The body is the v3 HTML carried across by the
 * extractor, shown inside a `.rtm` wrapper so the original cards keep their look.
 */
export default function SectionView() {
  const { sectionId = '' } = useParams();
  const section = sectionById[sectionId];

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [sectionId]);

  if (!section || section.id === 'flows') {
    return (
      <div className="mx-auto max-w-xl py-16">
        <EmptyState
          title="Section not found"
          hint="This section isn't on the map. Use search or pick one from the sidebar."
          action={
            <Link to="/" className="btn btn-primary mt-2">
              Back to overview
            </Link>
          }
        />
      </div>
    );
  }

  const idx = sections.findIndex((s) => s.id === section.id);
  const prev = sections[idx - 1];
  const next = sections[idx + 1];
  const group = navGroups.find((g) => g.ids.includes(section.id));

  return (
    <div className="mx-auto max-w-4xl">
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-fog-muted">
        <Link to="/" className="hover:text-fog-bright">
          Overview
        </Link>
        {group && (
          <>
            <span aria-hidden>/</span>
            <span>{group.label}</span>
          </>
        )}
        <span aria-hidden>/</span>
        <span className="text-fog">{section.title}</span>
      </nav>

      <header className="mb-6 border-b border-white/[0.07] pb-5">
        <h2 className="font-display text-2xl font-extrabold text-fog-bright">{section.title}</h2>
        {section.desc && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fog">{section.desc}</p>}
      </header>

      {/* Content preserved from the v3 page, mechanically. */}
      <div className="rtm" dangerouslySetInnerHTML={{ __html: section.html }} />

      <nav className="mt-10 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-5">
        {prev ? (
          <Link to={`/sections/${prev.id}`} className="btn btn-ghost">
            <ArrowLeft aria-hidden className="h-4 w-4" /> {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/sections/${next.id}`} className="btn btn-ghost">
            {next.title} <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        )}
      </nav>
    </div>
  );
}
