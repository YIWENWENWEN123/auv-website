(() => {
  const section = document.querySelector('#autonomy');
  const film = section.querySelector('video');
  const cover = section.querySelector('.film-cover');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;

  function updatePlayback() {
    if (!visible || document.hidden || motion.matches) {
      film.pause();
      if (motion.matches) cover.hidden = false;
      return;
    }
    if (!film.hasAttribute('src')) film.src = film.dataset.src;
    film.play().catch(() => { cover.hidden = false; });
  }

  film.addEventListener('playing', () => { cover.hidden = true; });
  film.addEventListener('error', () => { cover.hidden = false; });
  document.addEventListener('visibilitychange', updatePlayback);
  motion.addEventListener('change', updatePlayback);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= 0.15;
    if (visible) section.classList.add('in-view');
    updatePlayback();
  }, {threshold: [0, 0.15]}).observe(film);
})();