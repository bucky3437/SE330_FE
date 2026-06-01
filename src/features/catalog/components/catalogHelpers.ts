import { Author, Book, Category } from "../types/catalog.type";

export function authorLabel(author: Author | string) {
  return typeof author === "string" ? author : author.name;
}

export function categoryLabel(category?: Category | string | null) {
  if (!category) return "Uncategorized";
  return typeof category === "string" ? category : category.name;
}

export function bookIdOf(book: Book) {
  return String(book.bookId ?? book.id ?? "");
}

export function availabilityLabel(book: Book) {
  const available = book.availableCopies ?? 0;
  const total = book.totalCopies ?? 0;
  return `${available} / ${total}`;
}

export function availabilityTone(book: Book) {
  return (book.availableCopies ?? 0) > 0
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : "bg-rose-50 text-rose-700 ring-rose-200";
}

export function entityIdOf(entity: { id?: number; bookId?: number; authorId?: number; categoryId?: number | null; copyId?: number }) {
  return String(entity.id ?? entity.bookId ?? entity.authorId ?? entity.categoryId ?? entity.copyId ?? "");
}
