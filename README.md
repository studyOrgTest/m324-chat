# M324 Chat – DevOps Project

A simple real-time chat application (TypeScript, Express, WebSockets) used as the basis
for the ICT Module 324 DevOps work: linting, testing, building, CI/CD on a self-hosted
runner, automated deployment to Kubernetes, and monitoring.

## Features

- Real-time chat over WebSockets
- Dark mode UI
- List of currently connected users
- "is typing" indicator
- `GET /healthcheck` endpoint (`200 { "status": "OK" }`) for monitoring and probes

## Prerequisites

- Node.js >= 20
- Docker (Docker Desktop, which also provides a local Kubernetes cluster)

## Get started (local development)

```bash
npm install
npm run dev   # then open http://localhost:3000
```

## NPM scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server with live reload |
| `npm run build` | Compile TypeScript into `build/` |
| `npm start` | Run the compiled server (`build/index.js`) |
| `npm run lint` | Lint the TypeScript sources with ESLint |
| `npm test` | Run the Jest unit tests |
| `npm run format` | Format the code with Prettier |

## Docker

```bash
docker build -t m324-chat .     # build stage runs lint + test + build
docker run -p 3000:3000 m324-chat
```

## CI/CD, Kubernetes & monitoring

- CI: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)
- CD: [`.github/workflows/cd.yml`](.github/workflows/cd.yml)
- Kubernetes manifests: [`k8s/`](k8s/)
- Monitoring (Uptime Kuma): [`docker-compose.monitoring.yml`](docker-compose.monitoring.yml)

## Documentation

- **[DOKUMENTATION.md](DOKUMENTATION.md)** – DevOps process documentation (CI/CD &
  branching diagrams, monitoring) in Swiss Standard German.
- **[SETUP.md](SETUP.md)** – one-time infrastructure setup runbook.
