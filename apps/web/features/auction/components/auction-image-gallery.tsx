"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

type AuctionImageGalleryProps = {
  images: string[];
  title: string;
};

export function AuctionImageGallery({
  images,
  title,
}: AuctionImageGalleryProps) {
  const uniqueImages = useMemo(() => {
    const seen = new Set<string>();
    return images.filter((url) => {
      if (seen.has(url)) {
        return false;
      }
      seen.add(url);
      return true;
    });
  }, [images]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [transformOrigin, setTransformOrigin] = useState("center");
  const [isDragging, setIsDragging] = useState(false);
  const activePointerIdRef = useRef<number | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  if (uniqueImages.length === 0) {
    return null;
  }

  const selectedImage = uniqueImages[selectedIndex] ?? uniqueImages[0];

  const zoomIn = () => {
    setZoom((currentZoom) => Math.min(currentZoom + 0.25, 3));
  };

  const zoomOut = () => {
    setZoom((currentZoom) => Math.max(currentZoom - 0.25, 1));
  };

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setTransformOrigin("center");
  };

  const onLightboxDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (zoom > 1) {
      resetZoom();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const originX = ((event.clientX - rect.left) / rect.width) * 100;
    const originY = ((event.clientY - rect.top) / rect.height) * 100;

    setTransformOrigin(`${originX}% ${originY}%`);
    setZoom(2);
    setPan({ x: 0, y: 0 });
  };

  const startPan = (event: React.PointerEvent<HTMLDivElement>) => {
    if (zoom <= 1) {
      return;
    }

    activePointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    panStartRef.current = { ...pan };
  };

  const updatePan = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) {
      return;
    }

    if (activePointerIdRef.current !== event.pointerId) {
      return;
    }

    const dx = event.clientX - dragStartRef.current.x;
    const dy = event.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const stopPan = (event?: React.PointerEvent<HTMLDivElement>) => {
    if (event && activePointerIdRef.current === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    activePointerIdRef.current = null;
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isLightboxOpen]);

  return (
    <div className="mt-5 space-y-3">
      <button
        type="button"
        onClick={() => {
          setZoom(1);
          setPan({ x: 0, y: 0 });
          setIsLightboxOpen(true);
        }}
        onDragStart={(event) => event.preventDefault()}
        className="relative block h-56 w-full cursor-zoom-in overflow-hidden rounded-2xl border border-theme-line sm:h-72"
        aria-label="Mở ảnh lớn"
      >
        <Image
          src={selectedImage}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 65vw"
          draggable={false}
        />
      </button>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {uniqueImages.map((url, index) => {
          const isActive = index === selectedIndex;

          return (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`cursor-pointer rounded-xl border bg-theme-bg p-2 text-left transition ${
                isActive
                  ? "border-theme-brand ring-2 ring-theme-brand/25"
                  : "border-theme-line hover:border-theme-brand/50"
              }`}
              aria-label={`Xem ảnh ${index + 1}`}
            >
              <div className="relative h-24 overflow-hidden rounded-lg border border-theme-line sm:h-28">
                <Image
                  src={url}
                  alt={`${title} - ảnh ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  draggable={false}
                />
              </div>
            </button>
          );
        })}
      </div>

      {isLightboxOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white/90">{title}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={zoomOut}
                  className="rounded-lg border border-white/30 bg-black/45 px-3 py-1.5 text-sm font-semibold text-white transition hover:border-white/60"
                  aria-label="Thu nhỏ"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={zoomIn}
                  className="rounded-lg border border-white/30 bg-black/45 px-3 py-1.5 text-sm font-semibold text-white transition hover:border-white/60"
                  aria-label="Phóng to"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={resetZoom}
                  className="rounded-lg border border-white/30 bg-black/45 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:border-white/60"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(false)}
                  className="rounded-lg border border-white/30 bg-black/45 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:border-white/60"
                >
                  Đóng
                </button>
              </div>
            </div>

            <div
              className={`relative h-[70vh] overflow-hidden rounded-2xl border border-white/20 bg-black/30 ${
                zoom > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
              }`}
              onDragStart={(event) => event.preventDefault()}
              onPointerDown={startPan}
              onPointerMove={updatePan}
              onPointerUp={stopPan}
              onPointerCancel={stopPan}
              onDoubleClick={onLightboxDoubleClick}
            >
              <div
                className="relative h-full w-full"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin,
                }}
              >
                <Image
                  src={selectedImage}
                  alt={title}
                  fill
                  className="select-none object-contain"
                  sizes="100vw"
                  priority
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
