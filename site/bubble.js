/* Soap bubbles drifting up across each inner page. Click one and it pops; a new one rises from the bottom a moment later.
   "Back home" links pop on the way out. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function burst(x, y, n, spread) {
    for (var i = 0; i < n; i++) {
      var d = document.createElement('span');
      d.className = 'pop-drop';
      var a = (Math.PI * 2 * i) / n + Math.random() * .5;
      var r = spread * (.7 + Math.random() * .6);
      d.style.left = x + 'px';
      d.style.top = y + 'px';
      document.body.appendChild(d);
      d.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: 'translate(calc(-50% + ' + Math.cos(a) * r + 'px), calc(-50% + ' + Math.sin(a) * r + 'px)) scale(.3)', opacity: 0 }
      ], { duration: 520 + Math.random() * 200, easing: 'cubic-bezier(.2, .7, .3, 1)' }).onfinish = (function (el) { return function () { el.remove(); }; })(d);
    }
  }

  // floating bubbles
  var els = [].slice.call(document.querySelectorAll('.page-bubble'));
  var SIZES = [92, 64, 48, 38, 30, 24, 18];
  var W = innerWidth, H = innerHeight;
  var scale = W < 600 ? .7 : 1;
  var bubbles = els.map(function (el, i) {
    var s = Math.round(SIZES[i % SIZES.length] * scale);
    el.style.setProperty('--s', s + 'px');
    return {
      el: el, s: s,
      x: Math.random() * (W - s),
      y: H * (.15 + .8 * Math.random()),          // start scattered across the screen
      v: 9 + Math.random() * 14 + (60 - Math.min(s, 60)) * .12, // px per second; small ones rise a bit faster
      ph: Math.random() * Math.PI * 2,
      sw: 10 + Math.random() * 22,                   // sideways sway
      gone: false
    };
  });

  function place(b, t) {
    var dx = Math.sin(t / 1000 * .5 + b.ph) * b.sw;
    b.el.style.transform = 'translate(' + (b.x + dx) + 'px, ' + b.y + 'px)';
  }
  function respawn(b) {
    b.x = Math.random() * (W - b.s);
    b.y = H + 20 + Math.random() * 120;
    b.gone = false;
    b.el.classList.remove('popped');
  }

  bubbles.forEach(function (b) {
    place(b, 0);
    b.pop = pop;
    b.el.addEventListener('click', function (e) { if (e.detail === 0) pop(); }); // keyboard
    function pop() {
      if (b.gone) return;
      var r = b.el.getBoundingClientRect();
      if (!reduce) burst(r.left + r.width / 2 + scrollX, r.top + r.height / 2 + scrollY, 12, Math.max(26, r.width * .75));
      b.gone = true;
      b.el.classList.add('popped');
      setTimeout(function () { respawn(b); }, 1800 + Math.random() * 1500);
    }
  });

  // the bubbles float behind the page, so pops are caught here: a press on open space
  // (not a link, a field, or a card the bubble is hidden behind) pops the bubble under it
  var SOLID = 'a, button, input, textarea, select, label, img, video, .logo, .proj-card, .block, .talk, .spotlight, .loves li, .dot, .site-foot, .page-title h1, .page-title > p, .crumbs, h2, .route, .muted-note, .prose, .timeline .entry > div';
  document.addEventListener('pointerdown', function (e) {
    if (e.target.closest && e.target.closest(SOLID)) return;
    for (var i = 0; i < bubbles.length; i++) {
      var b = bubbles[i]; if (b.gone) continue;
      var r = b.el.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      if (dx * dx + dy * dy <= (r.width / 2 + 4) * (r.width / 2 + 4)) { b.pop(); break; }
    }
  });

  addEventListener('resize', function () { W = innerWidth; H = innerHeight; });

  if (!reduce && bubbles.length) {
    var last = performance.now(), still = false;
    // arrive, then settle: the bubbles drift for a few seconds, then hold still (pops still work)
    setTimeout(function () { still = true; }, 6000);
    var tlEl = document.querySelector('.timeline');
    if (tlEl && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) still = true; }); }).observe(tlEl);
    (function tick(now) {
      var dt = Math.min(.05, (now - last) / 1000); last = now;
      if (!document.hidden && !still) {
        bubbles.forEach(function (b) {
          if (b.gone) return;
          b.y -= b.v * dt;
          if (b.y < -b.s - 40) respawn(b);
          place(b, now);
        });
      }
      requestAnimationFrame(tick);
    })(last);
  }

  // "things I love" bubbles pop too, then reform
  document.querySelectorAll('.loves li').forEach(function (li) {
    li.addEventListener('pointerdown', function (e) {
      if (e.target.closest('a') || li.classList.contains('popped')) return;
      var r = li.getBoundingClientRect();
      if (!reduce) burst(r.left + r.width / 2 + scrollX, r.top + r.height / 2 + scrollY, 16, r.width * .62);
      li.classList.add('popped');
      setTimeout(function () { li.classList.remove('popped'); li.classList.add('reform'); }, 1100);
      setTimeout(function () { li.classList.remove('reform'); }, 2000);
    });
  });

    // the little bubble before each section heading pops too
  document.querySelectorAll('.dot').forEach(function (d) {
    d.setAttribute('aria-hidden', 'true');
    d.addEventListener('pointerdown', function () {
      if (d.classList.contains('popped')) return;
      var r = d.getBoundingClientRect();
      if (!reduce) burst(r.left + r.width / 2 + scrollX, r.top + r.height / 2 + scrollY, 8, 22);
      d.classList.add('popped');
      setTimeout(function () { d.classList.remove('popped'); d.classList.add('reform'); }, 900);
      setTimeout(function () { d.classList.remove('reform'); }, 1700);
    });
  });

  // Career timeline: the line fills in as you scroll, and each role slides in when you reach it
  var tl = document.querySelector('.timeline');
  if (tl) {
    var fill = function () {
      var r = tl.getBoundingClientRect(), mid = innerHeight * .6;
      tl.style.setProperty('--fill', Math.max(0, Math.min(1, (mid - r.top) / r.height)).toFixed(3));
    };
    fill(); addEventListener('scroll', fill, { passive: true }); addEventListener('resize', fill);
    if (!reduce && 'IntersectionObserver' in window) {
      tl.classList.add('reveal');
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -12% 0px' });
      tl.querySelectorAll('.entry').forEach(function (e) { io.observe(e); });
    }
  }

  // came here by popping a thought on About? then "back" goes to About, where the bubbles live
  var fromAbout = false;
  try {
    var came = sessionStorage.getItem('cameFrom') || '';
    // only the page you dove into from About links back there; any later page goes back home as usual
    fromAbout = came !== '' && came === location.pathname.split('/').pop();
  } catch (err) {}
  if (fromAbout && !/about\.html$/.test(location.pathname)) {
    document.querySelectorAll('.crumbs a[href="index.html"]').forEach(function (a) { a.href = 'about.html'; a.textContent = 'About me'; });
    document.querySelectorAll('.site-foot a[href="index.html"]').forEach(function (a) { a.href = 'about.html'; a.textContent = '← Back to About me'; });
  }

  // "Back home" pops on the way out
  document.querySelectorAll('.crumbs a[href="index.html"], .site-foot a[href="index.html"], .crumbs a[href="about.html"], .site-foot a[href="about.html"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (reduce || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      e.preventDefault();
      var r = a.getBoundingClientRect();
      burst(r.left + r.width / 2 + scrollX, r.top + r.height / 2 + scrollY, 10, Math.max(30, r.width * .6));
      a.classList.add('popping');
      setTimeout(function () { location.href = a.href; }, 260);
    });
  });
  addEventListener('pageshow', function () {
    document.querySelectorAll('.popping').forEach(function (a) { a.classList.remove('popping'); });
  });
})();
