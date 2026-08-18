/**
 * CSV Export Utilities
 * 
 * Functions for converting data to CSV format and downloading CSV files, including
 * specialized exports for players and opponents with attribute selection.
 */

// Converts array of objects to CSV string with proper escaping for commas and quotes
export const arrayToCSV = (data: any[], headers: string[]): string => {
  if (data.length === 0) return "";

  const headerRow = headers.join(",");

  const dataRows = data.map(item => {
    return headers.map(header => {
      const value = item[header] ?? "";
      if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(",");
  });

  return [headerRow, ...dataRows].join("\n");
};

// Triggers browser download of CSV content as a file
export const downloadCsv = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Generates CSV string for players with base info and optionally selected attributes
export const generatePlayersCSV = (players: any[], selectedAttributes?: string[]): string => {
  if (players.length === 0) return "";

  
  const splitName = (name: string) => {
    const parts = name.split(" ");
    if (parts.length === 1) return { firstName: parts[0], lastName: "" };
    return { 
      firstName: parts.slice(0, -1).join(" "), 
      lastName: parts[parts.length - 1] 
    };
  };

 
  const baseHeaders = [
    "FirstName",
    "LastName", 
    "ShirtNumber",
    "Nationality",
    "PrimaryPosition",
    "Overall",
    "HeightCM",
    "WeightKG",
    "BestFoot",
    "Team"
  ];

  
  const allAttributes = Object.keys(players[0].attributes || {});
  
  
  const attributesToExport = selectedAttributes && selectedAttributes.length > 0 
    ? selectedAttributes 
    : allAttributes;

  const headers = [...baseHeaders, ...attributesToExport];

  const data = players.map(p => {
    const { firstName, lastName } = splitName(p.name);
    
    const row: any = {
      FirstName: firstName,
      LastName: lastName,
      ShirtNumber: p.shirtNumber || "",
      Nationality: p.nationality || "",
      PrimaryPosition: p.position || "",
      Overall: p.overall || "",
      HeightCM: p.height || "",
      WeightKG: p.weight || "",
      BestFoot: p.bestFoot || "",
      Team: p.team || ""
    };

    
    attributesToExport.forEach(attr => {
      row[attr] = p.attributes?.[attr] ?? "";
    });

    return row;
  });

  return arrayToCSV(data, headers);
};

// Generates CSV string for opponents with formation/slot info and optionally selected attributes
export const generateOpponentsCSV = (opponents: any[], selectedAttributes?: string[]): string => {
  if (opponents.length === 0) return "";

  const splitName = (name: string) => {
    const parts = name.split(" ");
    if (parts.length === 1) return { firstName: parts[0], lastName: "" };
    return { 
      firstName: parts.slice(0, -1).join(" "), 
      lastName: parts[parts.length - 1] 
    };
  };

  const baseHeaders = [
    "FirstName",
    "LastName",
    "ShirtNumber", 
    "Nationality",
    "PrimaryPosition",
    "Slot",
    "Overall",
    "BestFoot",
    "Formation",
    "Team"
  ];

  const allAttributes = Object.keys(opponents[0].attributes || {});
  const attributesToExport = selectedAttributes && selectedAttributes.length > 0 
    ? selectedAttributes 
    : allAttributes;

  const headers = [...baseHeaders, ...attributesToExport];

  const data = opponents.map(p => {
    const { firstName, lastName } = splitName(p.name);
    
    const row: any = {
      FirstName: firstName,
      LastName: lastName,
      ShirtNumber: p.shirtNumber || "",
      Nationality: p.nationality || "",
      PrimaryPosition: p.position || "",
      Slot: p.slot || "",
      Overall: p.overall || "",
      BestFoot: p.bestFoot || "",
      Formation: p.formation || "",
      Team: p.team || ""
    };

    attributesToExport.forEach(attr => {
      row[attr] = p.attributes?.[attr] ?? "";
    });

    return row;
  });

  return arrayToCSV(data, headers);
};

// Returns sorted array of all available attribute keys from the first player's attributes
export const getAvailableAttributes = (players: any[]): string[] => {
  if (players.length === 0) return [];
  return Object.keys(players[0].attributes || {}).sort();
};