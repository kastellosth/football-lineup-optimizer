/**
 * Math and normalization utilities
 */


export const clamp01 = (x: number): number => {
  return x < 0 ? 0 : x > 1 ? 1 : x;
};

export const norm = (val: unknown): number => {
  const n = Number(String(val ?? "").replace(",", "."));
  return clamp01(Number.isFinite(n) ? n / 100 : 0);
};


export const normalizeToPercent = (value: number, max: number = 100): number => {
  return Math.min(100, Math.max(0, (value / max) * 100));
};