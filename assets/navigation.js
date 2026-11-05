(() => {
  const videos = [...document.querySelectorAll('video')];
  document.querySelectorAll('.video-play-fallback').forEach(button => button.remove());
  videos.forEach(video => {
    const parent = video.parentElement;
    const cover = parent.querySelector('.film-cover');
    let pending = false;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.controls = false;
    ['autoplay','loop','muted','playsinline','webkit-playsinline'].forEach(name => video.setAttribute(name,''));
    video.removeAttribute('controls');
    if (video.dataset.src && !video.getAttribute('src')) video.src = video.dataset.src;
    function attempt() {
      if (pending || document.hidden || !video.paused || video.error) return;
      video.muted = true;
      pending = true;
      try {
        Promise.resolve(video.play()).catch(() => {}).finally(() => {pending = false;});
      } catch (_) { pending = false; }
    }
    video.addEventListener('playing', () => {
      if (cover) cover.hidden = true;
      parent.classList.add('is-playing');
    });
    video.addEventListener('canplay', attempt);
    video.addEventListener('loadeddata', attempt);
    video.addEventListener('pause', () => setTimeout(attempt, 300));
    video.addEventListener('ended', () => {video.currentTime = 0; attempt();});
    document.addEventListener('visibilitychange', attempt);
    window.addEventListener('pageshow', attempt);
    // A normal page interaction can unlock playback when browser policy requires a gesture.
    ['pointerdown','touchend','keydown'].forEach(event => document.addEventListener(event,attempt,{passive:true}));
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          video.closest('section')?.classList.add('in-view','arg-visible');
          attempt();
        }
      }).observe(video);
    }
    setInterval(attempt, 3000);
    attempt();
  });
})();
