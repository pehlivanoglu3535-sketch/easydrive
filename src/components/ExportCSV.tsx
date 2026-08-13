"use client";

import { Download } from "lucide-react";

export function ExportCSV({ rows, filename = "rapor.csv", label = "CSV İndir" }: {
  rows: Record<string, string | number>[];
  filename?: string;
  label?: string;
}) {
  function download() {
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const esc = (v: string | number) => {
      const s = String(v ?? "");
      return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [headers.join(";"), ...rows.map((r) => headers.map((h) => esc(r[h])).join(";"))].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <button type="button" onClick={download} className="btn-outline btn-sm" disabled={rows.length === 0}>
      <Download size={14} /> {label}
    </button>
  );
}
