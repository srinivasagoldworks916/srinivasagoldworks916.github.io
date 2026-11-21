/* Overview page: category cards and the hero photo fallback. */

(function categoryCards(){
  const el = $('catTiles');
  if(!el) return;
  el.innerHTML = categoryCardsHTML(liveCategories, { includeSoon:true });
  fadeInImages(el);
})();

(function heroCarousel(){
  const wrap = $('heroSlides');
  if(!wrap) return;

  /* A slide that fails to load is dropped, so a missing file never shows a
     blank frame; if every one fails, fall back to the placeholder. */
  const tpl = $('framePlaceholder');
  [...wrap.querySelectorAll('img')].forEach(img => {
    const drop = () => {
      img.remove();
      if(!wrap.querySelector('img') && tpl){
        wrap.insertAdjacentHTML('afterend', tpl.innerHTML);
        wrap.remove();
      }
    };
    if(img.complete && img.naturalWidth === 0) drop();
    else img.addEventListener('error', drop, { once:true });
  });

  const slides = [...wrap.querySelectorAll('img')];
  const dotsEl = $('heroDots');
  if(slides.length < 2){ if(dotsEl) dotsEl.remove(); return; }

  dotsEl.innerHTML = slides.map((_, i) =>
    `<button type="button" role="tab" aria-label="Picture ${i + 1}" aria-selected="${i === 0}"></button>`
  ).join('');
  const dots = [...dotsEl.querySelectorAll('button')];

  let index = 0;
  let timer = null;
  const HOLD = 5200;

  function go(next){
    if(next === index) return;
    slides[index].classList.remove('is-active');
    dots[index].setAttribute('aria-selected', 'false');
    index = (next + slides.length) % slides.length;
    slides[index].classList.add('is-active');
    dots[index].setAttribute('aria-selected', 'true');
  }

  function play(){ stop(); timer = setInterval(() => go(index + 1), HOLD); }
  function stop(){ if(timer){ clearInterval(timer); timer = null; } }

  dots.forEach((d, i) => d.addEventListener('click', () => { go(i); play(); }));

  /* Do not animate for anyone who asked not to, and do not run while the
     tab is hidden: the timer would queue transitions nobody sees. */
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  function sync(){
    if(still.matches || document.hidden) stop();
    else play();
  }
  still.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  wrap.addEventListener('pointerenter', stop);
  wrap.addEventListener('pointerleave', sync);
  sync();
})();

observeReveals();
