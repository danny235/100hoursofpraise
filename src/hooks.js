import { useEffect, useRef, useState, useCallback } from 'react';
import { createMusic } from './music.js';
import { createYouTube } from './youtube.js';
import { START, END, YOUTUBE_ID } from './config.js';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const KEY = 'h100-mood';
const byClock = () => { const h = new Date().getHours(); return h >= 6 && h < 18 ? 'day' : 'night'; };

/* Day between 6 AM and 6 PM local time, night otherwise. A manual toggle overrides it and is remembered. */
export function useMood() {
  const [manual, setManual] = useState(() => {
    try { const v = localStorage.getItem(KEY); return v === 'day' || v === 'night' ? v : null; } catch { return null; }
  });
  const [clockMood, setClockMood] = useState(byClock);
  useEffect(() => {
    const id = setInterval(() => setClockMood(byClock()), 60000);
    return () => clearInterval(id);
  }, []);
  const mood = manual || clockMood;
  useEffect(() => { document.documentElement.setAttribute('data-mood', mood); }, [mood]);
  const toggle = useCallback(() => {
    const next = mood === 'day' ? 'night' : 'day';
    setManual(next);
    try { localStorage.setItem(KEY, next); } catch { /* storage unavailable */ }
  }, [mood]);
  return [mood, toggle];
}

/* Browsers only allow sound after a tap, so music starts from a button press.
   Plays the YouTube track when one is set; if it can't play, the built-in generated loop takes over. */
export function useSound() {
  const loop = useRef(null);
  const yt = useRef(null);
  const wantOn = useRef(false);
  const [on, setOn] = useState(false);
  useEffect(() => {
    loop.current = createMusic();
    if (YOUTUBE_ID) {
      yt.current = createYouTube(YOUTUBE_ID, () => { if (wantOn.current && loop.current) loop.current.start(); });
    }
    return () => {
      if (loop.current) loop.current.dispose();
      if (yt.current) yt.current.dispose();
    };
  }, []);
  const play = useCallback(() => {
    wantOn.current = true;
    const ok = (yt.current && yt.current.start()) || (loop.current && loop.current.start());
    if (ok) setOn(true);
  }, []);
  const pause = useCallback(() => {
    wantOn.current = false;
    if (yt.current) yt.current.stop();
    if (loop.current) loop.current.stop();
    setOn(false);
  }, []);
  const toggle = useCallback(() => { if (on) pause(); else play(); }, [on, play, pause]);
  return [on, toggle, play];
}

export function useCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  if (now < START) {
    const ms = START - now;
    return { mode: 'before', d: Math.floor(ms / 864e5), h: Math.floor((ms % 864e5) / 36e5), m: Math.floor((ms % 36e5) / 6e4), s: Math.floor((ms % 6e4) / 1e3) };
  }
  if (now < END) return { mode: 'live', hour: Math.min(100, Math.floor((now - START) / 36e5) + 1), pct: ((now - START) / (END - START)) * 100 };
  return { mode: 'after' };
}
