# Football Lineup Optimizer

A web application that optimizes football lineups by assigning players to tactical positions using a cost-matrix model and the **Hungarian algorithm**. Built as a Computer Science thesis/project to combine algorithm design, data processing, and a modern React interface.

## Why this project is interesting

Instead of selecting the highest-rated players greedily, the optimizer models lineup selection as an **assignment problem**. It evaluates how well each player fits each position and finds a globally optimal assignment while accounting for tactical and opponent-related factors.

### Highlights

- Hungarian algorithm for optimal player-to-position assignment
- Cost-matrix generation from player attributes and positional fit
- Formation evaluation and tactical penalties
- Opponent matchup and weakness mapping
- CSV-based squad and opponent import
- Player comparison and radar-chart visualizations
- Local persistence for user data
- Dockerized production build served with Nginx
- Automated CI, GitHub Pages deployment, and GHCR image publishing

## Tech stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/Radix UI, Recharts  
**Algorithms:** Hungarian assignment algorithm, weighted scoring, formation-fit penalties  
**Data:** Papa Parse / CSV  
**DevOps:** Docker, Nginx, Docker Compose, GitHub Actions, GitHub Pages, GitHub Container Registry

## Architecture

```text
CSV / Sample Data / User Data
      |
      v
 Parsing + Validation
      |
      v
 Player / Opponent Models
      |
      v
 Cost Matrix Builder
      |
      v
 Hungarian Algorithm
      |
      v
 Formation Evaluation
      |
      v
 Optimized Lineup + Visualizations
```

The optimization engine lives under `src/lib/engine/` and is kept separate from the React UI so the algorithmic logic is easier to understand and maintain.

## Run locally

### Node.js

```bash
npm install
npm run dev
```

Open `http://localhost:8080`.

### Docker

```bash
docker build -t football-lineup-optimizer .
docker run --rm -p 8080:80 football-lineup-optimizer
```

Or with Docker Compose:

```bash
docker compose up --build
```

Open `http://localhost:8080`.

## Production deployment

### GitHub Pages

The workflow at `.github/workflows/deploy-pages.yml` builds and deploys the application automatically whenever `main` is updated.

After pushing the repository, open **GitHub → Repository Settings → Pages** and set the source to **GitHub Actions**. The deployment workflow will publish the live URL.

### Docker image on GHCR

Every push to `main` also publishes a container image to GitHub Container Registry through `.github/workflows/publish-container.yml`.

The resulting image follows this format:

```bash
ghcr.io/<github-username>/<repository-name>:latest
```

Run it with:

```bash
docker run --rm -p 8080:80 ghcr.io/<github-username>/<repository-name>:latest
```

## Project structure

```text
data/
├── teams/              # Sample candidate squads
└── opponents/          # Sample opponent lineups and formations
docs/
└── thesis-report-public.pdf
src/
├── components/         # Reusable UI and football visualizations
├── lib/
│   ├── engine/         # Optimization algorithms and tactical scoring
│   ├── hooks/          # React hooks
│   ├── parsers/        # CSV parsing
│   ├── radar/          # Radar chart data preparation
│   └── utils/          # Domain and matrix utilities
└── pages/              # Application pages
```


## Sample datasets

The repository includes reproducible sample inputs under [`data/`](data/): four candidate squads and seven opponent lineups covering several common formations. These make it possible to inspect the CSV schema and exercise the optimizer without creating a dataset from scratch.

See [`data/README.md`](data/README.md) for the dataset structure and provenance note. Player statistics/ratings should be treated as demonstration inputs; this repository does not claim ownership of third-party football data.

## Academic background

This project was developed as a Computer Science diploma thesis at the University of Crete. The report covers the assignment problem, Hungarian algorithm, complexity analysis, cost-matrix construction, player-position compatibility, tactical formation modelling, opponent-aware optimization, architecture, testing, and future work.

[Read the public thesis report](docs/thesis-report-public.pdf). The public copy omits the student ID from the title page.

## Algorithm overview

For a selected formation, the application creates a cost matrix where rows represent players and columns represent available tactical positions. Each matrix value represents the cost of assigning a specific player to a specific position.

The scoring layer considers factors such as player attributes, natural/secondary positional suitability, formation-specific penalties, tactical relationships, and opponent information. The Hungarian algorithm then finds the assignment with the minimum total cost rather than making independent greedy choices.

This separation makes it possible to improve the football model without replacing the optimization algorithm itself.

## CI/CD

The repository contains three GitHub Actions workflows:

- **CI** — installs dependencies, builds the app, and verifies the Docker image can be built.
- **Deploy GitHub Pages** — deploys the production frontend from `main`.
- **Publish Docker Image** — publishes tagged and latest images to GHCR.

## Future improvements

- Automated unit tests for cost-matrix and assignment logic
- Benchmarking optimizer performance for different squad sizes
- Stronger schema validation for imported datasets
- Backend/API persistence and authentication
- Data-driven tuning of tactical weights

## CV-ready summary

> Developed a React/TypeScript football lineup optimization platform using the Hungarian algorithm to solve player-to-position assignment, with custom cost-matrix scoring, tactical formation analysis, opponent matchup logic, CSV processing, interactive visualizations, Dockerized deployment, and automated GitHub Actions CI/CD.
