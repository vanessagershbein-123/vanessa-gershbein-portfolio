/* Learning Hub app: progress, drills, review queue, notes and search.
   Everything is saved in this browser (localStorage). No accounts, no server. */
(function () {
  'use strict';
  var H = window.HUB;
  if (!H) return;
  var body = document.body;
  var ROOT = body.getAttribute('data-root') || '';
  var PAGE = body.getAttribute('data-page') || '';
  var KIND = body.getAttribute('data-kind') || '';
  var KEY = 'learninghub.v1';
  var DAY = 864e5;
  var IV = { M: 1, P: 3, N: 7 };
  var RN = { M: 'Missed', P: 'Partial', N: 'Nailed it' };
  var ST = { new: 'Not started', attempted: 'Attempted', review: 'Needs review', solid: 'Solid', read: 'Read' };

  var ITEMS = H.items || [];
  var BY = {};
  ITEMS.forEach(function (it) { BY[it.id] = it; });
  var DRILLS = ITEMS.filter(function (i) { return i.k === 'd'; });

  // ---------- state ----------
  function blank() { return { v: 1, done: {}, rate: {}, hist: {}, ans: {}, notes: {}, revealed: {}, quiz: {}, att: {}, prev: {}, tl: {}, last: null, act: {} }; }
  function ensure() { ['quiz', 'att', 'prev', 'tl', 'gl'].forEach(function (k) { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; }); }
  function valid(s) {
    if (!s || typeof s !== 'object' || s.v !== 1) return false;
    return ['done', 'rate', 'hist', 'ans', 'notes', 'revealed', 'act'].every(function (k) {
      return s[k] && typeof s[k] === 'object' && !Array.isArray(s[k]);
    });
  }
  var S = blank();
  try { var raw = JSON.parse(localStorage.getItem(KEY)); if (valid(raw)) S = raw; } catch (e) { /* private window or blocked storage */ }
  ensure();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); return true; } catch (e) { return false; } }

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function bump() { var k = today(); S.act[k] = (S.act[k] || 0) + 1; }
  function fmt(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function href(it) { return ROOT + it.url; }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k]; else if (k === 'cls') n.className = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function debounce(fn, ms) { var t; return function () { var a = arguments; clearTimeout(t); t = setTimeout(function () { fn.apply(null, a); }, ms); }; }

  // ---------- derived status ----------
  function lastH(id) { var h = S.hist[id]; return h && h.length ? h[h.length - 1] : null; }
  function dueAt(id) { var r = S.rate[id], h = lastH(id); if (!r || !h) return null; return h.ts + IV[r] * DAY; }
  function isDue(id) { var d = dueAt(id); return d !== null && d <= Date.now(); }
  function itemStatus(id) {
    var it = BY[id]; if (!it) return 'new';
    if (it.k === 'l') return S.done[id] ? 'read' : 'new';
    var r = S.rate[id];
    if (r === 'N') return 'solid';
    if (r === 'P' || r === 'M') return 'review';
    if ((S.ans[id] || '').trim() || S.revealed[id]) return 'attempted';
    return 'new';
  }
  function touched(id) { return itemStatus(id) !== 'new'; }
  function trackItems(tid) { return ITEMS.filter(function (i) { return i.t === tid; }); }
  function trackStatus(tid) {
    var its = trackItems(tid);
    if (!its.some(function (i) { return touched(i.id); })) return 'new';
    var drills = its.filter(function (i) { return i.k === 'd'; });
    if (drills.some(function (d) { return itemStatus(d.id) === 'review' || isDue(d.id); })) return 'review';
    var allRead = its.filter(function (i) { return i.k === 'l'; }).every(function (l) { return S.done[l.id]; });
    if (allRead && drills.every(function (d) { return S.rate[d.id] === 'N'; })) return 'solid';
    return 'attempted';
  }
  function complete(it) { return it.k === 'l' ? !!S.done[it.id] : !!S.rate[it.id]; }
  function orderedTrack(tid) {
    var its = trackItems(tid);
    return its.filter(function (i) { return i.k === 'l'; }).concat(its.filter(function (i) { return i.k === 'd'; }));
  }

  // ---------- every page ----------
  function paintCommon() {
    var dueN = DRILLS.filter(function (d) { return isDue(d.id); }).length;
    $$('[data-due-count]').forEach(function (n) { n.textContent = dueN; n.hidden = !dueN; });
    $$('[data-item]').forEach(function (a) {
      var id = a.getAttribute('data-item');
      var st = itemStatus(id);
      a.classList.toggle('is-done', BY[id] ? complete(BY[id]) : false);
      a.setAttribute('data-st', st);
    });
    $$('[data-item-status]').forEach(function (n) {
      var id = n.getAttribute('data-item-status'), st = itemStatus(id);
      n.textContent = st === 'new' ? '' : ST[st] + (isDue(id) ? ' · due' : '');
      n.className = 'st pill st-' + st + (isDue(id) ? ' is-due' : '');
    });
    $$('[data-track-status]').forEach(function (n) {
      var st = trackStatus(n.getAttribute('data-track-status'));
      n.textContent = ST[st]; n.className = 'pill st-' + st;
    });
    $$('[data-lessons-done]').forEach(function (n) {
      var tid = n.getAttribute('data-lessons-done');
      n.textContent = trackItems(tid).filter(function (i) { return i.k === 'l' && S.done[i.id]; }).length;
    });
    $$('[data-dot]').forEach(function (n) {
      var id = n.getAttribute('data-dot'), r = S.rate[id];
      n.className = 'dot' + (r ? ' r-' + r : '') + (isDue(id) ? ' is-due' : '');
      var it = BY[id];
      if (it) n.title = it.title + (r ? ' (' + RN[r] + ')' : ' (not started)');
    });
  }

  if (BY[PAGE]) { S.last = { id: PAGE, ts: Date.now() }; save(); }

  // ---------- home: one next rep ----------
  var RANK = { M: 0, P: 1, N: 2 };
  function shortDate(ts) { return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }
  function nextLesson() {
    var cur = S.last && BY[S.last.id];
    if (cur) {
      var seq = orderedTrack(cur.t).filter(function (i) { return i.k === 'l'; });
      var from = cur.k === 'l' ? seq.indexOf(cur) : 0;
      for (var j = Math.max(0, from); j < seq.length; j++) if (!S.done[seq[j].id]) return seq[j];
    }
    for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].k === 'l' && !S.done[ITEMS[i].id]) return ITEMS[i];
    return null;
  }
  function nextReps() {
    var out = [], seen = {};
    function add(it, why) { if (it && !seen[it.id]) { seen[it.id] = 1; out.push({ it: it, why: why }); } }
    DRILLS.filter(function (d) { return isDue(d.id); })
      .sort(function (a, b) { return (RANK[S.rate[a.id]] - RANK[S.rate[b.id]]) || (dueAt(a.id) - dueAt(b.id)); })
      .forEach(function (d) { add(d, 'Due for review · last time: ' + RN[S.rate[d.id]]); });
    var cur = S.last && BY[S.last.id];
    if (cur && cur.k === 'd' && !(S.att[cur.id] && S.att[cur.id].rated) && (S.ans[cur.id] || '').trim()) {
      add(cur, 'Finish your answer · ' + (cur.m || 5) + ' min');
    }
    ITEMS.filter(function (i) { return i.k === 'l' && S.done[i.id]; })
      .sort(function (a, b) { return S.done[b.id] - S.done[a.id]; })
      .forEach(function (l) {
        DRILLS.filter(function (d) { return d.lk === l.id && !S.rate[d.id]; })
          .forEach(function (d) { add(d, 'Practice lesson ' + l.n + ' · ' + (d.m || 5) + ' min'); });
      });
    var nl = nextLesson();
    if (nl) add(nl, 'Next lesson · ' + (nl.m || 8) + ' min');
    return out;
  }
  function paintHome() {
    var any = Object.keys(S.done).length + Object.keys(S.rate).length;
    body.classList.toggle('has-progress', any > 0);
    var box = $('[data-next]');
    if (box) {
      var reps = nextReps();
      clear(box);
      if (!reps.length) {
        var soon = DRILLS.filter(function (d) { return dueAt(d.id) !== null; })
          .sort(function (a, b) { return dueAt(a.id) - dueAt(b.id); })[0];
        box.appendChild(el('h2', { cls: 'panel-h', text: 'You\u2019re all caught up' }));
        box.appendChild(el('p', { cls: 'next-why', text: soon
          ? 'Next review: ' + soon.title + ', ' + shortDate(dueAt(soon.id)) + '.'
          : 'Every written lesson and drill is done. New ones are on the way.' }));
      } else {
        var top = reps[0];
        box.appendChild(el('h2', { cls: 'panel-h', text: any ? 'Your next rep' : 'Start here' }));
        box.appendChild(el('a', { cls: 'next-link', href: href(top.it), text: top.it.title }));
        box.appendChild(el('p', { cls: 'meta', text: (top.it.k === 'l' ? 'Lesson ' + top.it.n : top.it.n) + ' · ' + top.it.tt }));
        box.appendChild(el('p', { cls: 'next-why', text: top.why }));
        var rest = reps.slice(1, 3);
        if (rest.length) {
          box.appendChild(el('h3', { cls: 'then-h', text: 'After that' }));
          var ol = el('ol', { cls: 'then-list' });
          rest.forEach(function (r) {
            ol.appendChild(el('li', null, [el('a', { href: href(r.it), text: r.it.title }), el('span', { cls: 'meta', text: r.why })]));
          });
          box.appendChild(ol);
        }
      }
    }
    var strip = $('[data-streak]');
    if (strip) {
      clear(strip);
      var days = 0, total = 0, now = new Date();
      for (var i = 27; i >= 0; i--) {
        var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        var k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        var n = S.act[k] || 0;
        if (n) { days++; total += n; }
        var lvl = n === 0 ? 0 : n < 3 ? 1 : n < 6 ? 2 : 3;
        strip.appendChild(el('span', { cls: 'sq l' + lvl, title: d.toDateString() + ': ' + n + (n === 1 ? ' action' : ' actions') }));
      }
      var meta = $('[data-streak-meta]');
      if (meta) meta.textContent = days ? days + ' active day' + (days === 1 ? '' : 's') + ', ' + total + ' actions' : 'No activity yet. Read a lesson to start.';
    }
    (H.paths || []).forEach(function (p) {
      var its = ITEMS.filter(function (i) { return i.p === p.id; });
      if (!its.length) return;
      var dn = its.filter(complete).length;
      var bar = $('[data-bar="' + p.id + '"]');
      if (bar) bar.style.width = Math.round(dn / its.length * 100) + '%';
      var pm = $('[data-path-meta="' + p.id + '"]');
      if (pm && dn) pm.textContent = dn + ' of ' + its.length + ' done';
    });
  }

  // ---------- lesson ----------
  var paintMarkDone = function () {};
  function setupLesson() {
    var btn = $('[data-mark-done]');
    if (btn) {
      var id = btn.getAttribute('data-mark-done');
      var paint = paintMarkDone = function () {
        var on = !!S.done[id];
        btn.textContent = on ? 'Marked as read · Undo' : 'Mark as read';
        btn.classList.toggle('is-on', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      };
      paint();
      btn.addEventListener('click', function () {
        if (S.done[id]) delete S.done[id]; else { S.done[id] = Date.now(); bump(); }
        save(); paint(); paintCommon();
      });
    }
    var note = $('[data-note]');
    if (note) {
      var nid = note.getAttribute('data-note');
      note.value = S.notes[nid] || '';
      if (note.value) { var d = note.closest('details'); if (d) d.open = true; }
      var status = $('[data-note-status]');
      note.addEventListener('input', debounce(function () {
        var v = note.value;
        if (v.trim()) S.notes[nid] = v; else delete S.notes[nid];
        if (status) status.textContent = save() ? 'Saved in this browser.' : 'Couldn’t save: this browser is blocking storage.';
      }, 400));
    }
  }

  // ---------- concept check ----------
  function setupQuiz() {
    var box = $('[data-quiz]');
    if (!box) return;
    var id = box.getAttribute('data-quiz');
    var qs = $$('.q', box), scoreEl = $('[data-quiz-score]', box), first = {}, autoMarked = false;
    $$('.q-answer', box).forEach(function (d) { d.hidden = true; });
    // Start fresh every visit: never show a remembered or restored selection.
    $$('input[type="radio"]', box).forEach(function (r) { r.checked = false; r.setAttribute('autocomplete', 'off'); });
    var prev = S.quiz[id];
    if (prev && scoreEl) scoreEl.textContent = 'Last time: ' + prev.r + ' of ' + prev.n + ' right on the first try. Try again any time.';
    function paintScore() {
      var answered = Object.keys(first).length, right = 0;
      Object.keys(first).forEach(function (k) { if (first[k]) right++; });
      if (answered < qs.length) { scoreEl.textContent = answered + ' of ' + qs.length + ' answered.'; return; }
      scoreEl.textContent = right + ' of ' + qs.length + ' right on the first try. ' +
        (right === qs.length ? 'You have this one.' : 'Reread the parts you missed, then come back to it.');
      S.quiz[id] = { r: right, n: qs.length, ts: Date.now() };
      if (!autoMarked && !S.done[id]) {
        S.done[id] = Date.now();
        scoreEl.textContent += ' Lesson marked as read.';
      }
      autoMarked = true;
      bump(); save(); paintMarkDone(); paintCommon();
    }
    qs.forEach(function (q, i) {
      var correct = +q.getAttribute('data-correct'), fb = $('.q-feedback', q);
      var why = $('.q-answer p', q);
      $$('input[type="radio"]', q).forEach(function (r) {
        r.addEventListener('change', function () {
          var ok = +r.value === correct;
          if (!(i in first)) first[i] = ok;
          $$('.opt', q).forEach(function (l) { l.classList.remove('is-right', 'is-wrong'); });
          r.closest('.opt').classList.add(ok ? 'is-right' : 'is-wrong');
          fb.hidden = false;
          fb.className = 'q-feedback ' + (ok ? 'ok' : 'no');
          clear(fb);
          fb.appendChild(el('strong', { text: ok ? 'Correct. ' : 'Not quite. ' }));
          if (ok && why) fb.appendChild(document.createTextNode(why.textContent.replace(/^[^.]*\.\s*/, '')));
          else if (!ok) fb.appendChild(document.createTextNode('Try another option.'));
          paintScore();
        });
      });
    });
  }

  // ---------- drill ----------
  function startAttempt(id) {
    var prev = (S.ans[id] || '').trim();
    if (prev) S.prev[id] = { text: prev, ts: (lastH(id) || {}).ts || Date.now() };
    delete S.ans[id]; delete S.revealed[id]; delete S.tl[id];
    S.att[id] = { ts: Date.now(), rated: false };
    save();
  }
  function setupDrill() {
    var id = PAGE;
    if (!S.att[id]) { S.att[id] = { ts: Date.now(), rated: !!S.rate[id] }; save(); }
    if (S.rate[id] && S.att[id].rated && isDue(id)) startAttempt(id);
    var att = S.att[id];

    var secs = 0, timer = null;
    var tbox = $('[data-timer]');
    var target = tbox ? +tbox.getAttribute('data-target') : 300;
    var tEl = $('[data-time]'), tBtn = $('[data-timer-toggle]'), tReset = $('[data-timer-reset]');
    function paintTime() {
      if (tEl) tEl.textContent = fmt(secs);
      if (tbox) tbox.classList.toggle('over', secs > target);
    }
    function stop() { clearInterval(timer); timer = null; if (tBtn) tBtn.textContent = secs ? 'Resume' : 'Start timer'; }
    function start() { if (timer) return; timer = setInterval(function () { secs++; paintTime(); }, 1000); if (tBtn) tBtn.textContent = 'Pause'; }
    if (tBtn) tBtn.addEventListener('click', function () { timer ? stop() : start(); });
    if (tReset) tReset.addEventListener('click', function () { stop(); secs = 0; paintTime(); stop(); });

    // Coming back for review: say so, and keep the earlier answer out of the way
    var banner = $('[data-due-banner]');
    if (banner && S.rate[id] && !att.rated) {
      var h0 = lastH(id);
      banner.textContent = 'Back for review. Last time: ' + RN[S.rate[id]] + (h0 ? ' on ' + shortDate(h0.ts) : '') + '. Answer it fresh, then compare.';
      banner.hidden = false;
    }
    var prevBox = $('[data-prev]');
    if (prevBox && S.prev[id] && S.prev[id].text) {
      $('[data-prev-label]', prevBox).textContent = 'Your answer from ' + shortDate(S.prev[id].ts);
      $('[data-prev-text]', prevBox).textContent = S.prev[id].text;
      prevBox.hidden = false;
    }

    var ans = $('[data-answer]');
    if (ans) {
      ans.value = S.ans[id] || '';
      ans.addEventListener('input', debounce(function () {
        if (ans.value.trim()) S.ans[id] = ans.value; else delete S.ans[id];
        save(); paintCommon();
      }, 400));
      ans.addEventListener('focus', function () { if (!secs && !timer) start(); }, { once: true });
    }

    var rev = $('[data-reveal]'), rBtn = $('[data-reveal-btn]'), rate = $('[data-rate]');
    function showReveal() {
      if (rev) rev.hidden = false;
      if (rate) rate.hidden = false;
      if (rBtn) { rBtn.setAttribute('aria-expanded', 'true'); rBtn.hidden = true; }
    }
    if (rev && !S.revealed[id] && !att.rated) {
      rev.hidden = true;
      if (rate) rate.hidden = true;
    } else { showReveal(); }
    if (rBtn) rBtn.addEventListener('click', function () {
      stop(); S.revealed[id] = true; save(); showReveal(); paintCommon();
      var head = rev && rev.querySelector('h2');
      if (head) { head.setAttribute('tabindex', '-1'); head.focus({ preventScroll: true }); }
      if (rev) rev.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    });

    var learned = $('[data-learned]'), rStatus = $('[data-rate-status]'), retry = $('[data-retry]');
    if (learned) {
      learned.value = att.rated ? ((lastH(id) || {}).l || '') : (S.tl[id] || '');
      learned.addEventListener('input', debounce(function () {
        var v = learned.value.trim().slice(0, 200);
        if (att.rated && lastH(id)) lastH(id).l = v;
        else if (v) S.tl[id] = v; else delete S.tl[id];
        var ok = save();
        if (rStatus) rStatus.textContent = ok ? 'Takeaway saved.' : 'Couldn\u2019t save: this browser is blocking storage.';
        paintRate();
      }, 400));
    }
    function paintRate() {
      $$('.rate-btn').forEach(function (b) {
        var on = att.rated && S.rate[id] === b.getAttribute('data-r');
        b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (retry) retry.hidden = !att.rated;
      var hl = $('[data-history]');
      if (!hl) return;
      clear(hl);
      (S.hist[id] || []).slice().reverse().forEach(function (h) {
        var bits = [shortDate(h.ts), RN[h.r]];
        if (h.s) bits.push(fmt(h.s));
        var li = el('li', null, [el('span', { cls: 'pill r-' + h.r, text: bits.join(' · ') })]);
        if (h.l) li.appendChild(el('span', { cls: 'lesson-line', text: h.l }));
        hl.appendChild(li);
      });
    }
    $$('.rate-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        stop();
        var r = b.getAttribute('data-r');
        var hist = S.hist[id] = S.hist[id] || [];
        var replacing = att.rated && hist.length > 0;
        var entry = { ts: Date.now(), r: r, s: secs || (replacing ? hist[hist.length - 1].s : 0), l: learned ? learned.value.trim().slice(0, 200) : '' };
        if (replacing) hist[hist.length - 1] = entry;
        else { hist.push(entry); att.rated = true; bump(); }
        delete S.tl[id];
        S.rate[id] = r;
        var ok = save();
        if (rStatus) rStatus.textContent = ok
          ? (replacing ? 'Rating updated. ' : 'Saved. ') + 'This drill comes back in ' + IV[r] + (IV[r] === 1 ? ' day.' : ' days.')
          : 'Couldn\u2019t save: this browser is blocking storage.';
        paintRate(); paintCommon();
      });
    });
    if (retry) retry.addEventListener('click', function () { startAttempt(id); location.reload(); });
    paintRate();
  }

  // ---------- review ----------
  function paintReview() {
    var dl = $('[data-due-list]'), ul = $('[data-upcoming-list]'), ll = $('[data-learned-list]');
    function row(d, meta) {
      return el('li', null, [el('a', { href: href(d) }, [
        el('span', { cls: 'num', text: d.n.replace('Drill ', 'D') }),
        el('span', { cls: 't', text: d.title }),
        el('span', { cls: 'meta', text: meta }),
        el('span', { cls: 'pill r-' + S.rate[d.id], text: RN[S.rate[d.id]] })
      ])]);
    }
    var rated = DRILLS.filter(function (d) { return S.rate[d.id]; });
    var due = rated.filter(function (d) { return isDue(d.id); }).sort(function (a, b) { return dueAt(a.id) - dueAt(b.id); });
    var up = rated.filter(function (d) { return !isDue(d.id); }).sort(function (a, b) { return dueAt(a.id) - dueAt(b.id); });
    if (dl && due.length) { clear(dl); due.forEach(function (d) { dl.appendChild(row(d, d.tt)); }); }
    if (ul && up.length) {
      clear(ul);
      up.forEach(function (d) {
        var n = Math.ceil((dueAt(d.id) - Date.now()) / DAY);
        ul.appendChild(row(d, d.tt + ' · back in ' + n + (n === 1 ? ' day' : ' days')));
      });
    }
    if (ll) {
      var all = [];
      Object.keys(S.hist).forEach(function (id) {
        (S.hist[id] || []).forEach(function (h) { if (h.l && BY[id]) all.push({ it: BY[id], h: h }); });
      });
      all.sort(function (a, b) { return b.h.ts - a.h.ts; });
      if (all.length) {
        clear(ll);
        all.forEach(function (x) {
          ll.appendChild(el('li', null, [el('q', { text: x.h.l }), ' ', el('a', { href: href(x.it), text: x.it.title })]));
        });
      }
    }
  }

  // ---------- notes and search ----------
  function setupNotes() {
    var nl = $('[data-note-list]');
    function paintNotes() {
      if (!nl) return;
      var ids = Object.keys(S.notes).filter(function (id) { return BY[id] && (S.notes[id] || '').trim(); });
      clear(nl);
      if (!ids.length) { nl.appendChild(el('li', { cls: 'empty', text: 'Notes you add on lesson pages show up here.' })); return; }
      ids.forEach(function (id) {
        nl.appendChild(el('li', null, [el('a', { href: href(BY[id]), text: BY[id].title }), el('p', { text: S.notes[id] })]));
      });
    }
    paintNotes();

    var q = $('[data-search]'), out = $('[data-results]');
    function snippet(text, term) {
      var i = text.toLowerCase().indexOf(term);
      var frag = document.createDocumentFragment();
      if (i < 0) { frag.appendChild(document.createTextNode(text.slice(0, 140) + (text.length > 140 ? '…' : ''))); return frag; }
      var s = Math.max(0, i - 60), e = Math.min(text.length, i + term.length + 80);
      frag.appendChild(document.createTextNode((s ? '…' : '') + text.slice(s, i)));
      frag.appendChild(el('mark', { text: text.slice(i, i + term.length) }));
      frag.appendChild(document.createTextNode(text.slice(i + term.length, e) + (e < text.length ? '…' : '')));
      return frag;
    }
    function run() {
      if (!q || !out) return;
      var term = q.value.trim().toLowerCase();
      clear(out);
      if (term.length < 2) return;
      var idx = {};
      (window.HUB_SEARCH || []).forEach(function (x) { idx[x.id] = x.text; });
      var hits = [];
      ITEMS.forEach(function (it) {
        var text = idx[it.id] || '', note = S.notes[it.id] || '';
        var score = 0, low = text.toLowerCase(), pos = -1;
        if (it.title.toLowerCase().indexOf(term) >= 0) score += 10;
        while ((pos = low.indexOf(term, pos + 1)) >= 0 && score < 60) score += 1;
        if (note.toLowerCase().indexOf(term) >= 0) score += 5;
        if (score) hits.push({ it: it, score: score, text: note.toLowerCase().indexOf(term) >= 0 ? 'Your note: ' + note : text });
      });
      hits.sort(function (a, b) { return b.score - a.score; });
      if (!hits.length) { out.appendChild(el('li', { cls: 'empty', text: 'No matches for “' + q.value.trim() + '”.' })); return; }
      hits.slice(0, 20).forEach(function (h) {
        var p = el('p', { cls: 'snip' }); p.appendChild(snippet(h.text, term));
        out.appendChild(el('li', null, [el('a', { href: href(h.it) }, [
          el('span', { cls: 'num', text: h.it.k === 'l' ? h.it.n : h.it.n.replace('Drill ', 'D') }),
          el('span', { cls: 't', text: h.it.title }),
          el('span', { cls: 'meta', text: h.it.tt })
        ]), p]));
      });
    }
    if (q) q.addEventListener('input', debounce(run, 150));
  }

  // ---------- videos: load YouTube only after a click ----------
  $$('.video').forEach(function (fig) {
    var link = $('.video-link', fig), id = fig.getAttribute('data-video');
    if (!link || !/^[A-Za-z0-9_-]{11}$/.test(id || '')) return;
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var frame = el('iframe', {
        src: 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0' + (+fig.getAttribute('data-start') ? '&start=' + (+fig.getAttribute('data-start')) : ''),
        title: fig.getAttribute('data-title') || 'Video',
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        allowfullscreen: '', loading: 'lazy'
      });
      link.parentNode.insertBefore(frame, link);
      link.parentNode.removeChild(link);
      frame.focus();
    });
  });

  // ---------- glossary terms: keep the definition on screen; tap to open on phones ----------
  function placeTip(term) {
    var tip = term.querySelector('.term-tip');
    if (!tip) return;
    tip.style.marginLeft = '0px';
    tip.classList.remove('below');
    var r = tip.getBoundingClientRect();
    if (!r.width) return;
    var w = window.innerWidth || document.documentElement.clientWidth, shift = 0;
    if (r.left < 8) shift = 8 - r.left;
    else if (r.right > w - 8) shift = (w - 8) - r.right;
    tip.style.marginLeft = shift + 'px';
    if (r.top < 8) tip.classList.add('below');
  }
  function closeTerms(keep) {
    Array.prototype.forEach.call(document.querySelectorAll('.term.open'), function (x) {
      if (x !== keep) x.classList.remove('open');
    });
  }
  document.addEventListener('mouseover', function (e) {
    var t = e.target.closest && e.target.closest('.term');
    if (t) placeTip(t);
  });
  document.addEventListener('focusin', function (e) {
    var t = e.target.closest && e.target.closest('.term');
    if (t) placeTip(t);
  });
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.term');
    closeTerms(t);
    if (t) { t.classList.toggle('open'); placeTip(t); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeTerms(null);
    var a = document.activeElement;
    if (a && a.classList && a.classList.contains('term')) a.blur();
  });

  // ---------- drill hints: one per press, so asking for help is a deliberate choice.
  // The last press puts a fill-in-the-blanks outline into the answer box (below anything already typed). ----------
  Array.prototype.forEach.call(document.querySelectorAll('[data-hints]'), function (box) {
    var btn = box.querySelector('[data-hint-btn]'), list = box.querySelector('[data-hint-list]');
    if (!btn || !list) return;
    var hs = list.querySelectorAll('[data-hint]'), shown = 0, outline = box.getAttribute('data-outline') || '';
    function label() {
      if (shown < hs.length) {
        btn.textContent = shown ? 'Still stuck? Get another hint (' + shown + ' of ' + hs.length + ' used)' : 'Stuck? Get a hint';
      } else if (outline) {
        btn.textContent = 'Still stuck? Put an outline in your answer box';
      } else {
        btn.textContent = "That's every hint. Give it a try, then reveal the answer.";
        btn.disabled = true;
      }
    }
    label();
    btn.addEventListener('click', function () {
      if (shown < hs.length) {
        list.hidden = false;
        hs[shown].hidden = false;
        shown += 1;
        label();
        return;
      }
      if (!outline) return;
      var ans = document.querySelector('[data-answer]');
      if (ans) {
        var cur = ans.value.replace(/\s+$/, '');
        ans.value = cur ? cur + '\n\n' + outline : outline;
        ans.dispatchEvent(new Event('input', { bubbles: true }));
        ans.focus();
        ans.setSelectionRange(0, 0);
        ans.scrollTop = 0;
      }
      var li = document.createElement('li');
      li.innerHTML = '<span class="hint-n">Outline</span> It\'s in your answer box now. Fill in the blanks, then reveal the answer.';
      list.hidden = false;
      list.appendChild(li);
      outline = '';
      btn.textContent = 'Outline added. Fill in the blanks, then reveal the answer.';
      btn.disabled = true;
    });
  });

  // ---------- top nav menus: one open at a time; close on outside click or Escape ----------
  var navMenus = document.querySelectorAll('[data-nav-menu]');
  Array.prototype.forEach.call(navMenus, function (m) {
    m.addEventListener('toggle', function () {
      if (!m.open) return;
      Array.prototype.forEach.call(navMenus, function (o) { if (o !== m) o.open = false; });
    });
  });
  document.addEventListener('click', function (e) {
    Array.prototype.forEach.call(navMenus, function (m) { if (m.open && !m.contains(e.target)) m.open = false; });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    Array.prototype.forEach.call(navMenus, function (m) {
      if (m.open) { m.open = false; var s = m.querySelector('summary'); if (s) s.focus(); }
    });
  });

  // ---------- glossary flashcards: decks by path, flip, sort into Got it / Still learning ----------
  function setupFlash() {
    var box = $('[data-flash]'), src = document.getElementById('glossary-cards');
    if (!box || !src) return;
    var CARDS;
    try { CARDS = JSON.parse(src.textContent); } catch (e) { return; }
    var pref = S.gl;
    if (!pref.k || typeof pref.k !== 'object') pref.k = {};
    var deck = $('[data-deck="' + pref.deck + '"]', box) ? pref.deck : 'all';
    var rev = !!pref.rev, only = !!pref.only;
    var queue = [], total = 0, got = 0, flipped = false, cur = null;
    var card = $('[data-flash-card]', box), stage = $('[data-flash-stage]', box), done = $('[data-flash-done]', box);
    var bGot = $('[data-flash-got]', box), bAgain = $('[data-flash-again]', box), live = $('[data-flash-live]', box);
    var cbRev = $('[data-flash-reverse]', box), cbOnly = $('[data-flash-only]', box);

    function inDeck(c) { return deck === 'all' || c.p.indexOf('all') >= 0 || c.p.indexOf(deck) >= 0; }
    function deckCards() { return CARDS.filter(inDeck); }
    function shuffle(a) {
      for (var i = a.length - 1; i > 0; i--) { var r = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[r]; a[r] = x; }
      return a;
    }
    function paintKnown() {
      var all = deckCards(), k = all.filter(function (c) { return pref.k[c.t]; }).length;
      $('[data-flash-known]', box).textContent = k
        ? 'You\'ve marked ' + k + ' of ' + all.length + ' cards in this deck as Got it.'
        : all.length + ' cards in this deck. Flip a card, then sort it.';
    }
    function paintCount() {
      $('[data-flash-count]', box).textContent = got + ' of ' + total + ' done';
      $('[data-flash-bar]', box).style.width = (total ? Math.round(100 * got / total) : 0) + '%';
    }
    function face(isFlipped) {
      flipped = isFlipped;
      card.classList.toggle('is-flipped', flipped);
      $('[data-face="front"]', card).setAttribute('aria-hidden', flipped ? 'true' : 'false');
      $('[data-face="back"]', card).setAttribute('aria-hidden', flipped ? 'false' : 'true');
      bGot.disabled = bAgain.disabled = !flipped;
      if (cur) {
        var showTerm = flipped === rev;
        card.setAttribute('aria-label', (showTerm ? 'Term: ' + cur.t : 'Definition: ' + cur.d) + (flipped ? '' : '. Press to flip.'));
      }
    }
    function paintCard() {
      if (!queue.length) { finish(); return; }
      cur = queue[0];
      stage.hidden = false; done.hidden = true;
      $('[data-front-label]', card).textContent = rev ? 'Definition' : 'Term';
      $('[data-front-text]', card).textContent = rev ? cur.d : cur.t;
      $('[data-back-label]', card).textContent = rev ? 'Term' : 'Definition';
      $('[data-back-text]', card).textContent = rev ? cur.t : cur.d;
      $('[data-back-also]', card).textContent = cur.o ? 'Also written as: ' + cur.o + '.' : '';
      card.classList.toggle('is-rev', rev);
      card.classList.add('no-anim');
      face(false);
      void card.offsetWidth;
      card.classList.remove('no-anim');
      paintCount();
    }
    function finish() {
      cur = null;
      stage.hidden = true; done.hidden = false;
      var msg = total
        ? 'Round done: all ' + total + ' cards sorted into Got it.'
        : (only ? 'Nothing left to learn in this deck: every card is marked Got it.' : 'No cards in this deck yet.');
      $('[data-flash-done-text]', box).textContent = msg;
      live.textContent = msg;
      paintKnown();
    }
    function start() {
      var list = deckCards();
      if (only) list = list.filter(function (c) { return !pref.k[c.t]; });
      queue = shuffle(list.slice()); total = queue.length; got = 0;
      $$('[data-deck]', box).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-deck') === deck ? 'true' : 'false'); });
      cbRev.checked = rev; cbOnly.checked = only;
      paintKnown();
      paintCard();
    }
    function sort(knew) {
      if (!flipped || !cur) return;
      queue.shift();
      if (knew) { pref.k[cur.t] = 1; got++; }
      else {
        delete pref.k[cur.t];
        queue.splice(Math.min(queue.length, 3 + Math.floor(Math.random() * 3)), 0, cur);
      }
      bump(); save(); paintKnown();
      live.textContent = knew ? 'Got it.' : 'Still learning. It comes back in a few cards.';
      paintCard();
      if (!stage.hidden) card.focus({ preventScroll: true });
    }

    card.addEventListener('click', function () { if (cur) face(!flipped); });
    bGot.addEventListener('click', function () { sort(true); });
    bAgain.addEventListener('click', function () { sort(false); });
    $$('[data-deck]', box).forEach(function (b) {
      b.addEventListener('click', function () { deck = pref.deck = b.getAttribute('data-deck'); save(); start(); });
    });
    cbRev.addEventListener('change', function () { rev = pref.rev = cbRev.checked; save(); if (cur) paintCard(); });
    cbOnly.addEventListener('change', function () { only = pref.only = cbOnly.checked; save(); start(); });
    $('[data-flash-shuffle]', box).addEventListener('click', start);
    $('[data-flash-restart]', box).addEventListener('click', start);
    $('[data-flash-reset]', box).addEventListener('click', function () {
      if (!window.confirm('Clear your Got it marks for every card in this deck?')) return;
      deckCards().forEach(function (c) { delete pref.k[c.t]; });
      save(); start();
    });
    document.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey || stage.hidden || !cur) return;
      var tgt = e.target;
      if (tgt && tgt.closest && tgt.closest('input, textarea, select, [contenteditable]')) return;
      var r = box.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        if (!flipped) face(true); else sort(e.key === 'ArrowRight');
      } else if (e.key === ' ' && tgt !== card && !(tgt && tgt.closest && tgt.closest('button, a, summary'))) {
        e.preventDefault();
        face(!flipped);
      }
    });
    box.hidden = false;
    start();
  }

  // ---------- boot ----------
  paintCommon();
  if (KIND === 'home') paintHome();
  if (KIND === 'lesson') { setupLesson(); setupQuiz(); }
  if (KIND === 'drill') setupDrill();
  if (KIND === 'review') paintReview();
  if (KIND === 'notes') setupNotes();
  if (KIND === 'glossary') setupFlash();
})();
