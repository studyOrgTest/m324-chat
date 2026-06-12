# Setup & Runbook (manual infrastructure steps)

All application code, pipelines, manifests and documentation are already in this
repository. This runbook covers the one-time, account-level steps that require your
own accounts and machine. Do them in order.

> Conventions: replace `<ORG>` with your GitHub organization name and `<DOCKERHUB_USER>`
> with your Docker Hub username.

---

## 0. Install Docker Desktop (provides Docker + kubectl + local Kubernetes)

1. Install **Docker Desktop** for macOS and make sure it is running.
2. Open **Settings → Kubernetes**, enable Kubernetes / create the cluster. If you are
   asked for a provisioner, the default (**kubeadm**) is fine — it gives a single-node
   cluster. Click **Apply & Restart** and wait until the status indicator turns **green**
   ("Kubernetes running").
3. (Optional) Under **Settings → Resources** give Docker at least ~4 GB RAM; the app is
   small, so the defaults are usually enough.
4. Verify in a terminal:
   ```bash
   docker version
   kubectl config current-context   # should print: docker-desktop
   kubectl get nodes                # should list one node in status Ready
   ```

This single install gives you `docker`, `kubectl` and a local single-node Kubernetes
cluster, so k3d/minikube are not needed. The NodePort service is then reachable at
`http://localhost:30080`.

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

---

## 2. Self-hosted runner (at least one)

The CI/CD workflows use `runs-on: self-hosted`, and the deploy step needs to reach your
local Kubernetes cluster — so the runner must run on your machine. Register it **after**
the repository exists on GitHub (step 1).

1. In the repository: **Settings → Actions → Runners → New self-hosted runner**. Pick
   **macOS** and the architecture matching your Mac (Apple Silicon → `arm64`,
   Intel → `x64`).
2. Run the commands shown on that page **in a dedicated folder outside this project**
   (e.g. `~/actions-runner`) — never inside the repository, otherwise the runner's own
   files would land in your project. The page's first command
   (`mkdir actions-runner && cd actions-runner`) creates that folder, so run it from your
   home directory, not from the project. The remaining commands are: download, extract,
   then `./config.sh --url https://github.com/<ORG>/m324-chat --token <TOKEN>`. The token
   is short-lived, so generate it right before running `config.sh`. Accept the defaults
   (name, the `self-hosted` label, `_work` folder).
3. Start the runner from a terminal **where `docker ps` and `kubectl get nodes` already
   work**, so it inherits the correct PATH:
   ```bash
   ./run.sh
   ```
   (You can later install it as a service with `./svc.sh install && ./svc.sh start`, but
   foreground `./run.sh` is simplest and avoids PATH issues with Docker Desktop.)
4. Keep the runner **and Docker Desktop running** whenever you push branches, open pull
   requests or merge into `master`, so the CI and CD pipelines can execute. The workflows
   match the default `self-hosted` label, so no extra configuration is needed.

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

**Option A – via the `gh` CLI** (grant the `project` scope once):
```bash
gh auth refresh -s project,read:project
```
Then create the project (`gh project create`), the issues (`gh issue create`) and add them
to the board.

**Option B – web UI:** Org → Projects → New project → Board. Add columns
`Todo / In Progress / Done`. Create one issue per requirement (dark mode, connected users,
typing indicator, /healthcheck, CI pipeline, CD pipeline) and add them to the board.

---

## 5. Branching / pull-request flow

The feature branches already exist locally and are pushed in step 1. Open a pull request
from each feature branch into `development` and **merge them in the order they were built**,
so the diffs stay clean:

1. `feature/ci-pipeline`
2. `feature/healthcheck-endpoint`
3. `feature/dark-mode`
4. `feature/active-users-list`
5. `feature/typing-indicator`
6. `feature/cd-pipeline`
7. `docs/documentation`

Then open a final pull request from `development` into `master`; merging it triggers the
CD deployment. The developer procedure is documented in
[`DOKUMENTATION.md`](DOKUMENTATION.md#33-konkretes-vorgehen-für-entwickler).

> Use **merge commits** (not squash) when merging the stacked PRs, so the history stays
> consistent.

---

## 6. Monitoring (Uptime Kuma + ntfy notifier)

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
5. **Add a notification** (type ntfy): server `https://ntfy.sh` and a unique topic name
   (no account or password needed); assign it to the monitor.
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
