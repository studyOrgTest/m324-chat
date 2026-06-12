# Setup & Runbook (manual infrastructure steps)

All application code, pipelines, manifests and documentation are already in this
repository. This runbook covers the one-time, account-level steps that require your
own accounts and machine. Do them in order.

> Conventions: replace `<ORG>` with your GitHub organization name and `<DOCKERHUB_USER>`
> with your Docker Hub username.

---

## 0. Install Docker Desktop (provides Docker + kubectl + local Kubernetes)

1. Install **Docker Desktop** for macOS.
2. Open **Settings → Kubernetes → Enable Kubernetes**, then wait until the cluster is
   green.
3. Verify in a terminal:
   ```bash
   docker version
   kubectl config current-context   # should print: docker-desktop
   ```

This single install gives you `docker`, `kubectl` and a local Kubernetes cluster, so
k3d/minikube are not needed.

---

## 1. GitHub organization and repository

1. Create a **free GitHub organization**: <https://github.com/organizations/new> → Free
   plan. Note its name as `<ORG>`.
2. From the project directory, create the repository inside the org and push everything:
   ```bash
   gh repo create <ORG>/m324-chat --private --source=. --remote=origin --push
   git push origin --all     # pushes master, development and all feature/* branches
   ```
3. Add your lecturer ("Dozent") as an **Owner/Admin** of the organization (Org → People →
   Invite member → role Owner).

> Assistant can run the `gh` commands for the repository, issues and pull requests once
> the organization exists — just provide the org name.

---

## 2. Self-hosted runner (at least one)

The CI/CD workflows use `runs-on: self-hosted`, and the deploy step needs to reach your
local Kubernetes cluster — so the runner must run on your machine.

1. In the repository: **Settings → Actions → Runners → New self-hosted runner** (choose
   macOS).
2. Run the displayed commands (download, then `./config.sh --url ... --token ...`).
3. Start the runner:
   ```bash
   ./run.sh          # foreground; or install as a service with ./svc.sh install && ./svc.sh start
   ```
4. Make sure `docker` and `kubectl` are on the runner's PATH (they are if Docker Desktop
   is installed for your user).

---

## 3. Docker Hub secrets

1. Create a Docker Hub access token: Docker Hub → Account Settings → Security → New Access
   Token.
2. Create the target repository `<DOCKERHUB_USER>/m324-chat` and set it to **Public** (so
   the local cluster can pull the image without an imagePullSecret).
3. In the GitHub repo: **Settings → Secrets and variables → Actions → New repository
   secret** and add:
   - `DOCKERHUB_USERNAME` = `<DOCKERHUB_USER>`
   - `DOCKERHUB_TOKEN` = the access token

---

## 4. Project board (Kanban) and issues

The grading rubric expects a Project with a Kanban board, one issue per requirement, and
the issues linked/assigned/moved to the right status.

**Option A – let the assistant script it** (needs the `project` scope once):
```bash
gh auth refresh -s project,read:project
```
Then the assistant can create the project, the issues and link them.

**Option B – web UI:** Org → Projects → New project → Board. Add columns
`Todo / In Progress / Done`. Create one issue per requirement (dark mode, connected users,
typing indicator, /healthcheck, CI pipeline, CD pipeline) and add them to the board.

---

## 5. Branching / pull-request flow

The feature branches already exist locally and are pushed in step 1. Merge them into
`development` via pull requests, then merge `development` into `master` to trigger the CD
deployment. The exact procedure is documented in
[`DOKUMENTATION.md`](DOKUMENTATION.md#33-konkretes-vorgehen-für-entwickler).

> Use **merge commits** (not squash) when merging the stacked feature PRs, so the history
> stays consistent.

---

## 6. Monitoring (Uptime Kuma + e-mail notifier)

1. Make sure the app is deployed and reachable at `http://localhost:30080/healthcheck`
   (after the CD pipeline ran, or deploy manually:
   `IMAGE=<DOCKERHUB_USER>/m324-chat:latest ./k8s/deploy.sh`).
2. Start Uptime Kuma:
   ```bash
   docker compose -f docker-compose.monitoring.yml up -d
   ```
3. Open <http://localhost:3001>, create the admin account.
4. **Add a monitor** (type HTTP(s)) on `http://host.docker.internal:30080/healthcheck`,
   interval 60s, expected status 200.
5. **Add a notification** (type Email/SMTP) with your mail provider's SMTP settings and
   assign it to the monitor.
6. Take the three screenshots and save them to `docs/screenshots/` (see the file names in
   `docs/screenshots/README.md`).

---

## 7. Local development quickstart

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint     # ESLint
npm test         # Jest
npm run build    # tsc -> build/
docker build -t m324-chat .   # full pipeline inside the image
```
