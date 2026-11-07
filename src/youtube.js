/* Plays a YouTube video's audio through the official IFrame Player API (hidden player, loops).
   If the video can't be embedded or fails to load, onFail is called so the caller can fall back. */
let apiPromise = null;
function loadApi() {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) return resolve(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve(window.YT); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = () => reject(new Error('YouTube API blocked'));
    document.head.appendChild(s);
  });
  return apiPromise;
}

export function createYouTube(videoId, onFail) {
  let player = null, ready = false, wantPlay = false, failed = false, host = null;

  const fail = () => { if (failed) return; failed = true; wantPlay = false; if (onFail) onFail(); };

  host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:fixed;left:-9999px;top:0;width:200px;height:200px;opacity:0;pointer-events:none';
  const mount = document.createElement('div');
  host.appendChild(mount);
  document.body.appendChild(host);

  loadApi().then((YT) => {
    player = new YT.Player(mount, {
      videoId,
      width: 200, height: 200,
      playerVars: { controls: 0, disablekb: 1, fs: 0, rel: 0, playsinline: 1, loop: 1, playlist: videoId },
      events: {
        onReady: () => { ready = true; player.setVolume(70); if (wantPlay) player.playVideo(); },
        onStateChange: (e) => { if (e.data === YT.PlayerState.ENDED) player.playVideo(); },
        onError: fail,
      },
    });
  }).catch(fail);

  return {
    get failed() { return failed; },
    start() {
      if (failed) return false;
      wantPlay = true;
      if (ready) { player.unMute(); player.setVolume(70); player.playVideo(); }
      return true; // if still loading, it starts as soon as the player is ready
    },
    stop() { wantPlay = false; if (ready) player.pauseVideo(); },
    dispose() { wantPlay = false; try { if (player && player.destroy) player.destroy(); } catch (e) { /* ignore */ } if (host) host.remove(); },
  };
}
