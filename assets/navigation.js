(() => {
  const english = document.documentElement.lang === 'en';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const style = document.createElement('style');
  style.textContent = `.video-play-fallback{position:absolute;right:18px;bottom:18px;z-index:8;min-height:48px;padding:10px 18px;border:1px solid #42d8e7;border-radius:4px;background:#041421ed;color:#fff;font:600 16px/1.4 system-ui;cursor:pointer}.video-play-fallback[hidden]{display:none}.video-play-fallback:focus-visible{outline:3px solid white;outline-offset:3px}`;
  document.head.append(style);
  document.querySelectorAll('video').forEach(video => {
    const parent = video.parentElement;
    if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
    const cover = parent.querySelector('.film-cover');
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'video-play-fallback';
    const label = english ? 'Play video' : '播放视频';
    button.textContent = label;
    button.hidden = true;
    parent.append(button);
    video.muted = true; video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline',''); video.setAttribute('webkit-playsinline','');
    let visible = false, manual = false, pending = false;
    function showButton() { button.hidden = false; }
    function load() {
      if (video.dataset.src && !video.getAttribute('src')) video.src = video.dataset.src;
    }
    function play() {
      load();
      if (pending) return;
      pending = true;
      const result = video.play();
      Promise.resolve(result).catch(showButton).finally(() => {pending = false;});
    }
    function update() {
      if (!visible || document.hidden) { video.pause(); return; }
      if (motion.matches && !manual) { video.pause(); showButton(); return; }
      play();
    }
    button.addEventListener('click', () => {
      manual = true; button.textContent = label;
      // Calling play directly in the gesture handler is required on mobile browsers.
      pending = false; play();
    });
    video.addEventListener('playing', () => {
      button.hidden = true;
      if (cover) cover.hidden = true;
      parent.classList.add('is-playing');
    });
    video.addEventListener('pause', () => { if (visible && !document.hidden) showButton(); });
    video.addEventListener('error', () => {
      button.textContent = english ? 'Retry video' : '重新播放视频';
      showButton();
    });
    document.addEventListener('visibilitychange', update);
    motion.addEventListener('change', () => {manual = false; update();});
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          video.closest('section')?.classList.add('in-view','arg-visible');
        }
        update();
      }, {threshold:0.05}).observe(video);
    } else { visible = true; update(); }
  });
})();
