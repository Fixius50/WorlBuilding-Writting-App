import { useEffect, useMemo, useState } from "react";
import { WorkspaceUseCase } from "../application/WorkspaceUseCase";

const IMAGE_EXTENSION_RE = /\.(png|jpe?g|webp|gif|bmp|avif|svg)(\?.*)?$/i;

const PROBE_TIMEOUT_MS = 4500;
const COVER_RESOLUTION_CACHE_KEY = "workspace_cover_resolution_cache_v1";

type CoverResolutionCache = Record<string, string>;

const buildProxyImageUrl = (value: string): string => {
  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return value;
    }

    const withoutProtocol = `${parsed.host}${parsed.pathname}${parsed.search}`;
    return `https://images.weserv.nl/?url=${encodeURIComponent(withoutProtocol)}&w=1600&output=jpg`;
  } catch {
    // noop
  }

  return value;
};

const buildUniversalPreviewUrl = (value: string): string => {
  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return value;
    }

    // Vista previa universal para enlaces de página (no imagen directa).
    return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(parsed.toString())}?w=1600`;
  } catch {
    // noop: si no parsea, se devuelve el valor original
  }

  return value;
};

const normalizeImageUrl = (rawUrl: string): string => {
  const value = rawUrl.trim();

  if (!value) return "";
  if (value.startsWith("data:")) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;

  return `https://${value}`;
};

const probeImageSource = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const probe = new Image();
    let settled = false;

    const finish = (result: boolean) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const timeout = window.setTimeout(() => finish(false), PROBE_TIMEOUT_MS);

    probe.onload = () => {
      window.clearTimeout(timeout);
      finish(true);
    };

    probe.onerror = () => {
      window.clearTimeout(timeout);
      finish(false);
    };

    probe.onabort = () => {
      window.clearTimeout(timeout);
      finish(false);
    };

    probe.src = url;
  });
};

export type CoverProbeState = {
  status: "empty" | "checking" | "valid" | "invalid";
  message: string;
};

