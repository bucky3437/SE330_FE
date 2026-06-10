"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/features/i18n/context/LanguageContext";

const servicesCopy = {
  en: {
    title: "Library Services",
    description: "Access the essential tools you need to discover, borrow and manage library resources.",
    services: [
      ["01", "Find Books", "Search across titles, authors, categories and ISBNs."],
      ["02", "Borrowing Guide", "Learn loan limits, due dates and return rules."],
      ["03", "Reserve a Book", "Join the queue when a book is currently unavailable."],
      ["04", "My Library Account", "Track loans, reservations, notifications and fines."],
      ["05", "For Librarians", "Manage books, copies, members and borrowing records."],
      ["06", "Library Notices", "Stay updated with reminders and important announcements."],
    ],
  },
  vi: {
    title: "Dịch vụ thư viện",
    description: "Truy cập các công cụ cần thiết để tìm kiếm, mượn và quản lý tài nguyên thư viện.",
    services: [
      ["01", "Tìm sách", "Tìm theo tên sách, tác giả, danh mục và ISBN."],
      ["02", "Hướng dẫn mượn", "Nắm rõ giới hạn mượn, hạn trả và quy định hoàn trả."],
      ["03", "Đặt giữ sách", "Tham gia hàng đợi khi sách hiện chưa có sẵn."],
      ["04", "Tài khoản thư viện", "Theo dõi sách mượn, đặt giữ, thông báo và phí phạt."],
      ["05", "Dành cho thủ thư", "Quản lý sách, bản sao, thành viên và hồ sơ mượn trả."],
      ["06", "Thông báo thư viện", "Cập nhật nhắc nhở và các thông báo quan trọng."],
    ],
  },
};

export function LibraryServicesSection() {
  const { locale } = useLanguage();
  const copy = servicesCopy[locale];
  const sectionRef = useRef<HTMLElement | null>(null);
  const [hasEnteredView, setHasEnteredView] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (!("IntersectionObserver" in window)) {
      const fallbackTimerId = globalThis.setTimeout(() => setHasEnteredView(true), 0);
      return () => globalThis.clearTimeout(fallbackTimerId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEnteredView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.22,
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="overflow-x-hidden bg-gradient-to-b from-[#F8F9FA] to-white px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="animate-fade-up max-w-2xl">
          <h2 className="font-serif text-3xl font-bold text-[#000054]">{copy.title}</h2>
          <p className="mt-3 leading-7 text-[#333333]">
            {copy.description}
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {copy.services.map(([index, title, description], serviceIndex) => (
            <article
              key={title}
              className={`group relative overflow-hidden rounded-xl border border-[#EDEDF2] bg-white p-7 shadow-sm transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:border-[#337AB7]/40 hover:shadow-lg ${
                hasEnteredView
                  ? "translate-x-0 opacity-100"
                  : serviceIndex < 3
                    ? "-translate-x-24 opacity-0"
                    : "translate-x-24 opacity-0"
              } ${
                serviceIndex === 0
                  ? "delay-75"
                  : serviceIndex === 1
                    ? "delay-150"
                    : serviceIndex === 2
                      ? "delay-[225ms]"
                      : serviceIndex === 3
                        ? "delay-75"
                        : serviceIndex === 4
                          ? "delay-150"
                          : "delay-[225ms]"
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
