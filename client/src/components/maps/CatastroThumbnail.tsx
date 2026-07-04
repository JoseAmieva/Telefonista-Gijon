import { useEffect, useState } from "react";
import { theme } from "../../theme";
import { apiCatastroWms } from "../../api";

function Crosshair() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative h-12 w-12">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-[#B87420] opacity-90 shadow" />
        <div className="absolute bottom-0 left-1/2 top-0 w-0.5 -translate-x-1/2 bg-[#B87420] opacity-90 shadow" />
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#B87420] bg-[#B87420]/25" />
      </div>
    </div>
  );
}

export default function CatastroThumbnail({ lat, lon, height = 220 }: { lat: number; lon: number; height?: number }) {
  const [src, setSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  useEffect(() => {
    if (!lat || !lon) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    setStatus("loading");
    setSrc(null);

    apiCatastroWms(lat, lon)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
        setStatus("loaded");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [lat, lon]);

  return (
    <div className="relative overflow-hidden bg-[#DDD5C5]" style={{ height, minHeight: height }}>
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center text-sm" style={{ color: theme.muted }}>
          Cargando plano catastral…
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center text-sm px-4 text-center" style={{ color: theme.muted }}>
          Plano catastral no disponible
        </div>
      )}
      {src && (
        <>
          <img src={src} alt="Plano catastral" className="block h-full w-full object-cover" />
          <Crosshair />
        </>
      )}
    </div>
  );
}
