#!/usr/bin/env bash
# Actualización rápida en la VM (tras git pull en main).
# Uso en el servidor:
#   cd /opt/telefonista-gijon && bash deploy/pull_on_vm.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/telefonista-gijon}"
cd "$APP_DIR"

echo "== Git pull"
git fetch origin main
git checkout main
git pull origin main

echo "== Dependencias y build"
npm ci
npm run build

echo "== Reinicio servicio"
sudo systemctl restart telefonista
sleep 2
sudo systemctl --no-pager status telefonista | sed -n '1,15p'

echo "== Comprobación local"
curl -sS -I http://127.0.0.1:4000/ | head -n 1 || true

echo "Listo. Recarga http://pruebacentralita.duckdns.org"
