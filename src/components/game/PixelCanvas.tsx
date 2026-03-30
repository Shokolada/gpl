"use client";

import { useRef, useEffect, useCallback, useState } from "react";

interface PixelCanvasProps {
  totalPixels: number;
  capturedPixels: number;
  color: string;
  secondaryColor: string;
  label: string;
  className?: string;
}

/**
 * Deterministic pseudo-random number generator (mulberry32).
 * Given a seed, produces a consistent sequence of numbers [0, 1).
 */
function createSeededRandom(seed: number) {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a deterministic set of removed pixel indices for a given count.
 * Uses a Fisher-Yates-like approach with a seeded RNG so the same
 * capturedPixels count always produces the same set of removed positions.
 */
function getRemovedPixels(
  totalPixels: number,
  capturedPixels: number
): Set<number> {
  if (capturedPixels <= 0) return new Set();
  if (capturedPixels >= totalPixels) {
    return new Set(Array.from({ length: totalPixels }, (_, i) => i));
  }

  const random = createSeededRandom(42);
  const indices = Array.from({ length: totalPixels }, (_, i) => i);

  // Fisher-Yates shuffle, but we only need the first `capturedPixels` picks
  for (let i = 0; i < capturedPixels; i++) {
    const j = i + Math.floor(random() * (totalPixels - i));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return new Set(indices.slice(0, capturedPixels));
}

export default function PixelCanvas({
  totalPixels,
  capturedPixels,
  color,
  secondaryColor,
  label,
  className,
}: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Calculate grid dimensions (roughly square)
  const cols = Math.round(Math.sqrt(totalPixels));
  const rows = Math.ceil(totalPixels / cols);

  // Observe container width for responsive sizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(container);
    setContainerWidth(container.clientWidth);

    return () => observer.disconnect();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || containerWidth === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate pixel size based on container width
    const gap = 1;
    const pixelSize = Math.max(
      1,
      Math.floor((containerWidth - (cols - 1) * gap) / cols)
    );

    const canvasWidth = cols * pixelSize + (cols - 1) * gap;
    const canvasHeight = rows * pixelSize + (rows - 1) * gap;

    // Set canvas dimensions (accounting for device pixel ratio for sharpness)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Get deterministic set of removed pixels
    const removed = getRemovedPixels(totalPixels, capturedPixels);

    // Draw pixels
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;
        if (index >= totalPixels) continue;

        const x = col * (pixelSize + gap);
        const y = row * (pixelSize + gap);
        const isRemoved = removed.has(index);

        if (isRemoved) {
          // Removed/captured pixel - dark empty space
          ctx.fillStyle = "#1a1a1a";
          ctx.fillRect(x, y, pixelSize, pixelSize);
        } else {
          // Active pixel - draw with border for depth
          // Border/depth (secondary color)
          ctx.fillStyle = secondaryColor;
          ctx.fillRect(x, y, pixelSize, pixelSize);

          // Main fill (slightly inset for a subtle 3D look)
          const inset = Math.max(1, Math.floor(pixelSize * 0.15));
          ctx.fillStyle = color;
          ctx.fillRect(x, y, pixelSize - inset, pixelSize - inset);
        }
      }
    }
  }, [totalPixels, capturedPixels, color, secondaryColor, cols, rows, containerWidth]);

  // Redraw when dependencies change, using requestAnimationFrame
  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [draw]);

  const remainingPixels = totalPixels - capturedPixels;
  const percentage = ((remainingPixels / totalPixels) * 100).toFixed(1);

  return (
    <div ref={containerRef} className={className}>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ imageRendering: "pixelated" }}
      />
      <div className="mt-2 text-center">
        <p className="text-sm font-bold tracking-wide">{label}</p>
        <p className="text-xs text-gray-400">{percentage}%</p>
      </div>
    </div>
  );
}
