#!/usr/bin/env bash
# Despliegue desde máquina local con gcloud (método original del agente).
# Empaqueta el repo, sube el tarball a la VM y ejecuta deploy_vm.sh.
set -euo pipefail

ZONE="${ZONE:-us-west1-b}"
INSTANCE="${INSTANCE:-instance-20260512-183708}"
PROJECT="${PROJECT:-project-ee762301-896e-4615-821}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "Falta gcloud. Instálalo o usa deploy/update_on_vm.sh dentro de la VM (SSH navegador)."
  exit 1
fi

echo "== Crear tarball (sin node_modules ni .git)"
TMP_TGZ="$(mktemp /tmp/telefonista-gijon.XXXXXX.tgz)"
tar -czf "$TMP_TGZ" \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=client/dist \
  --exclude=server/dist \
  -C "$REPO_ROOT" .

echo "== Subir a la VM"
gcloud compute scp --zone "$ZONE" --project "$PROJECT" \
  "$TMP_TGZ" "$INSTANCE:/tmp/telefonista-gijon.tgz"

echo "== Ejecutar deploy en la VM"
gcloud compute ssh --zone "$ZONE" --project "$PROJECT" "$INSTANCE" \
  --command "bash -s" < "$REPO_ROOT/deploy/deploy_vm.sh"

rm -f "$TMP_TGZ"
echo "Despliegue terminado. Comprueba https://pruebacentralita.duckdns.org"
