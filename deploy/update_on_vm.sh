#!/usr/bin/env bash
# Actualiza la app en la VM preservando .env y server/data.
# Funciona con git clone (como el despliegue original por tarball) o con git pull si ya hay repo.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/telefonista-gijon}"
REPO_URL="${REPO_URL:-https://github.com/JoseAmieva/Telefonista-Gijon.git}"
BRANCH="${BRANCH:-main}"

cd "$APP_DIR"

echo "== Respaldo .env y datos"
if [ -f .env ]; then cp .env /tmp/telefonista.env.bak; fi
if [ -d server/data ]; then tar -czf /tmp/telefonista-data-bak.tgz -C server data; fi

if [ -d .git ]; then
  echo "== Git pull (repo existente)"
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
else
  echo "== Sin .git: clonar última versión (despliegue original era tarball, no git)"
  rm -rf /tmp/telefonista-gijon-clone
  git clone --depth 1 -b "$BRANCH" "$REPO_URL" /tmp/telefonista-gijon-clone
  find "$APP_DIR" -mindepth 1 -maxdepth 1 ! -name '.env' -exec rm -rf {} +
  cp -a /tmp/telefonista-gijon-clone/. "$APP_DIR"/
  rm -rf /tmp/telefonista-gijon-clone
fi

if [ -f /tmp/telefonista.env.bak ]; then mv /tmp/telefonista.env.bak .env; fi
mkdir -p server/data
if [ -f /tmp/telefonista-data-bak.tgz ]; then tar -xzf /tmp/telefonista-data-bak.tgz -C server; fi

echo "== Dependencias y build"
npm ci
npm run build

echo "== Reinicio servicio"
sudo systemctl restart telefonista
sleep 2
sudo systemctl --no-pager status telefonista | sed -n '1,12p' || true

echo "== Comprobación local"
curl -sS -I http://127.0.0.1:4000/ | head -n 1 || true

echo "Listo. Recarga https://pruebacentralita.duckdns.org"
