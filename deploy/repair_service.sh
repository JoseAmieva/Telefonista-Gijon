#!/usr/bin/env bash
# Repara 502: systemd con usuario correcto, .env y reinicio.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/telefonista-gijon}"
USER_NAME="$(whoami)"
NODE_BIN="$(command -v node)"

cd "$APP_DIR"
sudo chown -R "$USER_NAME:$USER_NAME" "$APP_DIR"

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

kv["NODE_ENV"] = "production"
kv["PORT"] = kv.get("PORT") or "4000"
kv["CLIENT_ORIGIN"] = "https://pruebacentralita.duckdns.org"
if kv.get("JWT_SECRET", "").startswith("cambiar") or len(kv.get("JWT_SECRET", "")) < 16:
    kv["JWT_SECRET"] = secrets.token_hex(32)
kv.setdefault("APP_USER", "user1")
kv.setdefault("APP_PASSWORD", "user1")

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

for k in ["NODE_ENV", "PORT", "JWT_SECRET", "APP_USER", "APP_PASSWORD", "CLIENT_ORIGIN"]:
    if k in kv and k not in written:
        out.append(f"{k}={kv[k]}")

p.write_text("\n".join(out) + "\n", encoding="utf-8")
print(".env ok")
PY

if [ ! -f server/dist/index.js ]; then
  echo "ERROR: falta server/dist/index.js — ejecuta: cd $APP_DIR && npm ci && npm run build"
  exit 1
fi

echo "== systemd ($USER_NAME)"
sudo tee /etc/systemd/system/telefonista.service >/dev/null <<EOF
[Unit]
Description=Centralita Telefonista Gijon (Node)
After=network.target

[Service]
Type=simple
User=$USER_NAME
Group=$USER_NAME
WorkingDirectory=$APP_DIR
EnvironmentFile=$APP_DIR/.env
ExecStart=$NODE_BIN server/dist/index.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable telefonista
sudo systemctl restart telefonista
sleep 2

echo "== Estado"
sudo systemctl --no-pager status telefonista | sed -n '1,15p' || true
echo "== Puerto 4000"
curl -sS -I http://127.0.0.1:4000/ | head -n 1 || true
echo "Si ves HTTP/1.1 200, recarga https://pruebacentralita.duckdns.org"
