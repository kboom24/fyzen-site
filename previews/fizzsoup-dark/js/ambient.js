/* FizzSoup ambient gutter motion. One rAF loop, no per-frame layout, no network. */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'ambient-layer';
  canvas.setAttribute('aria-hidden', 'true');

  var ctx, dpr = 1, w = 0, h = 0, dirty = true, running = false, last = 0, raf = 0;
  var paths = [];
  var sprites = [];
  var color = '#0B0D12';

  function themeColor() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    color = dark ? 'rgba(255,213,0,0.72)' : 'rgba(11,13,18,0.62)';
  }

  function sizeCanvas() {
    var nextDpr = Math.min(window.devicePixelRatio || 1, 2);
    var cw = window.innerWidth, ch = window.innerHeight;
    if (cw === w && ch === h && nextDpr === dpr) return;
    dpr = nextDpr; w = cw; h = ch;
    canvas.width = Math.max(1, Math.round(cw * dpr));
    canvas.height = Math.max(1, Math.round(ch * dpr));
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';
    ctx = canvas.getContext('2d', { alpha: true });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function addPath(pts, kind, minW) {
    if (!pts || pts.length < 2) return;
    var len = 0, segs = [];
    for (var i = 1; i < pts.length; i++) {
      var dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1];
      var l = Math.hypot(dx, dy);
      if (l < 1) continue;
      segs.push({ x: pts[i - 1][0], y: pts[i - 1][1], dx: dx, dy: dy, l: l });
      len += l;
    }
    if (len < (minW || 40)) return;
    paths.push({ pts: pts, segs: segs, len: len, kind: kind || 'edge' });
  }

  function along(path, dist) {
    var d = ((dist % path.len) + path.len) % path.len;
    for (var i = 0; i < path.segs.length; i++) {
      var s = path.segs[i];
      if (d <= s.l) {
        var t = d / s.l;
        return { x: s.x + s.dx * t, y: s.y + s.dy * t, a: Math.atan2(s.dy, s.dx) };
      }
      d -= s.l;
    }
    var lastS = path.segs[path.segs.length - 1];
    return { x: lastS.x + lastS.dx, y: lastS.y + lastS.dy, a: Math.atan2(lastS.dy, lastS.dx) };
  }

  function rectPath(x, y, width, height, axis) {
    if (axis === 'h') return [[x, y + height / 2], [x + width, y + height / 2]];
    return [[x + width / 2, y], [x + width / 2, y + height]];
  }

  function measure() {
    sizeCanvas();
    themeColor();
    paths = [];
    var header = document.querySelector('.topbar');
    var sidebar = document.querySelector('.sidebar');
    var main = document.querySelector('.main');
    var nav = document.querySelector('.bottom-nav');
    var navH = 0;
    if (nav) {
      var ns = window.getComputedStyle(nav);
      if (ns.display !== 'none') navH = nav.getBoundingClientRect().height;
    }

    if (header) {
      var hr = header.getBoundingClientRect();
      if (hr.width > 40 && hr.height > 20) {
        addPath([[hr.left + 8, hr.bottom - 3], [hr.right - 8, hr.bottom - 3]], 'header', 80);
      }
    }

    if (sidebar) {
      var ss = window.getComputedStyle(sidebar);
      var sr = sidebar.getBoundingClientRect();
      var rail = ss.display !== 'none' && sr.width > 0 && sr.height > 80 && sr.left < window.innerWidth;
      // Desktop/tablet rail only (not the off-canvas hidden sidebar).
      if (rail && sr.width <= 230 && sr.top < window.innerHeight && sr.bottom > 0) {
        addPath([[sr.right - 3, Math.max(sr.top, 0) + 8], [sr.right - 3, Math.min(sr.bottom, window.innerHeight - navH) - 8]], 'sidebar', 80);
      }
    }

    if (main) {
      var blocks = [];
      main.querySelectorAll('.hero-row, .hero, .new-card, .tiles, .sec, .row, .grid, .game').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.width < 40 || r.height < 20) return;
        if (r.bottom < -20 || r.top > window.innerHeight + 20) return;
        blocks.push({left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height});
      });
      blocks = blocks.filter(function (r, i) {
        return !blocks.some(function (o, j) {
          return j !== i && r.left >= o.left - 1 && r.right <= o.right + 1 && r.top >= o.top - 1 && r.bottom <= o.bottom + 1;
        });
      });
      blocks.sort(function (a, b) { return a.top - b.top || a.left - b.left; });
      for (var i = 0; i < blocks.length - 1; i++) {
        var a = blocks[i], b = blocks[i + 1];
        var gapTop = a.bottom, gapBot = b.top, gh = gapBot - gapTop;
        var left = Math.max(a.left, b.left);
        var right = Math.min(a.right, b.right);
        var gw = right - left;
        if (gh >= 12 && gh <= 48 && gw >= 80) {
          var y = gapTop + gh / 2;
          var inset = 16;
          addPath([[left + inset, y], [right - inset, y]], gh >= 18 ? 'lane' : 'edge', 80);
        }
      }
    }

    // Keep existing sprites attached to a still-valid kind of path; rebuild if needed.
    if (!sprites.length) spawn();
    else rebind();
  }

  function pathsOf(kind) {
    return paths.filter(function (p) { return p.kind === kind; });
  }

  function pick(kind, fallback) {
    var list = pathsOf(kind);
    if (!list.length && fallback) list = pathsOf(fallback);
    if (!list.length) list = paths;
    return list.length ? list[Math.floor(Math.random() * list.length)] : null;
  }

  function spawn() {
    sprites = [];
    function add(type, kind, speed, size) {
      var path = pick(kind, 'edge');
      if (!path) return;
      sprites.push({
        type: type, path: path, kind: kind,
        d: Math.random() * path.len,
        speed: speed * (Math.random() < 0.5 ? 1 : -1) * (0.85 + Math.random() * 0.3),
        phase: Math.random() * Math.PI * 2,
        size: size,
        hop: 0, hopV: 0
      });
    }
    add('ant', 'header', 22, 5);
    add('ant', 'sidebar', 18, 5);
    add('ant', 'edge', 20, 5);
    add('ant', 'lane', 24, 5);
    add('car', 'lane', 42, 9);
    add('bug', 'lane', 16, 6);
    add('dot', 'edge', 0, 3.2);
  }

  function rebind() {
    sprites.forEach(function (s) {
      var list = pathsOf(s.kind);
      if (!list.length) list = paths;
      if (!list.length) { s.path = null; return; }
      // Prefer a path of similar length
      var best = list[0], bd = Math.abs(list[0].len - (s.path && s.path.len || 0));
      for (var i = 1; i < list.length; i++) {
        var dd = Math.abs(list[i].len - (s.path && s.path.len || 0));
        if (dd < bd) { best = list[i]; bd = dd; }
      }
      var t = s.path && s.path.len ? (s.d / s.path.len) : Math.random();
      s.path = best;
      s.d = t * best.len;
    });
  }

  function update(dt) {
    var t = dt / 1000;
    for (var i = 0; i < sprites.length; i++) {
      var s = sprites[i];
      if (!s.path) continue;
      if (s.type !== 'dot') s.d += s.speed * t;
      s.phase += t * (s.type === 'ant' ? 14 : s.type === 'bug' ? 8 : 6);
      if (s.type === 'bug') {
        s.hopV -= 90 * t;
        s.hop += s.hopV * t;
        if (s.hop < 0) {
          s.hop = 0;
          if (Math.random() < 0.015) s.hopV = 36 + Math.random() * 16;
        }
      }
      if (s.type === 'dot') {
        s.phase += t * 2.2;
      }
    }
  }

  function strokeSet() {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.35;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  function drawAnt(x, y, a, phase, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    var i, lx, ly, swing;
    for (i = 0; i < 3; i++) {
      swing = Math.sin(phase + i * 1.1) * 0.55;
      lx = -size * 0.55 + i * size * 0.55;
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx - size * 0.15, size * 0.85 + swing);
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx + size * 0.15, -size * 0.85 - swing);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 1.05, size * 0.48, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size * 1.15, 0, size * 0.38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 1.3, -size * 0.1);
    ctx.quadraticCurveTo(size * 1.8, -size * 0.9, size * 1.9, -size * 0.55);
    ctx.moveTo(size * 1.3, size * 0.1);
    ctx.quadraticCurveTo(size * 1.8, size * 0.9, size * 1.9, size * 0.55);
    ctx.stroke();
    ctx.restore();
  }

  function drawCar(x, y, a, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    // body
    ctx.beginPath();
    ctx.roundRect(-size * 1.6, -size * 0.45, size * 3.0, size * 0.9, size * 0.25);
    ctx.stroke();
    // cabin
    ctx.beginPath();
    ctx.roundRect(-size * 0.15, -size * 1.05, size * 1.35, size * 0.65, size * 0.15);
    ctx.stroke();
    // wheels
    ctx.beginPath();
    ctx.arc(-size * 0.85, size * 0.5, size * 0.38, 0, Math.PI * 2);
    ctx.moveTo(size * 1.15 + size * 0.38, size * 0.5);
    ctx.arc(size * 1.15, size * 0.5, size * 0.38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawBug(x, y, a, phase, size, hop) {
    ctx.save();
    ctx.translate(x, y - hop);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.95, size * 0.7, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size * 1.05, 0, size * 0.38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 1.2, -size * 0.15);
    ctx.quadraticCurveTo(size * 1.7, -size * 1.1, size * 1.5, -size * 1.2);
    ctx.moveTo(size * 1.2, size * 0.15);
    ctx.quadraticCurveTo(size * 1.7, size * 1.1, size * 1.5, size * 1.2);
    ctx.stroke();
    var swing = Math.sin(phase) * 0.3;
    for (var i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-size * 0.2, 0);
      ctx.lineTo(-size * 0.1 + i * 0.3, size * 0.9 + swing);
      ctx.moveTo(-size * 0.2, 0);
      ctx.lineTo(-size * 0.1 + i * 0.3, -size * 0.9 - swing);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawDot(x, y, phase, size) {
    var b = Math.abs(Math.sin(phase));
    var yy = y - b * 7;
    var squash = 1 - b * 0.18;
    ctx.save();
    ctx.translate(x, yy);
    ctx.scale(1 + (1 - squash) * 0.35, squash);
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    strokeSet();
    for (var i = 0; i < sprites.length; i++) {
      var s = sprites[i];
      if (!s.path) continue;
      var p = along(s.path, s.d);
      if (p.x < -20 || p.y < -20 || p.x > w + 20 || p.y > h + 20) continue;
      if (s.speed < 0 && s.type !== 'dot') p.a += Math.PI;
      if (s.type === 'ant') drawAnt(p.x, p.y, p.a, s.phase, s.size);
      else if (s.type === 'car') drawCar(p.x, p.y, p.a, s.size);
      else if (s.type === 'bug') drawBug(p.x, p.y, p.a, s.phase, s.size, s.hop);
      else if (s.type === 'dot') drawDot(p.x, p.y, s.phase, s.size);
    }
  }

  function loop(ts) {
    if (document.hidden) { running = false; raf = 0; return; }
    raf = requestAnimationFrame(loop);
    if (dirty) { measure(); dirty = false; }
    var dt = last ? Math.min(32, ts - last) : 16;
    last = ts;
    update(dt);
    draw();
  }

  function start() {
    if (running) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(loop);
  }

  function markDirty() { dirty = true; }

  function boot() {
    document.body.appendChild(canvas);
    sizeCanvas();
    themeColor();
    dirty = true;
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) start();
    });
    window.addEventListener('resize', markDirty, { passive: true });
    window.addEventListener('scroll', markDirty, { passive: true, capture: true });
    if (window.MutationObserver) {
      new MutationObserver(markDirty).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
      new MutationObserver(markDirty).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
    start();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
