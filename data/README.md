# Sample datasets

This directory contains sample CSV files used to demonstrate and test the Football Lineup Optimizer.

## Structure

- `teams/` - candidate squad data used as the pool of players to optimize.
- `opponents/` - opponent starting lineups paired with an example tactical formation.

## Included samples

### Teams

- Bayern
- Chelsea
- Borussia Dortmund
- Liverpool

### Opponents

- Atletico Madrid - 3-5-2
- Atletico Madrid - 4-5-1
- Bayer Leverkusen - 3-4-3
- Manchester United - 4-4-2
- Roma - 4-3-3
- Tottenham Hotspur - 4-2-3-1
- Wolverhampton Wanderers - 5-3-2

## CSV schema

The datasets include player identity and football attributes such as position, preferred foot, physical measurements, overall rating, and technical/physical attributes. Opponent samples additionally include formation-slot information used by the matchup analysis.

The application parser is designed to normalize imported CSV data into the internal player model before optimization.

## Data provenance

These files were used as academic/demo data for the thesis project. Before redistributing or expanding this dataset, document the original source of the player ratings and confirm that its terms permit redistribution. The repository does not claim ownership of third-party player statistics or ratings.

For a portfolio demonstration, these files should be treated as sample inputs for the optimization software rather than as an independently published football dataset.
