"use client";
import type { Player } from "@/lib/types";
import {
  Radar as ReRadar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { RADAR_AXES } from "@/lib/radar/radarAttributes"; // should be the CSV's exact headers: e.g. ["Pace","Shooting","Passing",...]

// --- theme -----------------------------------------------------------------
const AXIS_COLOR = "#93c5fd";
const GRID_COLOR = "#34d399";
const POLY_STROKE = "#60a5fa";
const POLY_FILL = "#60a5fa";
const TOOLTIP_BG = "#0b1020";
const TOOLTIP_FG = "#e5e7eb";



function readValue(p: Player, key: string): number | null {
  const lower = key.toLowerCase().replace(/\s+/g, "").replace(/_/g, ""); // PATCH: normalize
  const attrs = Object.fromEntries(
    Object.entries(p.attributes || {}).map(([k, v]) => [
      k.toLowerCase().replace(/\s+/g, "").replace(/_/g, ""),
      v,
    ])
  );

  const val =
    attrs[lower] ??
    (typeof (p as any)[key] === "number" ? (p as any)[key] : undefined);

  if (typeof val !== "number" || isNaN(val)) return null;
  return Math.max(0, Math.min(100, val ));
}


function nameOf(p: Player): string {
  const first = (p as any).FirstName ?? (p as any).firstName;
  const last = (p as any).LastName ?? (p as any).lastName;
  const combined = [first, last].filter(Boolean).join(" ");
  return combined || (p as any).Name || (p as any).name || "—";
}

export default function RadarSection({ player }: { player: Player }) {
  const role = player.position?.toUpperCase() ?? "DEFAULT";
  const axes =
    role === "GK"
      ? RADAR_AXES.GK
      : RADAR_AXES.DEFAULT;
  const data = axes
    .map((axis) => {
      const value = readValue(player, axis);
      return value === null ? null : { axis, value };
    })
    .filter((x): x is { axis: string; value: number } => x !== null);

  const usable = data.length >= 2;

  return (
    <div className="w-full" style={{ minHeight: 280 }}>
      <h3 className="mb-2 text-sm font-medium">{nameOf(player)}</h3>

      {!usable && (
        <div className="text-xs text-muted-foreground">
          Not enough numeric data for a radar.
        </div>
      )}

      {usable && (
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <RadarChart data={data}>
              <PolarGrid stroke={GRID_COLOR} />
              <PolarAngleAxis dataKey="axis" tick={{ fill: AXIS_COLOR }} />
              <PolarRadiusAxis domain={[0, 100]} stroke={GRID_COLOR} tick={{ fill: AXIS_COLOR }} />
              <Tooltip
                contentStyle={{ backgroundColor: TOOLTIP_BG, borderColor: GRID_COLOR }}
                labelStyle={{ color: TOOLTIP_FG }}
                itemStyle={{ color: TOOLTIP_FG }}
              />
              <ReRadar
                name={nameOf(player)}
                dataKey="value"
                stroke={POLY_STROKE}
                fill={POLY_FILL}
                strokeOpacity={0.9}
                fillOpacity={0.25}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
