import React, { useEffect, useRef } from 'react';
import { createScene } from './scene.js';
import { createEmbers } from './embers.js';
import { useMood, useSound, useCountdown, prefersReducedMotion } from './hooks.js';
import { ministers } from './ministers.js';
import { VOLUNTEER_URL, DEPARTMENTS } from './config.js';

const pad = (v) => String(v).padStart(2, '0');
const reduce = prefersReducedMotion();

function Headline({ text }) {
  if (reduce) return <h1 id="headline" className="display">{text}</h1>;
  let n = 0;
  return (
    <h1 id="headline" className="display" aria-label={text}>
      <span aria-hidden="true">
        {text.split(' ').map((word, wi) => (
          <React.Fragment key={wi}>
            {wi > 0 && ' '}
            <span className="w">
              {word.split('').map((c, ci) => <span key={ci} className="ch" style={{ '--i': n++ }}>{c}</span>)}
            </span>
          </React.Fragment>
        ))}
      </span>
    </h1>
  );
}

function Countdown() {
  const c = useCountdown();
  if (c.mode === 'before') {
    return (
      <div>
        <div className="count" role="timer" aria-label="Time until the programme begins">
          <div className="tick"><b>{pad(c.d)}</b><span>Days</span></div>
          <div className="tick"><b>{pad(c.h)}</b><span>Hours</span></div>
          <div className="tick"><b>{pad(c.m)}</b><span>Minutes</span></div>
          <div className="tick"><b>{pad(c.s)}</b><span>Seconds</span></div>
        </div>
        <p className="when">Kickoff Monday 16 November 2026, 9:00 AM.</p>
      </div>
    );
  }
  if (c.mode === 'live') {
    return (
      <div className="live">
        <span className="flag"><i className="dot" />We are live</span>
        <p>Hour {c.hour} of 100</p>
      </div>
    );
  }
  return <div className="live"><p>The hundred hours are complete. Thank you for praising with us.</p></div>;
}

function Rail() {
  const c = useCountdown();
  return (
    <div className="span" aria-label="The 100 hours from Monday 9:00 AM to Friday 1:00 PM, with day changes at midnight">
      {[['Tue', 15], ['Wed', 39], ['Thu', 63], ['Fri', 87]].map(([d, p]) => (
        <span key={d} className="mk" style={{ '--p': p + '%' }}>{d}</span>
      ))}
      <div className="rail">
        {[15, 39, 63, 87].map((p) => <i key={p} className="notch" style={{ '--p': p + '%' }} />)}
        {c.mode === 'live' && <i className="nowmark" style={{ '--p': c.pct.toFixed(2) + '%' }} />}
      </div>
      <div className="ends"><span>Mon 16 Nov · 9:00 AM</span><span>Fri 20 Nov · 1:00 PM</span></div>
    </div>
  );
}

