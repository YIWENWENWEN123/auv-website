(() => {
  const section = document.getElementById('argonaut');
  const video = section.querySelector('video');
  const film = video.parentElement;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  function update() {
    if (!visible || motion.matches) {
      video.pause();
      film.classList.remove('is-playing');
      return;
    }
    if (!video.hasAttribute('src')) video.src = video.dataset.src;
    video.play().catch(() => film.classList.remove('is-playing'));
  }
  video.addEventListener('playing', () => film.classList.add('is-playing'));
  video.addEventListener('error', () => film.classList.remove('is-playing'));
  motion.addEventListener('change', update);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) section.classList.add('arg-visible');
    update();
  }).observe(section);
})();