import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { FeaturedBooksSection } from "./FeaturedBooksSection";
import { HeroSearchSection } from "./HeroSearchSection";
import { LibraryServicesSection } from "./LibraryServicesSection";
import { NoticesSection } from "./NoticesSection";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <HeroSearchSection />
        <LibraryServicesSection />
        <FeaturedBooksSection />
        <section className="bg-[linear-gradient(180deg,#FFFFFF_0%,#F8F9FA_100%)] px-5 py-20 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
            {[
              ["Borrow Books", "Check availability and borrow available copies from the catalogue."],
              ["Reserve Unavailable Books", "Join the reservation queue and receive pickup notifications."],
              ["Track Due Dates", "Follow return deadlines before overdue fines are applied."],
            ].map(([title, description], index) => (
              <article
                key={title}
                className={`animate-fade-up rounded-lg border border-[#EDEDF2] border-l-4 border-l-[#E60028] bg-white p-7 shadow-[0_2px_8px_rgba(7,7,88,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#337AB7]/35 hover:shadow-[0_16px_30px_rgba(7,7,88,0.12)] ${
                  index === 0 ? "animate-delay-75" : index === 1 ? "animate-delay-150" : "animate-delay-225"
                }`}
              >
                <h2 className="text-xl font-bold text-[#000054]">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-[#333333]">{description}</p>
              </article>
            ))}
          </div>
        </section>
        <NoticesSection />
      </main>
      <Footer />
    </div>
  );
}
