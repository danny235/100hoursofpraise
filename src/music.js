/* An original ambient loop synthesised with the Web Audio API: warm pads, soft bell notes and a gentle drum pulse.
   To use your own track instead, swap this for an <audio src="/music.mp3" loop> element. */
const chords = [
  [73.42, 146.83, 220, 277.18, 369.99],
  [61.74, 123.47, 185, 246.94, 293.66],
  [98, 196, 246.94, 293.66, 369.99],
  [110, 220, 277.18, 329.63, 440],
];
const scale = [587.33, 659.25, 739.99, 880, 987.77, 1108.73, 1318.51];

export function createMusic() {
  let ac = null, master = null, bus = null, timer = null, playing = false, beat = 0;

  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
    const dl = ac.createDelay(1.5); dl.delayTime.value = 0.42;
    const fb = ac.createGain(); fb.gain.value = 0.38;
    const wet = ac.createGain(); wet.gain.value = 0.4;
    bus = ac.createGain();
    bus.connect(lp); bus.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(lp);
    lp.connect(master); master.connect(ac.destination);
    return true;
  }
  function tone(f, t, dur, vol, type, atk) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.1);
  }
  function thump(t, vol) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(52, t + 0.18);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.4);
  }
  function tick() {
    if (!playing) return;
    const t = ac.currentTime + 0.05, step = beat % 32;
    if (step % 8 === 0) chords[(step / 8) | 0].forEach((f, i) => tone(f, t, 9, 0.05 - i * 0.004, i < 2 ? 'sine' : 'triangle', 2.2));
    if (step % 2 === 0) thump(t, step % 4 === 0 ? 0.32 : 0.16);
    if (step % 4 === 3 || Math.random() < 0.28) {
      tone(scale[Math.floor(Math.random() * scale.length)], t + Math.random() * 0.1, 2.6, 0.05 + Math.random() * 0.03, 'sine', 0.01);
    }
    beat++;
    timer = setTimeout(tick, 750);
  }
  const onVis = () => {
    if (!ac) return;
    if (document.hidden) ac.suspend && ac.suspend();
    else if (playing && ac.resume) ac.resume();
  };
  document.addEventListener('visibilitychange', onVis);

  return {
    start() {
      if (!ac && !build()) return false;
      if (ac.resume) ac.resume();
      playing = true; beat = 0; clearTimeout(timer); tick();
      master.gain.cancelScheduledValues(ac.currentTime);
      master.gain.setTargetAtTime(0.9, ac.currentTime, 0.8);
      return true;
    },
    stop() {
      if (!ac) return;
      playing = false; clearTimeout(timer);
      master.gain.cancelScheduledValues(ac.currentTime);
      master.gain.setTargetAtTime(0, ac.currentTime, 0.25);
      setTimeout(() => { if (!playing && ac.suspend) ac.suspend(); }, 1200);
    },
    dispose() { playing = false; clearTimeout(timer); document.removeEventListener('visibilitychange', onVis); if (ac) ac.close(); },
  };
}
