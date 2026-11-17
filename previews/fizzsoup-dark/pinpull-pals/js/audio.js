/* Pinpull Pals - synthesized audio (no audio files). Starts only after a user gesture. */
(function (root) {
  'use strict';
  var AC = null, master = null, muted = false, musicOn = false, timer = null, nextT = 0, stepI = 0, lastSizzle = 0;
  function ensure() {
    if (!AC) {
      try {
        var C = root.AudioContext || root.webkitAudioContext; if (!C) return false;
        AC = new C(); master = AC.createGain(); master.gain.value = muted ? 0 : 0.5; master.connect(AC.destination);
      } catch (e) { AC = null; return false; }
    }
    return true;
  }
  function unlock() { if (ensure() && AC.state === 'suspended') { try { AC.resume(); } catch (e) { } } }
  function tone(f, dur, type, vol, when, to) {
    if (!AC || muted) return;
    var t = AC.currentTime + (when || 0), o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.03);
  }
  function noise(dur, vol, freq) {
    if (!AC || muted) return;
    var n = Math.floor(AC.sampleRate * dur), buf = AC.createBuffer(1, n, AC.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
    s.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq || 3000; g.gain.value = vol || 0.15;
    s.connect(f); f.connect(g); g.connect(master); s.start();
  }
  var SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5, 1568, 1760];
  var SEQ = [0, 2, 4, 2, 3, 5, 4, 2, 1, 3, 4, 3, 0, 2, 4, 5];
  function tick() {
    if (!AC || !musicOn || AC.state !== 'running') return;
    while (nextT < AC.currentTime + 0.3) {
      var when = Math.max(0, nextT - AC.currentTime), n = SEQ[stepI % SEQ.length];
      tone(SCALE[n] / 2, 0.22, 'triangle', 0.045, when);
      if (stepI % 4 === 0) tone(SCALE[[0, 3, 1, 4][(stepI / 4) % 4 | 0]] / 4, 0.5, 'sine', 0.07, when);
      nextT += 0.26; stepI++;
    }
  }
  var api = {
    unlock: unlock,
    setMuted: function (m) { muted = !!m; if (master) master.gain.value = muted ? 0 : 0.5; },
    isMuted: function () { return muted; },
    state: function () { return AC ? AC.state : 'none'; },
    pause: function () { if (AC && AC.state === 'running') { try { AC.suspend(); } catch (e) { } } },
    resume: function () { if (AC && AC.state === 'suspended') { try { AC.resume(); } catch (e) { } } },
    music: function (on) {
      musicOn = on; if (on && ensure()) { nextT = AC.currentTime + 0.1; if (!timer) timer = setInterval(tick, 100); }
      else if (!on && timer) { clearInterval(timer); timer = null; }
    },
    click: function () { tone(660, 0.07, 'triangle', 0.12); },
    pull: function () { tone(300, 0.16, 'square', 0.08, 0, 720); noise(0.08, 0.08, 1800); },
    gem: function (n) { tone(SCALE[Math.min(n - 1, 9)], 0.16, 'triangle', 0.16); tone(SCALE[Math.min(n - 1, 9)] * 2, 0.1, 'sine', 0.06, 0.03); },
    sizzle: function () { if (!AC || AC.currentTime - lastSizzle < 0.07) return; lastSizzle = AC.currentTime; noise(0.22, 0.09, 5200); },
    bonk: function () { tone(180, 0.22, 'square', 0.16, 0, 60); noise(0.1, 0.12, 700); },
    win: function () { [0, 2, 4, 5, 7].forEach(function (n, i) { tone(SCALE[n], 0.22, 'triangle', 0.18, i * 0.09); }); },
    fail: function () { tone(330, 0.25, 'sawtooth', 0.1, 0, 220); tone(220, 0.4, 'sawtooth', 0.1, 0.2, 110); },
    star: function (i) { tone(SCALE[3 + i * 2], 0.25, 'triangle', 0.18); }
  };
  root.PPAudio = api;
})(window);
