"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useLanguage } from "@/features/i18n/context/LanguageContext";

type CatalogShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
  protectedPage?: boolean;
  wide?: boolean;
  frameless?: boolean;
};

export function CatalogShell({ eyebrow, title, description, children, actions, protectedPage = false, wide = false, frameless = false }: CatalogShellProps) {
  return (
    <ProtectedGate enabled={protectedPage}>
      <div className="min-h-dvh bg-[#F8F9FA]">
        <Navbar />
        <main id="main-content" tabIndex={-1} className={`mx-auto min-h-[calc(100dvh-4.5rem)] w-full px-5 pt-6 pb-12 outline-none lg:px-8 ${wide ? "max-w-[calc(100vw-2rem)] 2xl:max-w-[1720px]" : "max-w-7xl"}`}>
          {frameless ? (
            <>
              <section className="px-1 py-5 md:px-2">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-[#337AB7]">{eyebrow}</p>
                    <h1 className="mt-3 text-4xl font-black tracking-tight text-[#111827] md:text-5xl">{title}</h1>
                    <p className="mt-3 max-w-3xl leading-7 text-[#333333]">{description}</p>
                  </div>
                  {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
                </div>
              </section>
              <div className="mt-4">{children}</div>
            </>
          ) : (
            <section className="rounded-2xl border border-[#EDEDF2] bg-white p-6 shadow-[0_24px_60px_rgba(7,7,88,0.08)] md:p-8">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-[#337AB7]">{eyebrow}</p>
                  <h1 className="mt-3 font-serif text-4xl font-bold text-[#000054]">{title}</h1>
                  <p className="mt-3 max-w-3xl leading-7 text-[#333333]">{description}</p>
                </div>
                {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
              </div>
              <div className="mt-8">{children}</div>
            </section>
          )}
        </main>
        <Footer />
      </div>
    </ProtectedGate>
  );
}

function ProtectedGate({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isInitializing, refresh } = useAuth();
  const { locale } = useLanguage();
  const [isRecoveringSession, setIsRecoveringSession] = useState(false);
  const copy = locale === "vi"
    ? {
        checking: "Đang kiểm tra phiên đăng nhập...",
        redirecting: "Đang chuyển đến trang đăng nhập...",
      }
    : {
        checking: "Checking your session...",
        redirecting: "Redirecting to login...",
      };

  useEffect(() => {
    if (!enabled || isInitializing || isAuthenticated) return;

    let isCancelled = false;
    const recoverTimerId = window.setTimeout(() => {
      if (!isCancelled) {
        setIsRecoveringSession(true);
      }
    }, 0);

    refresh()
      .then((result) => {
        if (!isCancelled && !result) {
          router.replace("/login");
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsRecoveringSession(false);
        }
      });

    return () => {
      isCancelled = true;
      window.clearTimeout(recoverTimerId);
    };
  }, [enabled, isAuthenticated, isInitializing, refresh, router]);

  if (!enabled) return children;

  if (isInitializing || isRecoveringSession) {
    return <AuthStatus message={copy.checking} />;
  }

  if (!isAuthenticated) {
    return <AuthStatus message={copy.redirecting} />;
  }

  return children;
}

function AuthStatus({ message }: { message: string }) {
  const { locale } = useLanguage();
  const copy = locale === "vi"
    ? { eyebrow: "Xác thực", backHome: "Về trang chủ" }
    : { eyebrow: "Authenticating", backHome: "Back home" };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F8F9FA] px-5">
      <div className="w-full max-w-md rounded-2xl border border-[#EDEDF2] bg-white p-8 text-center shadow-[0_24px_60px_rgba(7,7,88,0.14)]">
        <p className="text-sm font-bold uppercase tracking-wide text-[#337AB7]">{copy.eyebrow}</p>
        <h1 className="mt-3 font-serif text-3xl font-bold text-[#000054]">{message}</h1>
        <Link href="/" className="mt-5 inline-flex rounded-full border border-[#D9DCE8] px-4 py-2 text-sm font-bold text-[#000054]">
          {copy.backHome}
        </Link>
      </div>
    </main>
  );
}

export function PrimaryAction({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full bg-[#E60028] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#E60028]/20 transition hover:-translate-y-0.5"
    >
      {children}
    </Link>
  );
}

export function SecondaryAction({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-[#D9DCE8] px-5 py-3 text-sm font-bold text-[#000054] transition hover:border-[#337AB7] hover:text-[#E60028]"
    >
      {children}
    </Link>
  );
}

export function Notice({
  message,
  tone = "info",
  autoDismiss,
  duration = 30000,
}: {
  message: string;
  tone?: "info" | "error" | "success";
  autoDismiss?: boolean;
  duration?: number;
}) {
  return <DismissibleNotice key={`${tone}-${message}`} message={message} tone={tone} autoDismiss={autoDismiss} duration={duration} />;
}

function DismissibleNotice({
  message,
  tone = "info",
  autoDismiss,
  duration = 30000,
}: {
  message: string;
  tone?: "info" | "error" | "success";
  autoDismiss?: boolean;
  duration?: number;
}) {
  const [isMounted, setIsMounted] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const shouldDismiss = autoDismiss ?? tone !== "info";

  useEffect(() => {
    if (!shouldDismiss) return;

    const fadeTimerId = window.setTimeout(() => {
      setIsLeaving(true);
    }, duration);
    const removeTimerId = window.setTimeout(() => {
      setIsMounted(false);
    }, duration + 350);

    return () => {
      window.clearTimeout(fadeTimerId);
      window.clearTimeout(removeTimerId);
    };
  }, [duration, message, shouldDismiss, tone]);

  if (!isMounted) return null;

  const classes =
    tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-[#D9DCE8] bg-[#F8F9FA] text-[#333333]";

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-300 ease-out ${
        isLeaving ? "-translate-y-1 opacity-0" : "translate-y-0 opacity-100"
      } ${classes}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {message}
    </div>
  );
}
