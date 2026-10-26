"use client";
import { useEffect, useRef } from "react";

const VIDEO_SRC = "/videos/bunyodkor-intro-2026.mp4";

export default function IntroPlayer({
  expanded,
  autoPlay,
  paused = false,
}: {
  expanded: boolean;
  autoPlay: boolean;
  paused?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) {
      video.pause();
    } else if (autoPlay) {
      void video.play().catch(() => {
        // Mobile browsers may require the user to tap Play.
      });
    }
  }, [autoPlay, paused]);

  return (
    <video
      ref={videoRef}
      src={VIDEO_SRC}
      autoPlay={autoPlay}
      muted
      loop
      playsInline
      controls={expanded}
      preload={expanded ? "auto" : "metadata"}
      aria-label="Bunyodkor tanishtiruv videosi"
      style={{
        display: "block",
        width: "100%",
        aspectRatio: "9 / 16",
        objectFit: "contain",
        backgroundColor: "#101820",
      }}
    />
  );
}
