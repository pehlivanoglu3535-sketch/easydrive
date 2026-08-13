"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";

/** Dokunmatik/fare ile dijital imza; base64 data URL'i gizli input'a yazar. */
export function SignaturePad({ name, hint = "Müşteri buraya imzalar", done = "İmza alındı ✓", clear = "Temizle" }: { name: string; hint?: string; done?: string; clear?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [value, setValue] = useState("");
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // yüksek çözünürlük
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f172a";

    const pos = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const down = (e: PointerEvent) => { drawing.current = true; const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); canvas.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => { if (!drawing.current) return; const p = pos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
    const up = () => { if (!drawing.current) return; drawing.current = false; setValue(canvas.toDataURL("image/png")); };

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointerleave", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointerleave", up);
    };
  }, []);

  function clearPad() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setValue("");
  }

  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <canvas ref={canvasRef} className="h-40 w-full touch-none rounded-lg border border-dashed border-slate-300 bg-white" />
      <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
        <span>{value ? done : hint}</span>
        <button type="button" onClick={clearPad} className="inline-flex items-center gap-1 hover:text-slate-700"><Eraser size={13} /> {clear}</button>
      </div>
    </div>
  );
}
