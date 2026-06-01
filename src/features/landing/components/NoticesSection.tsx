const notices = [
  ["New books added", "New computer science and finance titles are available this week."],
  ["Reservation pickup", "Reserved books are held for 48 hours after notification."],
  ["System maintenance", "Catalogue services may be briefly unavailable on Sunday morning."],
];

export function NoticesSection() {
  return (
    <section className="bg-[#F8F9FA] px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="animate-fade-up flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-serif text-3xl font-bold text-[#000054]">Library Notices</h2>
            <p className="mt-3 max-w-2xl leading-7 text-[#333333]">
              Timely updates for availability, reservations and system operations.
            </p>
          </div>
          <span className="rounded-full bg-[#E60028]/10 px-4 py-2 text-sm font-bold text-[#E60028]">3 active notices</span>
        </div>
        <div className="mt-10 grid gap-4">
          {notices.map(([title, content], index) => (
            <article
              key={title}
              className={`animate-fade-up grid gap-3 rounded-lg border border-[#EDEDF2] bg-white p-6 shadow-[0_2px_8px_rgba(7,7,88,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#337AB7]/35 hover:shadow-[0_14px_28px_rgba(7,7,88,0.12)] md:grid-cols-[220px_1fr] ${
                index === 0 ? "animate-delay-75" : index === 1 ? "animate-delay-150" : "animate-delay-225"
              }`}
            >
              <h3 className="font-bold text-[#000054]">{title}</h3>
              <p className="text-sm leading-6 text-[#333333]">{content}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
