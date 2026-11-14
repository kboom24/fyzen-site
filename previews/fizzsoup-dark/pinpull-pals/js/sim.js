/* Pinpull Pals - physics + rules (no DOM; also runs in Node for the level solver) */
(function (root) {
  'use strict';
  var OY = 95, G = 1100, DT = 1 / 120, HT = 4, MAXV = 560;
  var R = { gem: 7.5, lava: 6, water: 6, rock: 10, pal: 19, mon: 18 };
  var M = { gem: 1, lava: 1, water: 1, rock: 2.5, pal: 5, mon: 5 };

  function build(def, mirror) {
    var s = {
      segs: [], pins: [], balls: [], pal: null, total: 0, collected: 0, burnt: 0, need: 0,
      status: 'play', reason: '', quiet: 0, since: 0, pulled: 0, time: 0, events: [], order: [], tick: 0
    };
    function mx(x) { return mirror ? 360 - x : x; }
    function add(type, x, y) {
      var o = { type: type, x: x, y: y, vx: 0, vy: 0, r: R[type], m: M[type], alive: true, mag: false, g: false, tx: 0, hue: 0, face: 1, id: s.balls.length };
      if (type === 'gem') { s.total++; o.hue = (s.balls.length * 47) % 360; }
      s.balls.push(o); return o;
    }
    var b = {
      wall: function (x1, y1, x2, y2) { s.segs.push({ x1: mx(x1), y1: y1 + OY, x2: mx(x2), y2: y2 + OY, pin: -1, on: true }); },
      pin: function (x1, y1, x2, y2) {
        var i = s.pins.length, p = { x1: mx(x1), y1: y1 + OY, x2: mx(x2), y2: y2 + OY, out: false, t: 0, i: i };
        s.pins.push(p); s.segs.push({ x1: p.x1, y1: p.y1, x2: p.x2, y2: p.y2, pin: i, on: true });
      },
      fill: function (type, x, y, w, h) {
        var r = R[type], sp = 2 * r + 0.5, cols = Math.floor(w / sp), rows = Math.floor(h / sp);
        var ox = x + (w - cols * sp) / 2 + sp / 2;
        for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
          var bx = ox + i * sp + ((i * 7 + j * 13) % 5 - 2) * 0.12, by = y + h - r - j * sp;
          add(type, mirror ? 360 - bx : bx, by + OY);
        }
      },
      pal: function (x, y) { s.pal = add('pal', mx(x), y + OY); },
      mon: function (x, y) { add('mon', mx(x), y + OY); }
    };
    def(b);
    s.need = Math.ceil(s.total * 0.6);
    return s;
  }

  function inter(ax, ay, bx, by, s) {
    var d1x = bx - ax, d1y = by - ay, d2x = s.x2 - s.x1, d2y = s.y2 - s.y1;
    var den = d1x * d2y - d1y * d2x; if (den > -1e-9 && den < 1e-9) return false;
    var t = ((s.x1 - ax) * d2y - (s.y1 - ay) * d2x) / den, u = ((s.x1 - ax) * d1y - (s.y1 - ay) * d1x) / den;
    return t > 0 && t < 1 && u > 0 && u < 1;
  }
  function los(s, ax, ay, bx, by) {
    for (var i = 0; i < s.segs.length; i++) { var g = s.segs[i]; if (g.on && inter(ax, ay, bx, by, g)) return false; }
    return true;
  }
  function fail(s, why) { if (s.status === 'play') { s.status = 'fail'; s.reason = why; s.events.push({ k: 'fail', why: why }); } }

  function think(s) {
    var B = s.balls, pal = s.pal, i, a, best = 1e9, bdx = 0;
    if (s.status !== 'play') { for (i = 0; i < B.length; i++) B[i].tx = 0; return; }
    for (i = 0; i < B.length; i++) {
      a = B[i]; if (!a.alive) continue;
      if (a.type === 'gem' && !a.mag) {
        var dx = a.x - pal.x, dy = a.y - pal.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 240 && los(s, a.x, a.y, pal.x, pal.y)) {
          if (d < 118) { a.mag = true; }
          else if (dy > -55 && dy < 55 && d < best) { best = d; bdx = dx; }
        }
      } else if (a.type === 'mon') {
        var mdx = pal.x - a.x, mdy = pal.y - a.y;
        if (mdy > -60 && mdy < 60 && los(s, a.x, a.y, pal.x, pal.y)) { a.tx = mdx > 0 ? 62 : -62; a.face = mdx > 0 ? 1 : -1; }
        else a.tx = 0;
      }
    }
    pal.tx = best < 1e9 ? (bdx > 0 ? 75 : -75) : 0;
    if (pal.tx) pal.face = pal.tx > 0 ? 1 : -1;
  }

  /* returns true when the pair should not collide physically this step */
  function react(s, a, b) {
    var ta = a.type, tb = b.type, t;
    if (ta > tb) { t = a; a = b; b = t; ta = a.type; tb = b.type; }
    if (ta === 'lava') {
      if (tb === 'water') { a.alive = b.alive = false; s.events.push({ k: 'steam', x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }); return true; }
      if (tb === 'mon') { b.alive = false; s.events.push({ k: 'poof', x: b.x, y: b.y }); return true; }
      if (tb === 'pal') { if (s.status === 'play') s.events.push({ k: 'burn', x: b.x, y: b.y }); fail(s, 'burn'); return false; }
    } else if (ta === 'gem' && tb === 'lava') {
      a.type = 'coal'; s.burnt++; s.events.push({ k: 'burn', x: a.x, y: a.y }); return false;
    } else if (ta === 'mon') {
      if (tb === 'pal') { fail(s, 'bite'); return false; }
      if (tb === 'rock') {
        var rvx = a.vx - b.vx, rvy = a.vy - b.vy;
        if (rvx * rvx + rvy * rvy > 3600) { a.alive = false; s.events.push({ k: 'poof', x: a.x, y: a.y, bonk: 1 }); return true; }
      }
    }
    return false;
  }

  function step(s) {
    var B = s.balls, n = B.length, pal = s.pal, i, j, a, b, dx, dy, d, d2, nx, ny;
    s.tick++; s.time += DT; s.since += DT;
    if (s.tick % 6 === 1) think(s);
    for (i = 0; i < n; i++) {
      a = B[i]; if (!a.alive) continue;
      if (a.mag) {
        dx = pal.x - a.x; dy = pal.y - a.y; d = Math.sqrt(dx * dx + dy * dy);
        if (d < pal.r) { a.alive = false; s.collected++; s.events.push({ k: 'gem', x: pal.x, y: pal.y, n: s.collected, hue: a.hue }); }
        else { a.x += dx / d * 520 * DT; a.y += dy / d * 520 * DT; }
        continue;
      }
      a.vy += G * DT;
      if (a.tx && a.g) a.vx += (a.tx - a.vx) * 0.15;
      a.vx *= 0.9992;
      d2 = a.vx * a.vx + a.vy * a.vy;
      if (d2 > MAXV * MAXV) { d = MAXV / Math.sqrt(d2); a.vx *= d; a.vy *= d; }
      a.x += a.vx * DT; a.y += a.vy * DT; a.g = false;
      if (a.y > 760) { a.alive = false; if (a === pal) fail(s, 'stuck'); }
    }
    for (i = 0; i < n; i++) {
      a = B[i]; if (!a.alive || a.mag) continue;
      for (j = i + 1; j < n; j++) {
        b = B[j]; if (!b.alive || b.mag) continue;
        var rr = a.r + b.r;
        dx = b.x - a.x; if (dx > rr || dx < -rr) continue;
        dy = b.y - a.y; if (dy > rr || dy < -rr) continue;
        d2 = dx * dx + dy * dy; if (d2 >= rr * rr) continue;
        if (react(s, a, b)) { if (!a.alive) break; continue; }
        d = Math.sqrt(d2) || 0.01; nx = dx / d; ny = dy / d;
        var pen = rr - d; if (pen > 3) pen = 3;
        var ia = 1 / a.m, ib = 1 / b.m, tt = ia + ib;
        a.x -= nx * pen * ia / tt; a.y -= ny * pen * ia / tt;
        b.x += nx * pen * ib / tt; b.y += ny * pen * ib / tt;
        var rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (rv < 0) { var im = -1.05 * rv / tt; a.vx -= im * ia * nx; a.vy -= im * ia * ny; b.vx += im * ib * nx; b.vy += im * ib * ny; }
        if (ny > 0.5) a.g = true; else if (ny < -0.5) b.g = true;
      }
    }
    var S = s.segs, ns = S.length, g;
    for (i = 0; i < n; i++) {
      a = B[i]; if (!a.alive || a.mag) continue;
      var lim = a.r + HT, fr = (a.type === 'lava' || a.type === 'water') ? 0.004 : 0.012;
      for (j = 0; j < ns; j++) {
        g = S[j]; if (!g.on) continue;
        var ex = g.x2 - g.x1, ey = g.y2 - g.y1;
        var t = ((a.x - g.x1) * ex + (a.y - g.y1) * ey) / (ex * ex + ey * ey);
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        dx = a.x - (g.x1 + ex * t); dy = a.y - (g.y1 + ey * t);
        d2 = dx * dx + dy * dy; if (d2 >= lim * lim) continue;
        d = Math.sqrt(d2) || 0.01; nx = dx / d; ny = dy / d;
        a.x += nx * (lim - d); a.y += ny * (lim - d);
        var vn = a.vx * nx + a.vy * ny;
        if (vn < 0) { a.vx -= 1.1 * vn * nx; a.vy -= 1.1 * vn * ny; a.vx *= 1 - fr; a.vy *= 1 - fr; }
        if (ny < -0.5) a.g = true;
      }
    }
    judge(s);
  }

  function judge(s) {
    if (s.status !== 'play') return;
    var B = s.balls, live = 0, mons = 0, mv = 0, i, a;
    for (i = 0; i < B.length; i++) {
      a = B[i]; if (!a.alive) continue;
      if (a.type === 'gem') live++; else if (a.type === 'mon') mons++;
      if (a.mag || a.vx * a.vx + a.vy * a.vy > 900) mv++;
    }
    if (s.total - s.burnt < s.need) return fail(s, 'toast');
    if (live === 0 && mons === 0 && s.collected >= s.need) { s.status = 'win'; s.events.push({ k: 'win' }); return; }
    s.quiet = mv > 2 ? 0 : s.quiet + DT;
    if (s.pulled > 0 && (s.quiet > 1.0 || s.since > 8)) {
      for (i = 0; i < s.pins.length; i++) if (!s.pins[i].out) return;
      if (s.collected >= s.need && mons === 0) { s.status = 'win'; s.events.push({ k: 'win' }); }
      else fail(s, mons ? 'grump' : 'stuck');
    }
  }

  function pull(s, i) {
    var p = s.pins[i]; if (!p || p.out || s.status !== 'play') return false;
    p.out = true; s.pulled++; s.since = 0; s.quiet = 0; s.order.push(i);
    for (var j = 0; j < s.segs.length; j++) if (s.segs[j].pin === i) s.segs[j].on = false;
    s.events.push({ k: 'pull', i: i });
    return true;
  }
  function stars(s) { var f = s.collected / s.total; return f >= 1 ? 3 : f >= 0.85 ? 2 : 1; }

  /* ---------------- levels ---------------- */
  function shaft(b, x1, x2, y1, y2) { b.wall(x1, y1, x1, y2); b.wall(x2, y1, x2, y2); b.wall(x1, y2, x2, y2); b.wall(x1, y1, x2, y1); }
  function twin(b, top) { // two shafts over one wide room
    b.wall(40, top, 40, 480); b.wall(320, top, 320, 480); b.wall(40, 480, 320, 480);
    b.wall(150, top, 150, 300); b.wall(210, top, 210, 300); b.wall(150, 300, 210, 300);
    b.wall(40, top, 150, top); b.wall(210, top, 320, top);
  }
  function divert(b) { // shaft over a room with a side pit
    b.wall(130, 50, 230, 50); b.wall(130, 50, 130, 215); b.wall(230, 50, 230, 215);
    b.wall(60, 215, 130, 215); b.wall(230, 215, 300, 215);
    b.wall(60, 215, 60, 490); b.wall(300, 215, 300, 490); b.wall(60, 490, 300, 490);
    b.wall(130, 350, 130, 490);
  }
  var LEVELS = [
    { name: 'First Pull', tip: 'Tap a pin to pull it!', sol: [0], def: function (b) {
      shaft(b, 120, 240, 80, 470); b.pin(112, 230, 275, 230);
      b.fill('gem', 126, 170, 108, 55); b.pal(180, 447); } },
    { name: 'Hot Stuff', tip: 'Lava burns. Leave that pin alone!', sol: [0], def: function (b) {
      shaft(b, 120, 240, 60, 470); b.pin(112, 310, 275, 310); b.pin(248, 190, 85, 190);
      b.fill('gem', 126, 255, 108, 50); b.fill('lava', 126, 135, 108, 50); b.pal(180, 447); } },
    { name: 'Cool Down', tip: 'Water puts out lava.', sol: [1, 0, 2], def: function (b) {
      shaft(b, 120, 240, 30, 500); b.pin(112, 120, 275, 120); b.pin(248, 235, 85, 235); b.pin(112, 355, 275, 355);
      b.fill('gem', 126, 70, 108, 45); b.fill('water', 126, 150, 108, 80); b.fill('lava', 126, 305, 108, 45); b.pal(180, 477); } },
    { name: 'Grump Alert', tip: 'Bonk the Grump with rocks first.', sol: [1, 0], def: function (b) {
      twin(b, 100); b.pin(156, 300, 12, 300); b.pin(204, 300, 348, 300);
      b.pal(95, 277); b.fill('rock', 216, 220, 98, 75); b.mon(265, 458); b.fill('gem', 48, 440, 95, 36); } },
    { name: 'Keep Out', tip: 'Not every pin should be pulled.', sol: [1, 0], def: function (b) {
      twin(b, 100); b.pin(156, 300, 12, 300); b.pin(204, 300, 348, 300); b.pin(180, 484, 180, 262);
      b.pal(95, 457); b.mon(265, 458); b.fill('lava', 216, 240, 98, 55); b.fill('gem', 48, 250, 95, 45); } },
    { name: 'Rock n Roll', tip: 'Things slide down ramps.', sol: [0, 1, 2], def: function (b) {
      b.wall(130, 60, 230, 60); b.wall(130, 60, 130, 150); b.wall(130, 305, 130, 490);
      b.wall(230, 60, 230, 110); b.wall(230, 215, 230, 490); b.wall(130, 490, 230, 490);
      b.wall(340, 160, 230, 215); b.wall(340, 60, 340, 160); b.wall(230, 60, 340, 60);
      b.wall(20, 250, 130, 305); b.wall(20, 150, 20, 250); b.wall(20, 150, 130, 150);
      b.pin(116, 318, 116, 128); b.pin(122, 390, 265, 390); b.pin(244, 228, 244, 38);
      b.fill('rock', 28, 160, 84, 80); b.pal(292, 158); b.mon(205, 468); b.fill('gem', 136, 425, 45, 60); } },
    { name: 'Side Stream', tip: 'Bring the water to the lava.', sol: [2, 0, 1], def: function (b) {
      b.wall(130, 40, 230, 40); b.wall(130, 500, 230, 500);
      b.wall(130, 40, 130, 145); b.wall(130, 260, 130, 500); b.wall(230, 40, 230, 335); b.wall(230, 450, 230, 500);
      b.wall(20, 215, 130, 260); b.wall(20, 145, 20, 215); b.wall(20, 145, 130, 145);
      b.wall(340, 400, 230, 450); b.wall(340, 335, 340, 400); b.wall(230, 335, 340, 335);
      b.pin(122, 130, 265, 130); b.pin(238, 320, 95, 320); b.pin(116, 272, 116, 120); b.pin(244, 462, 244, 312);
      b.fill('gem', 136, 80, 88, 45); b.fill('lava', 136, 285, 88, 30); b.fill('water', 28, 155, 84, 50);
      b.fill('lava', 250, 350, 84, 42); b.pal(180, 477); } },
    { name: 'Detour', tip: 'Send the lava somewhere else.', sol: [1, 2, 0], def: function (b) {
      divert(b); b.pin(122, 110, 265, 110); b.pin(238, 195, 95, 195); b.pin(120, 345, 330, 240);
      b.fill('gem', 150, 62, 70, 40); b.fill('lava', 136, 140, 88, 45); b.pal(215, 467); } },
    { name: 'Lava Moat', tip: 'Clear the path, then open the gates.', sol: [0, 1, 2], def: function (b) {
      b.wall(30, 380, 30, 490); b.wall(330, 380, 330, 490); b.wall(30, 490, 330, 490);
      b.wall(30, 380, 130, 380); b.wall(220, 380, 330, 380);
      b.wall(130, 150, 130, 380); b.wall(220, 150, 220, 380); b.wall(130, 150, 220, 150);
      b.pin(122, 300, 255, 300); b.pin(118, 496, 118, 345); b.pin(232, 496, 232, 345);
      b.fill('water', 136, 205, 78, 90); b.fill('lava', 124, 445, 102, 40);
      b.pal(70, 467); b.fill('gem', 245, 440, 78, 46); } },
    { name: 'Chain Reaction', tip: 'Think four pulls ahead.', sol: [3, 2, 1, 0], def: function (b) {
      twin(b, 60); b.pin(156, 300, 12, 300); b.pin(204, 130, 348, 130); b.pin(204, 215, 348, 215); b.pin(204, 300, 348, 300);
      b.pal(95, 277); b.mon(265, 458);
      b.fill('gem', 216, 85, 98, 40); b.fill('water', 216, 150, 98, 60); b.fill('lava', 216, 262, 98, 34); } },
    { name: 'Grump Pit', tip: 'Roll the rocks to the Grump.', sol: [1, 2, 0], mirror: true, def: function (b) {
      divert(b); b.pin(122, 110, 265, 110); b.pin(238, 195, 95, 195); b.pin(120, 345, 330, 240);
      b.fill('gem', 150, 62, 70, 40); b.fill('rock', 136, 150, 88, 42); b.mon(95, 468); b.pal(215, 467); } },
    { name: 'Grand Rescue', tip: 'Everything you have learned!', sol: [0, 1, 2, 3], def: function (b) {
      b.wall(20, 380, 20, 490); b.wall(340, 170, 340, 490); b.wall(20, 490, 340, 490);
      b.wall(20, 380, 110, 380); b.wall(180, 380, 250, 380);
      b.wall(110, 170, 110, 380); b.wall(180, 170, 180, 380); b.wall(110, 170, 180, 170);
      b.wall(250, 170, 250, 380); b.wall(250, 170, 340, 170);
      b.pin(188, 300, 75, 300); b.pin(348, 300, 218, 300); b.pin(100, 496, 100, 345); b.pin(190, 496, 190, 345);
      b.fill('water', 116, 200, 58, 95); b.fill('rock', 256, 225, 78, 70); b.fill('lava', 106, 445, 78, 40);
      b.pal(55, 467); b.mon(300, 468); b.fill('gem', 200, 440, 62, 46); } }
  ];
  var BASE = LEVELS.length;
  for (var q = 0; q < BASE; q++) {
    var L = LEVELS[q];
    LEVELS.push({ name: L.name + ' II', tip: 'Mirror Isle: same tricks, flipped!', sol: L.sol, def: L.def, mirror: !L.mirror, world: 1 });
    L.world = 0;
  }
  function fromData(d) {
    return function (b) {
      var i;
      for (i = 0; i < d.w.length; i++) b.wall.apply(null, d.w[i]);
      for (i = 0; i < d.p.length; i++) b.pin.apply(null, d.p[i]);
      for (i = 0; i < d.f.length; i++) b.fill.apply(null, d.f[i]);
      b.pal(d.pal[0], d.pal[1]);
      for (i = 0; i < (d.m || []).length; i++) b.mon(d.m[i][0], d.m[i][1]);
    };
  }
  // World 3 "Lava Lagoon": generated from templates, every pin order checked by tools/gen.js
  var NEW = [{"name":"Lava Lagoon","tip":"Side rooms slide into the middle.","sol":[0,1,3],"world":2,"data":{"w":[[230,40,130,40],[230,500,130,500],[230,40,230,500],[130,40,130,145],[130,260,130,335],[130,450,130,500],[20,145,130,145],[20,145,20,215],[20,215,130,260],[20,335,130,335],[20,335,20,400],[20,400,130,450]],"p":[[116,133,116,274],[116,462,116,310],[122,130,268,130],[122,320,268,320]],"f":[["gem",28,153,82,40],["gem",28,343,82,50],["lava",136,64,88,54],["water",136,268,88,40]],"pal":[180,477],"m":[]}},{"name":"Rock Slide","tip":"Your Pal can drop down too!","sol":[0,2,1],"world":2,"data":{"w":[[320,60,40,60],[320,60,320,490],[40,60,40,490],[320,490,40,490],[210,60,210,270],[150,60,150,270],[210,270,150,270]],"p":[[204,270,336,270],[156,165,24,165],[34,270,180,270],[180,264,180,506]],"f":[["lava",46,137,98,22],["water",46,230,98,34],["gem",227,438,76,46]],"pal":[265,246],"m":[[95,468]]}},{"name":"Steam Bath","tip":"Side rooms slide into the middle.","sol":[2,3],"world":2,"data":{"w":[[130,40,230,40],[130,500,230,500],[130,40,130,145],[130,260,130,500],[230,40,230,335],[230,450,230,500],[20,145,130,145],[20,145,20,215],[20,215,130,260],[340,335,230,335],[340,335,340,400],[340,400,230,450]],"p":[[116,272,116,120],[244,323,244,464],[122,130,268,130],[238,320,92,320]],"f":[["lava",28,153,82,59],["rock",250,343,82,43],["gem",136,59,88,59],["water",136,268,88,40]],"pal":[180,477],"m":[]}},{"name":"Pebble Party","tip":"Drop rocks to bonk the Grump.","sol":[0,1],"world":2,"data":{"w":[[330,60,30,60],[330,60,330,490],[30,60,30,490],[330,490,30,490],[250,60,250,270],[220,60,220,270],[250,270,220,270],[140,60,140,270],[110,60,110,270],[140,270,110,270]],"p":[[244,270,346,270],[134,270,235,270],[116,270,14,270],[235,264,235,506],[125,264,125,506]],"f":[["rock",256,226,68,38],["gem",146,233,68,31],["lava",36,231,68,33]],"pal":[180,467],"m":[[290,468]]}},{"name":"Hot Tub","tip":"Lava melts Grumps as well.","sol":[0,2],"world":2,"data":{"w":[[230,40,130,40],[230,500,130,500],[230,40,230,335],[230,450,230,500],[130,40,130,145],[130,260,130,335],[130,450,130,500],[20,145,130,145],[20,145,20,215],[20,215,130,260],[340,335,230,335],[340,335,340,400],[340,400,230,450],[20,335,130,335],[20,335,20,400],[20,400,130,450]],"p":[[116,272,116,120],[244,323,244,464],[116,462,116,310],[122,320,268,320]],"f":[["lava",28,153,82,56],["lava",250,343,82,54],["gem",28,343,82,59]],"pal":[180,477],"m":[[180,295]]}},{"name":"Grump Drop","tip":"Your Pal can drop down too!","sol":[0,4,1,2,3],"world":2,"data":{"w":[[30,60,330,60],[30,60,30,490],[330,60,330,490],[30,490,330,490],[110,60,110,270],[140,60,140,270],[110,270,140,270],[220,60,220,270],[250,60,250,270],[220,270,250,270]],"p":[[116,270,14,270],[134,165,235,165],[134,270,235,270],[244,270,346,270],[125,264,125,506]],"f":[["gem",36,218,68,46],["lava",256,239,68,25],["water",30,456,80,28]],"pal":[180,246],"m":[[180,468]]}},{"name":"Gem Elevator","tip":"Water first, then the gems.","sol":[0,3],"world":2,"data":{"w":[[130,40,230,40],[130,500,230,500],[130,40,130,145],[130,260,130,500],[230,40,230,145],[230,260,230,500],[20,145,130,145],[20,145,20,215],[20,215,130,260],[340,145,230,145],[340,145,340,215],[340,215,230,260]],"p":[[116,272,116,120],[244,133,244,274],[122,130,268,130],[238,320,92,320]],"f":[["gem",28,153,82,36],["lava",250,153,82,42],["lava",136,79,88,39],["water",136,272,88,36]],"pal":[180,477],"m":[]}},{"name":"Waterfall","tip":"Keep the lava away from the gems!","sol":[4,1,2],"world":2,"data":{"w":[[40,60,320,60],[40,60,40,490],[320,60,320,490],[40,490,320,490],[150,60,150,270],[210,60,210,270],[150,270,210,270]],"p":[[156,130,24,130],[156,200,24,200],[156,270,24,270],[326,270,180,270],[180,264,180,506]],"f":[["rock",46,74,98,50],["gem",46,161,98,33],["rock",46,213,98,51],["lava",216,236,98,28],["gem",57,438,76,46]],"pal":[265,467],"m":[]}},{"name":"Melt Down","tip":"Drop rocks to bonk the Grump.","sol":[0,2,3,4],"world":2,"data":{"w":[[130,40,230,40],[130,500,230,500],[130,40,130,335],[130,450,130,500],[230,40,230,145],[230,260,230,335],[230,450,230,500],[340,145,230,145],[340,145,340,215],[340,215,230,260],[20,335,130,335],[20,335,20,400],[20,400,130,450],[340,335,230,335],[340,335,340,400],[340,400,230,450]],"p":[[244,272,244,120],[116,462,116,310],[244,323,244,464],[238,130,92,130],[122,320,268,320]],"f":[["rock",250,153,82,43],["lava",28,343,82,41],["gem",250,343,82,57],["gem",136,51,88,67]],"pal":[180,477],"m":[[180,295]]}},{"name":"Stone Rain","tip":"Order is everything. Think first!","sol":[2,3,0],"world":2,"data":{"w":[[40,60,320,60],[40,60,40,490],[320,60,320,490],[40,490,320,490],[150,60,150,270],[210,60,210,270],[150,270,210,270]],"p":[[34,270,180,270],[326,130,180,130],[204,200,336,200],[204,270,336,270]],"f":[["rock",216,90,98,34],["rock",216,165,98,29],["gem",216,230,98,34],["gem",57,438,76,46]],"pal":[95,246],"m":[[265,468]]}},{"name":"Lava Lamp","tip":"Water first, then the gems.","sol":[3,0,4],"world":2,"data":{"w":[[130,40,230,40],[130,500,230,500],[130,40,130,145],[130,260,130,500],[230,40,230,145],[230,260,230,335],[230,450,230,500],[20,145,130,145],[20,145,20,215],[20,215,130,260],[340,145,230,145],[340,145,340,215],[340,215,230,260],[340,335,230,335],[340,335,340,400],[340,400,230,450]],"p":[[116,272,116,120],[244,133,244,274],[244,323,244,464],[122,130,268,130],[122,320,268,320]],"f":[["gem",28,153,82,46],["lava",250,153,82,37],["rock",250,343,82,38],["water",136,56,88,62],["lava",136,269,88,39]],"pal":[180,477],"m":[]}},{"name":"High Dive","tip":"Lava melts Grumps as well.","sol":[0,4,2],"world":2,"data":{"w":[[40,60,320,60],[40,60,40,490],[320,60,320,490],[40,490,320,490],[150,60,150,270],[210,60,210,270],[150,270,210,270]],"p":[[156,270,24,270],[326,130,180,130],[204,200,336,200],[204,270,336,270],[180,264,180,506]],"f":[["lava",46,229,98,35],["lava",216,91,98,33],["gem",216,237,98,27]],"pal":[265,176],"m":[[265,468]]}},{"name":"Sneaky Grump","tip":"Keep the lava away from the gems!","sol":[1,2,3,4],"world":2,"data":{"w":[[130,40,230,40],[130,500,230,500],[130,40,130,145],[130,260,130,500],[230,40,230,145],[230,260,230,335],[230,450,230,500],[20,145,130,145],[20,145,20,215],[20,215,130,260],[340,145,230,145],[340,145,340,215],[340,215,230,260],[340,335,230,335],[340,335,340,400],[340,400,230,450]],"p":[[116,133,116,274],[244,133,244,274],[244,323,244,464],[122,130,268,130],[238,320,92,320]],"f":[["lava",28,153,82,59],["gem",250,153,82,51],["gem",250,343,82,43],["rock",136,70,88,48]],"pal":[180,477],"m":[[180,295]]}},{"name":"Hot Pockets","tip":"Order is everything. Think first!","sol":[0,3,1,4,2],"world":2,"data":{"w":[[40,60,320,60],[40,60,40,490],[320,60,320,490],[40,490,320,490],[150,60,150,270],[210,60,210,270],[150,270,210,270]],"p":[[156,130,24,130],[156,200,24,200],[156,270,24,270],[326,270,180,270],[180,264,180,506]],"f":[["gem",46,84,98,40],["gem",46,154,98,40],["rock",216,217,98,47],["water",225,456,80,28]],"pal":[95,467],"m":[[95,246]]}},{"name":"Double Trouble","tip":"Side rooms slide into the middle.","sol":[0,2,4],"world":2,"data":{"w":[[230,40,130,40],[230,500,130,500],[230,40,230,145],[230,260,230,335],[230,450,230,500],[130,40,130,335],[130,450,130,500],[340,145,230,145],[340,145,340,215],[340,215,230,260],[340,335,230,335],[340,335,340,400],[340,400,230,450],[20,335,130,335],[20,335,20,400],[20,400,130,450]],"p":[[244,272,244,120],[244,323,244,464],[116,462,116,310],[238,130,92,130],[122,320,268,320]],"f":[["gem",250,153,82,39],["water",250,343,82,50],["rock",28,343,82,44],["lava",136,72,88,46]],"pal":[180,477],"m":[[180,295]]}},{"name":"Tight Squeeze","tip":"Keep the lava away from the gems!","sol":[1,2,3,4],"world":2,"data":{"w":[[320,60,40,60],[320,60,320,490],[40,60,40,490],[320,490,40,490],[210,60,210,270],[150,60,150,270],[210,270,150,270]],"p":[[204,270,336,270],[34,130,180,130],[156,200,24,200],[156,270,24,270],[180,264,180,506]],"f":[["lava",216,234,98,30],["gem",46,92,98,32],["rock",46,148,98,46],["rock",46,236,98,28],["gem",227,438,76,46]],"pal":[95,467],"m":[]}},{"name":"Boulder Bash","tip":"Side rooms slide into the middle.","sol":[1,3,0],"world":2,"data":{"w":[[130,40,230,40],[130,500,230,500],[130,40,130,145],[130,260,130,335],[130,450,130,500],[230,40,230,500],[20,145,130,145],[20,145,20,215],[20,215,130,260],[20,335,130,335],[20,335,20,400],[20,400,130,450]],"p":[[116,272,116,120],[116,462,116,310],[122,130,268,130],[122,320,268,320]],"f":[["gem",28,153,82,36],["rock",28,343,82,59],["lava",136,80,88,38]],"pal":[180,477],"m":[[180,295]]}},{"name":"Fire and Water","tip":"Drop rocks to bonk the Grump.","sol":[0,3,4],"world":2,"data":{"w":[[30,60,330,60],[30,60,30,490],[330,60,330,490],[30,490,330,490],[110,60,110,270],[140,60,140,270],[110,270,140,270],[220,60,220,270],[250,60,250,270],[220,270,250,270]],"p":[[116,270,14,270],[134,270,235,270],[244,165,346,165],[244,270,346,270],[235,264,235,506]],"f":[["gem",36,220,68,44],["lava",146,230,68,34],["lava",256,123,68,36],["rock",256,226,68,38],["gem",32,438,76,46]],"pal":[290,467],"m":[[180,468]]}},{"name":"Grump Gauntlet","tip":"Drop rocks to bonk the Grump.","sol":[0,2,3,4],"world":2,"data":{"w":[[330,60,30,60],[330,60,330,490],[30,60,30,490],[330,490,30,490],[250,60,250,270],[220,60,220,270],[250,270,220,270],[140,60,140,270],[110,60,110,270],[140,270,110,270]],"p":[[244,270,346,270],[226,270,125,270],[116,270,14,270],[235,264,235,506],[125,264,125,506]],"f":[["rock",256,227,68,37],["lava",146,237,68,27],["gem",36,242,68,22]],"pal":[290,467],"m":[[180,468]]}},{"name":"Grand Finale","tip":"Use everything you have learned!","sol":[2,3,4],"world":2,"data":{"w":[[40,60,320,60],[40,60,40,490],[320,60,320,490],[40,490,320,490],[150,60,150,270],[210,60,210,270],[150,270,210,270]],"p":[[156,270,24,270],[204,130,336,130],[326,200,180,200],[204,270,336,270],[180,264,180,506]],"f":[["rock",46,206,98,58],["rock",216,68,98,56],["gem",216,150,98,44],["rock",216,230,98,34]],"pal":[95,467],"m":[[265,468]]}}];
  for (var nq = 0; nq < NEW.length; nq++) LEVELS.push(NEW[nq]);
  function load(i) { var L = LEVELS[i]; return build(L.def || fromData(L.data), !!L.mirror); }

  var api = { fromData: fromData, build: build, step: step, pull: pull, stars: stars, load: load, LEVELS: LEVELS, DT: DT, BASE: BASE };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PPSim = api;
})(typeof window !== 'undefined' ? window : this);