export const useCoverImageValidation = (coverUrl: string) => {
  const normalizedCoverUrl = useMemo(
    () => normalizeImageUrl(coverUrl),
    [coverUrl],
  );
  const [resolvedCoverUrl, setResolvedCoverUrl] = useState("");
  const [previewError, setPreviewError] = useState(false);
  const [resolutionCache, setResolutionCache] = useState<CoverResolutionCache>(
    {},
  );
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [coverProbe, setCoverProbe] = useState<CoverProbeState>({
    status: "empty",
    message: "Sin enlace",
  });

  useEffect(() => {
    let cancelled = false;

    WorkspaceUseCase.getSetting(COVER_RESOLUTION_CACHE_KEY)
      .then((stored) => {
        if (cancelled) return;

        if (!stored) {
          setCacheLoaded(true);
          return;
        }

        try {
          const parsed = JSON.parse(stored) as CoverResolutionCache;
          setResolutionCache(parsed ?? {});
        } catch {
          setResolutionCache({});
        }

        setCacheLoaded(true);
      })
      .catch(() => {
        if (!cancelled) {
          setCacheLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const saveResolution = (sourceUrl: string, resolvedUrl: string) => {
    if (!sourceUrl || !resolvedUrl) return;

    const current = resolutionCache[sourceUrl];
    if (current === resolvedUrl) return;

    const nextCache: CoverResolutionCache = {
      ...resolutionCache,
      [sourceUrl]: resolvedUrl,
    };

    setResolutionCache(nextCache);
    WorkspaceUseCase.saveSetting(
      COVER_RESOLUTION_CACHE_KEY,
      JSON.stringify(nextCache),
    ).catch(() => {
      // [LOG REMOVED]
    });
  };

  useEffect(() => {
    let cancelled = false;
    setPreviewError(false);

    if (!normalizedCoverUrl) {
      setResolvedCoverUrl("");
      setCoverProbe({ status: "empty", message: "Sin enlace" });
      return () => {
        cancelled = true;
      };
    }

    if (normalizedCoverUrl.startsWith("data:")) {
      const isDataImage = /^data:image\//i.test(normalizedCoverUrl);
      setResolvedCoverUrl(isDataImage ? normalizedCoverUrl : "");
      setCoverProbe(
        isDataImage
          ? { status: "valid", message: "Data URI de imagen" }
          : { status: "invalid", message: "Data URI no válido para imagen" },
      );

      return () => {
        cancelled = true;
      };
    }

    if (!cacheLoaded) {
      setCoverProbe({
        status: "checking",
        message: "Cargando caché de portadas...",
      });
      return () => {
        cancelled = true;
      };
    }

    const cachedResolvedUrl = resolutionCache[normalizedCoverUrl];
    if (cachedResolvedUrl) {
      setResolvedCoverUrl(cachedResolvedUrl);
      setCoverProbe({
        status: "valid",
        message: "Resuelta desde caché local",
      });
      return () => {
        cancelled = true;
      };
    }

    setCoverProbe({
      status: "checking",
      message: "Probando enlace directo...",
    });
    setResolvedCoverUrl("");

    const directUrl = normalizedCoverUrl;
    const proxiedDirectUrl = buildProxyImageUrl(directUrl);
    const universalPreviewUrl = buildUniversalPreviewUrl(directUrl);
    const proxiedPreviewUrl = buildProxyImageUrl(universalPreviewUrl);

    const candidates: Array<{ url: string; message: string }> = [
      {
        url: directUrl,
        message: IMAGE_EXTENSION_RE.test(directUrl)
          ? "Imagen detectada por extensión"
          : "Imagen detectada por contenido (sin extensión)",
      },
      {
        url: proxiedDirectUrl,
        message: "Imagen detectada: usando proxy anti-protección",
      },
      {
        url: universalPreviewUrl,
        message: "Enlace detectado: usando vista previa automática",
      },
      {
        url: proxiedPreviewUrl,
        message: "Enlace detectado: vista previa por proxy",
      },
    ].filter(
      (entry, idx, arr) => arr.findIndex((v) => v.url === entry.url) === idx,
    );

    (async () => {
      const totalCandidates = candidates.length;
      let checkedCount = 0;
      let foundValid = false;

      const checks = await Promise.all(
        candidates.map(async (candidate, index) => {
          const valid = await probeImageSource(candidate.url);
          checkedCount += 1;

          if (!cancelled && !foundValid && valid) {
            foundValid = true;
            setResolvedCoverUrl(candidate.url);
            setPreviewError(false);
            saveResolution(normalizedCoverUrl, candidate.url);
            setCoverProbe({ status: "valid", message: candidate.message });
          } else if (
            !cancelled &&
            !foundValid &&
            checkedCount < totalCandidates
          ) {
            const nextStep = Math.min(index + 2, totalCandidates);
            setCoverProbe({
              status: "checking",
              message: `Verificando fuentes de portada (${checkedCount}/${totalCandidates})...`,
            });
            if (nextStep === 2) {
              setCoverProbe({
                status: "checking",
                message: "Probando proxy anti-protección...",
              });
            }
          }

          return { candidate, valid };
        }),
      );

      if (cancelled) return;

      const firstValid = checks.find((result) => result.valid);
      if (firstValid) {
        return;
      }

      setResolvedCoverUrl("");
      setCoverProbe({
        status: "invalid",
        message: "El enlace no devuelve una imagen ni vista previa válida",
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [cacheLoaded, normalizedCoverUrl, resolutionCache]);

  const isCoverUrlInvalid = coverProbe.status === "invalid";
  const isSaveBlocked =
    isCoverUrlInvalid ||
    (coverProbe.status === "checking" && !resolvedCoverUrl);

  return {
    normalizedCoverUrl: resolvedCoverUrl,
    coverProbe,
    previewError,
    setPreviewError,
    isCoverUrlInvalid,
    isSaveBlocked,
  };
};
