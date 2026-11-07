# 100 Hours of Praise

Website for the RCCG Higher Ground Zonal HQ 100 Hours Marathon Praise (Psalm 149, Sound of Triumph), 16–20 November 2026.

Vite + React + three.js. Day/night theme follows the visitor's local time (6 AM–6 PM is day) with a manual toggle. Background music is synthesised in the browser and starts when a visitor taps the speaker button.

## Run locally
```bash
npm install
npm run dev
```

## Deploy (GitHub → Vercel)
1. Push this folder to a GitHub repository.
2. In Vercel choose **Add New → Project**, import the repository and press **Deploy**. Vercel detects Vite automatically (build command `npm run build`, output directory `dist`).

## Edit content
- `src/config.js`: volunteer form link, start/end time, department list.
- `src/ministers.js` and `public/ministers/`: add a minister by dropping an image in `public/ministers/` and adding a line.
- `public/flier.jpg`: the main flier (also used as the social-share image).
- `src/music.js`: swap for an `<audio>` element if you want to use your own track.
