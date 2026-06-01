"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/layout/BrandMark";
import { ApiError } from "@/types/api.type";
import { resendVerification, verifyEmail } from "../services/authService";
import { validateRequiredEmail } from "../validations/authValidation";

type VerifyState = "loading" | "success" | "expired" | "invalid";

export function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, setState] = useState<VerifyState>(token ? "loading" : "invalid");
  const [message, setMessage] = useState(
    token ? "Checking your verification link..." : "This verification link is missing a token.",
  );
  const [email, setEmail] = useState("");
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    verifyEmail(token)
      .then((response) => {
        setState("success");
        setMessage(response.message || "Your email has been verified successfully.");
      })
      .catch((caughtError) => {
        const apiError = caughtError as ApiError;
        const isExpired = apiError.code === "VERIFICATION_TOKEN_EXPIRED";
        setState(isExpired ? "expired" : "invalid");
        setMessage(apiError.message || (isExpired ? "This verification link has expired." : "This link cannot be used."));
      });
  }, [token]);

  const handleResend = async () => {
    const emailError = validateRequiredEmail(email);

    if (emailError) {
      setResendError(emailError);
      return;
    }

    setIsResending(true);
    setResendError(null);
    setResendMessage(null);

    try {
      const response = await resendVerification({ email: email.trim() });
      setResendMessage(response.message || "Verification email has been sent again.");
    } catch (caughtError) {
      const apiError = caughtError as ApiError;
      setResendError(apiError.message || "Could not resend verification email.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[linear-gradient(180deg,#F8F9FA_0%,#FFFFFF_100%)] outline-none">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.14),transparent_30%),linear-gradient(135deg,#050505_0%,#171717_65%,#2d2d2d_100%)] px-6 py-8 text-white lg:px-12">
          <BrandMark />
          <div className="flex min-h-[calc(100vh-96px)] flex-col justify-center">
            <p className="animate-fade-up inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white backdrop-blur">
              Email verification
            </p>
            <h1 className="animate-fade-up animate-delay-75 mt-5 max-w-xl font-serif text-4xl font-bold leading-tight md:text-5xl">
              A secure account starts with a verified email.
            </h1>
            <p className="animate-fade-up animate-delay-150 mt-5 max-w-lg text-lg leading-8 text-white/78">
              The Athenaeum uses email verification before activating borrowing and reservation access.
            </p>
            <StepIndicator state={state} />
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-12 lg:px-8">
          <div className="animate-modal-in w-full max-w-md rounded-2xl border border-[#EDEDF2] bg-white p-8 shadow-[0_24px_60px_rgba(17,24,39,0.14)]">
            {state === "loading" && <LoadingState message={message} />}
            {state === "success" && <SuccessState message={message} />}
            {(state === "expired" || state === "invalid") && (
              <VerifyError
                state={state}
                message={message}
                email={email}
                onEmailChange={setEmail}
                onResend={handleResend}
                isResending={isResending}
                resendMessage={resendMessage}
                resendError={resendError}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <>
      <p className="text-sm font-bold uppercase tracking-wide text-black/70">Checking link</p>
      <h2 className="mt-3 font-serif text-3xl font-bold text-black">Verifying your email</h2>
      <p className="mt-3 text-sm leading-6 text-black/75">{message}</p>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#EDEDF2]">
        <div className="h-full w-2/3 animate-pulse rounded-full bg-black" />
      </div>
    </>
  );
}

function SuccessState({ message }: { message: string }) {
  return (
    <>
      <p className="text-sm font-bold uppercase tracking-wide text-[#28A745]">Verified successfully</p>
      <h2 className="mt-3 font-serif text-3xl font-bold text-black">Your account is active</h2>
      <p className="mt-3 text-sm leading-6 text-black/75">{message}</p>
      <Link
        href="/login"
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#E60028] to-[#c90022] px-5 text-sm font-bold text-white shadow-lg shadow-[#E60028]/25 transition-all duration-200 hover:-translate-y-0.5"
      >
        Go to login
      </Link>
    </>
  );
}

function VerifyError({
  state,
  message,
  email,
  onEmailChange,
  onResend,
  isResending,
  resendMessage,
  resendError,
}: {
  state: Exclude<VerifyState, "loading" | "success">;
  message: string;
  email: string;
  onEmailChange: (email: string) => void;
  onResend: () => void;
  isResending: boolean;
  resendMessage: string | null;
  resendError: string | null;
}) {
  const isExpired = state === "expired";

  return (
    <>
      <p className="text-sm font-bold uppercase tracking-wide text-[#E60028]">
        {isExpired ? "Verification link expired" : "Invalid verification link"}
      </p>
      <h2 className="mt-3 font-serif text-3xl font-bold text-black">
        {isExpired ? "This link has expired" : "This link cannot be used"}
      </h2>
      <p className="mt-3 text-sm leading-6 text-black/75">{message}</p>
      <label htmlFor="resend-email" className="mt-6 block text-sm font-bold text-black">
        Registered email
      </label>
      <input
        id="resend-email"
        type="email"
        className="mt-2 h-12 w-full rounded-lg border border-[#D9DCE8] px-4 text-black outline-none transition-all duration-200 focus:border-2 focus:border-black focus:shadow-[0_0_0_4px_rgba(0,0,0,0.1)]"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
      />
      {resendMessage && (
        <p className="mt-4 animate-fade-up rounded-lg border border-[#28A745]/20 bg-[#28A745]/10 p-3 text-sm font-semibold text-[#1E7E34]">
          {resendMessage}
        </p>
      )}
      {resendError && (
        <p className="mt-4 animate-fade-up rounded-lg border border-[#E60028]/20 bg-[#E60028]/8 p-3 text-sm font-semibold text-[#B00020]">
          {resendError}
        </p>
      )}
      <div className="mt-6 grid gap-3">
        <button
          type="button"
          disabled={isResending}
          className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-[#E60028] to-[#c90022] px-5 text-sm font-bold text-white shadow-lg shadow-[#E60028]/25 transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:from-[#B8BBC8] disabled:to-[#9FA3B2]"
          onClick={onResend}
        >
          {isResending && (
            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          Resend verification
        </button>
        <Link
          href="/login"
          className="inline-flex h-12 items-center justify-center rounded-full border border-black px-5 text-sm font-bold text-black transition hover:bg-black hover:text-white"
        >
          Back to login
        </Link>
      </div>
    </>
  );
}

function StepIndicator({ state }: { state: VerifyState }) {
  const steps = ["Register", "Verify email", "Activated"];
  const activeStep = state === "success" ? 3 : 2;

  return (
    <div className="animate-fade-up animate-delay-225 mt-10 grid max-w-lg gap-3 sm:grid-cols-3">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= activeStep;

        return (
          <div
            key={step}
            className={`rounded-lg border p-4 backdrop-blur ${
              isActive ? "border-white/35 bg-white/14" : "border-white/12 bg-white/6"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-white/75">Step {stepNumber}</p>
            <p className="mt-1 text-sm font-bold text-white">{step}</p>
          </div>
        );
      })}
    </div>
  );
}
