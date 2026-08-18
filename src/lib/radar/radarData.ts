import { RADAR_AXES, axisLabel } from "@/lib/radar/radarAttributes";

 const clamp = (v: unknown) => {
  const n = Number.isFinite(Number(v)) ? Math.round(Number(v)) : 0;
  return Math.max(0, Math.min(100, n));
};

export type RadarPoint = { axis: string; value: number; key: string };

// Builds radar chart data points from player attributes based on position 
export function buildRadarData(
  p: Record<string, unknown> & { position?: string }
): RadarPoint[] {

  const role = p.position?.toUpperCase() === "GK" ? "GK" : "DEFAULT";
  const axes =
    Array.isArray(RADAR_AXES)
      ? RADAR_AXES
      : RADAR_AXES[role] ?? RADAR_AXES.DEFAULT;
  return axes.map((k) => {
    const val = (p as any).attributes?.[k.toLowerCase()] ?? (p as any)[k];
    const clamped = clamp(Number(val) * (val <= 1 ? 100 : 1)); 
    return {
      key: k,
      axis: axisLabel(k),
      value: clamped,
    };
  });
}