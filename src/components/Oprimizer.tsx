import React, { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FootballPitch } from "@/components/pitch";
import { OptimizerControls } from "@/components/OptimizerControls";
import { useCSVImport } from "@/lib/hooks";
import { parseCSVToPlayers } from "@/lib/parsers/parser";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import {
  formationProfiles,
  normalizeFormation,
  mapOpponentToFormation,
  evaluateFormation,
  OptimizerConfig,
  DEFAULT_CONFIG,
} from "@/lib/engine";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));


const getTeamName = (players: any[], fallback: string): string => {
  if (players.length === 0) return fallback;
  const teamNames = players.map(p => p.team).filter(Boolean);
  return teamNames.length > 0 ? teamNames[0] : fallback;
};

export function Optimizer() {
  const myTeam = useCSVImport<any>();
  const oppTeam = useCSVImport<any>();

  const [results, setResults] = useState<any[]>([]);
  const [bestFormation, setBestFormation] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const myRef = useRef<HTMLInputElement>(null);
  const oppRef = useRef<HTMLInputElement>(null);

  const [parserLogs, setParserLogs] = useState<string[]>([]);
  const [detectedFormation, setDetectedFormation] = useState<string | null>(null);
  const [viewingFormation, setViewingFormation] = useState<any | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [config, setConfig] = useState<OptimizerConfig>(DEFAULT_CONFIG);

  const detectFormation = (players: any[]): string | null => {
    if (players.length === 0) return null;

    const firstPlayer = players[0];

    if (firstPlayer.formation) {
      console.log(`Formation found in CSV: ${firstPlayer.formation}`);
      return firstPlayer.formation;
    }

    console.warn("No formation column found in CSV, using default 4-3-3");
    return "4-3-3";
  };

  const onImportMyTeam = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const text = await file.text();
      const players = parseCSVToPlayers(text);

      if (!players || players.length === 0) {
        throw new Error("No players found in CSV file");
      }

      const hasAttributes = players.some(p => p.attributes && Object.keys(p.attributes).length > 0);
      if (!hasAttributes) {
        throw new Error("Players are missing attribute data");
      }

      myTeam.setData(players);

      setParserLogs((prev) => [
        ...prev,
        `Loaded ${players.length} players for My Team.`,
      ]);

    } catch (err) {
      console.error("CSV Import Error:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to parse CSV file";
      setError(`My Team: ${errorMsg}`);
      setParserLogs((prev) => [
        ...prev,
        `ERROR My Team: ${errorMsg}`,
      ]);
    }
  };

  const onImportOppTeam = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const text = await file.text();
      const players = parseCSVToPlayers(text);

      if (!players || players.length === 0) {
        throw new Error("No players found in CSV file");
      }

      const hasAttributes = players.some(p => p.attributes && Object.keys(p.attributes).length > 0);
      if (!hasAttributes) {
        throw new Error("Players are missing attribute data");
      }

      oppTeam.setData(players);

      const formation = detectFormation(players);
      setDetectedFormation(formation);

      const formationSource = players[0]?.formation
        ? "from CSV column"
        : "(auto-detected)";

      setParserLogs((prev) => [
        ...prev,
        `Loaded ${players.length} players for Opponent.`,
        `Formation: ${formation} ${formationSource}`,
      ]);

      console.log("First player data:", players[0]);

    } catch (err) {
      console.error("CSV Import Error:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to parse CSV file";
      setError(`Opponent: ${errorMsg}`);
      setParserLogs((prev) => [
        ...prev,
        `ERROR Opponent: ${errorMsg}`,
      ]);
    }
  };

  const runOptimizer = async () => {
    if (!myTeam.data.length || !oppTeam.data.length) {
      setError("Please upload both teams first!");
      return;
    }

    if (myTeam.data.length < 11) {
      setError(`My Team needs at least 11 players (currently ${myTeam.data.length})`);
      return;
    }

    if (!detectedFormation) {
      setError("Could not detect opponent formation. Please check your CSV!");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setResults([]);
      setBestFormation(null);
      setParserLogs((prev) => [...prev, "Starting tactical analysis..."]);

      console.clear();
      console.log("Starting tactical analysis...");

      const formationsToTest = ["3-5-2", "4-4-2", "4-3-3", "4-2-3-1", "3-4-3", "4-5-1", "5-3-2"];
      const tested: any[] = [];

      for (const id of formationsToTest) {
        const formation = formationProfiles.find((f) => f.id === id);
        if (!formation) {
          console.warn(`Formation ${id} not found in formationProfiles`);
          continue;
        }

        setParserLogs((prev) => [...prev, `Evaluating ${id}...`]);

        try {
          const res = evaluateFormation(
            myTeam.data,
            oppTeam.data,
            formation,
            detectedFormation,
            config
          );

          if (res) {
            tested.push(res);

            setParserLogs((prev) => [
              ...prev,
              `${id}: Score ${res.totalScore.toFixed(2)} ` +
              `(Counter: ${res.counterAdvantage > 0 ? '+' : ''}${res.counterAdvantage?.toFixed(1) || '0.0'}, ` 
              
            ]);
          } else {
            console.warn(`Formation ${id} returned null - skipping`);
            setParserLogs((prev) => [...prev, `⚠️ ${id}: Skipped`]);
          }
        } catch (formationError) {
          console.error(`Error evaluating formation ${id}:`, formationError);
          setParserLogs((prev) => [...prev, `${id}: Error`]);
        }

        await sleep(400);
      }

      if (!tested.length) {
        throw new Error(
          "No formations could be evaluated. Please check your player data and try again."
        );
      }

      tested.sort((a, b) => b.totalScore - a.totalScore);
      setResults(tested);
      setBestFormation(tested[0]);

      // Get team names safely using helper function
      const yourTeamName = getTeamName(myTeam.data, "Your Team");
      const opponentTeamName = getTeamName(oppTeam.data, "Opponent");

      // Save to localStorage using STORAGE_KEYS constant
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.OPTIMIZATION_HISTORY) || '[]');
      const newRun = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        yourFormation: tested[0].id,
        opponentFormation: detectedFormation,
        winningFormation: tested[0].id,
        score: tested[0].totalScore,
        yourTeam: yourTeamName,
        opponentTeam: opponentTeamName
      };
      history.unshift(newRun);
      localStorage.setItem(STORAGE_KEYS.OPTIMIZATION_HISTORY, JSON.stringify(history));

      setParserLogs((prev) => [
        ...prev,
        `✅ Analysis complete! Best formation: ${tested[0].id} (${tested[0].totalScore.toFixed(2)})`,
        `📊 ${yourTeamName} vs ${opponentTeamName} saved to dashboard`,
      ]);

      console.log("Best formation:", tested[0].id, tested[0]);

    } catch (err) {
      console.error("Optimizer Error:", err);
      const errorMsg = err instanceof Error ? err.message : "Optimization failed";
      setError(errorMsg);
      setParserLogs((prev) => [...prev, `❌ Optimization failed: ${errorMsg}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    myTeam.clearData();
    oppTeam.clearData();
    setResults([]);
    setBestFormation(null);
    setError(null);
    setDetectedFormation(null);
    setParserLogs([]);
    setViewingFormation(null);
    setViewOpen(false);
  };

  // ... rest of your component (JSX) remains the same

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Formation Optimizer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Controls */}
          <div className="flex gap-3 items-center flex-wrap">
            <Button onClick={() => myRef.current?.click()} variant="default">
              Upload My Team
            </Button>
            <input
              ref={myRef}
              type="file"
              accept=".csv"
              onChange={onImportMyTeam}
              hidden
            />

            <Button onClick={() => oppRef.current?.click()} variant="default">
              Upload Opponent
            </Button>
            <input
              ref={oppRef}
              type="file"
              accept=".csv"
              onChange={onImportOppTeam}
              hidden
            />

            {detectedFormation && (
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                <span className="text-sm font-medium">Opponent Formation:</span>
                <span className="text-sm font-bold text-primary">{detectedFormation}</span>
              </div>
            )}

            {(myTeam.data.length > 0 || oppTeam.data.length > 0) && (
              <Button onClick={clearAll} variant="outline" disabled={isLoading}>
                🗑️ Clear All
              </Button>
            )}
          </div>

          {/* Advanced Settings - Moved here */}
          <OptimizerControls
            config={config}
            onConfigChange={setConfig}
          />

          {/* Run Button - Now appears after settings */}
          <div className="flex justify-center">
            <Button
              onClick={runOptimizer}
              disabled={!myTeam.data.length || !oppTeam.data.length || !detectedFormation || isLoading}
              variant="default"
              size="lg"
              className="w-full max-w-md"
            >
              {isLoading ? "Analyzing..." : "▶ Run Optimizer"}
            </Button>
          </div>

          {/* Status Display */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">My Team:</span>
              <span className={myTeam.data.length >= 11 ? "text-green-600" : "text-muted-foreground"}>
                {myTeam.data.length} players
              </span>
              {myTeam.isLoading && <span className="text-blue-600">Loading...</span>}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Opponent:</span>
              <span className={oppTeam.data.length > 0 ? "text-green-600" : "text-muted-foreground"}>
                {oppTeam.data.length} players
              </span>
              {oppTeam.isLoading && <span className="text-blue-600">Loading...</span>}
            </div>
          </div>

          {/* Logs */}
          <div className="border rounded bg-muted p-3 text-xs font-mono max-h-48 overflow-auto">
            {parserLogs.length > 0 ? (
              parserLogs.map((line, i) => (
                <div key={i} className="py-0.5">
                  {line}
                </div>
              ))
            ) : (
              <div className="text-muted-foreground">No logs yet. Upload teams to begin.</div>
            )}
          </div>

          {/* Error Display */}
          {(error || myTeam.error || oppTeam.error) && (
            <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">Error</p>
                  <p className="text-sm text-red-600 mt-1">
                    {error || myTeam.error || oppTeam.error}
                  </p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto flex-shrink-0 text-red-400 hover:text-red-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center py-10 animate-pulse text-center">
              <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mb-4"></div>
              <p className="text-lg font-medium">Analyzing formations...</p>
              <p className="text-sm text-muted-foreground mt-1">This may take a few moments</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Table */}
      {!isLoading && results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Formation Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border px-4 py-2 text-left">Rank</th>
                    <th className="border border-border px-4 py-2 text-left">Formation</th>
                    <th className="border border-border px-4 py-2 text-left">Total Score</th>
                    <th className="border border-border px-4 py-2 text-left">Synergy</th>
                    <th className="border border-border px-4 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="hover:bg-muted/50">
                      <td className="border border-border px-4 py-2">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                      </td>
                      <td className="border border-border px-4 py-2 font-medium">{r.id}</td>
                      <td className="border border-border px-4 py-2">{r.totalScore.toFixed(2)}</td>
                      <td className="border border-border px-4 py-2">
                        <span className={r.synergyScore > 20 ? "text-green-600 font-semibold" : ""}>
                          {r.synergyScore?.toFixed(1) || 'N/A'}
                        </span>
                      </td>
                      <td className="border border-border px-4 py-2">
                        {i < 3 ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setViewingFormation({
                                id: r.id,
                                mapping: r.mapping || [],
                                opponent: oppTeam.data || [],
                                totalScore: r.totalScore,
                                synergyScore: r.synergyScore,
                              });
                              setViewOpen(true);
                            }}
                          >
                            View
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Best Formation Details */}
      {!isLoading && bestFormation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Best Formation: {bestFormation.id}</span>
              <span className="text-base font-normal text-muted-foreground">
                ({bestFormation.totalScore.toFixed(2)})
              </span>
              {bestFormation.synergyScore && (
                <span className="text-sm text-green-600 font-medium">
                  Synergy: +{bestFormation.synergyScore.toFixed(1)}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border px-4 py-2 text-left">Player</th>
                    <th className="border border-border px-4 py-2 text-left">Position</th>
                    <th className="border border-border px-4 py-2 text-left">Role</th>
                    <th className="border border-border px-4 py-2 text-left">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {bestFormation.mapping
                    .filter((m: any) => m.slot && m.slot.trim() !== "—")
                    .map((m: any, i: number) => (
                      <tr key={i} className="hover:bg-muted/50">
                        <td className="border border-border px-4 py-2 font-medium">{m.player}</td>
                        <td className="border border-border px-4 py-2">{m.slot}</td>
                        <td className="border border-border px-4 py-2">{m.role}</td>
                        <td className="border border-border px-4 py-2">
                          <span className={m.score > 80 ? "text-green-600 font-semibold" : ""}>
                            {m.score.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formation View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {viewingFormation?.id} vs {detectedFormation}
            </DialogTitle>
            <DialogDescription>
              {results.findIndex((r) => r.id === viewingFormation?.id) === 0 && "Best Formation"}
              {results.findIndex((r) => r.id === viewingFormation?.id) === 1 && "Second Best Formation"}
              {results.findIndex((r) => r.id === viewingFormation?.id) === 2 && "Third Best Formation"}
              {viewingFormation && ` - Score: ${viewingFormation.totalScore?.toFixed(2) || "N/A"}`}
              {viewingFormation?.synergyScore && (
                <span className="text-green-600"> | Synergy: +{viewingFormation.synergyScore.toFixed(1)}</span>
              )}
            </DialogDescription>
          </DialogHeader>

          {viewingFormation && (
            <div className="space-y-6">
              <FootballPitch
                title={`Your Team: ${viewingFormation.id}`}
                formation={normalizeFormation(viewingFormation.id)}
                myLineup={viewingFormation.mapping
                  .filter((m: any) => m.slot && m.slot.trim() !== "—")
                  .map((m: any) => ({
                    player: {
                      name: m.player,
                      position: m.role,
                    },
                    slot: m.slot,
                    cost: 0,
                    effectiveness: m.score ?? 0,
                  }))}
                isOpponent={false}
              />

              <FootballPitch
                title={`Opponent: ${detectedFormation || "Unknown"}`}
                formation={normalizeFormation(detectedFormation || "4-3-3")}
                myLineup={mapOpponentToFormation(
                  viewingFormation.opponent,
                  detectedFormation || viewingFormation.id
                ).map((opp: any) => ({
                  player: {
                    name: opp.name,
                    position: opp.position,
                  },
                  slot: opp.slot ?? "",
                  cost: 0,
                  effectiveness: 0,
                }))}
                isOpponent={true}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}