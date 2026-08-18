// TeamRadarSection.tsx
import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import { RADAR_AXES } from "@/lib/radar/radarAttributes";
import type { OppRow } from "@/lib/types";

const AXIS_COLOR = "#93c5fd";
const GRID_COLOR = "#34d399";
const POLY_STROKE = "#60a5fa";
const POLY_FILL = "#60a5fa";
const TOOLTIP_BG = "#0b1020";
const TOOLTIP_FG = "#e5e7eb";

const humanize = (k: string) =>
  k.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

const toNumber = (v: unknown) => {
  if (v === null || v === undefined) return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

const clamp0100 = (n: number) => (n < 0 ? 0 : n > 100 ? 100 : n);

const isGK = (p: OppRow) =>
  (p.position ?? "").toUpperCase() === "GK" ||
  (p.slot ?? "").toUpperCase() === "1";

/** Returns the GK’s single goalkeeping value. */
function getGoalkeepingValueFromGK(players: OppRow[]): number | null {
  const keeper = players.find(isGK);
  if (!keeper) return null;

  const attrs = keeper.attributes ?? {};
  const gk =
    toNumber(attrs.goalkeeping) ??
    toNumber(attrs.goalkeepingavg) ??
    null;

  if (gk !== null) return clamp0100(gk * (gk <= 1 ? 100 : 1));
  return null;
}

export function TeamRadarSection({ players }: { players: OppRow[] }) {
  const data = useMemo(() => {
    // ✅ Filter out individual GK metrics from the main axes list
    const baseAxes: string[] = (Array.isArray(RADAR_AXES)
      ? RADAR_AXES
      : Object.values(RADAR_AXES).flat()
    ).filter(
      (attr) => !attr.toLowerCase().startsWith("gk") // remove GK submetrics
    );

    const results: { attr: string; value: number }[] = [];

    baseAxes.forEach((attr) => {
      let total = 0;
      let count = 0;

      players.forEach((p) => {
        const val = p.attributes?.[attr.toLowerCase()];
        const num = toNumber(val);
        if (num !== null) {
          total += clamp0100(num * (num <= 1 ? 100 : 1));
          count += 1;
        }
      });

      if (count > 0) {
        results.push({
          attr: humanize(attr),
          value: Math.round(total / count),
        });
      }
    });

    // ✅ Add the goalkeeper’s single “Goalkeeping” axis
    const gkValue = getGoalkeepingValueFromGK(players);
    if (gkValue !== null) {
      results.push({ attr: "Goalkeeping", value: Math.round(gkValue) });
    }

    return results;
  }, [players]);

  if (!data.length) return null;

  return (
    <div className="mt-4 h-64 w-full">
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid stroke={GRID_COLOR} />
          <PolarAngleAxis
            dataKey="attr"
            tick={{ fill: AXIS_COLOR, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            tick={{ fill: AXIS_COLOR, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            stroke={AXIS_COLOR}
          />
          <Tooltip
            wrapperStyle={{ border: "1px solid #1e293b" }}
            contentStyle={{ background: TOOLTIP_BG, color: TOOLTIP_FG }}
            labelStyle={{ color: "#a5b4fc" }}
            itemStyle={{ color: "#86efac" }}
          />
          <Radar
            name="Team"
            dataKey="value"
            stroke={POLY_STROKE}
            fill={POLY_FILL}
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
