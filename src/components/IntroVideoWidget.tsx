"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

const IntroPlayer = dynamic(() => import("./intro/IntroPlayer"), { ssr: false, loading: () => <div className="intro-video-loading">Bunyodkor bilan tanishing…</div> });

export default function IntroVideoWidget() {
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setDismissed(sessionStorage.getItem("bunyodkor-intro-v1") === "closed"); } catch { /* Storage may be disabled. */ }
      setAutoPlay(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      setReady(true);
    }, 1400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const dialog = dialogRef.current;
    const trigger = triggerRef.current;
    dialog?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      dialog?.close();
      trigger?.focus();
    };
  }, [expanded]);

  function dismiss() {
    setDismissed(true);
    try { sessionStorage.setItem("bunyodkor-intro-v1", "closed"); } catch { /* Closing works without storage. */ }
  }
  function open() { setAutoPlay(true); setExpanded(true); }
  if (!ready) return null;

  return createPortal(<div className="bunyodkor-intro">
    <div hidden={expanded}>{dismissed ? <button ref={triggerRef} className="intro-reopen" onClick={open}>▶ Bunyodkor haqida</button> : <aside className="intro-widget" aria-label="Bunyodkor tanishtiruv videosi">
      <div className="intro-widget-top"><span>36 soniya</span><button className="intro-close intro-pause" aria-label={paused ? "Videoni davom ettirish" : "Videoni to‘xtatish"} onClick={() => setPaused(value => !value)}>{paused ? "▶" : "Ⅱ"}</button><button className="intro-close" aria-label="Tanishtiruv videosini yopish" onClick={dismiss}>×</button></div>
      <div className="intro-mini-stage"><IntroPlayer expanded={false} autoPlay={autoPlay} paused={paused || expanded} /><button ref={triggerRef} className="intro-expand" aria-label="Tanishtiruv videosini kattalashtirish" onClick={open}><span>▶ Kattalashtirish</span></button></div>
      <Link className="intro-apply" href="/ariza-qoldirish">Ariza qoldirish</Link>
    </aside>}</div>
    {expanded && <dialog ref={dialogRef} className="intro-dialog" aria-labelledby="intro-dialog-title" onCancel={() => setExpanded(false)} onClick={event => { if (event.target === event.currentTarget) setExpanded(false); }}>
      <div className="intro-dialog-content">
        <div className="intro-dialog-top"><h2 id="intro-dialog-title">Bunyodkor bilan tanishing</h2><button autoFocus className="intro-close" aria-label="Kattalashtirilgan videoni yopish" onClick={() => setExpanded(false)}>×</button></div>
        <div className="intro-full-stage"><IntroPlayer expanded autoPlay={autoPlay} /></div>
        <Link className="intro-apply" href="/ariza-qoldirish" onClick={() => setExpanded(false)}>Ariza qoldirish</Link>
        <p className="intro-note">Biografik maqola · Shaxsiy profil · Ulashish imkoniyati</p>
      </div>
    </dialog>}
  </div>, document.body);
}
