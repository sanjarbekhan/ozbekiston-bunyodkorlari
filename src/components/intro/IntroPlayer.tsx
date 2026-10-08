"use client";
import { useEffect, useRef } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import IntroFilm, { INTRO_FPS, INTRO_FRAMES } from "./IntroFilm";
export default function IntroPlayer({ expanded, autoPlay, paused = false }: { expanded: boolean; autoPlay: boolean; paused?: boolean }) {
  const ref = useRef<PlayerRef>(null);
  useEffect(() => { if (paused) ref.current?.pause(); else if (autoPlay) ref.current?.play(); }, [paused, autoPlay]);
  return <Player ref={ref} component={IntroFilm} compositionWidth={720} compositionHeight={900} durationInFrames={INTRO_FRAMES} fps={INTRO_FPS} autoPlay={autoPlay} controls={expanded} clickToPlay={expanded} doubleClickToFullscreen={expanded} showVolumeControls={false} style={{ width: "100%", aspectRatio: "4 / 5" }} acknowledgeRemotionLicense />;
}
