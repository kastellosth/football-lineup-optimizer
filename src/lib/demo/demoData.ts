
const BASE = import.meta.env.BASE_URL;
export interface DemoDataset {
  id: string;
  label: string;
  path: string;
}

export const DEMO_TEAMS: DemoDataset[] = [
  {
    id: "liverpool",
    label: "Liverpool",
    path: `${BASE}data/teams/Liverpool.csv`,
  },
  {
    id: "chelsea",
    label: "Chelsea",
    path: `${BASE}data/teams/Chelsea.csv`,
  },
  {
    id: "bayern",
    label: "Bayern",
    path: `${BASE}data/teams/Bayern.csv`,
  },
  {
    id: "dortmund",
    label: "Dortmund",
    path: `${BASE}data/teams/Dortmund.csv`,
  },
];

export const DEMO_OPPONENTS: DemoDataset[] = [
  {
    id: "roma-433",
    label: "Roma — 4-3-3",
    path: `${BASE}data/opponents/Roma_433.csv`,
  },
  {
    id: "man-utd-442",
    label: "Manchester United — 4-4-2",
    path: `${BASE}data/opponents/Manchester_United_442.csv`,
  },
  {
    id: "atletico-352",
    label: "Atletico Madrid — 3-5-2",
    path: `${BASE}data/opponents/Atletico_de_Madrid_352.csv`,
  },
  {
    id: "atletico-451",
    label: "Atletico Madrid — 4-5-1",
    path: `${BASE}data/opponents/Atletico_de_Madrid_451.csv`,
  },
  {
    id: "leverkusen-343",
    label: "Bayer Leverkusen — 3-4-3",
    path: `${BASE}data/opponents/Bayer_Leverkusen_343.csv`,
  },
  {
    id: "tottenham-4231",
    label: "Tottenham — 4-2-3-1",
    path: `${BASE}data/opponents/Tottenham_4231.csv`,
  },
  {
    id: "wolves-532",
    label: "Wolves — 5-3-2",
    path: `${BASE}data/opponents/Wolves_532.csv`,
  },
];
