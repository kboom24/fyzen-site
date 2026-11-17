/* Pinpull Pals - all artwork is drawn in code (original, no image assets) */
(function (root) {
  'use strict';
  var TAU = Math.PI * 2;
  var SKINS = [
    { name: 'Mango', need: 0, body: '#ffa62b', dark: '#b85c00', belly: '#ffe0a3', ear: '#ff7b54' },
    { name: 'Minty', need: 6, body: '#4be3ac', dark: '#0f7d5c', belly: '#d4fff0', ear: '#22b98a' },
    { name: 'Berry', need: 14, body: '#ff6fa8', dark: '#a81e5c', belly: '#ffd6e7', ear: '#ff3f86' },
    { name: 'Skye', need: 24, body: '#5cc8ff', dark: '#1565a8', belly: '#dff4ff', ear: '#2f9bea' },
    { name: 'Lemon', need: 36, body: '#ffe14d', dark: '#a88400', belly: '#fffbd1', ear: '#ffc400' },
    { name: 'Cocoa', need: 50, body: '#c98a5b', dark: '#6b3d1c', belly: '#f6dcc4', ear: '#a5683c' },
    { name: 'Grape', need: 75, body: '#a77bff', dark: '#4b22a8', belly: '#ece2ff', ear: '#8a55f5' },
    { name: 'Frosty', need: 105, body: '#e9f6ff', dark: '#4f7fa8', belly: '#ffffff', ear: '#b9dcf5' }
  ];
  var INK = '#2a1458';

  function eye(c, x, y, r, px, py) {
    c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.fillStyle = INK; c.beginPath(); c.arc(x + px, y + py, r * 0.58, 0, TAU); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(x + px - r * 0.2, y + py - r * 0.25, r * 0.22, 0, TAU); c.fill();
  }

  function pal(c, x, y, r, skin, mood, t, face) {
    var burnt = mood === 'burnt', bob = mood === 'happy' ? Math.abs(Math.sin(t * 9)) * r * 0.35 : 0;
    var sq = 1 + Math.sin(t * 3.2) * 0.035;
    c.save(); c.translate(x, y - bob); c.scale(sq, 1 / sq); c.lineJoin = 'round';
    var body = burnt ? '#5a5560' : skin.body, dark = burnt ? '#26222b' : skin.dark;
    // ears
    c.fillStyle = burnt ? '#48434f' : skin.ear; c.strokeStyle = dark; c.lineWidth = r * 0.13;
    for (var s = -1; s <= 1; s += 2) {
      c.beginPath(); c.moveTo(s * r * 0.35, -r * 0.8); c.quadraticCurveTo(s * r * 0.95, -r * 1.75, s * r * 0.92, -r * 0.45); c.closePath(); c.fill(); c.stroke();
    }
    // body
    c.fillStyle = body; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = burnt ? '#6d6874' : skin.belly; c.beginPath(); c.ellipse(0, r * 0.42, r * 0.58, r * 0.45, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-r * 0.42, -r * 0.55, r * 0.26, r * 0.14, -0.6, 0, TAU); c.fill();
    var ex = r * 0.38, ey = -r * 0.12, er = r * 0.27, f = (face || 1) * r * 0.07;
    c.strokeStyle = INK; c.lineWidth = r * 0.12; c.lineCap = 'round';
    if (burnt || mood === 'sad' && false) {
      for (s = -1; s <= 1; s += 2) { c.beginPath(); c.moveTo(s * ex - er * 0.6, ey - er * 0.6); c.lineTo(s * ex + er * 0.6, ey + er * 0.6); c.moveTo(s * ex + er * 0.6, ey - er * 0.6); c.lineTo(s * ex - er * 0.6, ey + er * 0.6); c.stroke(); }
    } else if (mood === 'happy') {
      for (s = -1; s <= 1; s += 2) { c.beginPath(); c.arc(s * ex, ey + er * 0.3, er * 0.75, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    } else {
      var blink = (t % 3.4) > 3.25 && mood === 'idle';
      if (blink) { for (s = -1; s <= 1; s += 2) { c.beginPath(); c.moveTo(s * ex - er * 0.7, ey); c.lineTo(s * ex + er * 0.7, ey); c.stroke(); } }
      else { var big = mood === 'scared' ? 1.2 : 1; eye(c, -ex, ey, er * big, f, mood === 'sad' ? er * 0.2 : 0); eye(c, ex, ey, er * big, f, mood === 'sad' ? er * 0.2 : 0); }
    }
    // cheeks
    if (!burnt) { c.fillStyle = 'rgba(255,90,130,.45)'; c.beginPath(); c.arc(-r * 0.66, r * 0.2, r * 0.15, 0, TAU); c.arc(r * 0.66, r * 0.2, r * 0.15, 0, TAU); c.fill(); }
    // mouth
    c.lineWidth = r * 0.1; c.strokeStyle = INK; c.beginPath();
    if (mood === 'happy') { c.fillStyle = '#ff5d7a'; c.arc(0, r * 0.2, r * 0.26, 0, Math.PI); c.closePath(); c.fill(); c.stroke(); }
    else if (mood === 'scared') { c.fillStyle = INK; c.ellipse(0, r * 0.36, r * 0.13, r * 0.18, 0, 0, TAU); c.fill(); }
    else if (mood === 'sad' || burnt) { c.arc(0, r * 0.48, r * 0.2, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
    else { c.arc(0, r * 0.2, r * 0.2, Math.PI * 0.15, Math.PI * 0.85); c.stroke(); }
    c.restore();
  }

  function mon(c, x, y, r, t, face, angry) {
    c.save(); c.translate(x, y); var sq = 1 + Math.sin(t * 5) * 0.04; c.scale(sq, 1 / sq); c.lineJoin = 'round';
    c.strokeStyle = '#2b0b45'; c.lineWidth = r * 0.14;
    c.fillStyle = '#ffd23f'; // horns
    for (var s = -1; s <= 1; s += 2) { c.beginPath(); c.moveTo(s * r * 0.3, -r * 0.85); c.lineTo(s * r * 0.75, -r * 1.55); c.lineTo(s * r * 0.85, -r * 0.5); c.closePath(); c.fill(); c.stroke(); }
    c.fillStyle = '#8e3df2'; c.beginPath();
    for (var i = 0; i < 16; i++) { var a = i / 16 * TAU, rr = r * (i % 2 ? 1.0 : 1.12); c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    c.closePath(); c.fill(); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.ellipse(-r * 0.4, -r * 0.5, r * 0.25, r * 0.13, -0.6, 0, TAU); c.fill();
    eye(c, 0, -r * 0.15, r * 0.4, (face || 1) * r * 0.12, 0);
    c.strokeStyle = '#2b0b45'; c.lineWidth = r * 0.16; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-r * 0.55, -r * 0.7); c.lineTo(-r * 0.05, -r * 0.48); c.moveTo(r * 0.55, -r * 0.7); c.lineTo(r * 0.05, -r * 0.48); c.stroke();
    c.fillStyle = '#2b0b45'; c.beginPath(); c.ellipse(0, r * 0.5, r * 0.45, r * (angry ? 0.26 : 0.16), 0, 0, TAU); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-r * 0.3, r * 0.36); c.lineTo(-r * 0.18, r * 0.58); c.lineTo(-r * 0.06, r * 0.36); c.moveTo(r * 0.3, r * 0.36); c.lineTo(r * 0.18, r * 0.58); c.lineTo(r * 0.06, r * 0.36); c.fill();
    c.restore();
  }

  function gem(c, x, y, r, hue, t) {
    c.save(); c.translate(x, y); c.rotate(Math.sin(t * 2 + hue) * 0.12); c.lineJoin = 'round';
    c.beginPath(); c.moveTo(-r, -r * 0.25); c.lineTo(-r * 0.55, -r * 0.9); c.lineTo(r * 0.55, -r * 0.9); c.lineTo(r, -r * 0.25); c.lineTo(0, r); c.closePath();
    c.fillStyle = 'hsl(' + hue + ',95%,60%)'; c.strokeStyle = 'hsl(' + hue + ',85%,24%)'; c.lineWidth = r * 0.28; c.stroke(); c.fill();
    c.fillStyle = 'hsl(' + hue + ',100%,80%)'; c.beginPath(); c.moveTo(-r, -r * 0.25); c.lineTo(-r * 0.55, -r * 0.9); c.lineTo(r * 0.55, -r * 0.9); c.lineTo(r, -r * 0.25); c.closePath(); c.fill();
    c.fillStyle = 'hsl(' + hue + ',90%,48%)'; c.beginPath(); c.moveTo(0, r); c.lineTo(r, -r * 0.25); c.lineTo(r * 0.2, -r * 0.25); c.closePath(); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(-r * 0.3, -r * 0.55, r * 0.16, 0, TAU); c.fill();
    c.restore();
  }

  function rock(c, x, y, r) {
    c.fillStyle = '#93a1c4'; c.strokeStyle = '#39406b'; c.lineWidth = 2.2;
    c.beginPath(); c.arc(x, y, r - 1, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = '#c3cdea'; c.beginPath(); c.ellipse(x - r * 0.3, y - r * 0.35, r * 0.32, r * 0.2, -0.5, 0, TAU); c.fill();
    c.fillStyle = '#6f7ca6'; c.beginPath(); c.arc(x + r * 0.3, y + r * 0.3, r * 0.16, 0, TAU); c.fill();
  }
  function coal(c, x, y, r) {
    c.fillStyle = '#2b2630'; c.strokeStyle = '#120f16'; c.lineWidth = 1.5;
    c.beginPath(); c.arc(x, y, r - 1, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = '#ff6a1a'; c.beginPath(); c.arc(x - 2, y + 1, 1.3, 0, TAU); c.arc(x + 2.5, y - 2, 1, 0, TAU); c.fill();
  }

  function fluid(c, balls, type, t) {
    var lava = type === 'lava', i, a, n = 0;
    var cols = lava ? ['#a31712', '#ff5a1f', '#ffc93c'] : ['#0d4fb3', '#27b4f5', '#c9f1ff'];
    var grow = [3.6, 1.4];
    for (var p = 0; p < 2; p++) {
      c.fillStyle = cols[p]; c.beginPath();
      for (i = 0; i < balls.length; i++) { a = balls[i]; if (!a.alive || a.type !== type) continue; n++; c.moveTo(a.x + a.r + grow[p], a.y); c.arc(a.x, a.y, a.r + grow[p], 0, TAU); }
      c.fill();
    }
    if (!n) return;
    c.fillStyle = cols[2]; c.beginPath();
    for (i = 0; i < balls.length; i++) {
      a = balls[i]; if (!a.alive || a.type !== type) continue;
      var w = lava ? 1.6 + Math.sin(t * 5 + a.id) * 1.1 : 1.5;
      var ox = lava ? Math.sin(t * 3 + a.id * 1.7) * 1.5 : -2, oy = lava ? Math.cos(t * 2.3 + a.id) * 1.5 : -2.2;
      c.moveTo(a.x + ox + w, a.y + oy); c.arc(a.x + ox, a.y + oy, w, 0, TAU);
    }
    c.fill();
  }

  function star(c, x, y, r, fill, stroke) {
    c.beginPath();
    for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath(); c.fillStyle = fill; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = r * 0.16; c.lineJoin = 'round'; c.stroke(); }
  }

  var THEMES = [
    { top: '#24136e', mid: '#6a2bd9', bot: '#ff6fb1', wall: '#fff1d6', wallHi: '#ffffff', wallSh: '#e3c79a' },
    { top: '#053a66', mid: '#0f9fa8', bot: '#ffd36f', wall: '#eafff4', wallHi: '#ffffff', wallSh: '#a9dcc4' },
    { top: '#3b0d3f', mid: '#c2335f', bot: '#ffb24a', wall: '#fff3e2', wallHi: '#ffffff', wallSh: '#f0b98f' }
  ];
  function bg(c, w, h, th, t) {
    var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, th.top); g.addColorStop(0.55, th.mid); g.addColorStop(1, th.bot);
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (var i = 0; i < 16; i++) {
      var r = 10 + (i * 37 % 34), x = (i * 97 % w) + Math.sin(t * 0.4 + i) * 12, y = h - ((t * (8 + i % 5 * 3) + i * 71) % (h + 80)) + 40;
      c.fillStyle = 'rgba(255,255,255,' + (0.05 + (i % 3) * 0.025) + ')'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    }
  }

  root.PPArt = { SKINS: SKINS, THEMES: THEMES, INK: INK, pal: pal, mon: mon, gem: gem, rock: rock, coal: coal, fluid: fluid, star: star, bg: bg };
})(window);
