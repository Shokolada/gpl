"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface PixelSiphonProps {
  isActive: boolean;
  pixelCount: number;
  fromColor: string;
  toColor: string;
  direction: "down" | "up";
  onComplete: () => void;
}

interface Pixel {
  id: number;
  x: number;
  size: number;
  delay: number;
  drift: number;
  rotation: number;
}

export default function PixelSiphon({
  isActive,
  pixelCount,
  fromColor,
  toColor,
  direction,
  onComplete,
}: PixelSiphonProps) {
  const [showPixels, setShowPixels] = useState(false);

  const pixels = useMemo<Pixel[]>(() => {
    if (!isActive) return [];
    return Array.from({ length: pixelCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 4 + Math.random() * 4,
      delay: Math.random() * 0.3,
      drift: (Math.random() - 0.5) * 60,
      rotation: (Math.random() - 0.5) * 360,
    }));
  }, [isActive, pixelCount]);

  useEffect(() => {
    if (isActive) {
      setShowPixels(true);
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) {
      setShowPixels(false);
    }
  }, [isActive]);

  const handlePixelComplete = (pixelId: number) => {
    // Find the last pixel (the one with the longest delay)
    const lastPixel = pixels.reduce(
      (max, p) => (p.delay > max.delay ? p : max),
      pixels[0]
    );
    if (lastPixel && pixelId === lastPixel.id) {
      setShowPixels(false);
      onComplete();
    }
  };

  if (!showPixels || pixels.length === 0) return null;

  const isDown = direction === "down";
  const startY = isDown ? "-5%" : "105%";
  const endY = isDown ? "105%" : "-5%";

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {pixels.map((pixel) => (
          <motion.div
            key={pixel.id}
            initial={{
              x: `${pixel.x}vw`,
              y: startY,
              opacity: 1,
              rotate: 0,
              backgroundColor: fromColor,
            }}
            animate={{
              x: `calc(${pixel.x}vw + ${pixel.drift}px)`,
              y: endY,
              opacity: [1, 1, 1, 0.8, 0],
              rotate: pixel.rotation,
              backgroundColor: [fromColor, fromColor, toColor],
            }}
            transition={{
              duration: 0.8,
              delay: pixel.delay,
              ease: [0.25, 0.46, 0.45, 0.94],
              backgroundColor: {
                duration: 0.8,
                delay: pixel.delay,
                times: [0, 0.4, 1],
              },
              opacity: {
                duration: 0.8,
                delay: pixel.delay,
                times: [0, 0.3, 0.6, 0.85, 1],
              },
            }}
            onAnimationComplete={() => handlePixelComplete(pixel.id)}
            style={{
              position: "absolute",
              width: pixel.size,
              height: pixel.size,
              borderRadius: 1,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
