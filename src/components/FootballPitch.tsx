import React from "react";
import { cn } from "@/lib/utils/styleUtils";
import { Player } from "@/lib/types";
import type { OppRow } from "@/lib/types";

interface PitchPlayerProps {
  name: string;
  position: string;
  slot: string;
  isOpponent?: boolean;
  style?: React.CSSProperties;
}

function PitchPlayer({ name, position, slot, isOpponent, style }: PitchPlayerProps) {
  return (
    <div
      className={cn(
        "absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2",
        "text-xs text-center"
      )}
      style={style}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-medium border-2",
          isOpponent
            ? "bg-destructive text-destructive-foreground border-destructive-foreground/20"
            : "bg-success text-success-foreground border-success-foreground/20"
        )}
      >
        {slot}
      </div>
      <div className="mt-1 space-y-0.5 min-w-0">
        <div className="font-semibold text-[10px] text-black truncate max-w-16">
          {name.split(" ").slice(-1)[0]}
        </div>
        <div className="text-[9px] text-muted-foreground">{position}</div>
      </div>
    </div>
  );
}

interface FootballPitchProps {
  myLineup?: Array<{
    player: Player;
    slot: string;
    cost: number;
    effectiveness: number;
  }>;
  opponentLineup?: OppRow[];
  className?: string;
  title?: string;
  formation?: string;
}

export function FootballPitch({
  myLineup,
  opponentLineup,
  className,
  title,
  formation = "5-3-2",
}: FootballPitchProps) {
  // Complete formationPositionMap included here
  const formationPositionMap: Record<
    string,
    Record<string, { top: string; left: string }>
  > = {
    "4-3-3": {
      "1": { top: "90%", left: "50%" },
      "2": { top: "70%", left: "20%" },
      "3": { top: "70%", left: "40%" },
      "4": { top: "70%", left: "60%" },
      "5": { top: "70%", left: "80%" },
      "6": { top: "45%", left: "20%" },
      "7": { top: "45%", left: "80%" },
      "10": { top: "45%", left: "50%" },
      "8": { top: "20%", left: "20%" },
      "9": { top: "20%", left: "50%" },
      "11": { top: "20%", left: "80%" },
    },
    "4-4-2": {
      "1": { top: "90%", left: "50%" },
      "2": { top: "70%", left: "20%" },
      "3": { top: "70%", left: "40%" },
      "4": { top: "70%", left: "60%" },
      "5": { top: "70%", left: "80%" },
      "6": { top: "45%", left: "20%" },
      "8": { top: "45%", left: "40%" },
      "10": { top: "45%", left: "60%" },
      "11": { top: "45%", left: "80%" },
      "7": { top: "20%", left: "35%" },
      "9": { top: "20%", left: "65%" },
    },
    "4-2-3-1": {
      "1": { top: "90%", left: "50%" },
      "2": { top: "75%", left: "20%" },
      "3": { top: "75%", left: "40%" },
      "4": { top: "75%", left: "60%" },
      "5": { top: "75%", left: "80%" },
      "6": { top: "55%", left: "35%" },
      "8": { top: "55%", left: "65%" },
      "10": { top: "35%", left: "50%" },
      "7": { top: "35%", left: "20%" },
      "9": { top: "15%", left: "50%" },
      "11": { top: "35%", left: "80%" },
    },
    "3-5-2": {
      "1": { top: "90%", left: "50%" },
      "3": { top: "70%", left: "25%" },
      "4": { top: "70%", left: "50%" },
      "2": { top: "70%", left: "75%" },
      "6": { top: "45%", left: "30%" },
      "8": { top: "45%", left: "50%" },
      "11": { top: "45%", left: "70%" },
      "5": { top: "45%", left: "10%" },
      "7": { top: "45%", left: "90%" },
      "9": { top: "20%", left: "40%" },
      "10": { top: "20%", left: "60%" },
    },
    "5-3-2": {
      "1": { top: "90%", left: "50%" },
      "2": { top: "70%", left: "85%" },
      "3": { top: "70%", left: "65%" },
      "4": { top: "70%", left: "50%" },
      "5": { top: "70%", left: "35%" },
      "6": { top: "70%", left: "15%" },
      "7": { top: "45%", left: "65%" },
      "8": { top: "45%", left: "50%" },
      "9": { top: "45%", left: "35%" },
      "10": { top: "20%", left: "40%" },
      "11": { top: "20%", left: "60%" },
    },
    "3-4-3": {
      "1": { top: "90%", left: "50%" },
      "2": { top: "70%", left: "70%" },
      "3": { top: "70%", left: "50%" },
      "4": { top: "70%", left: "30%" },
      "5": { top: "45%", left: "85%" },
      "6": { top: "45%", left: "60%" },
      "7": { top: "45%", left: "40%" },
      "8": { top: "45%", left: "15%" },
      "9": { top: "20%", left: "75%" },
      "10": { top: "20%", left: "50%" },
      "11": { top: "20%", left: "25%" },
    },
    "4-5-1": {
      "1": { top: "90%", left: "50%" },
      "2": { top: "70%", left: "85%" },
      "3": { top: "70%", left: "60%" },
      "4": { top: "70%", left: "40%" },
      "5": { top: "70%", left: "15%" },
      "6": { top: "45%", left: "85%" },
      "7": { top: "45%", left: "65%" },
      "8": { top: "45%", left: "50%" },
      "11": { top: "45%", left: "35%" },
      "10": { top: "45%", left: "15%" },
      "9": { top: "20%", left: "50%" },
    },
  
};

const positionMap = formationPositionMap[formation] ?? {};

return (
  <div className={cn("bg-card rounded-lg shadow-card", className)}>
    {title && (
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
    )}
    <div className="p-4">
      <div className="relative w-full h-80 bg-pitch rounded-lg border-2 border-pitch-line overflow-hidden">
        {/* SVG Pitch */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <line x1="0" y1="50" x2="100" y2="50" stroke="hsl(var(--pitch-line))" strokeWidth="0.3" />
          <circle cx="50" cy="50" r="8" fill="none" stroke="hsl(var(--pitch-line))" strokeWidth="0.5" />
          <rect x="35" y="0" width="30" height="16" fill="none" stroke="hsl(var(--pitch-line))" strokeWidth="0.5" />
          <rect x="35" y="84" width="30" height="16" fill="none" stroke="hsl(var(--pitch-line))" strokeWidth="0.3" />
          <rect x="42" y="0" width="16" height="6" fill="none" stroke="hsl(var(--pitch-line))" strokeWidth="0.3" />
          <rect x="42" y="94" width="16" height="6" fill="none" stroke="hsl(var(--pitch-line))" strokeWidth="0.3" />
        </svg>

        {/* My lineup */}
        {myLineup?.map((p) => {
          const pos = positionMap[p.slot];
          if (!pos) return null;
          return (
            <PitchPlayer
              key={`${p.player.name}-${p.slot}`}
              name={p.player.name}
              position={p.player.position}
              slot={p.slot}
              style={{ top: pos.top, left: pos.left }}
            />
          );
        })}

        {/* Opponent lineup */}
        {opponentLineup?.map((p, i) => {
          const pos = positionMap[p.slot ?? ""];
          if (!pos) return null;
          const opponentTop = `${100 - parseFloat(pos.top)}%`;
          return (
            <PitchPlayer
              key={`${p.name}-${p.slot ?? i}`}
              name={p.name}
              position={p.position}
              slot={p.slot ?? ""}
              isOpponent
              style={{ top: opponentTop, left: pos.left }}
            />
          );
        })}
      </div>
    </div>
  </div>
);
}
