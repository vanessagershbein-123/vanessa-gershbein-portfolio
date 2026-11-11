/* Photo grid with no gaps: deal the photos into columns (each to the shortest one),
   then let each column stretch to the same height so every column ends together. */
(function () {
  var g = document.querySelector('.gallery');
  if (!g) return;
  var items = [].slice.call(g.querySelectorAll('.g-item'));
  var cur = 0;
  function ratio(it) { var im = it.querySelector('img'); return im.getAttribute('height') / im.getAttribute('width'); }
  function layout() {
    var w = g.clientWidth;
    var n = w >= 880 ? 3 : w >= 500 ? 2 : 1;
    if (n === cur) return;
    cur = n;
    g.textContent = '';
    g.classList.add('masonry');
    g.style.setProperty('--n', n);
    var cols = [], h = [];
    for (var i = 0; i < n; i++) { var c = document.createElement('div'); c.className = 'g-col'; g.appendChild(c); cols.push(c); h.push(0); }
    items.forEach(function (it) {
      var k = h.indexOf(Math.min.apply(null, h));
      cols[k].appendChild(it);
      h[k] += ratio(it) + .08;
    });
  }
  layout();
  addEventListener('resize', layout);
})();

// Gallery show video: load and play only once it scrolls into view (saves data on phones)
(function () {
  var v = document.querySelector('video[data-src]'); if (!v) return;
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function start() { if (!v.src) { v.src = v.dataset.src; } if (still) { v.controls = true; } else { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
  if (!('IntersectionObserver' in window)) { start(); return; }
  new IntersectionObserver(function (es, o) { es.forEach(function (e) { if (e.isIntersecting) { start(); o.disconnect(); } }); }, { rootMargin: '200px' }).observe(v);
})();
