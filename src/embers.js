/* Drifting embers, drawn only at night. */
export function createEmbers(canvas, { reduce, isNight }) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  let w = 0, h = 0, raf = 0;
  const ps = [];
  const size = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const spawn = (p, init) => {
    p.x = Math.random() * w; p.y = init ? Math.random() * h : h + 10;
    p.r = Math.random() * 1.5 + 0.5; p.vy = -(Math.random() * 0.3 + 0.06);
    p.vx = (Math.random() - 0.5) * 0.16; p.a = Math.random() * 0.6 + 0.25; p.t = Math.random() * 6.28;
  };
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (const p of ps) {
      const a = p.a * (0.65 + 0.35 * Math.sin(p.t));
      ctx.fillStyle = `rgba(255,140,60,${(a * 0.14).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.283); ctx.fill();
      ctx.fillStyle = `rgba(255,175,100,${a.toFixed(3)})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    }
  };
  const loop = () => {
    if (!document.hidden && isNight()) {
      for (const p of ps) { p.x += p.vx; p.y += p.vy; p.t += 0.02; if (p.y < -10) spawn(p, false); }
      draw();
    }
    raf = requestAnimationFrame(loop);
  };
  size();
  for (let i = 0; i < 60; i++) { const p = {}; spawn(p, true); ps.push(p); }
  const onResize = () => { size(); if (reduce) draw(); };
  window.addEventListener('resize', onResize);
  if (reduce) draw(); else raf = requestAnimationFrame(loop);
  return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
}
