import { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

type InstitutionalShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  imageUrl: string;
  children: ReactNode;
};

export function InstitutionalShell({ eyebrow, title, description, imageUrl, children }: InstitutionalShellProps) {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      <header className="relative min-h-[420px] overflow-hidden bg-[#000054]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,40,0.88)_0%,rgba(0,0,84,0.70)_48%,rgba(0,0,84,0.28)_100%)]" />
        <div className="relative mx-auto flex min-h-[420px] max-w-7xl flex-col justify-end px-5 py-14 text-white lg:px-8">
          <p className="text-sm font-bold uppercase tracking-wide text-[#51D2FF]">{eyebrow}</p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl font-bold leading-tight">{title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/85">{description}</p>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="outline-none">{children}</main>
      <Footer />
    </div>
  );
}

export function SectionBand({ children, tone = "white" }: { children: ReactNode; tone?: "white" | "soft" | "navy" }) {
  const classes =
    tone === "navy"
      ? "bg-[#000054] text-white"
      : tone === "soft"
        ? "bg-[#F8F9FA] text-[#111827]"
        : "bg-white text-[#111827]";

  return <section className={`${classes} px-5 py-16 lg:px-8`}><div className="mx-auto max-w-7xl">{children}</div></section>;
}

export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#EDEDF2] bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-[#337AB7]">{label}</p>
      <p className="mt-2 font-serif text-3xl font-bold text-[#000054]">{value}</p>
    </div>
  );
}

export function TextCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-xl border border-[#EDEDF2] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(7,7,88,0.10)]">
      <h3 className="text-xl font-bold text-[#000054]">{title}</h3>
      <p className="mt-3 leading-7 text-[#333333]">{body}</p>
    </article>
  );
}
