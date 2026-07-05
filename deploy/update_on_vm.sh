#!/usr/bin/env bash
# Actualiza la app en la VM preservando .env y server/data.
# Funciona con git clone (como el despliegue original por tarball) o con git pull si ya hay repo.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/telefonista-gijon}"
REPO_URL="${REPO_URL:-https://github.com/JoseAmieva/Telefonista-Gijon.git}"
BRANCH="${BRANCH:-main}"
USER_NAME="$(whoami)"

BACKUP_DIR="$(mktemp -d)"
trap 'rm -rf "$BACKUP_DIR"' EXIT

sudo mkdir -p "$APP_DIR"

echo "== Respaldo .env y datos"
if [ -f "$APP_DIR/.env" ]; then
  cp "$APP_DIR/.env" "$BACKUP_DIR/.env" 2>/dev/null || sudo cp "$APP_DIR/.env" "$BACKUP_DIR/.env"
fi
if [ -d "$APP_DIR/server/data" ]; then
  tar -czf "$BACKUP_DIR/data.tgz" -C "$APP_DIR/server" data 2>/dev/null \
    || sudo tar -czf "$BACKUP_DIR/data.tgz" -C "$APP_DIR/server" data
fi
sudo chown -R "$USER_NAME:$USER_NAME" "$BACKUP_DIR" 2>/dev/null || true

if [ -d "$APP_DIR/.git" ]; then
  echo "== Git pull (repo existente)"
  sudo chown -R "$USER_NAME:$USER_NAME" "$APP_DIR"
  cd "$APP_DIR"
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
else
  echo "== Sin .git: clonar última versión (despliegue original era tarball, no git)"
  CLONE_DIR="$(mktemp -d)"
  git clone --depth 1 -b "$BRANCH" "$REPO_URL" "$CLONE_DIR"
  echo "== Limpiar instalación anterior"
  sudo find "$APP_DIR" -mindepth 1 -maxdepth 1 ! -name '.env' -exec rm -rf {} +
  sudo chown -R "$USER_NAME:$USER_NAME" "$APP_DIR"
  cp -a "$CLONE_DIR"/. "$APP_DIR"/
  rm -rf "$CLONE_DIR"
  cd "$APP_DIR"
fi

if [ -f "$BACKUP_DIR/.env" ]; then mv "$BACKUP_DIR/.env" .env; fi
mkdir -p server/data
if [ -f "$BACKUP_DIR/data.tgz" ]; then tar -xzf "$BACKUP_DIR/data.tgz" -C server; fi

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
