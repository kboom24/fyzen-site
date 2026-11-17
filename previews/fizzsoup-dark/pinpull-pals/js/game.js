/* Pinpull Pals - rendering, UI, input, saves */
(function () {
  'use strict';
  var Sim = window.PPSim, Art = window.PPArt, Snd = window.PPAudio, TAU = Math.PI * 2;
  var KEY = 'fizzsoup:pinpull-pals:save:v1', NL = Sim.LEVELS.length;
  function $(id) { return document.getElementById(id); }
  var app = $('app'), stage = $('stage'), cv = $('cv'), ctx = cv.getContext('2d');

  /* ---------- save ---------- */
  var save = fresh();
  function fresh() { var a = []; for (var i = 0; i < NL; i++) a.push(0); return { v: 1, stars: a, gems: 0, mute: false, skin: 0, streak: 0, best: 0 }; }
  function loadSave() {
    try {
      var d = JSON.parse(window.localStorage.getItem(KEY));
      if (d && d.v === 1 && d.stars && d.stars.length) {
        var f = fresh();
        for (var i = 0; i < NL; i++) f.stars[i] = Math.max(0, Math.min(3, d.stars[i] | 0));
        f.gems = d.gems | 0; f.mute = !!d.mute; f.skin = Math.max(0, Math.min(Art.SKINS.length - 1, d.skin | 0)); f.streak = d.streak | 0; f.best = d.best | 0;
        save = f;
      }
    } catch (e) { /* storage unavailable: play without saving */ }
  }
  function store() { try { window.localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { } }
  function totalStars() { var n = 0; for (var i = 0; i < NL; i++) n += save.stars[i]; return n; }
  function unlocked(i) { return i === 0 || save.stars[i - 1] > 0; }

  /* ---------- state ---------- */
  var mode = 'title', paused = false, li = 0, st = null, T = 0, last = 0, acc = 0, endT = -1, shown = false;
  var fx = [], shake = 0, hintPin = -1, hintT = 0, scale = 1, lastGems = -1, tipT = 0, toastT = 0;

  /* ---------- layout ---------- */
  function resize() {
    var cs = getComputedStyle(stage);
    var aw = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var ah = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    var w = Math.max(160, Math.floor(Math.min(aw, ah * 9 / 16)));
    app.style.width = w + 'px'; app.style.height = Math.round(w * 16 / 9) + 'px'; app.style.fontSize = (w / 36) + 'px';
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(w * dpr); cv.height = Math.round(w * 16 / 9 * dpr); scale = cv.width / 360;
  }

  /* ---------- screens ---------- */
  var SCREENS = ['sTitle', 'sLevels', 'sSkins'], OVER = ['oWin', 'oFail', 'oPause', 'oConfirm', 'oShare'];
  function show(id, on) { $(id).hidden = !on; if (on) { var p = $(id).querySelector('.primary'); if (p) try { p.focus({ preventScroll: true }); } catch (e) { } } }
  function hideOverlays() { for (var i = 0; i < OVER.length; i++) $(OVER[i]).hidden = true; }
  function overlayOpen() { for (var i = 0; i < OVER.length; i++) if (!$(OVER[i]).hidden) return OVER[i]; return ''; }
  function go(m) {
    mode = m; paused = false; hideOverlays();
    for (var i = 0; i < SCREENS.length; i++) $(SCREENS[i]).hidden = true;
    $('hud').hidden = m !== 'play'; $('tip').hidden = true;
    if (m === 'title') { $('sTitle').hidden = false; $('tStars').innerHTML = '&#9733; ' + totalStars() + ' / ' + NL * 3; soundLabels(); }
    if (m === 'levels') { buildGrid(); $('sLevels').hidden = false; scrollGrid(); }
    if (m === 'skins') { buildSkins(); $('sSkins').hidden = false; }
    Snd.music(m === 'play');
  }
  function soundLabels() { var t = 'Sound: ' + (save.mute ? 'Off' : 'On'); $('bSound').textContent = t; $('bPSound').textContent = t; }
  function toast(msg) { var t = $('toast'); t.textContent = msg; t.hidden = false; toastT = 2.2; }

  function buildGrid() {
    var g = $('grid'), h = '', WORLDS = ['Candy Caves', 'Mirror Isle', 'Lava Lagoon'], wPrev = -1, cur = firstOpen();
    for (var i = 0; i < NL; i++) {
      var w = Sim.LEVELS[i].world || 0;
      if (w !== wPrev) { wPrev = w; h += '<h3 class="wh w' + (w + 1) + '">' + WORLDS[w] + '</h3>'; }
      var ok = unlocked(i), s = save.stars[i], stars = '';
      for (var k = 0; k < 3; k++) stars += k < s ? '&#9733;' : '<i>&#9733;</i>';
      h += '<button class="lv w' + (w + 1) + (i === cur ? ' cur' : '') + (ok ? '' : ' locked') + '" data-i="' + i + '"' + (ok ? '' : ' disabled') +
        ' aria-label="Level ' + (i + 1) + (ok ? ', ' + s + ' stars' : ', locked') + '"><b>' + (i + 1) + '</b><span>' + (ok ? stars : 'locked') + '</span></button>';
    }
    g.innerHTML = h;
  }
  function scrollGrid() { var g = $('grid'), c = g.querySelector('.cur'); g.scrollTop = c ? Math.max(0, c.offsetTop - g.clientHeight / 2 + c.offsetHeight / 2) : 0; }
  function buildSkins() {
    var g = $('skins'), ts = totalStars(); g.innerHTML = '';
    Art.SKINS.forEach(function (sk, i) {
      var ok = ts >= sk.need, b = document.createElement('button');
      b.className = 'skin' + (ok ? '' : ' locked') + (i === save.skin ? ' sel' : ''); b.setAttribute('data-i', i); if (!ok) b.disabled = true;
      var c = document.createElement('canvas'); c.width = c.height = 160;
      var x = c.getContext('2d'); Art.pal(x, 80, 96, 50, sk, ok ? 'happy' : 'idle', 0.35, 1);
      b.appendChild(c);
      var n = document.createElement('b'); n.textContent = sk.name; b.appendChild(n);
      var sm = document.createElement('small'); sm.innerHTML = ok ? (i === save.skin ? 'Selected' : 'Tap to pick') : '&#9733; ' + sk.need + ' to unlock'; b.appendChild(sm);
      g.appendChild(b);
    });
  }

  /* ---------- level flow ---------- */
  function start(i) {
    li = Math.max(0, Math.min(NL - 1, i)); st = Sim.load(li);
    for (var k = 0; k < 240; k++) Sim.step(st);
    st.events.length = 0; fx.length = 0; acc = 0; endT = -1; shown = false; hintPin = -1; shake = 0; lastGems = -1;
    go('play');
    $('hLevel').textContent = (li + 1) + '. ' + Sim.LEVELS[li].name;
    var tip = $('tip'); tip.textContent = Sim.LEVELS[li].tip; tip.hidden = false; tipT = 6;
    hud();
  }
  function hud() { if (st && st.collected !== lastGems) { lastGems = st.collected; $('hGems').textContent = 'Gems ' + st.collected + ' / ' + st.total; } }
  function pullPin(i) {
    if (mode !== 'play' || paused || !st || st.status !== 'play') return;
    if (Sim.pull(st, i)) { $('tip').hidden = true; if (hintPin === i) hintPin = -1; }
  }
  function hint() {
    if (mode !== 'play' || !st) return;
    if (st.status !== 'play') { start(li); }
    var sol = Sim.LEVELS[li].sol, o = st.order;
    for (var k = 0; k < o.length; k++) if (o[k] !== sol[k]) { toast('Off track - restart for a hint'); return; }
    if (o.length >= sol.length) { toast('Just wait and watch!'); return; }
    hintPin = sol[o.length]; hintT = 4; Snd.click();
  }
  var FAILS = {
    burn: ['Too hot!', 'Lava reached your Pal. Cool it with water or keep it away.'],
    bite: ['Chomp!', 'The Grump got your Pal. Deal with it first.'],
    toast: ['Burnt gems!', 'Too many gems melted. Keep lava away from the treasure.'],
    grump: ['Grump wins', 'The Grump is still lurking. Bonk it with rocks or lava.'],
    stuck: ['So close!', 'Not enough gems reached your Pal.']
  };
  function finish() {
    shown = true;
    if (st.status === 'win') {
      var s = Sim.stars(st), first = save.stars[li] === 0;
      if (s > save.stars[li]) save.stars[li] = s;
      save.gems += st.collected; save.streak++; if (save.streak > save.best) save.best = save.streak; store();
      $('wTitle').textContent = s === 3 ? 'Perfect!' : 'Rescued!';
      var info = st.collected + ' of ' + st.total + ' gems';
      if (save.streak > 1) info += '  -  Streak x' + save.streak;
      var ts = totalStars(), unl = '';
      Art.SKINS.forEach(function (sk) { if (first || s) { if (ts >= sk.need && ts - s < sk.need && sk.need > 0) unl = sk.name; } });
      if (unl) info += '\nNew Pal unlocked: ' + unl + '!';
      $('wInfo').textContent = info; $('wInfo').style.whiteSpace = 'pre-line';
      $('bNext').textContent = li + 1 < NL ? 'Next level' : 'All done!';
      var el = $('wStars').children;
      for (var k = 0; k < 3; k++) el[k].className = '';
      [0, 1, 2].forEach(function (k) { if (k < s) setTimeout(function () { if (!$('oWin').hidden) { el[k].className = 'on'; Snd.star(k); } }, 250 + k * 260); });
      show('oWin', true);
    } else {
      save.streak = 0; store();
      var f = FAILS[st.reason] || FAILS.stuck; $('fTitle').textContent = f[0]; $('fInfo').textContent = f[1];
      show('oFail', true);
    }
  }
  function share() {
    var s = save.stars[li], text = 'I rescued my Pal on level ' + (li + 1) + ' of Pinpull Pals with ' + ['', '⭐', '⭐⭐', '⭐⭐⭐'][s] +
      ' (' + totalStars() + ' stars total). Can you beat me?';
    var url = ''; try { url = String(window.location.href).split('#')[0]; } catch (e) { }
    function box() { $('shareText').value = text + (url ? '\n' + url : ''); show('oShare', true); try { $('shareText').select(); } catch (e) { } }
    function clip() {
      try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text + (url ? ' ' + url : '')).then(function () { toast('Copied! Paste it to a friend'); }, box); return; } } catch (e) { }
      box();
    }
    try {
      if (navigator.share) { navigator.share({ title: 'Pinpull Pals', text: text, url: url }).catch(function (e) { if (!e || e.name !== 'AbortError') clip(); }); return; }
    } catch (e) { }
    clip();
  }

  /* ---------- pause ---------- */
  function pause() {
    if (mode !== 'play' || paused || overlayOpen()) return;
    paused = true; show('oPause', true); soundLabels(); Snd.pause();
  }
  function resume() { if (!paused) return; paused = false; $('oPause').hidden = true; acc = 0; last = 0; Snd.resume(); }
  function focusLost() { if (mode === 'play' && !overlayOpen()) pause(); else Snd.pause(); }

  /* ---------- fx ---------- */
  function puff(x, y, n, col, sp, life, size, grav) {
    for (var i = 0; i < n && fx.length < 260; i++) {
      var a = Math.random() * TAU, v = sp * (0.4 + Math.random() * 0.6);
      fx.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: life * (0.6 + Math.random() * 0.4), m: life, c: typeof col === 'string' ? col : col[i % col.length], s: size * (0.6 + Math.random() * 0.8), g: grav || 0 });
    }
  }
  var CONF = ['#ff5d7a', '#ffd23f', '#4be3ac', '#5cc8ff', '#b388ff', '#ff9a3c'];
  function events() {
    var E = st.events;
    for (var i = 0; i < E.length; i++) {
      var e = E[i];
      if (e.k === 'pull') Snd.pull();
      else if (e.k === 'gem') { Snd.gem(e.n); puff(e.x, e.y - 8, 6, ['#fff', 'hsl(' + e.hue + ',95%,65%)'], 120, 0.5, 3.2, 150); }
      else if (e.k === 'steam') { Snd.sizzle(); puff(e.x, e.y, 2, 'rgba(255,255,255,.75)', 40, 0.7, 6, -120); }
      else if (e.k === 'burn') { Snd.sizzle(); puff(e.x, e.y, 5, ['#55505c', '#ff6a1a'], 60, 0.7, 4.5, -90); }
      else if (e.k === 'poof') { Snd.bonk(); shake = 7; puff(e.x, e.y, 22, ['#8e3df2', '#d3b1ff', '#fff'], 190, 0.7, 5, 200); }
      else if (e.k === 'win') { Snd.win(); endT = 0.85; puff(180, 250, 90, CONF, 420, 1.8, 5, 520); }
      else if (e.k === 'fail') { Snd.fail(); shake = 9; endT = 1.0; }
    }
    E.length = 0;
  }
  function updateFx(dt) {
    for (var i = fx.length - 1; i >= 0; i--) {
      var p = fx[i]; p.l -= dt; if (p.l <= 0) { fx[i] = fx[fx.length - 1]; fx.pop(); continue; }
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.985;
    }
    if (shake > 0) shake = Math.max(0, shake - dt * 22);
  }

  /* ---------- draw ---------- */
  function seg(x1, y1, x2, y2) { ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); }
  function drawWalls(th) {
    var S = st.segs, i, g; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = Art.INK; ctx.lineWidth = 13; ctx.beginPath(); for (i = 0; i < S.length; i++) { g = S[i]; if (g.pin < 0) seg(g.x1, g.y1, g.x2, g.y2); } ctx.stroke();
    ctx.strokeStyle = th.wallSh; ctx.lineWidth = 8; ctx.beginPath(); for (i = 0; i < S.length; i++) { g = S[i]; if (g.pin < 0) seg(g.x1, g.y1, g.x2, g.y2); } ctx.stroke();
    ctx.strokeStyle = th.wall; ctx.lineWidth = 5.5; ctx.beginPath(); for (i = 0; i < S.length; i++) { g = S[i]; if (g.pin < 0) seg(g.x1 - 0.8, g.y1 - 0.8, g.x2 - 0.8, g.y2 - 0.8); } ctx.stroke();
  }
  function drawPins(dt) {
    var P = st.pins;
    for (var i = 0; i < P.length; i++) {
      var p = P[i]; if (p.out) { p.t = Math.min(1, p.t + dt * 3.2); if (p.t >= 1) continue; }
      var dx = p.x2 - p.x1, dy = p.y2 - p.y1, len = Math.sqrt(dx * dx + dy * dy), e = p.t * p.t * 170, ox = dx / len * e, oy = dy / len * e;
      ctx.save(); ctx.globalAlpha = 1 - p.t; ctx.translate(ox, oy); ctx.lineCap = 'round';
      ctx.strokeStyle = Art.INK; ctx.lineWidth = 11; ctx.beginPath(); seg(p.x1, p.y1, p.x2, p.y2); ctx.stroke();
      ctx.strokeStyle = '#ffb300'; ctx.lineWidth = 6.5; ctx.beginPath(); seg(p.x1, p.y1, p.x2, p.y2); ctx.stroke();
      ctx.strokeStyle = '#fff0a8'; ctx.lineWidth = 2; ctx.beginPath(); seg(p.x1 - 1.2, p.y1 - 1.2, p.x2 - 1.2, p.y2 - 1.2); ctx.stroke();
      var hr = 12.5 + (hintPin === i ? Math.sin(T * 9) * 2 : 0);
      if (hintPin === i) { ctx.strokeStyle = 'rgba(255,255,255,' + (0.55 + Math.sin(T * 9) * 0.35) + ')'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(p.x2, p.y2, 22 + Math.sin(T * 9) * 3, 0, TAU); ctx.stroke(); }
      ctx.fillStyle = '#ff3d6e'; ctx.strokeStyle = Art.INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x2, p.y2, hr, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(p.x2 - 4, p.y2 - 5, 4.5, 2.6, -0.6, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '900 12px ui-rounded, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(i + 1), p.x2, p.y2 + 1);
      ctx.restore();
    }
  }
  function palMood() {
    if (st.status === 'win') return 'happy';
    if (st.status === 'fail') return st.reason === 'burn' ? 'burnt' : 'sad';
    var B = st.balls, pal = st.pal;
    for (var i = 0; i < B.length; i++) {
      var a = B[i]; if (!a.alive) continue;
      if (a.type === 'mon' && a.tx) return 'scared';
      if (a.type === 'lava') { var dx = a.x - pal.x, dy = a.y - pal.y; if (dx * dx + dy * dy < 4200) return 'scared'; }
    }
    return 'idle';
  }
  function drawPlay(dt) {
    var th = Art.THEMES[Sim.LEVELS[li].world || 0], B = st.balls, i, a;
    Art.bg(ctx, 360, 640, th, T);
    ctx.save();
    if (shake > 0) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    Art.fluid(ctx, B, 'water', T); Art.fluid(ctx, B, 'lava', T);
    for (i = 0; i < B.length; i++) {
      a = B[i]; if (!a.alive) continue;
      if (a.type === 'rock') Art.rock(ctx, a.x, a.y, a.r);
      else if (a.type === 'coal') Art.coal(ctx, a.x, a.y, a.r);
      else if (a.type === 'gem') Art.gem(ctx, a.x, a.y, a.r + 1, a.hue, T);
    }
    drawWalls(th); drawPins(dt);
    for (i = 0; i < B.length; i++) { a = B[i]; if (a.alive && a.type === 'mon') Art.mon(ctx, a.x, a.y, a.r, T, a.face, !!a.tx); }
    if (st.pal.alive) Art.pal(ctx, st.pal.x, st.pal.y, st.pal.r, Art.SKINS[save.skin], palMood(), T, st.pal.face);
    drawFx();
    ctx.restore();
  }
  function drawFx() {
    for (var i = 0; i < fx.length; i++) { var p = fx[i]; ctx.globalAlpha = Math.min(1, p.l / p.m * 1.6); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  function drawMenu() {
    Art.bg(ctx, 360, 640, Art.THEMES[0], T);
    if (mode !== 'title') return;
    var cx = 180, cy = 292;
    for (var i = 0; i < 9; i++) { var a = T * 0.7 + i / 9 * TAU; Art.gem(ctx, cx + Math.cos(a) * 112, cy + Math.sin(a) * 46 - 6, 11, i * 40, T); }
    ctx.fillStyle = 'rgba(30,10,80,.28)'; ctx.beginPath(); ctx.ellipse(cx, cy + 60, 58, 11, 0, 0, TAU); ctx.fill();
    Art.pal(ctx, cx, cy, 56, Art.SKINS[save.skin], 'happy', T * 0.55, 1);
  }

  /* ---------- loop ---------- */
  function frame(ts) {
    window.requestAnimationFrame(frame);
    var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts;
    if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').hidden = true; }
    if (mode === 'play' && paused) dt = 0;
    T += dt;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    if (mode === 'play' && st) {
      if (!paused) {
        acc += dt; var n = 0;
        while (acc >= Sim.DT && n < 8) { Sim.step(st); acc -= Sim.DT; n++; }
        if (n === 8) acc = 0;
        events(); updateFx(dt); hud();
        if (tipT > 0) { tipT -= dt; if (tipT <= 0) $('tip').hidden = true; }
        if (hintT > 0) { hintT -= dt; if (hintT <= 0) hintPin = -1; }
        if (endT > 0 && !shown) { endT -= dt; if (endT <= 0) finish(); }
      }
      drawPlay(dt);
    } else drawMenu();
  }

  /* ---------- input ---------- */
  function pinAt(x, y) {
    var best = -1, bd = 30;
    for (var i = 0; i < st.pins.length; i++) {
      var p = st.pins[i]; if (p.out) continue;
      var ex = p.x2 - p.x1, ey = p.y2 - p.y1, t = ((x - p.x1) * ex + (y - p.y1) * ey) / (ex * ex + ey * ey); t = t < 0 ? 0 : t > 1 ? 1 : t;
      var dx = x - (p.x1 + ex * t), dy = y - (p.y1 + ey * t), d = Math.sqrt(dx * dx + dy * dy) + 8;
      var hx = x - p.x2, hy = y - p.y2, dh = Math.sqrt(hx * hx + hy * hy);
      d = Math.min(d, dh);
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }
  cv.addEventListener('pointerdown', function (e) {
    if (mode !== 'play' || paused || !st) return;
    var r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 360, y = (e.clientY - r.top) / r.height * 640;
    var i = pinAt(x, y); if (i >= 0) pullPin(i);
    e.preventDefault();
  });
  function on(id, fn) { $(id).addEventListener('click', function () { Snd.unlock(); Snd.click(); fn(); }); }
  function firstOpen() { for (var i = 0; i < NL; i++) if (!save.stars[i]) return unlocked(i) ? i : Math.max(0, i - 1); return NL - 1; }
  function toggleSound() { save.mute = !save.mute; Snd.setMuted(save.mute); store(); soundLabels(); }
  on('bPlay', function () { start(firstOpen()); });
  on('bLevels', function () { go('levels'); });
  on('bSkins', function () { go('skins'); });
  on('bSound', toggleSound); on('bPSound', toggleSound);
  on('bLevelsBack', function () { go('title'); });
  on('bSkinsBack', function () { go('title'); });
  on('bReset', function () { show('oConfirm', true); });
  on('bResetNo', function () { $('oConfirm').hidden = true; });
  on('bResetYes', function () { var m = save.mute; save = fresh(); save.mute = m; store(); go('title'); toast('Progress erased'); });
  on('bPause', pause); on('bResume', resume);
  on('bRetry', function () { start(li); });
  on('bHint', hint);
  on('bNext', function () { if (li + 1 < NL) start(li + 1); else go('levels'); });
  on('bReplay', function () { start(li); });
  on('bShare', share);
  on('bShareClose', function () { $('oShare').hidden = true; });
  on('bFailRetry', function () { start(li); });
  on('bFailHint', function () { start(li); hint(); });
  on('bFailLevels', function () { go('levels'); });
  on('bPRestart', function () { Snd.resume(); start(li); });
  on('bPLevels', function () { Snd.resume(); go('levels'); });
  on('bPHome', function () { Snd.resume(); go('title'); });
  $('grid').addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.lv') : null; if (!b || b.disabled) return;
    Snd.unlock(); Snd.click(); start(+b.getAttribute('data-i'));
  });
  $('skins').addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.skin') : null; if (!b || b.disabled) return;
    Snd.unlock(); Snd.click(); save.skin = +b.getAttribute('data-i'); store(); buildSkins();
  });
  document.addEventListener('pointerdown', function () { if (!paused) Snd.unlock(); }, true);
  document.addEventListener('keydown', function (e) {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!paused) Snd.unlock();
    var k = e.key, ov = overlayOpen();
    if (k === 'm' || k === 'M') { toggleSound(); return; }
    if (k === 'Escape' || k === 'p' || k === 'P') {
      if (ov === 'oPause') resume(); else if (ov === 'oConfirm' || ov === 'oShare') $(ov).hidden = true; else if (mode === 'play') pause(); else if (mode !== 'title') go('title');
      e.preventDefault(); return;
    }
    if (ov) return; // Enter/Space activate the focused button natively
    if (mode === 'play') {
      if (k >= '1' && k <= '9') { pullPin(+k - 1); e.preventDefault(); }
      else if (k === 'r' || k === 'R') start(li);
      else if (k === 'h' || k === 'H') hint();
    }
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden) focusLost(); });
  window.addEventListener('blur', focusLost);
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', function () { setTimeout(resize, 60); });
  cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  /* ---------- boot ---------- */
  loadSave(); Snd.setMuted(save.mute); resize(); go('title');
  window.requestAnimationFrame(frame);
  // small read-only handle used by automated tests
  window.PinpullPals = {
    info: function () { return { mode: mode, paused: paused, level: li, status: st ? st.status : '', reason: st ? st.reason : '', collected: st ? st.collected : 0, total: st ? st.total : 0, time: st ? st.time : 0, audio: Snd.state(), muted: Snd.isMuted(), overlay: overlayOpen(), stars: save.stars.slice() }; },
    pins: function () { var r = cv.getBoundingClientRect(); return st ? st.pins.map(function (p) { return { out: p.out, x: r.left + p.x2 / 360 * r.width, y: r.top + p.y2 / 640 * r.height }; }) : []; }
  };
})();
