import Link from "next/link";
import { InstitutionalShell, SectionBand, StatTile, TextCard } from "./InstitutionalShell";

const values = [
  ["Search-first access", "The Athenaeum centers discovery, availability, and clear circulation status."],
  ["Academic calm", "Spaces and systems are designed for focus, research, and repeat daily use."],
  ["Operational clarity", "Borrowing, holds, returns, and catalog work are visible to the people who need them."],
];

const spaces = [
  {
    title: "Reading room",
    body: "A quiet environment for individual study and long-form reading.",
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Digital catalog desk",
    body: "Search-first tooling for finding books, checking copies, and placing holds.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Circulation support",
    body: "Staff workflows for checkout, check-in, renewals, and hold pickup.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  },
];

export function AboutPage() {
  return (
    <InstitutionalShell
      eyebrow="About The Athenaeum"
      title="A modern academic library for knowledge discovery."
      description="The Athenaeum brings together a refined public catalog, member services, and staff circulation tools in one cohesive library experience."
      imageUrl="/image.png"
    >
      <SectionBand>
        <div className="grid gap-5 md:grid-cols-4">
          <StatTile label="Catalog focus" value="Books" />
          <StatTile label="Member tools" value="Loans" />
          <StatTile label="Staff desk" value="Live" />
          <StatTile label="Design tone" value="Calm" />
        </div>
      </SectionBand>

      <SectionBand tone="soft">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#337AB7]">Our role</p>
            <h2 className="mt-3 font-serif text-4xl font-bold text-[#000054]">Built for readers and operators.</h2>
            <p className="mt-4 leading-7 text-[#333333]">
              The library experience is not only a public catalog. It is a system for discovery, accountability,
              staff service, and a clear path from search to shelf.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/books" className="rounded-full bg-[#E60028] px-5 py-3 text-sm font-bold text-white">Explore books</Link>
              <Link href="/borrowing-guide" className="rounded-full border border-[#D9DCE8] px-5 py-3 text-sm font-bold text-[#000054]">Borrowing guide</Link>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {values.map(([title, body]) => <TextCard key={title} title={title} body={body} />)}
          </div>
        </div>
      </SectionBand>

      <SectionBand>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#337AB7]">Spaces and systems</p>
          <h2 className="mt-3 font-serif text-4xl font-bold text-[#000054]">Designed as a working library.</h2>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {spaces.map((space) => (
            <article key={space.title} className="overflow-hidden rounded-2xl border border-[#EDEDF2] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(7,7,88,0.12)]">
              <div
                className="h-56 w-full bg-cover bg-center"
                role="img"
                aria-label={space.title}
                style={{ backgroundImage: `url(${space.image})` }}
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#000054]">{space.title}</h3>
                <p className="mt-3 leading-7 text-[#333333]">{space.body}</p>
              </div>
            </article>
          ))}
        </div>
      </SectionBand>

      <SectionBand tone="navy">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#51D2FF]">The Athenaeum</p>
            <h2 className="mt-3 font-serif text-4xl font-bold">A modern space for knowledge discovery.</h2>
          </div>
          <Link href="/notices" className="rounded-full bg-white px-5 py-3 text-sm font-bold text-[#000054]">Library notices</Link>
        </div>
      </SectionBand>
    </InstitutionalShell>
  );
}
