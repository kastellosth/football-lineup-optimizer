import Papa from "papaparse";
import { Player } from "@/lib/types";

// Normalizes a value to 0-100 range, handling both 0-1 and 0-100 scales
const normalize = (v: unknown): number => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;

  if (n > 1) {
    return Math.min(100, Math.max(0, n));
  } else {
    return Math.min(100, Math.max(0, n));
  }
};

// Parses CSV text into an array of Player objects with normalized attributes (0-100 scale)
export function parseCSVToPlayers(csvText: string): Player[] {
  const parsed = Papa.parse<string[]>(csvText.trim(), { skipEmptyLines: true });
  const rows = parsed.data as string[][];

  if (!rows.length) return [];


  const header = rows[0].map((h) =>
    h.trim().toLowerCase().replace(/[\s_]+/g, "")
  );

  const players: Player[] = [];

  for (const [i, row] of rows.entries()) {
    if (i === 0) continue;

    const val = (key: string) => {
      const idx = header.indexOf(key.toLowerCase());
      return idx >= 0 ? row[idx] : "";
    };

    const formationValue = val("formation");
    const name = [val("firstname"), val("lastname")].filter(Boolean).join(" ").trim();
    if (!name) continue;

    const player: Player = {
      name,
      shirtNumber: Number(val("shirtnumber")) || 0,
      nationality: val("nationality"),
      position: val("primaryposition"),
      slot: val("slot") || undefined,
      bestFoot: (val("bestfoot") as "Left" | "Right" | undefined) || undefined,
      height: Number(val("heightcm")) || undefined,
      weight: Number(val("weightkg")) || undefined,
      overall: Number(val("overall")) || 0,
      team: val("team") || undefined, 
      attributes: {},
      formation: formationValue || undefined,
    };

    const attributeKeys = [
      "pace", "shooting", "physicality", "dribbling", "passing", "defending","goalkeeping",
      "acceleration", "sprintspeed",
      "positioning", "finishing", "volleys", "penalties", "shotpower", "longshots",
      "vision", "curve", "longpassing", "shortpassing", "freekickaccuracy", "crossing",
      "agility", "reactions", "composure", "balance", "ballcontrol", "dribbling",
      "interceptions", "headingaccuracy", "defensiveawareness", "standingtackle", "slidingtackle",
      "jumping", "stamina", "strength", "aggression",
      "gkdiving", "gkhandling", "gkkicking", "gkreflexes", "gkpositioning",
    ];

    player.attributes = Object.fromEntries(
      attributeKeys.map((key) => [key, normalize(val(key))])
    );

    players.push(player);
  }

  console.log(`Parsed ${players.length} players (attributes in 0-100 scale)`);

  if (players.length > 0) {
    const sample = players[0];
    console.log(`Sample: ${sample.name} - Pace: ${sample.attributes.pace}, Overall: ${sample.overall}`);
  }

  return players;
}