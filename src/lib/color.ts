// Marka renginden (hex) tema tonları üretir. Sunucu ve istemcide güvenli (saf fonksiyonlar).

function normalizeHex(hex: string): string {
  let h = (hex || "").trim();
  if (!h.startsWith("#")) h = "#" + h;
  if (/^#[0-9a-fA-F]{3}$/.test(h)) {
    h = "#" + h.slice(1).split("").map((c) => c + c).join("");
  }
  return /^#[0-9a-fA-F]{6}$/.test(h) ? h : "#4f46e5";
}

function hexToRgb(hex: string) {
  const n = parseInt(normalizeHex(hex).slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function toHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

/** hex'i target'a (siyah/beyaz) belirli oranda karıştırır. */
function mix(hex: string, target: string, amount: number) {
  const a = hexToRgb(hex);
  const b = hexToRgb(target);
  return toHex(
    a.r + (b.r - a.r) * amount,
    a.g + (b.g - a.g) * amount,
    a.b + (b.b - a.b) * amount
  );
}

/** Bir rengin okunabilirlik için yeterince koyu olup olmadığı (beyaz metin uyumu). */
export function isDark(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  // algılanan parlaklık (YIQ)
  return (r * 299 + g * 587 + b * 114) / 1000 < 150;
}

/**
 * Marka rengini CSS değişkenlerine çevirir. Panel/site kök elemanına
 * inline style olarak verilir; tüm .btn-primary, .nav-link-active,
 * input focus vb. bu değişkenleri kullanır.
 */
export function brandVars(hex: string): Record<string, string> {
  const base = normalizeHex(hex);
  const { r, g, b } = hexToRgb(base);
  return {
    "--brand": base,
    "--brand-600": base,
    "--brand-700": mix(base, "#000000", 0.16),
    "--brand-50": mix(base, "#ffffff", 0.9),
    "--ring": `rgba(${r}, ${g}, ${b}, 0.18)`,
  };
}