export default function App() {
  const [mood, toggleMood] = useMood();
  const [soundOn, toggleSound, startSound] = useSound();
  const [entered, setEntered] = React.useState(false);
  const enterBtn = useRef(null);
  const [hint, setHint] = React.useState(true);
  const sceneCanvas = useRef(null);
  const emberCanvas = useRef(null);
  const sceneApi = useRef(null);
  const moodRef = useRef(mood);
  moodRef.current = mood;

  useEffect(() => {
    let api = null;
    try {
      api = createScene(sceneCanvas.current, { reduce });
      api.setMood(moodRef.current);
    } catch (e) {
      if (sceneCanvas.current) sceneCanvas.current.style.display = 'none';
    }
    sceneApi.current = api;
    const stopEmbers = createEmbers(emberCanvas.current, { reduce, isNight: () => moodRef.current === 'night' });
    return () => { stopEmbers(); if (api) api.dispose(); sceneApi.current = null; };
  }, []);

  useEffect(() => { if (sceneApi.current) sceneApi.current.setMood(mood); }, [mood]);

  /* While the entry screen is up, lock scrolling and put focus on its button. */
  useEffect(() => {
    if (entered) { document.body.style.overflow = ''; return; }
    document.body.style.overflow = 'hidden';
    if (enterBtn.current) enterBtn.current.focus();
    return () => { document.body.style.overflow = ''; };
  }, [entered]);

  const enter = () => {
    startSound(); setHint(false);
    setEntered(true);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <canvas id="scene" ref={sceneCanvas} aria-hidden="true" />
      <canvas id="embers" ref={emberCanvas} aria-hidden="true" />
      {!entered && (
        <div className="gate" role="dialog" aria-modal="true" aria-labelledby="gate-title">
          <div className="gate-box">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="gate-flame">
              <defs><linearGradient id="fl2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ff7a3d" /><stop offset="1" stopColor="#ffc933" /></linearGradient></defs>
              <path fill="url(#fl2)" d="M12 1.5c.9 4.1 5.6 6.2 5.6 11.4a5.6 5.6 0 0 1-11.2 0c0-2.2 1-3.6 2.4-4.8.1 2 .9 3.2 2.2 3.5-.8-3.6-.5-6.9 1-10.1z" />
            </svg>
            <p className="eyebrow">Psalm 149 · Sound of Triumph</p>
            <h1 id="gate-title" className="display gate-title">100 Hours of Praise</h1>
            <p className="gate-sub">16–20 November 2026 · RCCG Higher Ground Zonal HQ</p>
            <button ref={enterBtn} type="button" className="btn btn-solid gate-btn" onClick={enter}>Enter</button>
          </div>
        </div>
      )}
      <div className={'page' + (entered ? ' entered' : '')}>
        <header className="nav wrap">
          <a className="brand" href="#top" aria-label="100 Hours of Praise, top of page">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <defs><linearGradient id="fl" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ff7a3d" /><stop offset="1" stopColor="#ffc933" /></linearGradient></defs>
              <path fill="url(#fl)" d="M12 1.5c.9 4.1 5.6 6.2 5.6 11.4a5.6 5.6 0 0 1-11.2 0c0-2.2 1-3.6 2.4-4.8.1 2 .9 3.2 2.2 3.5-.8-3.6-.5-6.9 1-10.1z" />
            </svg>
            <span>100 Hours of Praise</span>
          </a>
          <div className="tools">
            <button className="ic" id="mood" type="button" data-m={mood} onClick={toggleMood}
              aria-label={mood === 'day' ? 'Switch to night mode' : 'Switch to day mode'} title="Day / night">
              <svg className="a moon" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>
              <svg className="a sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></svg>
            </button>
            <button className={'ic' + (hint && !soundOn ? ' hint' : '')} id="snd" type="button" aria-pressed={soundOn}
              onClick={() => { setHint(false); toggleSound(); }}
              aria-label={soundOn ? 'Mute background music' : 'Play background music'} title="Background music">
              <svg className="off" viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="M16 9.5l5 5M21 9.5l-5 5" /></svg>
              <svg className="on" viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.3 6.5a8 8 0 0 1 0 11" /></svg>
            </button>
            <a className="btn btn-solid" href={VOLUNTEER_URL} target="_blank" rel="noopener noreferrer">Volunteer</a>
          </div>
        </header>

        <section className="hero wrap" id="top">
          <p className="eyebrow">Psalm 149 · Sound of Triumph</p>
          <Headline text="For one hundred hours, the praise will not stop." />
          <p className="sub">The 100 Hours Marathon Praise of RCCG Higher Ground Zonal Headquarters. Four days and four hours, non-stop, from Monday 16 November, 9:00 AM.</p>
          <div className="cta-row">
            <a className="btn btn-solid" href="#details">Join us in person</a>
            <a className="btn btn-ghost" href="#ministers">Meet the ministers</a>
          </div>
          <Countdown />
        </section>

        <main>
          <div className="band">
            <section className="sec wrap" id="expect">
              <p className="eyebrow">What to expect</p>
              <h2 className="display">Three sounds fill the house.</h2>
              <div className="pillars">
                <article className="pillar">
                  <p className="eyebrow">A joyful noise</p>
                  <h3 className="display">Praise</h3>
                  <p>Choirs and voices lifting the high praises of God, hour after hour, in the spirit of Psalm 149.</p>
                </article>
                <article className="pillar">
                  <p className="eyebrow">In spirit and truth</p>
                  <h3 className="display">Worship</h3>
                  <p>Instrumentalists and worship leaders carrying the presence of God through the day and into the night.</p>
                </article>
                <article className="pillar">
                  <p className="eyebrow">Songs of the faith</p>
                  <h3 className="display">Hymns</h3>
                  <p>The old songs have their place too, so the hymns of the church are heard alongside the new.</p>
                </article>
              </div>
            </section>
          </div>

          <div className="band">
            <section className="sec wrap" id="details">
              <div className="det">
                <figure className="flier">
                  <img src="/flier.jpg" width="800" height="900"
                    alt="Event flier: 100 Hours Marathon Praise, Psalm 149 Sound of Triumph, 16th to 20th November 2026, kickoff 9 AM, 4 days and 4 hours non-stop, Higher Ground Zone, opposite Peace Lodge, Alakahia." />
                </figure>
                <div>
                  <p className="eyebrow">The details</p>
                  <h2 className="display">Come and praise with us.</h2>
                  <ul className="facts">
                    <li><b>Dates</b><span>16th – 20th November 2026</span></li>
                    <li><b>Kickoff</b><span>9:00 AM, Monday 16th</span></li>
                    <li><b>Duration</b><span>4 days and 4 hours, non-stop</span></li>
                    <li><b>Venue</b><span>Higher Ground Zone, opposite Peace Lodge, Alakahia</span></li>
                    <li><b>Follow</b><span>RCCG Higher Ground Zonal HQ on Facebook, Instagram and YouTube</span></li>
                  </ul>
                </div>
              </div>
              <Rail />
            </section>
          </div>

          <div className="band">
            <section className="sec wrap" id="ministers">
              <div className="mhead">
                <div>
                  <p className="eyebrow">Ministering</p>
                  <h2 className="display">Voices on the platform.</h2>
                </div>
                <p className="lede" style={{ margin: 0 }}>Ministers announced so far, as shared on the programme fliers.</p>
              </div>
              <ul className="mgrid">
                {ministers.map((m) => (
                  <li key={m.img}>
                    <figure className="mc">
                      <img src={m.img} width="400" height="283" loading="lazy" alt={`Ministering flier: ${m.name}`} />
                    </figure>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="band">
            <section className="sec wrap" id="serve">
              <div className="panel">
                <p className="eyebrow">Volunteers</p>
                <h2 className="display">There is a place for you on the team.</h2>
                <p className="lede">Volunteers keep the house running for a hundred hours. Pick a department, tell us when you are free, and we will place you.</p>
                <ul className="teams">{DEPARTMENTS.map((d) => <li key={d}>{d}</li>)}</ul>
                <a className="btn btn-solid" href={VOLUNTEER_URL} target="_blank" rel="noopener noreferrer">Open the volunteer form</a>
              </div>
            </section>
          </div>
        </main>

        <div className="band">
          <footer className="foot wrap">
            <p>The Redeemed Christian Church of God · Higher Ground Zonal Headquarters</p>
            <p>100 Hours Marathon Praise · 16–20 November 2026</p>
          </footer>
        </div>
      </div>
    </>
  );
}
