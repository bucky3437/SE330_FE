import Link from "next/link";
import { InstitutionalShell, SectionBand } from "./InstitutionalShell";

const notices = [
  {
    type: "Service",
    title: "Extended study hours during assessment week",
    date: "May 20, 2026",
    body: "The main reading room will remain open until 10:00 PM with quiet study priority and additional desk support.",
  },
  {
    type: "Catalog",
    title: "New digital systems collection now available",
    date: "May 18, 2026",
    body: "Explore recent titles in distributed systems, databases, software architecture, and information retrieval.",
  },
  {
    type: "Circulation",
    title: "Return reminders and hold pickup notices",
    date: "May 15, 2026",
    body: "Members should check email notifications and the My Holds page for pickup deadlines.",
  },
  {
    type: "Space",
    title: "Quiet zone refresh on Level 2",
    date: "May 12, 2026",
    body: "New task lighting, power access, and seating improvements are being installed in phases.",
  },
];

const serviceCards = [
  ["Borrowing", "Current loans, holds, and fines remain available in member tools.", "/user/loans"],
  ["Staff desk", "Librarians can manage checkout, return, and hold pickup workflows.", "/staff/circulation"],
  ["Collections", "Catalog updates continue throughout the semester.", "/books"],
];

export function NoticesPage() {
  return (
    <InstitutionalShell
      eyebrow="Library notices"
      title="Current updates from The Athenaeum."
      description="Operational notices, service changes, collection highlights, and space updates for members and staff."
      imageUrl="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=80"
    >
      <SectionBand>
        <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr]">
          <div className="grid gap-5">
            {notices.map((notice) => (
              <article key={notice.title} className="rounded-2xl border border-[#EDEDF2] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(7,7,88,0.10)]">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#000054]/8 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#000054]">{notice.type}</span>
                  <time className="text-sm font-semibold text-[#337AB7]">{notice.date}</time>
                </div>
                <h2 className="mt-4 font-serif text-3xl font-bold text-[#000054]">{notice.title}</h2>
                <p className="mt-3 leading-7 text-[#333333]">{notice.body}</p>
              </article>
            ))}
          </div>
          <aside className="rounded-2xl border border-[#EDEDF2] bg-[#F8F9FA] p-6 lg:sticky lg:top-28 lg:self-start">
            <p className="text-sm font-bold uppercase tracking-wide text-[#337AB7]">Quick access</p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-[#000054]">Act on a notice</h2>
            <div className="mt-6 grid gap-4">
              {serviceCards.map(([title, body, href]) => (
                <Link key={title} href={href} className="rounded-xl border border-[#EDEDF2] bg-white p-4 transition hover:border-[#337AB7]/40">
                  <h3 className="font-bold text-[#000054]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#333333]">{body}</p>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </SectionBand>

      <SectionBand tone="navy">
        <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#51D2FF]">Stay informed</p>
            <h2 className="mt-3 font-serif text-4xl font-bold">Service updates that matter.</h2>
          </div>
          <p className="text-lg leading-8 text-white/80">
            Library notices are written for action: check your account, return materials on time, follow pickup deadlines,
            and use staff support when circulation status changes.
          </p>
        </div>
      </SectionBand>
    </InstitutionalShell>
  );
}
