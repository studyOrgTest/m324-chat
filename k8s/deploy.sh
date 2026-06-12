#!/usr/bin/env bash
#
# Deploy the chat application to the current kube-context.
#
# Usage:
#   IMAGE=<dockerhub-user>/m324-chat:<tag> ./k8s/deploy.sh
#
# The same script is used by the CD workflow and for manual local deployments.
set -euo pipefail

IMAGE="${IMAGE:?Set IMAGE to <dockerhub-user>/m324-chat:<tag>}"
DIR="$(cd "$(dirname "$0")" && pwd)"

# Namespace and service are static; the deployment image is templated.
kubectl apply -f "$DIR/namespace.yaml"
kubectl apply -f "$DIR/service.yaml"
sed "s|__IMAGE__|${IMAGE}|g" "$DIR/deployment.yaml" | kubectl apply -f -

# Wait for the rollout so a broken deployment fails the pipeline.
kubectl rollout status deployment/m324-chat -n m324 --timeout=120s
