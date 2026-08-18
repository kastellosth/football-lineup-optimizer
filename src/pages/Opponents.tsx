import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FootballPitch } from "@/components/FootballPitch";
import { ExportDialog } from "@/components/ExportDialog";
import { Upload, Download, Search, Eye, X, AlertTriangle, Scale, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, } from "@/components/ui/dialog";
import RadarSection from "@/components/ui/radarSection";
import { TeamRadarSection } from "@/components/ui/TeamRadarSection";
import { PlayerComparison } from "@/components/PlayerComparison";
import type { OppRow, Lane, PositionFilter, OpponentAnalysisByLane } from "@/lib/types";
import { parseCSVToPlayers } from "@/lib/parsers/parser";
import { useCSVImport, usePlayerComparison, useFilters, useSessionStorage } from "@/lib/hooks/";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { normalizeSlot, coarseLine, getSeverityColor, sortBySlot, matchesSearchQuery, matchesPositionFilter, getPlayerInitials, formatAttributeValue, POSITION_LABELS, getPositionColor } from "@/lib/utils";

import {
  generateOpponentsCSV, downloadCsv,
  getAttributeColor, getAttributeTextColor, ATTRIBUTE_GROUPS,
  calculateWeaknessScore, flagsForPlayer, coachTip, PRESS_TRIGGERS,
  getAvailableAttributes
} from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Opponents() {

  const {
    data: opponents,
    setData: setOpponents,
    error,
    isLoading,
  } = useCSVImport<OppRow>();

  const filters = useFilters();
  const comparison = usePlayerComparison<OppRow>(4);
  const [persistedOpponents, setPersistedOpponents] = useSessionStorage<OppRow[]>(STORAGE_KEYS.CURRENT_OPPONENTS, []);
  const [persistedFormation, setPersistedFormation] = useSessionStorage<string>(STORAGE_KEYS.CURRENT_FORMATION, "4-3-3");
  const [oppHadMissing, setOppHadMissing] = useState(false);
  const [oppMissingNames, setOppMissingNames] = useState<string[]>([]);
  const [formation, setFormation] = useState(persistedFormation);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<OppRow | null>(null);
  const positions: PositionFilter[] = ["All", "GK", "DF", "MF", "FW"];

  useEffect(() => {
    if (persistedOpponents.length > 0 && opponents.length === 0) {
      setOpponents(persistedOpponents);
    }
  }, []);

  useEffect(() => {
    if (opponents.length > 0) {
      setPersistedOpponents(opponents);
    }
  }, [opponents, setPersistedOpponents]);

  useEffect(() => {
    setPersistedFormation(formation);
  }, [formation, setPersistedFormation]);

  const clearOpponents = () => {
    if (confirm("Are you sure you want to clear all opponents? This cannot be undone.")) {
      setOpponents([]);
      setPersistedOpponents([]);
      setFormation("4-3-3");
      setPersistedFormation("4-3-3");
      comparison.clearAll();
    }
  };

  const filteredOpponents = useMemo(() => {
    const filtered = opponents.filter((player) => {
      return (
        matchesSearchQuery(player, filters.searchQuery) &&
        matchesPositionFilter(player, filters.positionFilter)
      );
    });

    const sorted = filtered.slice();
    switch (filters.sortBy) {
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "slot":
        return sorted.sort(sortBySlot);
      case "overall":
        return sorted.sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0));
      default:
        return sorted;
    }
  }, [opponents, filters.searchQuery, filters.positionFilter, filters.sortBy]);

  const analysis = useMemo<OpponentAnalysisByLane>(() => {
    const lanes: Lane[] = ["DF", "MF", "FW"];
    const res = {
      DF: { ranked: [] },
      MF: { ranked: [] },
      FW: { ranked: [] },
    } as OpponentAnalysisByLane;

    lanes.forEach((lane) => {
      const list = filteredOpponents.filter((pl) => coarseLine(pl.position) === lane);
      const ranked = list
        .map((p) => {
          const fullAnalysis = calculateWeaknessScore(p, lane);
          return {
            p,
            score: fullAnalysis.score,
            flags: flagsForPlayer(p, lane),
            analysis: fullAnalysis,
          };
        })
        .sort((a, b) => b.score - a.score);

      res[lane] = { ranked, weakest: ranked[0] };
    });
    return res;
  }, [filteredOpponents]);

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.currentTarget;
    const file = inputEl?.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const res: any = await parseCSVToPlayers(text);

      const players = (res?.players) ? res.players : res;
      setOpponents(players as OppRow[]);

      const hadMissing = !!res?.stats?.hadMissingAttrs;
      const names = (res?.playersWithMissingAttrs ?? []) as string[];
      setOppHadMissing(hadMissing);
      setOppMissingNames(names);

      if (players.length > 0 && players[0].formation) {
        setFormation(players[0].formation);
      }

      comparison.clearAll();

      if (hadMissing) {
        console.log("⚠ Players with missing attributes:");
        Array.from(new Set(names)).forEach((n) => console.log(`  - ${n}`));
      }
    } catch (err: any) {
      console.error("CSV import failed:", err);
      alert(`Import failed: ${err?.message || "Unknown error"}`);
    } finally {
      if (inputEl) inputEl.value = "";
    }
  };

  const handleExport = (selectedAttributes: string[]) => {
    if (opponents.length === 0) {
      alert("No opponents to export!");
      return;
    }
    const csv = generateOpponentsCSV(opponents, selectedAttributes);
    downloadCsv(csv, `opponent-team-${Date.now()}.csv`);
  };


  const handleView = (player: OppRow) => {
    setSelected(player);
    setViewOpen(true);
  };

  if (opponents.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-4">
        <Upload className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">No Opponent Data</h2>
        <p className="text-muted-foreground">
          Import a CSV file to analyze opponent teams and formations.
        </p>
        {error && (
          <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button
          onClick={() => document.getElementById("import-opponents-csv")?.click()}
          disabled={isLoading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isLoading ? "Importing..." : "Import CSV"}
        </Button>
        <input
          id="import-opponents-csv"
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={onImport}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Opponents Management
          </h1>
          {oppHadMissing && (
            <Badge variant="outline" className="ml-3 align-middle text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Missing attributes detected
            </Badge>
          )}
          <p className="text-muted-foreground mt-1">
            Manage opponent squads, formations, and tactical weaknesses
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => document.getElementById("import-opponents-csv")?.click()}
            disabled={isLoading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => setExportDialogOpen(true)}
            disabled={opponents.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="destructive"
            onClick={clearOpponents}
            disabled={opponents.length === 0}
          >
            <X className="mr-2 h-4 w-4" />
            Clear Opponents
          </Button>
          <input
            id="import-opponents-csv"
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={onImport}
          />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="card-gradient border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Opponent Filters</CardTitle>
              <CardDescription>
                {filteredOpponents.length} of {opponents.length} players shown
              </CardDescription>
            </div>
            {filters.hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={filters.clearFilters}
              >
                <X className="mr-2 h-4 w-4" /> Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            {/* Search */}
            <div className="col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, position, or slot..."
                value={filters.searchQuery}
                onChange={(e) => filters.setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Position Filter */}
            <div>
              <select
                value={filters.positionFilter}
                onChange={(e) => filters.setPositionFilter(e.target.value)}
                className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground w-full"
              >
                {positions.map((p) => (
                  <option key={p} value={p}>
                    {p === "All" ? "All Positions" : p}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <select
                className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground w-full"
                value={filters.sortBy}
                onChange={(e) => filters.setSortBy(e.target.value as "name" | "slot" | "overall")}
                title="Sort by"
              >
                <option value="name">Sort by Name</option>
                <option value="slot">Sort by Slot</option>
                <option value="overall">Sort by Overall</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Status Bar */}
      {comparison.compareList.length > 0 && (
        <Card className="card-gradient border-border/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  <span className="font-semibold">
                    {comparison.compareList.length} Player{comparison.compareList.length > 1 ? 's' : ''} Selected
                  </span>
                </div>

                {/* Selected Players Pills */}
                <div className="flex items-center gap-2 flex-wrap">
                  {comparison.compareList.map((player) => (
                    <Badge
                      key={player.name}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      <span>{player.name}</span>
                      <button
                        onClick={() => comparison.removePlayer(player)}
                        className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {comparison.compareList.length >= 2 && (
                  <Button
                    variant={comparison.isComparisonOpen ? "secondary" : "default"}
                    size="sm"
                    onClick={comparison.toggleView}
                  >
                    {comparison.isComparisonOpen ? (
                      <>
                        <ChevronUp className="mr-2 h-4 w-4" />
                        Hide Comparison
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-2 h-4 w-4" />
                        Compare Players
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={comparison.clearAll}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collapsible Comparison Card */}
      {comparison.isComparisonOpen && comparison.compareList.length >= 2 && (
        <PlayerComparison
          players={comparison.compareList as any}
          onRemove={comparison.removePlayer}
          onClear={comparison.clearAll}
        />
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Formation Preview & Analysis */}
        <div className="xl:col-span-1">
          <Card className="card-gradient border-border/50 sticky top-6">
            <CardHeader>
              <CardTitle className="text-foreground">Formation Preview</CardTitle>
              <CardDescription>Visual representation and weakness analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <FootballPitch
                  opponentLineup={filteredOpponents}
                  className="h-fit"
                  formation={formation}
                />
                <TeamRadarSection players={filteredOpponents as any} />

                {/* Weakness Analysis */}
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Opponent Weakness Analysis
                  </div>

                  {(["DF", "MF", "FW"] as const).map((lane) => {
                    const bucket = analysis[lane];
                    if (!bucket?.weakest) return null;
                    const w = bucket.weakest;

                    return (
                      <div
                        key={lane}
                        className="rounded-lg border border-border/50 p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">
                            {POSITION_LABELS[lane]} – Weak Link
                          </div>
                          <Badge
                            variant="outline"
                            className={getSeverityColor(
                              w.analysis?.severity || "low"
                            )}
                          >
                            {w.analysis?.severity.toUpperCase()} ({w.score.toFixed(0)})
                          </Badge>
                        </div>

                        <div className="text-sm font-medium text-foreground">
                          {w.p.name} ({(w.p.position ?? "").toUpperCase()}
                          {w.p.slot ? `, ${normalizeSlot(w.p.slot)}` : ""})
                        </div>

                        {w.analysis?.level && (
                          <div className="text-xs text-muted-foreground">
                            Weakness Level:{" "}
                            <span className="font-medium">{w.analysis.level}</span>
                          </div>
                        )}

                        {!!w.flags.length && (
                          <ul className="text-xs list-disc list-inside text-muted-foreground space-y-0.5">
                            {w.flags.slice(0, 2).map((f, i) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        )}

                        <div className="text-xs bg-blue-50 dark:bg-blue-950/20 p-2 rounded border border-blue-200 dark:border-blue-800">
                          <span className="font-semibold text-blue-700 dark:text-blue-400">
                            💡 Coach Tip:
                          </span>{" "}
                          <span className="text-blue-600 dark:text-blue-300">
                            {coachTip(w.p, lane)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Press Triggers */}
                {filteredOpponents.length > 0 && (
                  <div className="rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 p-3">
                    <div className="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-2">
                      Press Triggers
                    </div>
                    <ul className="text-xs space-y-1 text-orange-600 dark:text-orange-300">
                      {PRESS_TRIGGERS.slice(0, 3).map((trigger, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="mt-0.5">•</span>
                          <span>{trigger}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Opponents Table */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="card-gradient border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Opponent Squad</CardTitle>
              <CardDescription>
                {opponents.length} players loaded
                {oppHadMissing && ` • ${oppMissingNames.length} with missing data`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {filteredOpponents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-4 px-6 font-medium text-muted-foreground">
                          Slot
                        </th>
                        <th className="text-left py-4 px-6 font-medium text-muted-foreground">
                          Player
                        </th>
                        <th className="text-left py-4 px-6 font-medium text-muted-foreground">
                          Position
                        </th>
                        <th className="text-left py-4 px-6 font-medium text-muted-foreground">
                          Overall
                        </th>
                        <th className="text-left py-4 px-6 font-medium text-muted-foreground">
                          Weakness
                        </th>
                        <th className="text-right py-4px-6 font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOpponents.map((player) => {
                        const lane = coarseLine(player.position);
                        const playerAnalysis =
                          lane && lane !== "GK"
                            ? calculateWeaknessScore(player, lane as Lane)
                            : null;

                        return (
                          <tr
                            key={player.name}
                            className={`border-b border-border/50 hover:bg-muted/5 ${comparison.isSelected(player)
                              ? 'bg-primary/10 border-l-4 border-l-primary'
                              : ''
                              }`}
                          >
                            <td className="py-4 px-6">
                              <Badge
                                variant="outline"
                                className="font-mono text-xs"
                              >
                                {normalizeSlot(player.slot)}
                              </Badge>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-medium shadow">
                                  {getPlayerInitials(player.name)}
                                </div>
                                <div className="font-medium text-foreground">
                                  {player.name}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <Badge className={getPositionColor(player.position || "")}>
                                {(player.position ?? "").toUpperCase()}
                              </Badge>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground w-8">
                                  {player.overall ?? "—"}
                                </span>
                                <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all"
                                    style={{ width: `${player.overall ?? 0}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              {playerAnalysis ? (
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getSeverityColor(
                                      playerAnalysis.severity
                                    )}`}
                                  >
                                    {playerAnalysis.severity}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {playerAnalysis.score.toFixed(0)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="View Details"
                                  onClick={() => handleView(player)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>

                                {/* Compare Button */}
                                <Button
                                  variant={comparison.isSelected(player) ? "default" : "ghost"}
                                  size="sm"
                                  title={comparison.isSelected(player) ? "Remove from Comparison" : "Add to Comparison"}
                                  onClick={() => comparison.togglePlayer(player)}
                                  className={`relative transition-all duration-200 ${comparison.isSelected(player) ? 'scale-105' : 'hover:scale-105'
                                    }`}
                                >
                                  <Scale className="h-4 w-4" />
                                  {comparison.isSelected(player) && (
                                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center animate-in zoom-in duration-200">
                                      ✓
                                    </span>
                                  )}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No opponents found matching your filters.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected?.name}
              {selected &&
                coarseLine(selected.position || "") &&
                coarseLine(selected.position || "") !== "GK" && (
                  <Badge
                    variant="outline"
                    className={getSeverityColor(
                      calculateWeaknessScore(
                        selected,
                        coarseLine(selected.position || "") as Lane
                      ).severity
                    )}
                  >
                    {calculateWeaknessScore(
                      selected,
                      coarseLine(selected.position || "") as Lane
                    ).severity}{" "}
                    risk
                  </Badge>
                )}
            </DialogTitle>
            <DialogDescription>
              {selected ? `${(selected.position ?? "").toUpperCase()}` : ""}
              {selected?.slot && ` • Slot ${normalizeSlot(selected.slot)}`}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position:</span>
                  <Badge className={getPositionColor(selected.position || "")}>
                    {selected.position?.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slot:</span>
                  <span className="font-medium">
                    {normalizeSlot(selected.slot)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Overall:</span>
                  <span className="font-medium">
                    {selected.overall ?? "—"}
                  </span>
                </div>
                {selected.bestFoot && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best Foot:</span>
                    <span className="font-medium">{selected.bestFoot}</span>
                  </div>
                )}
              </div>

              {/* Attributes */}
              {selected?.attributes && (
                <div className="pt-2 space-y-3 max-h-96 overflow-y-auto">
                  {Object.entries(ATTRIBUTE_GROUPS).map(([group, attrs]) => (
                    <div key={group}>
                      <div className="text-sm font-semibold text-primary mb-2">
                        {group}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {attrs.map((attr) => {
                          const value = formatAttributeValue(
                            selected.attributes?.[attr.toLowerCase()]
                          );
                          return (
                            <div
                              key={attr.toLowerCase()}
                              className="flex justify-between items-center"
                            >
                              <span className="text-muted-foreground">{attr}:</span>
                              <div className="flex items-center gap-2">
                                <span className={getAttributeTextColor(value)}>
                                  {value}
                                </span>
                                <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${getAttributeColor(
                                      value
                                    )}`}
                                    style={{ width: `${value}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Player Radar */}
              <RadarSection
                player={{ ...selected, ...(selected?.attributes ?? {}) } as any}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        availableAttributes={getAvailableAttributes(opponents)}
        onExport={handleExport}
        title="Export Opponent CSV"
        description="Select which attributes to include in the export. Base info (Name, Position, Formation, etc.) is always included."
      />

    </div>

  );
}