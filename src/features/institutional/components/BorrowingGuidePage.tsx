import Link from "next/link";
import { InstitutionalShell, SectionBand, StatTile, TextCard } from "./InstitutionalShell";

const loanRules = [
  ["Books", "21 days", "2 renewals", "Place holds when all copies are out"],
  ["Reference", "In library", "No renewals", "Ask staff for scans or support"],
  ["Course reserve", "2 hours", "No renewals", "High-demand access at the desk"],
  ["Media kits", "7 days", "1 renewal", "Return directly to circulation"],
];

const steps = [
  ["Find", "Search the catalog by title, author, ISBN, or subject."],
  ["Borrow", "Bring available copies to the desk or ask a librarian for checkout support."],
  ["Renew", "Extend eligible loans before the due date from your account."],
  ["Return", "Return books on time so the next reader can access them."],
];

export function BorrowingGuidePage() {
  return (
    <InstitutionalShell
      eyebrow="Borrowing guide"
      title="Clear rules for borrowing, renewal, holds, and returns."
      description="A practical guide for using The Athenaeum collection with confidence, from first checkout to final return."
      imageUrl="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1800&q=80"
    >
      <SectionBand>
        <div className="grid gap-5 md:grid-cols-4">
          <StatTile label="Standard loan" value="21 days" />
          <StatTile label="Renewals" value="2x" />
          <StatTile label="Hold pickup" value="3 days" />
          <StatTile label="Desk support" value="Daily" />
        </div>
      </SectionBand>

      <SectionBand tone="soft">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#337AB7]">Loan periods</p>
            <h2 className="mt-3 font-serif text-4xl font-bold text-[#000054]">Borrow by material type</h2>
            <p className="mt-4 leading-7 text-[#333333]">
              Loan policies are built to balance generous access with fair circulation for high-demand materials.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/user/loans" className="rounded-full bg-[#E60028] px-5 py-3 text-sm font-bold text-white">My Loans</Link>
              <Link href="/user/holds" className="rounded-full border border-[#D9DCE8] px-5 py-3 text-sm font-bold text-[#000054]">My Holds</Link>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-[#EDEDF2] bg-white">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-[#000054] text-white">
                <tr>{["Material", "Loan period", "Renewal", "Notes"].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr>
              </thead>
              <tbody>
                {loanRules.map((row) => (
                  <tr key={row[0]} className="border-t border-[#EDEDF2]">
                    {row.map((cell, index) => <td key={cell} className={`px-4 py-4 ${index === 0 ? "font-bold text-[#000054]" : "text-[#333333]"}`}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionBand>

      <SectionBand>
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#337AB7]">How it works</p>
            <h2 className="mt-3 font-serif text-4xl font-bold text-[#000054]">From discovery to return</h2>
          </div>
          <Link href="/books" className="rounded-full border border-[#D9DCE8] px-5 py-3 text-sm font-bold text-[#000054]">Browse catalog</Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-4">
          {steps.map(([title, body], index) => (
            <article key={title} className="rounded-xl border border-[#EDEDF2] bg-[#F8F9FA] p-6">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#E60028] text-sm font-bold text-white">{index + 1}</span>
              <h3 className="mt-5 text-xl font-bold text-[#000054]">{title}</h3>
              <p className="mt-3 leading-7 text-[#333333]">{body}</p>
            </article>
          ))}
        </div>
      </SectionBand>

      <SectionBand tone="navy">
        <div className="grid gap-5 md:grid-cols-3">
          <TextCard title="Renewals" body="Renew before the due date when no other reader is waiting and your account is in good standing." />
          <TextCard title="Holds" body="Place a hold on unavailable titles and watch pickup status from your account." />
          <TextCard title="Fines" body="Fine records are visible in your profile area so you can resolve account issues early." />
        </div>
      </SectionBand>
    </InstitutionalShell>
  );
}
