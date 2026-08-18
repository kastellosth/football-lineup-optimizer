import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OptimizerConfig, DEFAULT_CONFIG } from "@/lib/engine/costMatrix";
import { ChevronDown, ChevronUp } from "lucide-react";

interface OptimizerControlsProps {
  config: OptimizerConfig;
  onConfigChange: (config: OptimizerConfig) => void;
}

export function OptimizerControls({ config, onConfigChange }: OptimizerControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAttributeWeightChange = (value: number) => {
    const attrWeight = value / 100;
    onConfigChange({
      ...config,
      attributeWeight: attrWeight,
      matchupWeight: 1 - attrWeight
    });
  };

  const handleMatchupWeightChange = (value: number) => {
    const matchupWeight = value / 100;
    onConfigChange({
      ...config,
      matchupWeight: matchupWeight,
      attributeWeight: 1 - matchupWeight
    });
  };

  const handleReset = () => {
    onConfigChange(DEFAULT_CONFIG);
  };

  return (
    <div className="border rounded-lg bg-muted">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/80 transition-colors"
      >
        <span className="text-sm font-semibold">Advanced Settings</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-4 pt-0 space-y-3 border-t">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Optimizer Weights</label>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleReset}
              className="text-xs"
            >
              Reset to Default
            </Button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-muted-foreground">Player Attributes</label>
              <span className="text-xs font-mono font-semibold text-primary">
                {(config.attributeWeight * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={config.attributeWeight * 100}
              onChange={(e) => handleAttributeWeightChange(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              How much player quality matters vs tactical matchup
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-muted-foreground">Tactical Matchup</label>
              <span className="text-xs font-mono font-semibold text-primary">
                {(config.matchupWeight * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={config.matchupWeight * 100}
              onChange={(e) => handleMatchupWeightChange(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              How much opponent-specific advantages matter
            </p>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Default (70/30):</strong> Realistic - Elite players beat average players
              <br />
              <strong className="text-foreground">50/50:</strong> Tactical - Perfect matchup overcomes skill gap
            </p>
          </div>
        </div>
      )}
    </div>
  );
}