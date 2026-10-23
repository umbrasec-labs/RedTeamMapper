import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Orbit } from 'lucide-react';
import { cardSlug, phaseForSection, sectionById, sections } from '@/data';
import { CalloutBox, CodeCard, SectionCard } from '@/components/Reference';
import { EmptyState } from '@/components/Feedback';

/** Full reader for one reference section: callouts, a card grid, and code blocks. */
export default function SectionView() {
  const { sectionId = '' } = useParams();
  const [params] = useSearchParams();
  const focusCard = params.get('card');
  const section = sectionById[sectionId];

  useEffect(() => {
    if (focusCard) {
      const t = setTimeout(
        () => document.getElementById(`card-${focusCard}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        100,
      );
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0 });
  }, [focusCard, sectionId]);

  if (!section || section.id === 'flows') {
    return (
      <div className="mx-auto max-w-xl py-16">
        <EmptyState
          title={`No section called “${sectionId}”`}
          hint="Pick a section from the sidebar or search for a topic."
          action={
            <Link to="/" className="btn btn-primary mt-2">
              Back to the map
            </Link>
          }
        />
      </div>
    );
  }

  const phase = phaseForSection(section.id);
  const i = sections.findIndex((s) => s.id === section.id);
  const prev = sections[i - 1];
  const next = sections[i + 1];

  return (
    <article className="mx-auto max-w-6xl">
      <header className="mb-6 max-w-3xl">
        <div className="eyebrow text-ember">{section.eyebrow}</div>
        <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">{section.title}</h2>
        {section.description && (
          <p className="mt-2 text-[13px] leading-relaxed text-fog-dim">{section.description}</p>
        )}
        {phase && (
          <div className="mt-3">
            <Link to={`/?phase=${phase.id}`} className="chip">
              <Orbit aria-hidden className="h-3 w-3" /> {phase.label} phase
            </Link>
          </div>
        )}
      </header>

      <div className="space-y-5">
        {section.callouts.map((c, i) => (
          <CalloutBox key={i} callout={c} />
        ))}

        {section.cards.length > 0 && (
          <div className="grid items-start gap-3 lg:grid-cols-2">
            {section.cards.map((card) => {
              const slug = cardSlug(card.title);
              return (
                <SectionCard
                  key={`${slug}-${focusCard === slug}`}
                  card={card}
                  id={`card-${slug}`}
                  defaultOpen={focusCard === slug}
                  highlight={focusCard === slug}
                />
              );
            })}
          </div>
        )}

        {section.code.map((block, i) => (
          <CodeCard key={i} block={block} />
        ))}
      </div>

      <nav
        aria-label="Section navigation"
        className="mt-10 flex flex-wrap justify-between gap-3 border-t border-white/[0.06] pt-5"
      >
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
    </article>
  );
}
