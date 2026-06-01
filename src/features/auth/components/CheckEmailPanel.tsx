"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/layout/BrandMark";
import { ApiError } from "@/types/api.type";
import { resendVerification } from "../services/authService";
import { validateRequiredEmail } from "../validations/authValidation";

export function CheckEmailPanel() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(() => {
    const emailFromQuery = searchParams.get("email");

    if (emailFromQuery) return emailFromQuery;
    if (typeof window === "undefined") return "";

    return window.sessionStorage.getItem("pendingVerificationEmail") ?? "";
  });
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResend = async () => {
    const emailError = validateRequiredEmail(email);

    if (emailError) {
      setError(emailError);
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await resendVerification({ email: email.trim() });
      setMessage(response.message || "Verification email has been sent again.");
      setCooldown(60);
      const timerId = window.setInterval(() => {
        setCooldown((current) => {
          if (current <= 1) {
            window.clearInterval(timerId);
            return 0;
          }

          return current - 1;
        });
      }, 1000);
    } catch (caughtError) {
      const apiError = caughtError as ApiError;
      setError(formatResendError(apiError));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[linear-gradient(180deg,#F8F9FA_0%,#FFFFFF_100%)] outline-none">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.14),transparent_30%),linear-gradient(135deg,#050505_0%,#171717_65%,#2d2d2d_100%)] px-6 py-8 text-white lg:px-12">
          <BrandMark />
          <div className="flex min-h-[calc(100vh-96px)] flex-col justify-center">
            <p className="animate-fade-up inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white backdrop-blur">
              Verify your account
            </p>
            <h1 className="animate-fade-up animate-delay-75 mt-5 max-w-xl font-serif text-4xl font-bold leading-tight md:text-5xl">
              Please check your email to activate your account.
            </h1>
            <p className="animate-fade-up animate-delay-150 mt-5 max-w-lg text-lg leading-8 text-white/78">
              The account stays pending until the verification link is confirmed.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-12 lg:px-8">
          <div className="animate-modal-in w-full max-w-lg rounded-2xl border border-[#EDEDF2] bg-white p-8 shadow-[0_24px_60px_rgba(17,24,39,0.14)]">
            <p className="text-sm font-bold uppercase tracking-wide text-black/70">Check your inbox</p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-black">Verification email sent</h2>
            <p className="mt-3 text-sm leading-6 text-black/75">
              We sent a verification link to your email. If you do not see it, check spam or resend after the cooldown.
            </p>

            <label htmlFor="verification-email" className="mt-6 block text-sm font-bold text-black">
              Registered email
            </label>
            <input
              id="verification-email"
              type="email"
              className="mt-2 h-12 w-full rounded-lg border border-[#D9DCE8] px-4 text-black outline-none transition-all duration-200 focus:border-2 focus:border-black focus:shadow-[0_0_0_4px_rgba(0,0,0,0.1)]"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            {message && (
              <p className="mt-4 animate-fade-up rounded-lg border border-[#28A745]/20 bg-[#28A745]/10 p-3 text-sm font-semibold text-[#1E7E34]">
                {message}
              </p>
            )}
            {error && (
              <p className="mt-4 animate-fade-up rounded-lg border border-[#E60028]/20 bg-[#E60028]/8 p-3 text-sm font-semibold text-[#B00020]">
                {error}
              </p>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={isLoading || cooldown > 0}
                className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-[#E60028] to-[#c90022] px-5 text-sm font-bold text-white shadow-lg shadow-[#E60028]/25 transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:from-[#B8BBC8] disabled:to-[#9FA3B2] disabled:shadow-none disabled:hover:translate-y-0"
                onClick={handleResend}
              >
                {isLoading && (
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
              </button>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-full border border-black px-5 text-sm font-bold text-black transition hover:bg-black hover:text-white"
              >
                Back to login
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function formatResendError(error: ApiError) {
  if (error.code === "EMAIL_ALREADY_VERIFIED") {
    return "This account has already been verified. You can log in now.";
  }

  if (error.code === "EMAIL_RESEND_COOLDOWN") {
    return "Please wait before requesting another verification email.";
  }

  if (error.code === "EMAIL_RESEND_LIMIT_EXCEEDED") {
    return "You have reached today’s resend limit. Please try again later.";
  }

  return error.message || "Could not resend verification email.";
}
