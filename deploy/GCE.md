# Despliegue en Google Compute Engine (VM)

VM de ejemplo: zona `us-west1-b`, IP externa `136.117.52.81`. Ajusta nombres de instancia y proyecto a los tuyos.

## 1. Entrar por SSH

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

```bash
cd /opt/telefonista-gijon
git pull
npm ci
npm run build
sudo systemctl restart telefonista
```
