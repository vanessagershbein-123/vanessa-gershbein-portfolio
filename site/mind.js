// Home "mind": Vanessa in the center, four thoughts slowly orbiting all the way around her.
// They burst out of her head on load, float loosely, lean toward the cursor, can be flung and drift back into orbit.
// Bubble trails lag behind like a string of bubbles; her face smoothly turns to follow the cursor or the hovered thought.
// Without this file (or with reduced motion) the thoughts sit in a calm grid and still link everywhere.
(function () {
  var stage = document.querySelector('.mind-stage');
  if (!stage || !window.Matter || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var M = window.Matter;
  var me = stage.querySelector('.me');
  var thoughts = Array.prototype.slice.call(stage.querySelectorAll('.thought'));
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  stage.classList.add('live');
  document.querySelector('.mind').classList.add('live');

  // a second copy of her photo so face changes crossfade instead of snapping
  var me2 = me.cloneNode(false);
  me2.removeAttribute('id'); me2.alt = ''; me2.setAttribute('aria-hidden', 'true');
  me2.classList.add('me-b');
  stage.insertBefore(me2, me.nextSibling);
  var faceEls = [me, me2], front = 0;

  var engine = M.Engine.create({ gravity: { x: 0, y: 0 } });
  var W, H, head, cx, cy, rx, ry, springs = [], bodies = [], trails = [];
  var ORBIT = Math.PI * 2 / 80; // one lap every 80 seconds

  function layout() {
    W = stage.clientWidth; H = stage.clientHeight;
    cx = W / 2; cy = H / 2;
    faceEls.forEach(function (el) { el.style.left = cx + 'px'; el.style.top = cy + 'px'; });
    // the giant name fills the stage width and sits level with her shoulders
    var gn = stage.querySelector('.giant-name');
    if (gn) {
      gn.style.fontSize = '';
      var fs = parseFloat(getComputedStyle(gn).fontSize), tw = gn.scrollWidth;
      var word = gn.querySelector('.word') || gn; var range = document.createRange(); range.selectNodeContents(word); tw = range.getBoundingClientRect().width || tw;
      gn.style.fontSize = (fs * (W * .9) / tw) + 'px';
      gn.style.top = (cy + me.offsetHeight * .02) + 'px';
    }
    // paint the blue band down to the bottom of this section
    var sec = stage.closest('.mind');
    if (sec) document.body.style.setProperty('--band', (sec.getBoundingClientRect().bottom + window.scrollY) + 'px');
    var bw = thoughts[0].offsetWidth, bh = thoughts[0].offsetHeight;
    rx = Math.min(W / 2 - bw / 2 - 6, me.offsetWidth * .55 + bw * .75);
    ry = H / 2 - bh / 2 - 8;
  }
  function homeAt(i, time) {
    var a = -Math.PI * .75 + i * Math.PI / 2 + time * ORBIT; // start at the four diagonals
    return { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry };
  }

  function build() {
    layout();
    head = M.Bodies.circle(cx, cy, me.offsetWidth * .38, { isStatic: true });
    var walls = [
      M.Bodies.rectangle(W / 2, -40, W * 2, 80, { isStatic: true }),
      M.Bodies.rectangle(W / 2, H + 40, W * 2, 80, { isStatic: true }),
      M.Bodies.rectangle(-40, H / 2, 80, H * 2, { isStatic: true }),
      M.Bodies.rectangle(W + 40, H / 2, 80, H * 2, { isStatic: true })
    ];
    bodies = thoughts.map(function (t, i) {
      var w = t.offsetWidth, hh = t.offsetHeight;
      var b = M.Bodies.circle(cx, cy, w * .47, { frictionAir: .03, restitution: .6, inertia: Infinity });
      b.el = t; b.w = w; b.h = hh; b.seed = i * 1.9 + .4; b.tilt = 0;
      return b;
    });
    // loose springs: the thoughts drift and sway instead of snapping to their spot
    springs = bodies.map(function (b, i) {
      return M.Constraint.create({ pointA: homeAt(i, 0), bodyB: b, length: 0, stiffness: .0011, damping: .035 });
    });
    M.Composite.add(engine.world, [head].concat(walls, bodies, springs));
    burst();
    if (finePointer) addMouse();
  }

  function burst() {
    bodies.forEach(function (b, i) {
      M.Body.setPosition(b, { x: cx, y: cy });
      var h = springs[i].pointA, dx = h.x - cx, dy = h.y - cy, d = Math.hypot(dx, dy) || 1;
      M.Body.setVelocity(b, { x: dx / d * 16, y: dy / d * 16 });
      b.el.classList.remove('formed'); void b.el.offsetWidth; b.el.classList.add('formed');
    });
    head.collisionFilter.mask = 0; // let thoughts pass through her while they burst out
    setTimeout(function () { head.collisionFilter.mask = 0xFFFFFFFF; }, 500);
  }

  // bubble trails: three dots from her head toward each thought, each lagging a little more
  thoughts.forEach(function (t) {
    var set = [12, 17, 23].map(function (size, k) {
      var d = document.createElement('span');
      d.className = 'trail'; d.setAttribute('aria-hidden', 'true');
      d.style.width = d.style.height = size + 'px';
      d.style.setProperty('--c', getComputedStyle(t).getPropertyValue('--c'));
      stage.appendChild(d);
      return { el: d, x: 0, y: 0, ease: [.22, .14, .09][k], s: size / 2 };
    });
    trails.push(set);
  });

  var dragged = false, downAt = null;
  function addMouse() {
    var mouse = M.Mouse.create(stage);
    mouse.element.removeEventListener('mousewheel', mouse.mousewheel);
    mouse.element.removeEventListener('wheel', mouse.mousewheel);
    mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);
    M.Composite.add(engine.world, M.MouseConstraint.create(engine, { mouse: mouse, constraint: { stiffness: .2, render: { visible: false } } }));
  }
  stage.addEventListener('pointerdown', function (e) { downAt = { x: e.clientX, y: e.clientY }; dragged = false; });
  stage.addEventListener('pointermove', function (e) { if (downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 6) dragged = true; });
  thoughts.forEach(function (t) {
    t.addEventListener('click', function (e) {
      if (dragged) { e.preventDefault(); downAt = null; return; }
      downAt = null;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // new-tab clicks open normally
      // dive into the thought: the bubble swells past the edges of the screen, pops into droplets, and the next page arrives
      e.preventDefault();
      try { sessionStorage.setItem('cameFrom', (t.getAttribute('href') || '').split('#')[0]); } catch (err) {}
      diveInto(t, t.getAttribute('href'));
    });
    t.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });

  function diveInto(t, href) {
    var r = t.getBoundingClientRect(), cxv = r.left + r.width / 2, cyv = r.top + r.height / 2, d = Math.max(r.width, r.height);
    var far = Math.hypot(Math.max(cxv, window.innerWidth - cxv), Math.max(cyv, window.innerHeight - cyv));
    var scale = (far * 2.15) / d;
    var z = document.createElement('div');
    z.className = 'dive'; z.setAttribute('aria-hidden', 'true');
    z.style.left = (cxv - d / 2) + 'px'; z.style.top = (cyv - d / 2) + 'px'; z.style.width = z.style.height = d + 'px';
    document.body.appendChild(z);
    t.style.visibility = 'hidden';
    document.documentElement.classList.add('diving');
    var grow = z.animate([{ transform: 'scale(1)' }, { transform: 'scale(' + scale.toFixed(2) + ')' }], { duration: 720, easing: 'cubic-bezier(.65, 0, .85, .25)', fill: 'forwards' });
    z.animate([{ background: 'rgba(255,255,255,0)' }, { background: 'rgba(255,255,255,0)', offset: .55 }, { background: 'rgba(255,255,255,1)' }], { duration: 720, easing: 'ease-in', fill: 'forwards' });
    grow.onfinish = function () {
      // the pop: a ring of droplets bursting out from the middle of the screen
      for (var k = 0; k < 18; k++) {
        var drop = document.createElement('span'), a = k / 18 * Math.PI * 2, dist = 120 + Math.random() * 160;
        drop.className = 'dive-drop';
        drop.style.left = window.innerWidth / 2 + 'px'; drop.style.top = window.innerHeight / 2 + 'px';
        document.body.appendChild(drop);
        drop.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: .9 }, { transform: 'translate(calc(-50% + ' + (Math.cos(a) * dist).toFixed(0) + 'px), calc(-50% + ' + (Math.sin(a) * dist).toFixed(0) + 'px)) scale(.3)', opacity: 0 }], { duration: 380, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
      }
      setTimeout(function () { window.location.href = href; }, 220);
    };
  }

  // coming back with the browser's back button: bring popped bubbles back
  window.addEventListener('pageshow', function () { document.documentElement.classList.remove('diving'); document.querySelectorAll('.dive, .dive-drop').forEach(function (n) { n.remove(); }); thoughts.forEach(function (t) { t.classList.remove('pop'); t.style.visibility = ''; }); faceEls.forEach(function (el) { el.style.visibility = ''; }); stage.querySelectorAll('.drop').forEach(function (d) { d.remove(); }); });
  // clicking her photo sends the thoughts bursting out of her head again
  faceEls.forEach(function (el) {
    el.setAttribute('title', 'click me');
    if (el === me) { el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0'); el.setAttribute('aria-label', 'Burst the thought bubbles out again'); }
    el.addEventListener('click', function () {
      if (dragged) { downAt = null; return; }
      downAt = null;
      burst();
    });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); burst(); } });
  });


  /* custom cursor inside the thought area: a small dot that grows into "open" over a thought */
  if (finePointer) {
    var dot = document.createElement('div');
    dot.className = 'cursor'; dot.setAttribute('aria-hidden', 'true');
    dot.innerHTML = '<span></span>';
    document.body.appendChild(dot);
    stage.classList.add('has-cursor');
    var label = dot.firstChild, pos = { x: 0, y: 0 }, aim = { x: 0, y: 0 };
    stage.addEventListener('pointerenter', function () { dot.classList.add('show'); });
    stage.addEventListener('pointerleave', function () { dot.classList.remove('show'); });
    stage.addEventListener('pointermove', function (e) { aim.x = e.clientX; aim.y = e.clientY; });
    thoughts.forEach(function (t) {
      t.addEventListener('pointerenter', function () { label.textContent = 'pop'; dot.classList.add('big'); });
      t.addEventListener('pointerleave', function () { dot.classList.remove('big'); });
    });
    faceEls.forEach(function (el) {
      el.addEventListener('pointerenter', function () { label.textContent = 'click me'; dot.classList.add('big'); });
      el.addEventListener('pointerleave', function () { dot.classList.remove('big'); });
    });
    (function follow() {
      pos.x += (aim.x - pos.x) * .5; pos.y += (aim.y - pos.y) * .5;
      dot.style.transform = 'translate(' + pos.x.toFixed(1) + 'px,' + pos.y.toFixed(1) + 'px)';
      requestAnimationFrame(follow);
    })();
  }

  /* Her face: 3x3 photos (rows up/level/down, columns left/center/right) in site/images/face/face-1..9.jpg */
  var faces = [], faceOn = false, faceIdx = 5, focus = null, cursor = null;
  (function loadFaces() {
    var probe = new Image();
    probe.onload = function () {
      var left = 9;
      for (var n = 1; n <= 9; n++) {
        var im = new Image();
        im.onload = function () { var me_ = this; (me_.decode ? me_.decode() : Promise.resolve()).catch(function () {}).then(function () { if (--left === 0) faceOn = true; }); };
        im.src = 'images/face/face-' + n + '.jpg';
        faces.push(im);
      }
    };
    probe.src = 'images/face/face-5.jpg';
  })();
  window.addEventListener('pointermove', function (e) { cursor = { x: e.clientX, y: e.clientY }; }, { passive: true });
  thoughts.forEach(function (t, i) {
    t.addEventListener('pointerenter', function () { focus = i; });
    t.addEventListener('pointerleave', function () { if (focus === i) focus = null; });
  });
  if (!finePointer) setInterval(function () { focus = Math.floor(Math.random() * thoughts.length); }, 2600);

  var lean = { x: 0, y: 0 };
  function target() {
    var s = stage.getBoundingClientRect();
    if (focus !== null && bodies[focus]) return { x: s.left + bodies[focus].position.x, y: s.top + bodies[focus].position.y };
    return cursor;
  }
  // gaze is eased (no jumping straight from left to right), each pose has a buffer zone (no flicker at the edges),
  // and a new pose fades in ON TOP of the old one, which stays solid underneath (no see-through flash)
  var gaze = { x: 0, y: 0 }, col = 1, row = 1, lastSwap = 0, fading = false;
  function axis(v, cur) {
    if (cur === 1) return v < -.34 ? 0 : v > .34 ? 2 : 1;
    if (cur === 0) return v > -.18 ? 1 : 0;
    return v < .18 ? 1 : 2;
  }
  faceEls.forEach(function (el, i) { el.style.transition = 'none'; el.style.opacity = i === 0 ? '1' : '0'; el.style.zIndex = i === 0 ? '2' : '1'; });
  function swapTo(idx) {
    var next = faceEls[1 - front], cur = faceEls[front];
    fading = true;
    next.src = faces[idx - 1].src;
    next.style.transition = 'none'; next.style.opacity = '0'; next.style.zIndex = '3'; cur.style.zIndex = '2';
    void next.offsetWidth;
    next.style.transition = 'opacity .17s ease-out'; next.style.opacity = '1';
    setTimeout(function () { cur.style.transition = 'none'; cur.style.opacity = '0'; cur.style.zIndex = '1'; next.style.zIndex = '2'; fading = false; }, 180);
    front = 1 - front;
  }
  function face(now) {
    var t = target(), s = stage.getBoundingClientRect(), fx = s.left + cx, fy = s.top + cy;
    var nx = 0, ny = 0;
    if (t) { nx = Math.max(-1, Math.min(1, (t.x - fx) / (window.innerWidth * .3))); ny = Math.max(-1, Math.min(1, (t.y - fy) / (window.innerHeight * .3))); }
    gaze.x += (nx - gaze.x) * .16; gaze.y += (ny - gaze.y) * .16;
    // the whole photo leans gently toward what she's looking at
    lean.x += (gaze.x * 9 - lean.x) * .08; lean.y += (gaze.y * 7 - lean.y) * .08;
    var tf = 'translate(' + lean.x.toFixed(2) + 'px,' + lean.y.toFixed(2) + 'px) rotate(' + (lean.x * .25).toFixed(2) + 'deg)';
    faceEls.forEach(function (el) { el.style.transform = tf; });
    if (!faceOn || !t || fading || now - lastSwap < 200) return;
    var c = axis(gaze.x, col), r = axis(gaze.y, row);
    // step one pose at a time so a fast sweep passes through the middle instead of skipping it
    if (c !== col) c = col + (c > col ? 1 : -1);
    if (r !== row) r = row + (r > row ? 1 : -1);
    if (c !== col || r !== row) { col = c; row = r; lastSwap = now; swapTo(row * 3 + col + 1); }
  }

  var t0 = performance.now(), last = t0;
  (function loop(now) {
    M.Engine.update(engine, Math.min(32, now - last)); last = now;
    var time = (now - t0) / 1000, s = stage.getBoundingClientRect();
    var cur = cursor ? { x: cursor.x - s.left, y: cursor.y - s.top } : null;
    bodies.forEach(function (b, i) {
      if (springs[i]) springs[i].pointA = homeAt(i, time);
      // lazy drifting, each thought on its own rhythm
      var f = .0011 * b.mass;
      M.Body.applyForce(b, b.position, { x: Math.sin(time * .55 + b.seed) * f, y: Math.cos(time * .7 + b.seed * 1.4) * f });
      // lean toward the cursor when it comes close; drift aside when another thought is hovered
      if (cur) {
        var dx = cur.x - b.position.x, dy = cur.y - b.position.y, d = Math.hypot(dx, dy);
        if (d < 240 && d > 1) M.Body.applyForce(b, b.position, { x: dx / d * .0009 * b.mass * (1 - d / 240), y: dy / d * .0009 * b.mass * (1 - d / 240) });
      }
      if (focus !== null && focus !== i && bodies[focus]) {
        var o = bodies[focus], ax = b.position.x - o.position.x, ay = b.position.y - o.position.y, ad = Math.hypot(ax, ay) || 1;
        M.Body.applyForce(b, b.position, { x: ax / ad * .0007 * b.mass, y: ay / ad * .0007 * b.mass });
      }
      // a slight tilt in the direction it's drifting
      b.tilt += (Math.max(-9, Math.min(9, b.velocity.x * 2.2)) - b.tilt) * .1;
      b.el.style.transform = 'translate(' + (b.position.x - b.w / 2).toFixed(1) + 'px,' + (b.position.y - b.h / 2).toFixed(1) + 'px) rotate(' + b.tilt.toFixed(2) + 'deg)';
      // trails: from her head toward the thought, each dot easing behind the one before
      var hx = cx + lean.x, hy = cy - me.offsetHeight * .12 + lean.y, tx = b.position.x - hx, ty = b.position.y - hy, td = Math.hypot(tx, ty) || 1;
      var r = me.offsetWidth * .52, reach = Math.max(0, td - r - Math.min(b.w, b.h) * .42);
      trails[i].forEach(function (dot, k) {
        var p = (r + reach * (k + 1) / 4) / td, gx = hx + tx * p, gy = hy + ty * p;
        dot.x += (gx - dot.x) * dot.ease; dot.y += (gy - dot.y) * dot.ease;
        dot.el.style.transform = 'translate(' + (dot.x - dot.s).toFixed(1) + 'px,' + (dot.y - dot.s).toFixed(1) + 'px)';
      });
    });
    face(now);
    requestAnimationFrame(loop);
  })(t0);

  var sec0 = stage.closest('.mind');
  function band() { if (sec0) document.body.style.setProperty('--band', (sec0.getBoundingClientRect().bottom + window.scrollY) + 'px'); }
  if ('ResizeObserver' in window && sec0) new ResizeObserver(band).observe(sec0);
  window.addEventListener('load', band);
  build();
  trails.forEach(function (set) { set.forEach(function (dot) { dot.x = cx; dot.y = cy; }); });
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () {
    layout(); M.Body.setPosition(head, { x: cx, y: cy });
  }, 150); });
})();
