"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "../context/AuthContext";

export function ProfilePanel() {
  const router = useRouter();
  const auth = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!auth.isInitializing && !auth.isAuthenticated) {
      router.push("/login");
    }
  }, [auth.isAuthenticated, auth.isInitializing, router]);

  if (auth.isInitializing || !auth.isAuthenticated) {
    return (
      <main id="main-content" tabIndex={-1} className="flex min-h-screen items-center justify-center bg-[#F8F9FA] px-5 outline-none">
        <div className="w-full max-w-md rounded-2xl border border-[#EDEDF2] bg-white p-8 text-center shadow-[0_24px_60px_rgba(17,24,39,0.14)]">
          <p className="text-sm font-bold uppercase tracking-wide text-black/70">Authenticating</p>
          <h1 className="mt-3 font-serif text-3xl font-bold text-black">Checking your session...</h1>
        </div>
      </main>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    if (!fullName) {
      setError("Full name is required.");
      return;
    }

    setIsSaving(true);
    try {
      await auth.updateProfile({ fullName, phone });
      setMessage("Your profile was updated.");
      setError("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not update profile.");
      setMessage("");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl px-5 pt-6 pb-12 outline-none lg:px-8">
        <section className="rounded-2xl border border-[#EDEDF2] bg-white p-8 shadow-[0_24px_60px_rgba(17,24,39,0.1)]">
          <p className="text-sm font-bold uppercase tracking-wide text-black/70">My profile</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-black">
            {auth.currentUser?.fullName || "The Athenaeum member profile"}
          </h1>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["Email", auth.currentUser?.email ?? "-"],
              ["Role", auth.currentUser?.role ?? "-"],
              ["Status", auth.currentUser?.status ?? "-"],
              ["Borrow limit", String(auth.currentUser?.maxBorrowLimit ?? "-")],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-[#EDEDF2] bg-[#F8F9FA] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-black/60">{label}</p>
                <p className="mt-2 break-words font-bold text-black">{value}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-[#EDEDF2] bg-[#F8F9FA] p-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <h2 className="text-xl font-bold text-black">Update profile</h2>
                <p className="mt-1 text-sm leading-6 text-black/70">Only full name and phone can be changed here.</p>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-full bg-[#E60028] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#E60028]/20 transition hover:-translate-y-0.5 disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-xs font-bold uppercase tracking-wide text-black">Full name</span>
                <input
                  name="fullName"
                  defaultValue={auth.currentUser?.fullName ?? ""}
                  className="mt-2 w-full rounded-xl border border-[#D9DCE8] bg-white px-4 py-3 outline-none focus:border-black"
                />
              </label>
              <label>
                <span className="text-xs font-bold uppercase tracking-wide text-black">Phone</span>
                <input
                  name="phone"
                  defaultValue={auth.currentUser?.phone ?? ""}
                  className="mt-2 w-full rounded-xl border border-[#D9DCE8] bg-white px-4 py-3 outline-none focus:border-black"
                />
              </label>
            </div>

            {message ? <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</p> : null}
            {error ? <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p> : null}
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}
