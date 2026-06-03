"use client";

import Link from "next/link";
import { useLanguage } from "@/features/i18n/context/LanguageContext";
import { BrandMark } from "./BrandMark";

const footerCopy = {
  en: {
    tagline: "A modern space for knowledge discovery.",
    copyright: "© 2026 The Athenaeum. Built with Next.js and Spring Boot.",
    groups: [
      { title: "Explore", links: ["Books", "Categories", "Authors", "Borrowing Guide"] },
      { title: "Account", links: ["Login", "Register", "My Loans", "Reservations"] },
      { title: "System", links: ["About", "Notices", "Contact", "Help Desk"] },
    ],
  },
  vi: {
    tagline: "Không gian hiện đại cho hành trình khám phá tri thức.",
    copyright: "© 2026 The Athenaeum. Xây dựng với Next.js và Spring Boot.",
    groups: [
      { title: "Khám phá", links: ["Sách", "Danh mục", "Tác giả", "Hướng dẫn mượn"] },
      { title: "Tài khoản", links: ["Đăng nhập", "Đăng ký", "Sách đang mượn", "Đặt giữ"] },
      { title: "Hệ thống", links: ["Giới thiệu", "Thông báo", "Liên hệ", "Quầy hỗ trợ"] },
    ],
  },
};

export function Footer() {
  const { locale } = useLanguage();
  const copy = footerCopy[locale];

  return (
    <footer className="bg-[linear-gradient(135deg,#050505_0%,#171717_70%,#2d2d2d_100%)] text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.4fr_2fr] lg:px-8">
        <div className="space-y-4">
          <BrandMark />
          <p className="max-w-md text-sm leading-6 text-white/75">
            {copy.tagline}
          </p>
          <p className="text-sm text-white/60">{copy.copyright}</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {copy.groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-bold uppercase tracking-wide text-white">{group.title}</h3>
              <div className="mt-4 grid gap-2">
                {group.links.map((link) => (
                  <Link key={link} href="#" className="text-sm text-white/75 transition hover:text-white">
                    {link}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
