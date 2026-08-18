import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, CheckSquare, Square } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableAttributes: string[];
  onExport: (selectedAttributes: string[]) => void;
  title?: string;
  description?: string;
}

export function ExportDialog({
  open,
  onOpenChange,
  availableAttributes,
  onExport,
  title = "Export CSV",
  description = "Select which attributes to include in the export"
}: ExportDialogProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>(availableAttributes);

  const attributeGroups = useMemo(() => {
    const groups: Record<string, string[]> = {
      "Core Attributes": ["pace", "shooting", "passing", "dribbling", "defending", "physicality"],
      "Pace": ["acceleration", "sprintspeed"],
      "Shooting": ["positioning", "finishing", "volleys", "penalties", "shotpower", "longshots"],
      "Passing": ["vision", "curve", "longpassing", "shortpassing", "freekickaccuracy", "crossing"],
      "Dribbling": ["agility", "reactions", "composure", "balance", "ballcontrol"],
      "Defending": ["interceptions", "headingaccuracy", "defensiveawareness", "standingtackle", "slidingtackle"],
      "Physicality": ["jumping", "stamina", "strength", "aggression"],
      "Goalkeeping": ["goalkeeping", "gkdiving", "gkhandling", "gkkicking", "gkreflexes", "gkpositioning"]
    };

    const result: Record<string, string[]> = {};
    Object.entries(groups).forEach(([group, attrs]) => {
      const available = attrs.filter(attr => availableAttributes.includes(attr));
      if (available.length > 0) {
        result[group] = available;
      }
    });

    const grouped = Object.values(result).flat();
    const other = availableAttributes.filter(attr => !grouped.includes(attr));
    if (other.length > 0) {
      result["Other"] = other;
    }

    return result;
  }, [availableAttributes]);

  const handleToggle = (attribute: string) => {
    setSelectedAttributes(prev =>
      prev.includes(attribute)
        ? prev.filter(a => a !== attribute)
        : [...prev, attribute]
    );
  };

  const handleToggleGroup = (attributes: string[]) => {
    const allSelected = attributes.every(attr => selectedAttributes.includes(attr));
    if (allSelected) {
      setSelectedAttributes(prev => prev.filter(attr => !attributes.includes(attr)));
    } else {
      setSelectedAttributes(prev => [...new Set([...prev, ...attributes])]);
    }
  };

  const handleSelectAll = () => {
    setSelectedAttributes(availableAttributes);
  };

  const handleSelectNone = () => {
    setSelectedAttributes([]);
  };

  const handleExport = () => {
    onExport(selectedAttributes);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectNone}
            >
              <Square className="mr-2 h-4 w-4" />
              Deselect All
            </Button>
            <div className="ml-auto text-sm text-muted-foreground">
              {selectedAttributes.length} / {availableAttributes.length} selected
            </div>
          </div>

          {/* Scrollable attribute list */}
          <ScrollArea className="h-[400px] border rounded-md p-4">
            <div className="space-y-6">
              {Object.entries(attributeGroups).map(([group, attributes]) => {
                const allSelected = attributes.every(attr => selectedAttributes.includes(attr));
                const someSelected = attributes.some(attr => selectedAttributes.includes(attr));

                return (
                  <div key={group} className="space-y-3">
                    {/* Group header */}
                    <div className="flex items-center space-x-2 pb-2 border-b">
                      <Checkbox
                        id={`group-${group}`}
                        checked={allSelected}
                        onCheckedChange={() => handleToggleGroup(attributes)}
                        className={someSelected && !allSelected ? "data-[state=checked]:bg-primary/50" : ""}
                      />
                      <Label
                        htmlFor={`group-${group}`}
                        className="text-sm font-semibold cursor-pointer"
                      >
                        {group} ({attributes.length})
                      </Label>
                    </div>

                    {/* Group attributes */}
                    <div className="grid grid-cols-2 gap-2 pl-6">
                      {attributes.map(attr => (
                        <div key={attr} className="flex items-center space-x-2">
                          <Checkbox
                            id={attr}
                            checked={selectedAttributes.includes(attr)}
                            onCheckedChange={() => handleToggle(attr)}
                          />
                          <Label
                            htmlFor={attr}
                            className="text-sm cursor-pointer capitalize"
                          >
                            {attr}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={selectedAttributes.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export ({selectedAttributes.length} attributes)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
