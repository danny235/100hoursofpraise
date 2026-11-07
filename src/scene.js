import * as T from 'three';

/* A procedural city with a glowing "praise house" at its centre. The camera descends toward it as the page scrolls.
   mix: 0 = night, 1 = day. */
export function createScene(canvas, { reduce }) {
  const renderer = new T.WebGLRenderer({ canvas, antialias: true });
  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(55, 1, 0.5, 420);

  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  const hemi = new T.HemisphereLight(0xffffff, 0x302018, 1);
  const sun = new T.DirectionalLight(0xfff0d0, 1); sun.position.set(-60, 90, 40);
  const glowL = new T.PointLight(0xff8a3d, 2, 90); glowL.position.set(0, 7, 0);
  scene.add(hemi, sun, glowL);

  const ground = new T.Mesh(new T.PlaneGeometry(520, 520), new T.MeshStandardMaterial({ color: 0x111111, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; scene.add(ground);

  const pts = [];
  for (let g = -26; g <= 25; g++) { const o = g * 4 + 2; pts.push(o, 0.05, -104, o, 0.05, 104, -104, 0.05, o, 104, 0.05, o); }
  const lg = new T.BufferGeometry(); lg.setAttribute('position', new T.Float32BufferAttribute(pts, 3));
  const roads = new T.LineSegments(lg, new T.LineBasicMaterial({ color: 0xffa94d, transparent: true, opacity: 0.5 }));
  scene.add(roads);

  const box = new T.BoxGeometry(1, 1, 1); box.translate(0, 0.5, 0);
  const cityMat = new T.MeshStandardMaterial({ roughness: 0.85, metalness: 0.05 });
  const city = new T.InstancedMesh(box, cityMat, 53 * 53);
  const dm = new T.Object3D(), cc = new T.Color(), win = [];
  let k = 0;
  for (let gx = -26; gx <= 26; gx++) {
    for (let gz = -26; gz <= 26; gz++) {
      const x = gx * 4 + (rnd() - 0.5) * 0.6, z = gz * 4 + (rnd() - 0.5) * 0.6;
      const d = Math.sqrt(x * x + z * z);
      if (d < 17 || rnd() < 0.16) continue;
      const hgt = 1.2 + Math.pow(rnd(), 2.6) * 20 * Math.max(0.15, 1 - d / 150);
      const sx = 2 + rnd() * 0.9, sz = 2 + rnd() * 0.9;
      dm.position.set(x, 0, z); dm.scale.set(sx, hgt, sz); dm.updateMatrix();
      city.setMatrixAt(k, dm.matrix);
      const tone = 0.55 + rnd() * 0.35; cc.setRGB(tone, tone * 0.93, tone * 0.86); city.setColorAt(k, cc);
      const nw = Math.floor(2 + rnd() * 5 + hgt / 4);
      for (let j = 0; j < nw; j++) {
        const face = rnd() < 0.5 ? 1 : -1;
        win.push(
          x + (rnd() < 0.5 ? face * (sx / 2 + 0.05) : (rnd() - 0.5) * sx),
          0.5 + rnd() * (hgt - 0.6),
          z + (rnd() < 0.5 ? (rnd() - 0.5) * sz : face * (sz / 2 + 0.05))
        );
      }
      k++;
    }
  }
  city.count = k; city.instanceColor.needsUpdate = true; scene.add(city);

  const wg = new T.BufferGeometry(); wg.setAttribute('position', new T.Float32BufferAttribute(win, 3));
  const windows = new T.Points(wg, new T.PointsMaterial({ color: 0xffc46b, size: 0.75, transparent: true, opacity: 1, blending: T.AdditiveBlending, depthWrite: false }));
  scene.add(windows);

  const hall = new T.Group(); scene.add(hall);
  const tierMats = [];
  for (let i = 0; i < 4; i++) {
    const m = new T.MeshStandardMaterial({ color: i % 2 ? 0xd1431f : 0x8f2314, emissive: 0xff5a1f, emissiveIntensity: 0.6, roughness: 0.6 });
    tierMats.push(m);
    const t = new T.Mesh(new T.CylinderGeometry(10 - i * 2, 10.6 - i * 2, 1.1, 56), m);
    t.position.y = 0.55 + i * 1.1; hall.add(t);
  }
  const domeMat = new T.MeshStandardMaterial({ color: 0xffc933, emissive: 0xffb020, emissiveIntensity: 1.1, roughness: 0.35, metalness: 0.2 });
  const dome = new T.Mesh(new T.SphereGeometry(3.4, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
  dome.position.y = 4.4; hall.add(dome);
  const ringMat = new T.MeshBasicMaterial({ color: 0xffc933, transparent: true, opacity: 0.9 });
  const ring = new T.Mesh(new T.TorusGeometry(11.5, 0.12, 8, 96), ringMat);
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.2; hall.add(ring);
  const ring2 = new T.Mesh(new T.TorusGeometry(14.5, 0.08, 8, 96), ringMat);
  ring2.rotation.x = Math.PI / 2; ring2.position.y = 0.15; hall.add(ring2);
  const beamMat = new T.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.35, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide });
  const beam = new T.Mesh(new T.CylinderGeometry(0.5, 3.2, 150, 32, 1, true), beamMat);
  beam.position.y = 75; hall.add(beam);

  const C = (v) => new T.Color(v);
  const P = {
    sky: [C(0x080507), C(0xbcd9ee)], gnd: [C(0x0e0a0c), C(0xcdbfa8)],
    hemiS: [C(0x3a2a4a), C(0xffffff)], hemiG: [C(0x180f0c), C(0xb89a7a)],
  };
  const tmp = new T.Color();
  const mixc = (pair, m) => tmp.copy(pair[0]).lerp(pair[1], m);

  let mix = 0, target = 0, clock = 0, raf = 0, last = performance.now();

  function applyMix() {
    const m = mix;
    const sky = mixc(P.sky, m).clone();
    renderer.setClearColor(sky);
    scene.fog = new T.Fog(sky, 60 + 60 * m, 230 + 60 * m);
    ground.material.color.copy(mixc(P.gnd, m));
    hemi.color.copy(mixc(P.hemiS, m)); hemi.groundColor.copy(mixc(P.hemiG, m)); hemi.intensity = 0.55 - 0.2 * m;
    sun.intensity = 0.05 + 0.65 * m;
    glowL.intensity = 2.4 * (1 - m) + 0.2;
    windows.material.opacity = 1 - m; roads.material.opacity = 0.5 - 0.38 * m;
    roads.material.color.setHex(m > 0.5 ? 0x6b5a48 : 0xffa94d);
    beamMat.opacity = 0.36 - 0.32 * m;
    tierMats.forEach((t) => { t.emissiveIntensity = 0.65 - 0.5 * m; });
    domeMat.emissiveIntensity = 1.1 - 0.7 * m;
    cityMat.emissive.setRGB(0.02 * (1 - m), 0.012 * (1 - m), 0.01 * (1 - m));
  }

  function resize() {
    const W = window.innerWidth, H = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix();
  }
  const ease = (v) => v * v * (3 - 2 * v);
  function frame() {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const s = ease(Math.min(1, Math.max(0, window.scrollY / max)));
    const a = -0.5 + s * 1.5 + clock * 0.035;
    const r = 105 - 78 * s, y = 92 - 82 * s;
    cam.position.set(Math.sin(a) * r, y, Math.cos(a) * r);
    cam.lookAt(0, 4 * s, 0);
    ring.rotation.z = clock * 0.1;
    renderer.render(scene, cam);
  }
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (document.hidden) { last = now; return; }
    const dt = Math.min(0.1, (now - last) / 1000); last = now; clock += dt;
    if (Math.abs(mix - target) > 0.002) { mix += (target - mix) * Math.min(1, dt * 3.2); applyMix(); }
    else if (mix !== target) { mix = target; applyMix(); }
    beamMat.opacity = (0.36 - 0.32 * mix) * (0.88 + 0.12 * Math.sin(clock * 1.6));
    frame();
  }
  const onResize = () => { resize(); frame(); };
  const onScroll = () => { if (reduce) frame(); };

  resize(); applyMix();
  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', onScroll, { passive: true });
  if (reduce) frame(); else raf = requestAnimationFrame(loop);

  return {
    setMood(m) {
      target = m === 'day' ? 1 : 0;
      if (reduce) { mix = target; applyMix(); frame(); }
    },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      renderer.dispose();
    },
  };
}
