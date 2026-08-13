"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label = "Yazdır", className = "btn-primary" }: { label?: string; className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      <Printer size={16} /> {label}
    </button>
  );
}
