# Despliegue en Google Compute Engine (VM)

VM de ejemplo: zona `us-west1-b`, IP externa `136.117.52.81`. Ajusta nombres de instancia y proyecto a los tuyos.

## Actualizar la app (sin recordar contraseñas SSH)

**No hace falta contraseña de la VM ni tu cuenta de GitHub.** El SSH de Google Cloud usa tu **cuenta de Google** (la misma con la que entras en GCP), no GitHub.

### Si al pulsar SSH se cierra la ventana al instante

Prueba en este orden:

1. **Cloud Shell** (suele ser lo más fiable): en la consola de GCP, arriba a la derecha, icono **>_** (Activar Cloud Shell). Cuando abra el terminal, pega:

```bash
gcloud compute ssh --zone "us-west1-b" "instance-20260512-183708" --project "project-ee762301-896e-4615-821"
```

2. **SSH en ventana aparte**: en la lista de instancias, flecha junto a **SSH** → **Abrir en ventana del navegador** (no en panel lateral).

3. **No uses credenciales de GitHub** para entrar a la VM. GitHub solo sirve para el código en GitHub.com; no es el login del servidor.

### Actualizar la centralita (dentro de la VM o tras conectar por Cloud Shell)

El repositorio en GitHub es **privado**, así que `curl` a `raw.githubusercontent.com` devuelve **404**. Opciones:

**A) Hacer el repo público** (más simple para esta centralita de prueba): GitHub → *Telefonista-Gijon* → Settings → Danger zone → *Change repository visibility* → Public. Luego:

```bash
curl -fsSL https://raw.githubusercontent.com/JoseAmieva/Telefonista-Gijon/main/deploy/update_on_vm.sh | bash
```

**B) Repo privado:** crea un [token de acceso personal](https://github.com/settings/tokens) con permiso `repo`, y en la VM (sustituye `TU_TOKEN`, no lo compartas con nadie):

```bash
export GITHUB_TOKEN="TU_TOKEN"
git clone --depth 1 -b main "https://${GITHUB_TOKEN}@github.com/JoseAmieva/Telefonista-Gijon.git" /tmp/telefonista-gijon-clone
# … luego el bloque «Actualizar sin curl» de abajo (desde «APP=/opt/telefonista-gijon»).
```

**C) Sin curl ni token:** pega el bloque completo «Actualizar sin curl» de la sección siguiente (clona solo si el repo es público o ya exportaste `GITHUB_TOKEN`).

