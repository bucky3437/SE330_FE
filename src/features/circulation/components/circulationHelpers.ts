export function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export function money(value?: number | null) {
  return typeof value === "number" ? value.toLocaleString("en-US", { style: "currency", currency: "USD" }) : "-";
}

export function recordId(record: { id?: number; borrowId?: number; holdId?: number; fineId?: number }) {
  return String(record.id ?? record.borrowId ?? record.holdId ?? record.fineId ?? "");
}

export function titleOf(record: { title?: string; bookTitle?: string }) {
  return record.bookTitle ?? record.title ?? "Untitled";
}
