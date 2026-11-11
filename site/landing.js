/* Home: the bubble field. Pop a bubble (click, tap, or Enter on the big one) and it bursts into droplets,
   shows the next real fact about Vanessa, then floats back. */
(function () {
  try { sessionStorage.removeItem('cameFrom'); } catch (err) {}
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var field = document.querySelector('.lp-field'), facts = [], next = 0, factEl = null, factTimer;
  try { facts = JSON.parse(field.dataset.facts || '[]'); } catch (err) {}
  var live = field && field.querySelector('[data-fact-live]');
  function showFact(b) {
    if (!facts.length) return;
    var text = facts[next % facts.length]; next++;
    if (factEl) factEl.remove();
    clearTimeout(factTimer);
    factEl = document.createElement('p');
    factEl.className = 'lp-fact'; factEl.setAttribute('aria-hidden', 'true'); factEl.textContent = text;
    document.body.appendChild(factEl);
    var br = b.getBoundingClientRect(), w = factEl.offsetWidth, h = factEl.offsetHeight, pad = 12;
    var x = br.left + br.width / 2 - w / 2, y = br.top + br.height / 2 - h / 2;
    x = Math.max(pad, Math.min(innerWidth - w - pad, x)); y = Math.max(pad, Math.min(innerHeight - h - pad, y));
    factEl.style.left = x + scrollX + 'px'; factEl.style.top = y + scrollY + 'px';
    if (live) live.textContent = text;
    var el = factEl;
    factTimer = setTimeout(function () { el.classList.add('out'); setTimeout(function () { el.remove(); }, 400); }, 3600);
  }
  document.querySelectorAll('.lp-float').forEach(function (b) {
    function pop() {
      if (b.classList.contains('popped')) return;
      var r = b.getBoundingClientRect();
      if (!reduce) for (var i = 0; i < 14; i++) {
        var d = document.createElement('span'), a = i / 14 * Math.PI * 2, dist = r.width * (.55 + Math.random() * .4);
        d.className = 'pop-drop';
        d.style.left = r.left + r.width / 2 + scrollX + 'px'; d.style.top = r.top + r.height / 2 + scrollY + 'px';
        document.body.appendChild(d);
        d.animate([{ transform: 'translate(-50%,-50%)', opacity: 1 }, { transform: 'translate(calc(-50% + ' + Math.cos(a) * dist + 'px), calc(-50% + ' + Math.sin(a) * dist + 'px)) scale(.3)', opacity: 0 }], { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)' }).onfinish = (function (x) { return function () { x.remove(); }; })(d);
      }
      b.classList.add('popped');
      showFact(b);
      var hint = document.querySelector('.lp-hint'); if (hint) hint.style.opacity = 0;
      setTimeout(function () { b.classList.remove('popped'); b.classList.add('reborn'); }, 2200);
      setTimeout(function () { b.classList.remove('reborn'); }, 3600);
    }
    b.addEventListener('pointerdown', function (e) { e.preventDefault(); pop(); });
    b.addEventListener('click', function (e) { if (e.detail === 0) pop(); });
  });

  // hover/tap explainers (Goldstar, brands): tap to open on touch screens, tap elsewhere or press Escape to close
  var wraps = [].slice.call(document.querySelectorAll('.lp-tip-wrap'));
  // keep each note on screen: nudge it left or right if it would hang off the edge
  function fit(wrap) {
    var box = wrap.querySelector('.lp-tip-box'), pad = 12;
    box.style.left = '0px'; box.style.right = 'auto';
    var r = box.getBoundingClientRect(), shift = 0;
    if (r.right > innerWidth - pad) shift = innerWidth - pad - r.right;
    if (r.left + shift < pad) shift = pad - r.left;
    box.style.left = shift + 'px';
    box.style.setProperty('--arrow', Math.max(14, Math.min(r.width - 28, -shift + 24)) + 'px');
  }
  wraps.forEach(function (w) { fit(w); w.addEventListener('mouseenter', function () { fit(w); }); });
  addEventListener('resize', function () { wraps.forEach(fit); });
  wraps.forEach(function (wrap) {
    wrap.querySelector('.lp-tip').addEventListener('click', function (e) {
      e.stopPropagation();
      var open = wrap.classList.contains('open');
      wraps.forEach(function (w) { w.classList.remove('open'); });
      if (!open) { fit(wrap); wrap.classList.add('open'); }
    });
  });
  document.addEventListener('click', function () { wraps.forEach(function (w) { w.classList.remove('open'); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') wraps.forEach(function (w) { w.classList.remove('open'); }); });
})();