4. Recarga [http://pruebacentralita.duckdns.org](http://pruebacentralita.duckdns.org).

### Actualizar sin curl (pegar entero en la VM)

Si el repo es **público**, o antes has hecho `export GITHUB_TOKEN="..."` (repo privado):

```bash
set -euo pipefail
APP=/opt/telefonista-gijon
REPO="https://github.com/JoseAmieva/Telefonista-Gijon.git"
[ -n "${GITHUB_TOKEN:-}" ] && REPO="https://${GITHUB_TOKEN}@github.com/JoseAmieva/Telefonista-Gijon.git"
[ -f "$APP/.env" ] && cp "$APP/.env" /tmp/telefonista.env.bak
[ -d "$APP/server/data" ] && tar -czf /tmp/telefonista-data-bak.tgz -C "$APP/server" data || true
rm -rf /tmp/telefonista-gijon-clone
git clone --depth 1 -b main "$REPO" /tmp/telefonista-gijon-clone
find "$APP" -mindepth 1 -maxdepth 1 ! -name '.env' -exec rm -rf {} +
cp -a /tmp/telefonista-gijon-clone/. "$APP"/
cd "$APP"
[ -f /tmp/telefonista.env.bak ] && mv /tmp/telefonista.env.bak .env
mkdir -p server/data
[ -f /tmp/telefonista-data-bak.tgz ] && tar -xzf /tmp/telefonista-data-bak.tgz -C server || true
npm ci && npm run build && sudo systemctl restart telefonista
echo "Listo — recarga https://pruebacentralita.duckdns.org"
```

**Login de la aplicación** (no es la VM): por defecto `user1` / `user1` (configurable en `.env` con `APP_USER` y `APP_PASSWORD`).

### Despliegue automático (una sola vez)

Para que cada `push` a `main` actualice la VM sin entrar a mano:

1. En GCP, genera o usa una clave SSH para tu usuario de la VM (ej. `jamievam`).
2. En GitHub → repo **Telefonista-Gijon** → Settings → Secrets → Actions → **New secret**
3. Nombre: `VM_SSH_KEY` — valor: la clave privada completa.
4. El workflow `.github/workflows/deploy-vm.yml` desplegará solo en cada push a `main`.

## 1. Entrar por SSH (alternativa con gcloud local)

```bash
gcloud compute ssh --zone "us-west1-b" "instance-20260512-183708" --project "project-ee762301-896e-4615-821"
```

(O el usuario Linux que uses en la VM.)

## 2. Instalar Node.js (recomendado: LTS 22)

En Ubuntu/Debian (NodeSource LTS 22):

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential git
node -v
npm -v
```

## 3. Código en el servidor

```bash
sudo mkdir -p /opt/telefonista-gijon
sudo chown "$USER:$USER" /opt/telefonista-gijon
cd /opt/telefonista-gijon
git clone https://github.com/JoseAmieva/Telefonista-Gijon.git .
npm ci
```

## 4. Variables de entorno

```bash
cp deploy/env.example .env
nano .env
```

Define al menos:

- `JWT_SECRET` — cadena larga aleatoria (mínimo 16 caracteres).
- `APP_USER` / `APP_PASSWORD` — usuario y contraseña de la app (o `APP_PASSWORD_HASH` con bcrypt).
- `CLIENT_ORIGIN` — URL pública con la que accedes (ej. `https://centralita.tudominio.es`). Si sirves todo por el mismo host y puerto 4000, puedes usar `https://centralita.tudominio.es`.
- `PORT=4000` — interno; Nginx hará de proxy.

## 5. Build y servicio systemd

```bash
mkdir -p server/data
npm run build
# Ajustar User/Group en el unit si tu usuario no es "ubuntu":
nano deploy/systemd/telefonista.service
sudo cp deploy/systemd/telefonista.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable telefonista
sudo systemctl start telefonista
sudo systemctl status telefonista
```

Los datos de historial se guardan en `server/data/db.json` (crear backup periódico).

## 6. Firewall en GCP

En la consola de VPC o `gcloud`, abre al menos:

- TCP **22** (SSH, restringido a tus IPs si puedes).
- TCP **80** y **443** si usas Nginx + Let’s Encrypt.

## 7. Nginx + HTTPS (Certbot)

Instala Nginx y Certbot, copia la plantilla y sustituye `TU_DOMINIO`:

```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
sudo cp deploy/nginx-telefonista.example.conf /etc/nginx/sites-available/telefonista
sudo nano /etc/nginx/sites-available/telefonista
sudo ln -sf /etc/nginx/sites-available/telefonista /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d TU_DOMINIO
```

Certbot ampliará este sitio a HTTPS (certificados en `/etc/letsencrypt/`).

Tras tener HTTPS, actualiza `CLIENT_ORIGIN` en `.env` a `https://TU_DOMINIO`, reinicia:

```bash
sudo systemctl restart telefonista
```

## 8. Comprobar

- Navegador: `https://TU_DOMINIO` (o `http://IP:4000` solo en pruebas; en producción usa HTTPS detrás de Nginx).
- Logs: `journalctl -u telefonista -f`

## Actualizar versión

En la VM (SSH navegador):

```bash
cd /opt/telefonista-gijon && bash deploy/update_on_vm.sh
```

Desde tu máquina con `gcloud` (método original del agente: tarball + `deploy_vm.sh`):

```bash
bash deploy/push_from_local.sh
```
