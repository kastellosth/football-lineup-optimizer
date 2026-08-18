import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
interface PitchPlayerProps {
  name: string;
  position: string;
  slot: string;
  isOpponent?: boolean;
  style?: React.CSSProperties;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
            ? "bg-red-500 text-white border-red-700"
            : "bg-blue-500 text-white border-blue-700"
        )}
      >
        {slot}
      </div>
      <div className="mt-1 space-y-0.5 min-w-0">
        <div className="font-semibold text-[10px] text-white truncate max-w-16 drop-shadow-md">
          {name.split(" ").slice(-1)[0]}
        </div>
        <div className="text-[9px] text-gray-200 drop-shadow">{position}</div>
      </div>
    </div>
  );
}

interface FootballPitchProps {
  myLineup?: Array<{
    player: { name: string; position: string };
    slot: string;
    cost: number;
    effectiveness: number;
  }>;
  className?: string;
  title?: string;
  formation?: string;
  isOpponent?: boolean;
}

export function FootballPitch({
  myLineup,
  className,
  title,
  formation = "4-3-3",
  isOpponent = false,
}: FootballPitchProps) {
  const slotAliases: Record<string, string> = {
    "1": "GK",
    "2": "RB",
    "3": "CB1",
    "4": "CB2",
    "5": "RB",
    "6": "CM1",
    "7": "LW",
    "8": "CM2",
    "9": "ST",
    "10": "CAM",
    "11": "RW",
    "LCB": "CB1",
    "RCB": "CB2",
    "CB3": "CB2",
    "CB": "CB2",
    "LCM": "CM1",
    "RCM": "CM2",
    "CM3": "CM2",
    "LCDM": "CDM1",
    "RCDM": "CDM2",
    "LS": "ST1",
    "RS": "ST2",
    "LF": "ST2",
    "3L": "CB1",
    "2R": "CB2",
    "5LWB": "LWB",
    "7RWB": "RWB",
    "7R": "RW",
    "11L": "LW",
    "10L": "LW",
    "11R": "RW",
  };

  const formationPositionMap: Record<
    string,
    Record<string, { top: string; left: string }>
  > = {
    "4-3-3": {
      "GK": { top: "90%", left: "50%" },
      "LB": { top: "75%", left: "20%" },
      "CB1": { top: "75%", left: "40%" },
      "CB2": { top: "75%", left: "60%" },
      "RB": { top: "75%", left: "80%" },
      "CM3": { top: "55%", left: "30%" },
      "CM2": { top: "55%", left: "70%" },
      "CM1": { top: "55%", left: "50%" },
      "CAM": { top: "35%", left: "50%" },
      "LW": { top: "30%", left: "20%" },
      "ST": { top: "30%", left: "50%" },
      "RW": { top: "30%", left: "80%" },
    },
    "4-4-2": {
      "GK": { top: "90%", left: "50%" },
      "LB": { top: "75%", left: "20%" },
      "CB1": { top: "75%", left: "40%" },
      "CB2": { top: "75%", left: "60%" },
      "RB": { top: "75%", left: "80%" },
      "LM": { top: "55%", left: "20%" },
      "CM1": { top: "55%", left: "40%" },
      "LCM": { top: "55%", left: "40%" },
      "CM2": { top: "55%", left: "60%" },
      "RCM": { top: "55%", left: "60%" },
      "RM": { top: "55%", left: "80%" },
      "ST1": { top: "30%", left: "35%" },
      "ST2": { top: "30%", left: "65%" },
      "RS": { top: "30%", left: "65%" },
    },
    "4-2-3-1": {
      "GK": { top: "90%", left: "50%" },
      "LB": { top: "75%", left: "20%" },
      "CB1": { top: "75%", left: "40%" },
      "CB2": { top: "75%", left: "60%" },
      "RB": { top: "75%", left: "80%" },
      "CDM1": { top: "55%", left: "35%" },
      "CDM2": { top: "55%", left: "65%" },
      "CAM": { top: "35%", left: "50%" },
      "LAM": { top: "25%", left: "20%" },
      "ST": { top: "15%", left: "50%" },
      "RAM": { top: "25%", left: "80%" },
    },
       "3-5-2": {
      "GK": { top: "90%", left: "50%" },
      "CB2": { top: "70%", left: "25%" },
      "CB1": { top: "70%", left: "50%" },
      "CB3": { top: "70%", left: "75%" },
      "LWB": { top: "45%", left: "10%" },
      "CM1": { top: "45%", left: "50%" },
      "CM2": { top: "45%", left: "70%" },
      "CAM": { top: "45%", left: "30%" },
      "RWB": { top: "45%", left: "90%" },
      "ST1": { top: "20%", left: "40%" },
      "ST2": { top: "20%", left: "60%" },
    },
    "5-3-2": {
      "GK": { top: "90%", left: "50%" },
      "LWB": { top: "75%", left: "15%" },
      "CB1": { top: "75%", left: "35%" },
      "CB2": { top: "75%", left: "50%" },
      "CB3": { top: "75%", left: "65%" },
      "RWB": { top: "75%", left: "85%" },
      "CM1": { top: "55%", left: "30%" },
      "CM2": { top: "55%", left: "70%" },
      "CM3": { top: "55%", left: "50%" },
      "ST1": { top: "30%", left: "70%" },
      "ST2": { top: "30%", left: "30%" },
    },
    "3-4-3": {
      "GK": { top: "90%", left: "50%" },
      "LCB": { top: "75%", left: "25%" },
      "CB1": { top: "75%", left: "25%" },
      "CB": { top: "75%", left: "50%" },
      "CB2": { top: "75%", left: "50%" },
      "RCB": { top: "75%", left: "75%" }
      ,"LWB": { top: "55%", left: "20%" },
      "CB3": { top: "75%", left: "75%" },
      "CM1": { top: "55%", left: "40%" },
      
      "CM2": { top: "55%", left: "60%" },
      "RWB": { top: "55%", left: "80%" },
      "LW": { top: "35%", left: "20%" },
      "ST": { top: "35%", left: "50%" },
      "RW": { top: "35%", left: "80%" },
    },
    "4-5-1": {
      "GK": { top: "90%", left: "50%" },
      "LB": { top: "75%", left: "20%" },
      "CB1": { top: "75%", left: "40%" },
      "CB2": { top: "75%", left: "60%" },
      "RB": { top: "75%", left: "80%" },
      "LM": { top: "45%", left: "10%" },
      "CM1": { top: "45%", left: "70%" },
      "CM3": { top: "45%", left: "30%" },
      "CM2": { top: "45%", left: "50%" },
      "RM": { top: "45%", left: "90%" },
      "ST": { top: "25%", left: "50%" },
    },
  };

  const positionMap = formationPositionMap[formation] ?? formationPositionMap["4-3-3"];

  return (
    <div className={cn("bg-card rounded-lg shadow-lg border", className)}>
      {title && (
        <div className="p-3 border-b border-border bg-muted">
          <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        </div>
      )}
      <div className="p-4">
        <div className="relative w-full aspect-[16/10] bg-green-600 rounded-lg border-2 border-white overflow-hidden shadow-inner">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.3" />
            <circle cx="50" cy="50" r="8" fill="none" stroke="white" strokeWidth="0.5" />
            <rect x="35" y="0" width="30" height="16" fill="none" stroke="white" strokeWidth="0.5" />
            <rect x="35" y="84" width="30" height="16" fill="none" stroke="white" strokeWidth="0.3" />
            <rect x="42" y="0" width="16" height="6" fill="none" stroke="white" strokeWidth="0.3" />
            <rect x="42" y="94" width="16" height="6" fill="none" stroke="white" strokeWidth="0.3" />
          </svg>

          {myLineup?.map((p, index) => {
            const pos = positionMap[p.slot];
            if (!pos || !p.player || !p.player.name) return null;

            return (
              <PitchPlayer
                key={`${p.player.name}-${p.slot}-${index}`}
                name={p.player.name}
                position={p.player.position}
                slot={p.slot}
                isOpponent={isOpponent}
                style={{ top: pos.top, left: pos.left }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}