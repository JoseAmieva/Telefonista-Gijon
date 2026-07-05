#!/usr/bin/env bash
set -euo pipefail

PUBLIC_ORIGIN_DEFAULT="http://136.117.52.81"

echo "== Packages"
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl git python3

echo "== Node 22 LTS"
if ! command -v node >/dev/null 2>&1 || ! node -v | grep -q "^v22\\."; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs build-essential
fi

node -v
npm -v

echo "== App dir"
sudo mkdir -p /opt/telefonista-gijon
sudo chown "$(whoami):$(whoami)" /opt/telefonista-gijon
cd /opt/telefonista-gijon

echo "== Extract tarball"
if [ -f .env ]; then cp .env /tmp/telefonista.env.bak; fi
if [ -d server/data ]; then
  rm -f /tmp/telefonista-data-bak.tgz 2>/dev/null || sudo rm -f /tmp/telefonista-data-bak.tgz 2>/dev/null || true
  tar -czf /tmp/telefonista-data-bak.tgz -C server data
fi

rm -rf /opt/telefonista-gijon/*
tar -xzf /tmp/telefonista-gijon.tgz -C /opt/telefonista-gijon
cd /opt/telefonista-gijon

if [ -f /tmp/telefonista.env.bak ]; then mv /tmp/telefonista.env.bak .env; fi
mkdir -p server/data
if [ -f /tmp/telefonista-data-bak.tgz ]; then tar -xzf /tmp/telefonista-data-bak.tgz -C server; fi

echo "== .env"
python3 - <<'PY'
from pathlib import Path
import secrets

p = Path("/opt/telefonista-gijon/.env")
if not p.exists():
    src = Path("/opt/telefonista-gijon/deploy/env.example")
    p.write_text(src.read_text(encoding="utf-8"), encoding="utf-8")

txt = p.read_text(encoding="utf-8").splitlines()
kv = {}
for line in txt:
    if not line or line.lstrip().startswith("#") or "=" not in line:
        continue
    k, v = line.split("=", 1)
    kv[k.strip()] = v

# Always set origin (can be overridden later)
kv["CLIENT_ORIGIN"] = kv.get("CLIENT_ORIGIN") or "http://136.117.52.81"
if kv["CLIENT_ORIGIN"].startswith("https://TU_DOMINIO") or kv["CLIENT_ORIGIN"] == "http://136.117.52.81":
    kv["CLIENT_ORIGIN"] = "http://136.117.52.81"

# Ensure JWT_SECRET
if kv.get("JWT_SECRET", "").startswith("cambiar") or kv.get("JWT_SECRET", "") == "":
    kv["JWT_SECRET"] = secrets.token_hex(32)

out = []
written = set()
for line in txt:
    if not line or line.lstrip().startswith("#") or "=" not in line:
        out.append(line)
        continue
    k, _ = line.split("=", 1)
    k = k.strip()
    if k in kv:
        out.append(f"{k}={kv[k]}")
        written.add(k)
    else:
        out.append(line)

for k in ["NODE_ENV","PORT","JWT_SECRET","APP_USER","APP_PASSWORD","APP_PASSWORD_HASH","CLIENT_ORIGIN"]:
    if k in kv and k not in written:
        out.append(f"{k}={kv[k]}")

p.write_text("\n".join(out) + "\n", encoding="utf-8")
print(".env ok")
PY

echo "== Install & build"
mkdir -p server/data
npm ci
npm run build

echo "== systemd"
USER_NAME="$(whoami)"
sudo tee /etc/systemd/system/telefonista.service >/dev/null <<EOF
[Unit]
Description=Centralita Telefonista Gijon (Node)
After=network.target

[Service]
Type=simple
User=$USER_NAME
Group=$USER_NAME
WorkingDirectory=/opt/telefonista-gijon
EnvironmentFile=/opt/telefonista-gijon/.env
ExecStart=/usr/bin/node server/dist/index.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now telefonista
sudo systemctl restart telefonista

echo "== Status"
sudo systemctl --no-pager --full status telefonista | sed -n "1,25p"

echo "== Local check"
curl -sS -I http://127.0.0.1:4000/ | head -n 1 || true

