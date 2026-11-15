const videoClips = [...document.querySelectorAll('.feature-video')].map(frame => ({
  frame,
  video: frame.querySelector('video')
}));

function playSilently(video) {
  video.muted = true;
  try {
    const playback = video.play();
    if (playback) playback.catch(() => {});
  } catch {
    // The poster remains available if the browser cannot play the video.
  }
}

let pageIsInactive = false;

function suspendVideos() {
  if (pageIsInactive) return;
  pageIsInactive = true;
  for (const clip of videoClips) {
    clip.resumeOnReturn = !clip.video.paused;
    clip.video.muted = true;
    if (clip.resumeOnReturn) clip.video.pause();
  }
}

function resumeVideos() {
  if (!pageIsInactive || document.hidden) return;
  pageIsInactive = false;
  for (const clip of videoClips) {
    if (clip.resumeOnReturn) playSilently(clip.video);
    clip.resumeOnReturn = false;
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) suspendVideos();
  else resumeVideos();
});
window.addEventListener('pagehide', suspendVideos);
window.addEventListener('pageshow', resumeVideos);

// Playback starts only through the native controls. Keep one stream active.
for (const clip of videoClips) {
  clip.video.addEventListener('play', () => {
    for (const other of videoClips) {
      if (other !== clip) {
        other.resumeOnReturn = false;
        other.video.pause();
      }
    }
  });
}
