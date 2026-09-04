"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function VerbImage({
  imageQuery,
  letter,
  className = "h-44",
}: {
  imageQuery: string;
  letter?: string;
  className?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSrc(null);
    setError(false);
    const controller = new AbortController();
    fetch(`/api/verb-image?q=${encodeURIComponent(imageQuery)}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.url) setSrc(data.url);
        else if (!cancelled) setError(true);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [imageQuery]);

  const placeholder = letter?.toUpperCase() ?? "?";

  return (
    <div
      className={`relative w-full shrink-0 overflow-hidden rounded-2xl bg-muted ${className}`}
    >
      {src && !error ? (
        <Image
          src={src}
          alt={imageQuery}
          fill
          sizes="(max-width: 512px) 100vw, 512px"
          className="object-cover"
          unoptimized
          onError={() => setError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-muted-foreground/40">
          {placeholder}
        </div>
      )}
    </div>
  );
}