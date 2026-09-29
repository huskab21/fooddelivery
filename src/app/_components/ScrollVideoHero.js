"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollVideoHero({
  src = "/pictures/Hero.mp4",
  scrollHeight = 150,
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const startOffsetRef = useRef(null);
  const targetTimeRef = useRef(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      if (startOffsetRef.current === null) {
        startOffsetRef.current = Math.random() * video.duration;
      }
      setDuration(video.duration);
    };


    if (video.readyState >= 1 && video.duration) {
      handleLoadedMetadata();
    } else {
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    if (!duration) return;

    const startOffset = startOffsetRef.current ?? 0;
    const video = videoRef.current;
    if (!video) return;


    const wrap = (t) => ((t % duration) + duration) % duration;


    const updateTarget = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;

      let progress = -rect.top / totalScrollable;
      progress = Math.min(Math.max(progress, 0), 1);

      targetTimeRef.current = wrap(startOffset + progress * duration);
    };

    updateTarget();
    targetTimeRef.current = wrap(startOffset);

    let current = wrap(startOffset);
    video.currentTime = current;

    const tick = () => {
      const target = targetTimeRef.current;
      let diff = target - current;
      if (Math.abs(diff) > duration / 2) {
        diff += diff > 0 ? -duration : duration;
      }
      // Ease toward the target instead of jumping straight to it, so the
      // video reads as a slow-motion pass rather than a hard scroll-snap.
      current = wrap(current + diff * 0.015);
      video.currentTime = current;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    window.addEventListener("scroll", updateTarget, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateTarget);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [duration]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: `${scrollHeight}vh` }}
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}