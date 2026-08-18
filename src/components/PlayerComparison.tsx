import { Player } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Scale, BarChart3 } from "lucide-react";
import { getPositionColor } from "@/lib/utils/positionUtils";

interface PlayerComparisonProps {
  players: Player[];
  onRemove: (player: Player) => void;
  onClear: () => void;
}

const playerColors = [
  "bg-blue-500",
  "bg-red-500", 
  "bg-yellow-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500"
];

export function PlayerComparison({ players, onRemove, onClear }: PlayerComparisonProps) {
  if (players.length === 0) return null;

  const basicStats = [
    { key: "overall", label: "Overall" },
    { key: "pace", label: "Pace" },
    { key: "shooting", label: "Shooting" },
    { key: "passing", label: "Passing" },
    { key: "dribbling", label: "Dribbling" },
    { key: "defending", label: "Defending" },
    { key: "physicality", label: "Physicality" },
    { key: "goalkeeping", label: "Goalkeeping" }
  ];

  const getStatValue = (player: Player, statKey: string) => {
    if (statKey === "overall") return player.overall;
    const value = player.attributes?.[statKey];
    console.log(`Player: ${player.name}, Stat: ${statKey}, Value:`, value);
    return value || 0;
  };

  const getMaxStatValue = (statKey: string) => {
    return Math.max(...players.map(p => getStatValue(p, statKey)));
  };




  const analyzeForRole = (player: Player, role: string) => {
    const roleRequirements: Record<string, string[]> = {
      "Striker": ["finishing", "positioning", "shotpower", "pace"],
      "Winger": ["pace", "dribbling", "crossing", "stamina"],
      "CAM": ["passing", "vision", "ballcontrol", "dribbling"],
      "CM": ["passing", "stamina", "vision", "defensiveawareness"],
      "CDM": ["defensiveawareness", "standingtackle", "interceptions", "passing"],
      "CB": ["defensiveawareness", "standingtackle", "strength", "headingaccuracy"],
      "FB": ["pace", "stamina", "standingtackle", "crossing"],
    };

    const attrs = roleRequirements[role] || [];
    const scores = attrs.map(attr => player.attributes?.[attr] || 0);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    return Math.round(avg);
  };

  return (
    <Card className="card-gradient border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Player Comparison
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
          >
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Player Legend */}
        <div className="flex flex-wrap gap-4 pb-4 border-b border-border">
          {players.map((player, idx) => (
            <div key={player.shirtNumber} className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-lg">
              <div className={`w-4 h-8 rounded ${playerColors[idx]}`} />
              <div>
                <div className="font-semibold">{player.name}</div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge className={`${getPositionColor(player.position)} text-xs`}>
                    {player.position}
                  </Badge>
                  <span className="text-muted-foreground">#{player.shirtNumber}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(player)}
                className="h-6 w-6 p-0 ml-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Bar Chart Comparison */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <BarChart3 className="h-5 w-5" />
            Statistics Comparison
          </div>
          
          {basicStats.map((stat) => {
            const maxValue = getMaxStatValue(stat.key);
            
            return (
              <div key={stat.key} className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                <div className="space-y-2">
                  {players.map((player, idx) => {
                    const value = Math.round(getStatValue(player, stat.key));
                    const isBest = value === maxValue && value > 0;
                    
                    return (
                      <div key={player.shirtNumber} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded ${playerColors[idx]}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 h-8">
                            <div className="relative w-full bg-muted rounded-full h-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${playerColors[idx]} ${
                                  isBest ? 'opacity-100' : 'opacity-70'
                                }`}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                            <span className={`text-sm font-semibold min-w-[3ch] text-right ${
                              isBest ? 'text-green-500' : 'text-foreground'
                            }`}>
                              {value}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto border-t border-border pt-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground w-40">
                  Attribute
                </th>
                {players.map((player) => (
                  <th key={player.shirtNumber} className="text-center py-3 px-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{player.name}</span>
                      </div>
                      <Badge className={getPositionColor(player.position)}>
                        {player.position}
                      </Badge>
                      <Badge variant="outline">#{player.shirtNumber}</Badge>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Overall Rating */}
              <tr className="border-b border-border/50 bg-muted/10">
                <td className="py-3 px-4 font-semibold">Overall Rating</td>
                {players.map((player) => {
                  const maxOverall = Math.max(...players.map(p => p.overall));
                  const isBest = player.overall === maxOverall;
                  return (
                    <td key={player.shirtNumber} className="text-center py-3 px-4">
                      <span className={`text-xl font-bold ${isBest ? 'text-green-500' : 'text-foreground'}`}>
                        {Math.round(player.overall)}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Role Suitability Section */}
              <tr className="border-b border-border/50 bg-muted/20">
                <td className="py-3 px-4 font-semibold" colSpan={players.length + 1}>
                  Role Suitability
                </td>
              </tr>
              {["Striker", "Winger", "CAM", "CM", "CDM", "CB", "FB"].map(role => {
                const maxScore = Math.max(...players.map(p => analyzeForRole(p, role)));
                
                return (
                  <tr key={role} className="border-b border-border/50 hover:bg-muted/5">
                    <td className="py-2 px-4 text-sm text-muted-foreground">{role}</td>
                    {players.map(player => {
                      const score = analyzeForRole(player, role);
                      const isBest = score === maxScore && score > 0;
                      
                      return (
                        <td key={player.shirtNumber} className="text-center py-2 px-4">
                          <Badge 
                            variant={isBest ? "default" : "outline"}
                            className={isBest ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            {score}
                          </Badge>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}


            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}