import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Upload, Download, X, AlertTriangle, Scale, ChevronDown, ChevronUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ExportDialog } from "@/components/ExportDialog";
import RadarSection from "@/components/ui/radarSection";
import { Player } from "@/lib/types";
import { PlayerComparison } from "@/components/PlayerComparison";
import { useCSVImport, usePlayerComparison, useFilters, useSessionStorage } from "@/lib/hooks";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import {
  coarseLine,
  getPositionColor,getAttributeColor,
  getAttributeTextColor,
  ATTRIBUTE_GROUPS,generatePlayersCSV,
  downloadCsv,getAvailableAttributes
} from "@/lib/utils";


const norm = (s: string) => s.toLowerCase().trim();

export default function Teams(): JSX.Element {

  const {
    data: players,
    setData: setPlayers,
    error,
    isLoading,
    handleImport
  } = useCSVImport<Player>();

  const comparison = usePlayerComparison<Player>(4);
  const filters = useFilters();

  // Use sessionStorage hook for persistence
  const [persistedPlayers, setPersistedPlayers] = useSessionStorage<Player[]>(
    STORAGE_KEYS.CURRENT_TEAM,
    []
  );

  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<Player | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Load persisted players on mount
  useEffect(() => {
    if (persistedPlayers.length > 0 && players.length === 0) {
      setPlayers(persistedPlayers);
    }
  }, []);

  // Sync players with persisted storage
  useEffect(() => {
    if (players.length > 0) {
      setPersistedPlayers(players);
    }
  }, [players, setPersistedPlayers]);

  const validatePlayers = (parsed: any[]): Player[] => {
    return parsed.filter(p => p.name && p.position && p.shirtNumber);
  };

  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImport(e, validatePlayers);
    comparison.clearAll();
  };

  const filtered = useMemo((): Player[] => {
    const q = norm(filters.searchQuery);
    return players.filter((p) => {
      const matchesQuery =
        !q ||
        norm(p.name).includes(q) ||
        norm(p.nationality || "").includes(q) ||
        norm(p.position).includes(q);

      const matchesPosition =
        filters.positionFilter === "All" || coarseLine(p.position) === filters.positionFilter;

      return matchesQuery && matchesPosition;
    });
  }, [players, filters.searchQuery, filters.positionFilter]);

  const sortedPlayers = useMemo(() => {
    const sorted = filtered.slice();
    switch (filters.sortBy) {
      case "number":
        return sorted.sort((a, b) => (a.shirtNumber ?? 999) - (b.shirtNumber ?? 999));
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "overall":
        return sorted.sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0));
      default:
        return sorted;
    }
  }, [filtered, filters.sortBy]);

  const stats = useMemo(() => {
    if (players.length === 0) return null;

    const avgOverall = players.reduce((acc, p) => acc + (p.overall ?? 0), 0) / players.length;
    const positionDist = players.reduce((acc, p) => {
      const line = coarseLine(p.position) ?? "Unknown";
      acc[line] = (acc[line] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { avgOverall: avgOverall.toFixed(1), positionDist };
  }, [players]);

  const handleExport = (selectedAttributes: string[]) => {
    if (players.length === 0) {
      alert("No players to export!");
      return;
    }
    const csv = generatePlayersCSV(players, selectedAttributes);
    downloadCsv(csv, `team-${Date.now()}.csv`);
  };

  const clearTeam = () => {
    if (confirm("Are you sure you want to clear all players? This cannot be undone.")) {
      setPlayers([]);
      setPersistedPlayers([]);
      comparison.clearAll();
    }
  };

  const positions = ["All", "GK", "DF", "MF", "FW"] as const;

  if (players.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-4">
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">No Players Loaded</h2>
        <p className="text-muted-foreground">
          Import a CSV file to start managing your team
        </p>
        {error && (
          <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button
          onClick={() => document.getElementById("import-team-csv")?.click()}
          disabled={isLoading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isLoading ? "Importing..." : "Import CSV"}
        </Button>

        {/* Hidden File Input */}
        <input
          id="import-team-csv"
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={onImport}
        />
      </div>
    );
  }

  // ... rest of your component (table, filters, dialog, etc.) remains the same
  return (
    <div className="p-6 space-y-6">
      {/* Header + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Teams Management</h1>
          {stats && (
            <p className="text-sm text-muted-foreground mt-1">
              {players.length} players • Avg Overall: {stats.avgOverall}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => document.getElementById("import-team-csv")?.click()}
            disabled={isLoading}
            aria-label="Import player CSV file"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => setExportDialogOpen(true)}
            disabled={players.length === 0}
            aria-label="Export players to CSV"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="destructive"
            onClick={clearTeam}
            disabled={players.length === 0}
            aria-label="Clear all players"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Team
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}


      {/* Filters & Controls */}
      <Card className="card-gradient border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Squad Filters</CardTitle>
              <CardDescription>
                {filtered.length} of {players.length} players shown
              </CardDescription>
            </div>
            {filters.hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={filters.clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="col-span-2">
              <input
                className="w-full rounded-md border border-gray-600 bg-black text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder:text-white"
                placeholder="Search name, position, nationality..."
                value={filters.searchQuery}
                onChange={(e) => filters.setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <select
                className="w-full rounded-md border border-gray-600 bg-black text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                value={filters.positionFilter}
                onChange={(e) => filters.setPositionFilter(e.target.value)}
                title="Filter by position"
              >
                {positions.map((p) => (
                  <option key={p} value={p}>
                    {p === "All" ? "All Positions" : p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="w-full rounded-md border border-gray-600 bg-black text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                value={filters.sortBy}
                onChange={(e) => filters.setSortBy(e.target.value as "number" | "name" | "overall")}
                title="Sort by"
              >
                <option value="number">Sort by Number</option>
                <option value="name">Sort by Name</option>
                <option value="overall">Sort by Overall</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Status Bar - Shows selected players */}
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
                      key={player.shirtNumber}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      <span>#{player.shirtNumber} {player.name}</span>
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
          players={comparison.compareList}
          onRemove={comparison.removePlayer}
          onClear={comparison.clearAll}
        />
      )}

      {/* Players Table */}
      <Card className="card-gradient border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Number</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Player</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Position</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Quality</th>
                  <th className="text-right py-4 px-6 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.length > 0 ? (
                  sortedPlayers.map((p) => (
                    <tr
                      key={`${p.shirtNumber}-${p.name}`}
                      className={`border-b border-border/50 hover:bg-muted/5 ${comparison.isSelected(p)
                        ? 'bg-primary/10 border-l-4 border-l-primary'
                        : ''
                        }`}
                    >
                      <td className="py-4 px-6">
                        <Badge variant="outline" className="font-mono">
                          {p.shirtNumber ?? "-"}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground font-medium">
                            {(p.name?.[0] ?? "").toUpperCase()}
                          </div>
                          <div className="font-medium text-foreground">{p.name}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge className={getPositionColor(p.position)}>
                          {p.position}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{Math.round(p.overall)}</span>
                          <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-destructive rounded-full transition-all"
                              style={{ width: `${Math.round(p.overall)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="View Details"
                            onClick={() => {
                              setSelected(p);
                              setViewOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Compare Button */}
                          <Button
                            variant={comparison.isSelected(p) ? "default" : "ghost"}
                            size="sm"
                            title={comparison.isSelected(p) ? "Remove from Comparison" : "Add to Comparison"}
                            onClick={() => comparison.togglePlayer(p)}
                            className={`relative transition-all duration-200 ${comparison.isSelected(p) ? 'scale-105' : 'hover:scale-105'
                              }`}
                          >
                            <Scale className="h-4 w-4" />
                            {comparison.isSelected(p) && (
                              <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center animate-in zoom-in duration-200">
                                ✓
                              </span>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      No players found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selected ? `${selected.name}` : "Player"}</DialogTitle>
            <DialogDescription>
              {selected ? `${selected.position} | Number · ${selected.shirtNumber}` : ""}
            </DialogDescription>
          </DialogHeader>

          {selected?.attributes && (
            <div className="space-y-4">
              {/* Attributes with color coding */}
              <div className="grid grid-cols-2 gap-2 text-sm max-h-96 overflow-y-auto">
                {Object.entries(ATTRIBUTE_GROUPS).map(([group, attrs]) => (
                  <div key={group} className="mb-3">
                    <h3 className="font-semibold text-sm text-primary mb-1">{group}</h3>
                    {attrs.map((attr) => {
                      const value = Math.round(selected.attributes?.[attr] ?? 0);
                      return (
                        <div key={attr} className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{attr}:</span>
                          <div className="flex items-center gap-2">
                            <span className={getAttributeTextColor(value)}>{value}</span>
                            <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${getAttributeColor(value)}`}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Player radar */}
              {selected && <RadarSection player={selected} />}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden File Input */}
      <input
        id="import-team-csv"
        type="file"
        accept=".csv"
        style={{ display: "none" }}
        onChange={onImport}
      />
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        availableAttributes={getAvailableAttributes(players)}
        onExport={handleExport}
        title="Export Team CSV"
        description="Select which attributes to include in the export. Base info (Name, Position, etc.) is always included."
      />
    </div>


  );
}




