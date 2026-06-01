"use client";

import type { ReactNode } from "react";

type CsvValue = string | number | boolean | null | undefined;

export type SortDirection = "asc" | "desc";

export function compareText(a: CsvValue, b: CsvValue, direction: SortDirection) {
  const left = String(a ?? "").toLowerCase();
  const right = String(b ?? "").toLowerCase();
  const result = left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
  return direction === "asc" ? result : -result;
}

export function downloadCsv(filename: string, headers: string[], rows: CsvValue[][]) {
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll("\"", "\"\"")}"`).join(","))
    .join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

export function SortableHeader({
  active,
  children,
  direction,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  direction: SortDirection;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg px-1 py-1 text-left font-bold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/70"
      aria-label={`Sort by ${String(children)}${active ? `, currently ${direction === "asc" ? "ascending" : "descending"}` : ""}`}
    >
      <span>{children}</span>
      <span aria-hidden="true" className={`text-xs transition ${active ? "opacity-100" : "opacity-45"}`}>
        {active && direction === "desc" ? "↓" : "↑"}
      </span>
    </button>
  );
}
