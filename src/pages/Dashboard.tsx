import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, TrendingUp, Target, Shield, Trophy, Calendar, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "@/lib/hooks";
import { STORAGE_KEYS } from "@/lib/storage/keys";

interface OptimizationRun {
  id: string;
  timestamp: string;
  yourFormation: string;
  opponentFormation: string;
  winningFormation: string;
  score: number;
  yourTeam?: string;
  opponentTeam?: string;
  actualResult?: string;
  notes?: string;
}

const calculateWinRate = (history: OptimizationRun[]) => {
  const gamesWithResults = history.filter(run => run.actualResult);
  if (gamesWithResults.length === 0) return "N/A";

  const wins = gamesWithResults.filter(run => {
    if (!run.actualResult) return false;
    const [yourScore, oppScore] = run.actualResult.split('-').map(Number);
    return yourScore > oppScore;
  }).length;

  return `${((wins / gamesWithResults.length) * 100).toFixed(0)}%`;
};
export default function Dashboard() {
  const navigate = useNavigate();
  
  const [history, setHistory] = useLocalStorage<OptimizationRun[]>(
    STORAGE_KEYS.OPTIMIZATION_HISTORY,
    []
  );
  
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<OptimizationRun | null>(null);
  const [resultInput, setResultInput] = useState("");
  const [notesInput, setNotesInput] = useState("");

  const handleEditResult = (run: OptimizationRun) => {
    setSelectedRun(run);
    setResultInput(run.actualResult || "");
    setNotesInput(run.notes || "");
    setEditOpen(true);
  };

  const saveResult = () => {
    if (!selectedRun) return;
    
    setHistory(prev => prev.map(run => 
      run.id === selectedRun.id 
        ? { ...run, actualResult: resultInput, notes: notesInput }
        : run
    ));
    
    setEditOpen(false);
    setSelectedRun(null);
    setResultInput("");
    setNotesInput("");
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const stats = {
    totalRuns: history.length,
    avgScore: history.length > 0 
      ? (history.reduce((acc, run) => acc + run.score, 0) / history.length).toFixed(1) 
      : "0",
    withResults: history.filter(run => run.actualResult).length,
    winRate: calculateWinRate(history)
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your optimization history and tactical performance
          </p>
        </div>
        <Button
          className="gradient-primary hover:opacity-90 transition-opacity"
          onClick={() => navigate("/optimize")}
        >
          <Play className="mr-2 h-4 w-4" />
          New Optimization
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-gradient border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Target className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalRuns}</div>
            <p className="text-xs text-muted-foreground mt-1">Total Optimizations</p>
          </CardContent>
        </Card>

        <Card className="card-gradient border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.avgScore}</div>
            <p className="text-xs text-muted-foreground mt-1">Average Score</p>
          </CardContent>
        </Card>

        <Card className="card-gradient border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.withResults}</div>
            <p className="text-xs text-muted-foreground mt-1">Games Recorded</p>
          </CardContent>
        </Card>

        <Card className="card-gradient border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Trophy className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.winRate}</div>
            <p className="text-xs text-muted-foreground mt-1">Win Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Optimization History */}
      <Card className="card-gradient border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Optimization History</CardTitle>
          <CardDescription>All saved optimization runs</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((run) => (
                <Card key={run.id} className="border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-[200px_1fr_auto] gap-4 items-start">
                      {/* Column 1: Team Names */}
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-blue-600">
                          {run.yourTeam || "Your Team"}
                        </div>
                        <div className="text-xs text-muted-foreground">vs</div>
                        <div className="text-sm font-semibold text-red-600">
                          {run.opponentTeam || "Opponent"}
                        </div>
                      </div>

                      {/* Column 2: Formations & Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/50">
                            {run.yourFormation}
                          </Badge>
                          <span className="text-sm text-muted-foreground">vs</span>
                          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/50">
                            {run.opponentFormation}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Score:</span>
                            <span className="font-semibold text-foreground">{run.score.toFixed(1)}</span>
                          </div>
                          {run.actualResult && (
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Result:</span>
                              <span className="font-semibold text-foreground">{run.actualResult}</span>
                            </div>
                          )}
                        </div>

                        {run.notes && (
                          <div className="text-xs text-muted-foreground italic">
                            "{run.notes}"
                          </div>
                        )}
                      </div>

                      {/* Column 3: Date & Actions */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(run.timestamp)}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditResult(run)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          {run.actualResult ? "Edit" : "Add Result"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-1">No Optimizations Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Run your first optimization to start tracking your tactical decisions
              </p>
              <Button onClick={() => navigate("/optimize")}>
                <Play className="mr-2 h-4 w-4" />
                Start First Optimization
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Result Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Game Result</DialogTitle>
            <DialogDescription>
              Add the actual match result and notes for this optimization
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedRun && (
              <div className="space-y-2">
                {/* Team names if available */}
                {(selectedRun.yourTeam || selectedRun.opponentTeam) && (
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg text-sm">
                    <span className="font-semibold text-blue-600">{selectedRun.yourTeam || "Your Team"}</span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="font-semibold text-red-600">{selectedRun.opponentTeam || "Opponent"}</span>
                  </div>
                )}
                
                {/* Formations */}
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Badge>{selectedRun.yourFormation}</Badge>
                  <span className="text-sm text-muted-foreground">vs</span>
                  <Badge variant="outline">{selectedRun.opponentFormation}</Badge>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Match Result (e.g., 2-1, 0-0)</label>
              <Input
                placeholder="2-1"
                value={resultInput}
                onChange={(e) => setResultInput(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Input
                placeholder="Great performance, dominated possession..."
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveResult}>
              Save Result
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}