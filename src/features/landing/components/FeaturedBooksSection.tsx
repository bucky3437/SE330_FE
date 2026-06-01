"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Book } from "@/features/catalog/types/catalog.type";
import { getBooks } from "@/features/catalog/services/catalogService";
import { authorLabel, availabilityLabel, bookIdOf, categoryLabel } from "@/features/catalog/components/catalogHelpers";

const FEATURED_BOOKS_LIMIT = "3";

export function FeaturedBooksSection() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getBooks({ page: "0", size: FEATURED_BOOKS_LIMIT })
      .then((bookPage) => {
        if (isMounted) {
          setBooks(bookPage.items.slice(0, 3));
        }
      })
      .catch(() => {
        if (isMounted) {
          setBooks([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="bg-white px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="animate-fade-up flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-serif text-3xl font-bold text-[#000054]">New and Featured Books</h2>
            <p className="mt-3 max-w-2xl leading-7 text-[#333333]">
              Recently highlighted resources from core library categories.
            </p>
          </div>
          <Link
            href="/books"
            className="rounded-full border-2 border-[#D9DCE8] px-5 py-2.5 text-sm font-bold text-[#337AB7] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#337AB7] hover:bg-[#337AB7] hover:text-white hover:shadow-md hover:shadow-[#337AB7]/20"
          >
            View all books
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => <FeaturedBookSkeleton key={index} />)
            : books.map((book, index) => <FeaturedBookCard key={bookIdOf(book) || book.isbn} book={book} index={index} />)}
        </div>
      </div>
    </section>
  );
}

function FeaturedBookCard({ book, index }: { book: Book; index: number }) {
  const bookId = bookIdOf(book);

  return (
    <article
      className={`animate-fade-up group overflow-hidden rounded-xl border border-[#EDEDF2] bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#337AB7]/40 hover:shadow-xl ${
        index === 0 ? "animate-delay-75" : index === 1 ? "animate-delay-150" : "animate-delay-225"
      }`}
    >
      <div className="relative h-32 overflow-hidden bg-gradient-mesh p-5 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#000054] via-[#337AB7] to-[#51D2FF] opacity-90" />
        <div className="relative">
          <p className="inline-flex rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wide backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-white/30">
            {categoryLabel(book.category)}
          </p>
        </div>
      </div>

      <div className="p-6">
        <h3 className="line-clamp-2 min-h-14 text-xl font-bold text-[#000054] transition-colors duration-300 group-hover:text-[#337AB7]">
          {book.title}
        </h3>
        <p className="mt-2 text-sm text-[#333333]">
          by {(book.authors ?? []).map(authorLabel).join(", ") || "Unknown author"}
        </p>

        <dl className="mt-5 grid gap-3 text-sm">
          <div className="flex justify-between border-t border-[#EDEDF2] pt-3">
            <dt className="font-semibold text-[#000054]">Availability</dt>
            <dd className="font-medium text-[#337AB7]">{availabilityLabel(book)} copies</dd>
          </div>
          <div className="flex justify-between border-t border-[#EDEDF2] pt-3">
            <dt className="font-semibold text-[#000054]">Language</dt>
            <dd>{book.language || "N/A"}</dd>
          </div>
        </dl>

        <Link
          href={bookId ? `/books/${bookId}` : "/books"}
          className="mt-6 inline-flex w-full justify-center rounded-full border-2 border-[#000054] px-4 py-3 text-sm font-bold text-[#000054] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#000054] hover:text-white hover:shadow-md hover:shadow-[#000054]/20"
        >
          View details
        </Link>
      </div>
    </article>
  );
}

function FeaturedBookSkeleton() {
  return (
    <article className="animate-pulse overflow-hidden rounded-xl border border-[#EDEDF2] bg-white shadow-sm">
      <div className="h-32 bg-[#EDEDF2]" />
      <div className="p-6">
        <div className="h-6 w-3/4 rounded bg-[#EDEDF2]" />
        <div className="mt-3 h-4 w-1/2 rounded bg-[#EDEDF2]" />
        <div className="mt-6 h-px bg-[#EDEDF2]" />
        <div className="mt-4 h-4 rounded bg-[#EDEDF2]" />
        <div className="mt-4 h-px bg-[#EDEDF2]" />
        <div className="mt-4 h-4 rounded bg-[#EDEDF2]" />
        <div className="mt-6 h-12 rounded-full bg-[#EDEDF2]" />
      </div>
    </article>
  );
}
