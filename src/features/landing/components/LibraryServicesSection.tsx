const services = [
  ["01", "Find Books", "Search across titles, authors, categories and ISBNs."],
  ["02", "Borrowing Guide", "Learn loan limits, due dates and return rules."],
  ["03", "Reserve a Book", "Join the queue when a book is currently unavailable."],
  ["04", "My Library Account", "Track loans, reservations, notifications and fines."],
  ["05", "For Librarians", "Manage books, copies, members and borrowing records."],
  ["06", "Library Notices", "Stay updated with reminders and important announcements."],
];

export function LibraryServicesSection() {
  return (
    <section className="bg-gradient-to-b from-[#F8F9FA] to-white px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="animate-fade-up max-w-2xl">
          <h2 className="font-serif text-3xl font-bold text-[#000054]">Library Services</h2>
          <p className="mt-3 leading-7 text-[#333333]">
            Access the essential tools you need to discover, borrow and manage library resources.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(([index, title, description], serviceIndex) => (
            <article
              key={title}
              className={`animate-fade-up group relative overflow-hidden rounded-xl border border-[#EDEDF2] bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#337AB7]/40 hover:shadow-lg ${
                serviceIndex === 0
                  ? "animate-delay-75"
                  : serviceIndex === 1
                    ? "animate-delay-150"
                    : serviceIndex === 2
                      ? "animate-delay-225"
                      : serviceIndex === 3
                        ? "animate-delay-300"
                        : serviceIndex === 4
                          ? "animate-delay-375"
                          : "animate-delay-450"
              }`}
            >
              {/* Gradient top border */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#E60028] via-[#51D2FF] to-[#337AB7] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              
              {/* Number badge with enhanced styling */}
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-[#000054] via-[#070758] to-[#337AB7] text-base font-black text-white shadow-md shadow-[#000054]/25 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#000054]/30">
                {index}
              </div>
              
              <h3 className="text-lg font-bold text-[#000054] transition-colors duration-300 group-hover:text-[#337AB7]">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#333333]">{description}</p>
              
              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-[#E60028] to-[#337AB7] transition-all duration-300 group-hover:w-full" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
