import { useEffect, useRef, useState } from "react";
import { theme } from "../../theme";

function latLonToTile(lat: number, lon: number, zoom: number) {
  const n = 2 ** zoom;
  const xf = ((lon + 180) / 360) * n;
  const lr = (lat * Math.PI) / 180;
  const yf = ((1 - Math.log(Math.tan(lr) + 1 / Math.cos(lr)) / Math.PI) / 2) * n;
  return { xi: Math.floor(xf), yi: Math.floor(yf), xf: xf - Math.floor(xf), yf: yf - Math.floor(yf) };
}

function drawPin(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.beginPath();
  ctx.arc(x, y - 22, 14, 0, Math.PI * 2);
  ctx.fillStyle = theme.amber;
  ctx.fill();
  ctx.strokeStyle = "#FFF";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(x - 10, y - 12);
  ctx.lineTo(x, y + 2);
  ctx.lineTo(x + 10, y - 12);
  ctx.fillStyle = theme.amber;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y - 22, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#FFF";
  ctx.fill();
  ctx.restore();
}

export default function CanvasMap({ lat, lon, height = 220 }: { lat: number; lon: number; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !lat || !lon) return;

    const ZOOM = 16;
    const TILE = 256;
    const W = canvas.parentElement?.clientWidth || 400;
    const H = height;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ddd6c4";
    ctx.fillRect(0, 0, W, H);
    setStatus("loading");

    const { xi, yi, xf, yf } = latLonToTile(lat, lon, ZOOM);
    const cx = Math.round(W / 2);
    const cy = Math.round(H / 2);
    const tiles: { tx: number; ty: number; px: number; py: number }[] = [];

    for (let dx = -3; dx <= 3; dx++) {
      for (let dy = -3; dy <= 3; dy++) {
        tiles.push({
          tx: xi + dx,
          ty: yi + dy,
          px: Math.round(cx - xf * TILE + dx * TILE),
          py: Math.round(cy - yf * TILE + dy * TILE),
        });
      }
    }

    let done = 0;
    let ok = 0;
    const onFinish = () => {
      drawPin(ctx, cx, cy);
      setStatus(ok > 0 ? "loaded" : "error");
    };

    tiles.forEach(({ tx, ty, px, py }) => {
      fetch(`https://tile.openstreetmap.org/${ZOOM}/${tx}/${ty}.png`)
        .then((r) => (r.ok ? r.blob() : Promise.reject()))
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, px, py, TILE, TILE);
            URL.revokeObjectURL(url);
            ok++;
            done++;
            if (done === tiles.length) onFinish();
          };
          img.onerror = () => {
            done++;
            if (done === tiles.length) onFinish();
          };
          img.src = url;
        })
        .catch(() => {
          done++;
          if (done === tiles.length) onFinish();
        });
    });
  }, [lat, lon, height]);

  return (
    <div className="relative overflow-hidden bg-[#ddd6c4]" style={{ height }}>
      <canvas ref={canvasRef} className="block h-full w-full" />
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#ddd6c4]/90 text-sm text-[#7A8898]">
          Cargando mapa…
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#ddd6c4] text-sm text-[#7A8898] px-4 text-center">
          Mapa no disponible
        </div>
      )}
    </div>
  );
}
