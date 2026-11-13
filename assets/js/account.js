/* Playtoom accounts v1 (backend-preview). Loaded lazily by hx.js: only after the player interacts (Play, Profile) or, for a returning player
   who already has a session, after the page is idle. It is the ONLY code on the site that talks to the network, and only to the Supabase
   project domain below (documented exception to the 0-external-requests rule; see playtoom-studio docs/BACKEND-CONTRACT.md).
   - Guest-first: anonymous Supabase sign-in on first Play (no personal data). Optional email link later (13+ only, neutral age screen).
   - Cloud saves: syncs localStorage "hexan:<slug>" (engine HX.Save) + site progress; merges, never drops local progress.
   - Real leaderboards: swaps the offline stub in games that ship a pluggable LB (ADAPTERS) for the backend; falls back silently.
   - Online play (BACKEND-CONTRACT §8, live 2026-10-31): for games that ship the PLAYTOOM_MP facade, installs the "playtoom-mp" provider
     (inlined below, kept inside this closure) after the guest session exists. The game only sees the facade: no URL, key, token or room id.
     Realtime WebSocket only after the player taps Create/Join in such a game; nothing at all for games without the facade.
   - window.PTAccount: isPremium(), canSeeUpsell(), ready, profile(), onChange(fn) for the (future) ad layer / Plus upsell.
   Offline or backend down: everything stays local, no retries storm, no console errors from this file. */
(function () {
  'use strict';
  if (window.PTAccount && window.PTAccount._real) return;
  var SB_URL = 'https://yopgnpermfxljstfcsrl.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvcGducGVybWZ4bGpzdGZjc3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzODY2NDMsImV4cCI6MjEwODk2MjY0M30.G361hqYzMx4tp08Kv6h86bRKbK7_-AB1R-e88eVQIjI'; // public anon key (RLS enforced); injected at build time
  var LS_SESSION = 'pt_sb', LS_SYNC = 'pt_sync', LS_CACHE = 'pt_acct_c', LS_DOWN = 'pt_acct_down', SITE_SAVE = 'pt-site';
  var SITE_KEYS = ['pt_recent', 'pt_plays', 'pt_days', 'pt_favs'];
  var AVATARS = { star: '\u2B50', fox: '\uD83E\uDD8A', cat: '\uD83D\uDC31', dog: '\uD83D\uDC36', panda: '\uD83D\uDC3C', owl: '\uD83E\uDD89', frog: '\uD83D\uDC38', dino: '\uD83E\uDD96',
    robot: '\uD83E\uDD16', rocket: '\uD83D\uDE80', ghost: '\uD83D\uDC7B', alien: '\uD83D\uDC7D', unicorn: '\uD83E\uDD84', octopus: '\uD83D\uDC19', penguin: '\uD83D\uDC27', dragon: '\uD83D\uDC09' };
  /* Same list as private.is_clean_name() on the server. */
  var NAME_BLOCK = ['fuck','fuk','shit','bitch','cunt','dick','cock','pussy','penis','vagina','boob','tits','slut','whore','hoe','porn','sex','nude','naked','rape','pedo','nazi','hitler','kkk',
    'nigg','nigga','fag','retard','spic','chink','kike','wank','bastard','asshole','arse','twat','damn','kill','suicide','drug','cocaine','weed','meth','hentai','milf','anal','cum','jizz','dildo',
    'horny','sexy','xxx','69','420','admin','moderator','playtoom','playversy','official','support','hexan','staff'];
  function norm(s) { var a = '013457@$!_.- ', b = 'oleastasi', o = ''; s = String(s || '').toLowerCase(); for (var i = 0; i < s.length; i++) { var j = a.indexOf(s[i]); o += j < 0 ? s[i] : (j < b.length ? b[j] : ''); } return o; }
  function isClean(s) { var n = norm(s); return !NAME_BLOCK.some(function (w) { return n.indexOf(w) >= 0; }); }
  var ADJ = ['Sunny','Zippy','Brave','Lucky','Mighty','Jolly','Swift','Cosmic','Bouncy','Clever','Happy','Turbo','Fizzy','Snappy','Witty','Rapid','Bright','Comet','Pixel','Sparky'];
  var NOUN = ['Fox','Panda','Owl','Frog','Dino','Robot','Rocket','Comet','Otter','Tiger','Koala','Falcon','Gecko','Moose','Llama','Whale','Bunny','Yeti','Badger','Puffin'];
  function suggestName() { for (var t = 0; t < 20; t++) { var n = ADJ[Math.random() * ADJ.length | 0] + NOUN[Math.random() * NOUN.length | 0] + (10 + (Math.random() * 990 | 0)); if (isClean(n) && n.length <= 16) return n; } return 'Player' + (100 + (Math.random() * 900 | 0)); }

  /* ---------------- storage ---------------- */
  function lget(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lset(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function jget(k, d) { var v = lget(k); if (v == null) return d; try { return JSON.parse(v); } catch (e) { return d; } }
  function jset(k, v) { lset(k, v == null ? null : JSON.stringify(v)); }
  function h32(s) { var h = 2166136261 >>> 0; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(36) + ':' + s.length; }

  /* ---------------- tiny Supabase REST client (no SDK, no third-party code) ---------------- */
  var down = false;
  function isDown() { if (down) return true; if (typeof navigator !== 'undefined' && navigator.onLine === false) return true; var t = +lget(LS_DOWN) || 0; return Date.now() < t; }
  function markDown() { down = true; lset(LS_DOWN, String(Date.now() + 10 * 60 * 1000)); emit(); }
  /* Only real outages count (timeout, network error, 5xx). A fetch cancelled because the page is going away (click-through navigation,
     pagehide/beforeunload, hidden tab) or aborted by anyone but our own timeout never marks the backend down. While down, one probe request
     may go out every 30 s after the last failure (on any page); any answer below 500 ends offline mode at once instead of after 10 min. */
  var leaving = false, probing = false, leaveT = 0;
  function leave() { leaving = true; clearTimeout(leaveT); leaveT = setTimeout(function () { leaving = false; }, 15000); }
  window.addEventListener('beforeunload', leave); window.addEventListener('pagehide', leave);
  window.addEventListener('pageshow', function () { leaving = false; clearTimeout(leaveT); });
  function gone() { return leaving || (typeof document !== 'undefined' && document.visibilityState === 'hidden'); }
  function markUp() { var was = down || lget(LS_DOWN) != null; down = false; lset(LS_DOWN, null); if (was) { emit(); setTimeout(function () { if (session) { wireLB(); wireMP(); } }, 0); } }   // deferred: a probe that was a guest signup saves its session first
  function blocked() { if (!isDown()) return false; if ((typeof navigator !== 'undefined' && navigator.onLine === false) || probing) return true;
    var t = +lget(LS_DOWN) || 0; return t && Date.now() < t - 10 * 60 * 1000 + 30000; }   // down: probe allowed 30 s after the last failure
  function http(method, path, body, tok, extra) {
    if (blocked()) return Promise.resolve({ ok: false, status: 0, data: null, offline: true });
    var probe = isDown(); if (probe) probing = true;
    var h = { apikey: SB_KEY, 'Content-Type': 'application/json', Authorization: 'Bearer ' + (tok || SB_KEY) };
    if (extra) for (var k in extra) h[k] = extra[k];
    var timedOut = false, ctl = typeof AbortController !== 'undefined' ? new AbortController() : null, to = ctl ? setTimeout(function () { timedOut = true; ctl.abort(); }, 8000) : 0;
    return fetch(SB_URL + path, { method: method, headers: h, body: body == null ? undefined : JSON.stringify(body), signal: ctl ? ctl.signal : undefined, keepalive: method !== 'GET' && JSON.stringify(body || '').length < 60000, credentials: 'omit', referrerPolicy: 'no-referrer' })
      .then(function (r) { clearTimeout(to); if (probe) probing = false; return r.text().then(function (t) { var d = null; try { d = t ? JSON.parse(t) : null; } catch (e) {} if (r.status >= 500) markDown(); else markUp(); return { ok: r.ok, status: r.status, data: d }; }); },
            function (e) { clearTimeout(to); if (probe) probing = false;
              if (!timedOut && ((e && e.name === 'AbortError') || gone())) return { ok: false, status: 0, data: null, offline: false, aborted: true };   // cancelled, not an outage
              markDown(); return { ok: false, status: 0, data: null, offline: true }; });
  }
  var session = jget(LS_SESSION, null), refreshing = null;
  function saveSession(d) { if (!d || !d.access_token) return null; session = { access_token: d.access_token, refresh_token: d.refresh_token, expires_at: d.expires_at || (Math.floor(Date.now() / 1000) + (d.expires_in || 3600)),
      user: d.user ? { id: d.user.id, is_anonymous: !!d.user.is_anonymous, email: d.user.email || d.user.new_email || null } : (session && session.user) }; jset(LS_SESSION, session); return session; }
  function token() {
    if (!session) return Promise.resolve(null);
    if (session.expires_at - 60 > Date.now() / 1000) return Promise.resolve(session.access_token);
    if (!refreshing) refreshing = http('POST', '/auth/v1/token?grant_type=refresh_token', { refresh_token: session.refresh_token }).then(function (r) {
      refreshing = null; if (r.ok) return saveSession(r.data).access_token; if (r.status === 400 || r.status === 401) { /* revoked: keep local progress, start over as a new guest on next Play */ session = null; jset(LS_SESSION, null); } return null; });
    return refreshing;
  }
  var ensuring = null;
  /* create=true only after a player action (Play, profile setup). */
  function ensure(create) {
    if (session) return token();
    if (!create || blocked()) return Promise.resolve(null);
    if (!ensuring) ensuring = http('POST', '/auth/v1/signup', { data: {} }).then(function (r) { ensuring = null; if (r.ok && r.data && r.data.access_token) { saveSession(r.data); lset('pt_acct', '1'); return session.access_token; } return null; });
    return ensuring;
  }
  function rpc(fn, args, create) { return ensure(create).then(function (t) { if (!t) return { ok: false, status: 0, data: null, offline: true }; return http('POST', '/rest/v1/rpc/' + fn, args || {}, t); }); }

  /* ---------------- account state ---------------- */
  var acct = null, listeners = [];
  function cache() { return jget(LS_CACHE, {}) || {}; }
  function emit() { listeners.forEach(function (f) { try { f(api.state()); } catch (e) {} }); renderHeader(); }
  function loadAccount() { return rpc('my_account', {}, false).then(function (r) { if (r.ok && r.data) { acct = r.data; jset(LS_CACHE, { p: acct.premium_until, ab: acct.age_band, n: acct.username, a: acct.avatar, g: acct.is_guest }); emit(); } return acct; }); }
  function updateProfile(patch) { return ensure(true).then(function (t) { if (!t) return { ok: false, error: 'offline' };
    return http('PATCH', '/rest/v1/profiles?id=eq.' + session.user.id, patch, t, { Prefer: 'return=minimal' }).then(function (r) {
      if (r.ok) return loadAccount().then(function () { return { ok: true }; });
      var m = (r.data && (r.data.message || r.data.code)) || 'error'; if (r.status === 409 || /duplicate|unique/i.test(m)) m = 'taken'; return { ok: false, error: m }; }); }); }

  /* ---------------- cloud saves: merge, never lose local progress ---------------- */
  var MONO = /best|high|max|top|unlock|star|score|plays|played|level|xp|streak|record|win|trophy|trophies|count|total|clear|complete|solved|found|owned|earned|collected|rank/i;
  function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }
  function mergeVal(base, other, key) {
    if (isObj(base) && isObj(other)) { var o = {}, k; for (k in base) o[k] = k in other ? mergeVal(base[k], other[k], k) : base[k]; for (k in other) if (!(k in base)) o[k] = other[k]; return o; }
    if (typeof base === 'number' && typeof other === 'number' && MONO.test(key || '') && !/^_rev$/.test(key)) return Math.max(base, other);
    if (Array.isArray(base) && Array.isArray(other) && base.length === other.length && base.every(function (x, i) { return typeof x === 'boolean' && typeof other[i] === 'boolean'; })) return base.map(function (x, i) { return x || other[i]; });
    if (base === undefined) return other;
    return base;
  }
  /* base = the copy with the higher engine revision (_rev); progress counters from the other copy are kept with max(). */
  function mergeSave(local, remote) { if (!isObj(remote)) return local; if (!isObj(local)) return remote;
    var lr = local._rev | 0, rr = remote._rev | 0, base = rr > lr ? remote : local, other = base === local ? remote : local, out = mergeVal(base, other, '');
    out._rev = Math.max(lr, rr) + (JSON.stringify(out) === JSON.stringify(base) ? 0 : 1); return out; }
  function mergeSite(local, remote) { var o = {}; SITE_KEYS.forEach(function (k) { var a = local[k], b = remote[k];
    if (k === 'pt_favs' || k === 'pt_days') { var s = [], seen = {}; (a || []).concat(b || []).forEach(function (x) { var id = JSON.stringify(x); if (!seen[id]) { seen[id] = 1; s.push(x); } }); o[k] = k === 'pt_days' ? s.sort().slice(-400) : s; }
    else if (k === 'pt_plays') { o[k] = {}; [a || {}, b || {}].forEach(function (m) { for (var g in m) o[k][g] = Math.max(o[k][g] || 0, +m[g] || 0); }); }
    else if (k === 'pt_recent') { var m = {}; (a || []).concat(b || []).forEach(function (r) { if (r && r.s && (!m[r.s] || (r.t || 0) > (m[r.s].t || 0))) m[r.s] = r; }); o[k] = Object.keys(m).map(function (s) { return m[s]; }).sort(function (x, y) { return (y.t || 0) - (x.t || 0); }).slice(0, 60); }
    else o[k] = a != null ? a : b; }); return o; }
  function localSite() { var o = {}; SITE_KEYS.forEach(function (k) { var v = jget(k, null); if (v != null) o[k] = v; }); return o; }
  function localGames() { var o = {}; try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf('hexan:') === 0 && /^[a-z0-9][a-z0-9-]{1,39}$/.test(k.slice(6))) o[k.slice(6)] = k; } } catch (e) {} return o; }
  var syncState = jget(LS_SYNC, {}) || {}, syncing = null, lastSync = 0, changedGames = [];
  function writeLocal(game, data) { if (game === SITE_SAVE) { SITE_KEYS.forEach(function (k) { if (data[k] != null) jset(k, data[k]); }); } else jset('hexan:' + game, data); }
  function readLocal(game) { return game === SITE_SAVE ? localSite() : jget('hexan:' + game, null); }
  function pushOne(game, data, baseRev, tries) {
    return rpc('save_put', { p_game: game, p_data: data, p_base_rev: baseRev == null ? null : baseRev }, false).then(function (r) {
      if (!r.ok || !r.data) return false;
      if (r.data.ok) { syncState[game] = { rev: r.data.rev, h: h32(JSON.stringify(data)) }; return true; }
      if (r.data.conflict && tries > 0) { var m = game === SITE_SAVE ? mergeSite(data, r.data.data || {}) : mergeSave(data, r.data.data); writeLocal(game, m); changedGames.push(game); return pushOne(game, m, r.data.rev, tries - 1); }
      return false; });
  }
  /* Full sync: pull remote, merge into local, push anything changed. Safe to call often. */
  function sync() {
    if (syncing) return syncing; if (!session || blocked()) return Promise.resolve(false);
    syncing = ensure(false).then(function (t) { if (!t) return null; return http('GET', '/rest/v1/game_saves?select=game,data,rev', null, t); }).then(function (r) {
      if (!r || !r.ok || !Array.isArray(r.data)) return false;
      var remote = {}; r.data.forEach(function (row) { remote[row.game] = row; });
      var games = localGames(), names = {}, g; for (g in games) names[g] = 1; for (g in remote) names[g] = 1; names[SITE_SAVE] = 1;
      changedGames = []; var jobs = [];
      Object.keys(names).forEach(function (game) {
        var loc = readLocal(game), rem = remote[game], st = syncState[game] || {};
        if (game === SITE_SAVE && loc && !Object.keys(loc).length) loc = null;
        if (rem && !loc) { writeLocal(game, rem.data); changedGames.push(game); syncState[game] = { rev: rem.rev, h: h32(JSON.stringify(rem.data)) }; return; }
        if (!loc) return;
        var lh = h32(JSON.stringify(loc));
        if (rem && rem.rev === st.rev && lh === st.h) return;                              // nothing changed anywhere
        if (!rem) { jobs.push(pushOne(game, loc, null, 1)); return; }
        if (rem.rev === st.rev) { jobs.push(pushOne(game, loc, rem.rev, 1)); return; }      // only local changed
        var m = game === SITE_SAVE ? mergeSite(loc, rem.data) : mergeSave(loc, rem.data), mh = h32(JSON.stringify(m));
        if (mh !== lh) { writeLocal(game, m); changedGames.push(game); }
        if (mh !== h32(JSON.stringify(rem.data))) jobs.push(pushOne(game, m, rem.rev, 1)); else syncState[game] = { rev: rem.rev, h: mh };
      });
      return Promise.all(jobs).then(function () { jset(LS_SYNC, syncState); lastSync = Date.now(); afterPull(changedGames.slice()); emit(); return true; });
    }).then(function (v) { syncing = null; return v; }, function () { syncing = null; return false; });
    return syncing;
  }
  /* On a game page, reload the (same-origin) game frame if its save changed before the player pressed Play, so the game boots with it. */
  var played = !!window.__ptPlayed;
  function gameSlug() { var m = document.querySelector('[data-gamepage]'); return m ? m.getAttribute('data-gamepage') : null; }
  function frame() { return document.querySelector('#frame iframe.gframe, #frame iframe'); }
  function afterPull(changed) { var s = gameSlug(), f = frame(); if (!s || !f || played || document.documentElement.classList.contains('pt-immersive')) return;
    if (changed.indexOf(s) >= 0) { try { f.contentWindow.location.reload(); } catch (e) {} } }
  var pushT = 0;
  function schedulePush(ms) { clearTimeout(pushT); pushT = setTimeout(sync, ms); }

  /* ---------------- real leaderboards: swap the offline stub inside the same-origin game frame ---------------- */
  var num = function (v) { return v == null ? null : Number(v); };
  /* Games whose LB facade matches LEADERBOARD-API "standing" shape (submitScore/getStanding/getTop, higher score = better). */
  var ADAPTERS = { 'soccer-cup': 'CC', 'hole-grow': 'BB', 'crowd-math': 'MP' };
  function RealProvider(game) {
    var call = function (fn, args) { return rpc(fn, args, true).then(function (r) { if (!r.ok) throw new Error(r.offline ? 'offline' : ((r.data && r.data.message) || 'error')); return r.data; }); };
    var standing = function (d) { return d && d.ranked ? { ok: true, offline: false, ranked: true, score: num(d.score), rank: num(d.rank), total: num(d.total), percentile: num(d.percentile), next: d.next ? { rank: num(d.next.rank), score: num(d.next.score) } : null } : { ok: true, offline: false, ranked: false }; };
    return { id: 'playtoom-cloud', offline: false, label: '', preview: false,
      submitScore: function (req) { return call('submit_score', { p_game: game, p_board: String(req.board), p_score: Math.round(+req.score || 0), p_time_ms: req.timeMs ? Math.round(req.timeMs) : null,
          p_meta: { par: req.par != null ? +req.par : undefined, mode: req.mode || undefined, level: req.level || undefined }, p_version: null }).then(function (d) {
          return { ok: true, offline: false, improved: !!d.improved, best: num(d.score), rank: num(d.rank), total: num(d.total), percentile: num(d.percentile) }; }); },
      getStanding: function (req) { return call('lb_standing', { p_game: game, p_board: String(req.board), p_score: req.score == null ? null : Math.round(+req.score) }).then(standing); },
      getTop: function (req) { return call('lb_top', { p_game: game, p_board: String(req.board), p_limit: Math.min(req.limit || 5, 50), p_offset: 0 }).then(function (rows) {
          return { ok: true, offline: false, total: null, entries: (rows || []).map(function (e) { return { rank: num(e.rank), name: String(e.name || ''), score: num(e.score), you: !!e.you }; }) }; }); },
      getAround: function (req) { return call('lb_around_me', { p_game: game, p_board: String(req.board), p_radius: req.radius || 3 }).then(function (rows) { return { ok: true, offline: false, entries: rows || [] }; }); }
    };
  }
  /* ---------------- online play: PLAYTOOM_MP provider (contract 1) ---------------- */
  var PTMP = (function () { var root = {}; 
/* Playtoom portal: PLAYTOOM_MP provider "playtoom-mp" (contract 1.1, studio docs/BACKEND-CONTRACT.md §8). LIVE 2026-10-31.
 * 1.1: rooms of 2..4 players (seats 0..3). Every peer gets every other peer's inputs in order (per-seat seq), tagged with the seat. 3-4 player
 * rooms are a lobby until the host's start (server mp_start checks seats + capacity, then {t:'s', d:numbers-only data, r:players}). Per-player
 * send rate = the room's rate from the server (budget / n^2: 10/s for 2, 8/s for 3, 4/s for 4 players on the current plan).
 * Lives on the SITE side (portal page around the game's same-origin iframe), never in a game. Inlined into the site's account.js closure by
 * sitebuild/_build/backend_patch.py (wireMP(): installs it into games whose PLAYTOOM_MP facade still has the offline stub, after the guest session exists):
 *   var prov = PTMultiplayer.create({ rpc: rpc, token: token, url: SB_URL, apikey: SB_KEY, game: pageSlug, WS: window.WebSocket });
 *   prov.ready.then(function () { F.setProvider(prov); });
 * Transport: ONE WebSocket to Supabase Realtime (Phoenix protocol v1), private broadcast channel 'mp:<room uuid>' (RLS: seat holders only),
 * opened only after the player taps Create/Join, closed on leave. The game only ever sees the facade: no URL, key, token, room id or topic.
 * Envelope on the wire (event 'm'): {v:1, t:'h'|'s'|'i'|'e'|'p'|'b', s:seat, q:seq?, a:ack?, k:[seats heard]?, g:1 (started)?, r:players?, d:data?}
 *   h = hello (resent every 1 s until every known seat lists us in k), s = start (host, 3-4 players), i = input, e = emote,
 *   p = ping (after 2 s without sending; 5 s in a lobby), b = bye.
 * Game identity: rooms use the PAGE slug the portal passes as o.game (authoritative, like analytics), not the slug the game claims.
 * Capacity: per-player send cap = server net_rate (default 10/s, burst 10); 'busy' from the server = online is full (available() false).
 * Age policy (Hexan, 2026-10-31): open to every player incl. under-13 and unknown age, in CODE-ONLY friend rooms. The server decides
 * (mp_status / mp_gate, settings.age_policy default 'friends_all_ages'); this provider never reads or sends age, names or any text.
 * Kid-safety limits enforced here too: inputs are numbers/booleans/null/arrays/objects only (no strings), emotes are preset ids 0..7,
 * no chat API, no matchmaking/lobby API (create-by-code and join-by-code only). */
(function (root) {
  'use strict';
  var LIM = { bytes: 256, perSec: 10, burst: 10, peerFlood: 30, emotes: 8, depth: 4, arr: 32, keys: 16 };   // perSec/burst: server net_rate (mp_status.rate, <= 20); peerFlood: > 2x the cap + pings/emotes
  var KEY_RE = /^[A-Za-z_][A-Za-z0-9_]{0,11}$/;
  // Realm-agnostic plain-object test: the portal and the game iframe have different Object.prototype objects.
  function isPlain(v) { var p = Object.getPrototypeOf(v); return p !== null && Object.getPrototypeOf(p) === null && Object.prototype.toString.call(v) === '[object Object]'; }
  function valid(v, d) {
    if (d > LIM.depth) return false;
    if (v === null || typeof v === 'boolean') return true;
    if (typeof v === 'number') return isFinite(v);
    if (Array.isArray(v)) { if (v.length > LIM.arr) return false; for (var i = 0; i < v.length; i++) if (!valid(v[i], d + 1)) return false; return true; }
    if (v && typeof v === 'object' && isPlain(v)) { var k = Object.keys(v); if (k.length > LIM.keys) return false; for (var j = 0; j < k.length; j++) if (!KEY_RE.test(k[j]) || !valid(v[k[j]], d + 1)) return false; return true; }
    return false;
  }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }

  /* Minimal Supabase Realtime client: join one private topic, broadcast, receive, heartbeat, token refresh. */
  function Realtime(o) {
    var WS = o.WS || root.WebSocket, ws = null, ref = 0, joinRef = null, topic = 'realtime:' + o.topic, hb = null, tk = null, self = { onmsg: null, onclose: null, closed: false };
    function push(event, payload, top) { if (!ws || ws.readyState !== 1) return false; ref++; ws.send(JSON.stringify({ topic: top || topic, event: event, payload: payload, ref: String(ref), join_ref: top ? null : joinRef })); return true; }
    self.open = function () {
      return o.token().then(function (t) {
        if (!t) throw new Error('no_token');
        return new Promise(function (res, rej) {
          var u = o.url.replace(/^http/, 'ws') + '/realtime/v1/websocket?apikey=' + encodeURIComponent(o.apikey) + '&vsn=1.0.0', done = false;
          try { ws = new WS(u); } catch (e) { return rej(e); }
          var to = setTimeout(function () { if (!done) { done = true; rej(new Error('timeout')); try { ws.close(); } catch (e) {} } }, 10000);
          ws.onopen = function () {
            ref++; joinRef = String(ref);
            ws.send(JSON.stringify({ topic: topic, event: 'phx_join', ref: joinRef, join_ref: joinRef, payload: { config: { broadcast: { self: false, ack: false }, presence: { key: '' }, private: true }, access_token: t } }));
          };
          ws.onmessage = function (ev) {
            var m; try { m = JSON.parse(ev.data); } catch (e) { return; }
            if (m.topic !== topic) return;
            if (m.event === 'phx_reply' && m.ref === joinRef && !done) { done = true; clearTimeout(to); if (m.payload && m.payload.status === 'ok') { start(); res(); } else rej(new Error('join_refused')); return; }
            if (m.event === 'broadcast' && m.payload && m.payload.event === 'm' && self.onmsg) self.onmsg(m.payload.payload);
            else if ((m.event === 'phx_error' || m.event === 'phx_close' || (m.event === 'system' && m.payload && m.payload.status === 'error')) && done) fin('error');
          };
          ws.onclose = function () { if (!done) { done = true; clearTimeout(to); rej(new Error('closed')); } fin('error'); };
          ws.onerror = function () {};
        });
      });
    };
    function start() {
      hb = setInterval(function () { push('heartbeat', {}, 'phoenix'); }, 25000);
      tk = setInterval(function () { o.token().then(function (t) { if (t) push('access_token', { access_token: t }); }); }, 5 * 60000);
    }
    function fin(why) { if (self.closed) return; self.closed = true; clearInterval(hb); clearInterval(tk); try { ws.close(); } catch (e) {} if (self.onclose) self.onclose(why); }
    self.send = function (env) { return push('broadcast', { type: 'broadcast', event: 'm', payload: env }); };
    self.close = function () { if (self.closed) return; push('phx_leave', {}); self.onclose = null; fin('left'); };
    return self;
  }

  function create(o) {
    var sink = function () {}, st = { available: false, busy: false }, room = null, rate = LIM.perSec;
    var now = o.now || function () { return Date.now(); };
    function refreshStatus() {
      return o.rpc('mp_status', { p_game: o.game }, false).then(function (r) {
        var d = r && r.ok && r.data; st.available = !!(d && d.available); st.busy = !!(d && d.busy);
        if (d && (d.rate | 0) === d.rate && d.rate >= 1 && d.rate <= 20) { rate = d.rate; }
      }, function () { st.available = false; });
    }
    function err(e) { return { ok: false, error: e }; }
    function rpcErr(r) { var e = r && r.data && r.data.error ? r.data.error : (r && r.offline ? 'offline' : 'error'); if (e === 'busy' && !room) { st.available = false; st.busy = true; } return e; }   // busy = online is full right now: "Online is busy, try later"
    function okRate(x) { return (x | 0) === x && x >= 1 && x <= 20; }
    function peerOf(s) { if (!room.peers[s]) room.peers[s] = { known: false, ack: false, inQ: 0, buf: {}, gapSince: 0, lastRecv: 0, flood: 0, floodT: now(), started: false }; return room.peers[s]; }
    function known() { var k = []; for (var s in room.peers) if (room.peers[s].known) k.push(+s); return k; }
    function enter(r, kind) {
      var d = r.data, max = d.max_players === 3 || d.max_players === 4 ? d.max_players : 2;
      room = { id: d.room, seat: d.seat, code: d.code, seed: d.seed, max: max, rate: okRate(d.rate) ? d.rate : rate, started: max === 2, created: now(), peers: {}, outQ: 0, lastSent: now(), active: false, timers: [], startMsg: null, startAt: 0 };
      if (Array.isArray(d.seats)) d.seats.forEach(function (x) { if ((x | 0) === x && x >= 0 && x < max && x !== d.seat) peerOf(x); });   // roster at join: these seats must answer our hello
      if (d.seat !== 0) peerOf(0);
      bucket = room.rate; fillT = now();
      var rt = room.rt = Realtime({ WS: o.WS, url: o.url, apikey: o.apikey, token: o.token, topic: d.topic });
      rt.onmsg = onEnv; rt.onclose = function (why) { closeRoom(why === 'left' ? 'left' : 'error', false); };
      return rt.open().then(function () {
        hello();
        room.timers.push(setInterval(tick, 1000));
        room.timers.push(setInterval(function () { if (!room) return; var a = room.active; room.active = false; o.rpc('mp_heartbeat', { p_room: room.id, p_active: a }).then(function (h) { if (room && h && h.data && h.data.ok === false && h.data.error === 'closed') closeRoom(h.data.reason === 'idle' ? 'idle' : 'expired', true); }); }, 60000));
        return { ok: true, code: d.code, seat: d.seat, seed: d.seed, maxPlayers: max };
      }, function () { var id = room && room.id; closeRoom(null, false); if (id) o.rpc('mp_leave', { p_room: id, p_reason: 'error' }); return err(kind === 'join' ? 'timeout' : 'error'); });
    }
    // hello: {t:'h', k:[seats I have heard], a:1 if I know anyone (1.0 field)}. A seat that lists me has acked.
    function hello() { if (room) { var k = known(); room.rt.send({ v: 1, t: 'h', s: room.seat, a: k.length ? 1 : 0, k: k }); room.lastSent = now(); k.forEach(function (x) { room.peers[x].told = true; }); } }
    function drain(s, p) {   // deliver a peer's inputs in order once the match has started (inputs that raced ahead of the host's start wait here)
      while (room && room.started && room.peers[s] === p && p.buf[p.inQ + 1] !== undefined) { p.inQ++; var d = p.buf[p.inQ]; delete p.buf[p.inQ]; sink('input', { seat: s, seq: p.inQ, input: d }); } // the game may leave() inside onInput
      if (room && room.peers[s] === p) { if (Object.keys(p.buf).length && room.started) { if (!p.gapSince) p.gapSince = now(); } else p.gapSince = 0; }
    }
    function playing() { return room.started; }
    function dropPeer(s, reason) {
      var p = room.peers[s]; if (!p) return; var was = p.known; delete room.peers[s];
      if (was) sink('peerLeave', { seat: s, reason: reason });
      if (!room) return;
      var left = known().length;
      if (room.max === 2) return closeRoom('peer_left', true);                       // 1.0: a 2-player room ends when the peer goes
      if (s === 0 && !room.started) return closeRoom('peer_left', true);           // the host left the lobby (the server closed it)
      if (room.started && left === 0) return closeRoom('peer_left', true);          // alone in a started match
    }
    function tick() {
      if (!room) return; var t = now(), ps = Object.keys(room.peers).map(Number), lobby = !room.started;
      var unacked = ps.some(function (s) { return !room.peers[s].ack; });
      if (unacked && (room.seat !== 0 || ps.length)) { hello(); if (room.seat !== 0 && !(room.peers[0] && room.peers[0].known) && t - room.created > 15000) return closeRoom('error', true); } // a waiting host with nobody stays silent (Realtime bills every message)
      if (room.startMsg && t - room.startAt < 6000 && ps.some(function (s) { return room.peers[s].known && !room.peers[s].started; })) room.rt.send(room.startMsg);   // re-send start until every player confirms (g:1)
      if (ps.length && t - room.lastSent > (lobby ? 5000 : 2000)) { room.rt.send(env('p')); room.lastSent = t; }
      for (var i = 0; room && i < ps.length; i++) {
        var p = room.peers[ps[i]]; if (!p) continue;
        if (p.known && t - p.lastRecv > (lobby ? 16000 : 8000)) { dropPeer(ps[i], 'timeout'); continue; }
        if (p.gapSince && Object.keys(p.buf).length && t - p.gapSince > 3000) return closeRoom('error', true);
      }
    }
    function env(t, extra) { var e = { v: 1, t: t, s: room.seat }; if (room.started && room.max > 2) e.g = 1; if (extra) for (var k in extra) e[k] = extra[k]; return e; }
    function onEnv(e) {
      if (!room || !e || e.v !== 1 || (e.s | 0) !== e.s || e.s < 0 || e.s >= room.max || e.s === room.seat) return;
      var t = now(), p = peerOf(e.s); p.lastRecv = t;
      if (t - p.floodT > 1000) { p.floodT = t; p.flood = 0; } if (++p.flood > LIM.peerFlood) return closeRoom('abuse', true);
      if (e.g === 1) p.started = true;
      if (!p.known) {   // Realtime may deliver out of order: any message from a seat can be the first one we see
        if (room.started && room.max > 2) { if (!room.roster || room.roster.indexOf(e.s) < 0) { delete room.peers[e.s]; return; } p.known = true; }   // nobody joins a started match (the server refuses it too)
        else { p.known = true; sink('peerJoin', { seat: e.s }); if (!room) return; }
      }
      if (e.t === 'h') {
        var acked = Array.isArray(e.k) ? e.k.indexOf(room.seat) >= 0 : !!e.a;
        if (acked) p.ack = true;
        if (!acked || !p.told) hello(); return;
      }
      p.ack = true;
      if (e.t === 's') {   // host started a 3-4 player room
        if (e.s !== 0 || room.max === 2 || room.started) return;
        var pl = Array.isArray(e.r) ? e.r.filter(function (x) { return (x | 0) === x && x >= 0 && x < room.max; }) : null;
        if (e.d !== null && e.d !== undefined && (!valid(e.d, 0) || JSON.stringify(e.d).length > LIM.bytes)) return;
        room.started = true; room.roster = pl;
        if (pl) for (var ks in room.peers) if (pl.indexOf(+ks) < 0) delete room.peers[ks];   // lobby leftovers not in the match
        sink('start', { data: e.d === undefined ? null : clone(e.d), players: pl || known().concat([room.seat]) });
        if (room) { room.rt.send(env('p')); room.lastSent = t; }
        for (var s2 in (room ? room.peers : {})) drain(+s2, room.peers[s2]);
        return;
      }
      if (e.t === 'i') {
        if ((e.q | 0) !== e.q || e.q < 1 || !valid(e.d, 0) || JSON.stringify(e.d).length > LIM.bytes) return;
        if (e.q <= p.inQ || p.buf[e.q] !== undefined) return;         // duplicate
        p.buf[e.q] = e.d; if (Object.keys(p.buf).length > 64) return closeRoom('error', true);
        drain(e.s, p);
      } else if (e.t === 'e') { if ((e.d | 0) === e.d && e.d >= 0 && e.d < LIM.emotes) sink('emote', { seat: e.s, id: e.d }); }
      else if (e.t === 'b') dropPeer(e.s, 'left');
    }
    function closeRoom(reason, tellServer) {
      if (!room) return; var r = room; room = null;
      r.timers.forEach(clearInterval); r.rt.onclose = null; r.rt.close();
      if (tellServer) o.rpc('mp_leave', { p_room: r.id, p_reason: reason === 'peer_left' ? 'peer_left' : reason === 'abuse' ? 'abuse' : 'left' });
      if (reason) sink('close', { reason: reason });
    }
    var bucket = LIM.burst, fillT = now();
    function anyPeer() { return known().length > 0; }
    var P = {
      id: 'playtoom-mp', apiVersion: 1, maxPlayers: 4,
      available: function () { return st.available; },
      attach: function (s) { sink = typeof s === 'function' ? s : function () {}; },
      refresh: refreshStatus,
      createRoom: function (a) {
        if (room) return Promise.resolve(err('busy'));
        var args = { p_game: o.game, p_proto: a.proto, p_mode: a.mode || '' }; if (a.maxPlayers === 3 || a.maxPlayers === 4) args.p_max = a.maxPlayers;
        return o.rpc('mp_create', args, true).then(function (r) {
          if (!r || !r.ok || !r.data || r.data.ok !== true) return err(rpcErr(r));
          return enter(r, 'create');
        }, function () { return err('offline'); });
      },
      joinRoom: function (a) {
        if (room) return Promise.resolve(err('busy'));
        return o.rpc('mp_join', { p_code: a.code, p_game: o.game, p_proto: a.proto, p_mode: a.mode || '' }, true).then(function (r) {
          if (!r || !r.ok || !r.data || r.data.ok !== true) return err(rpcErr(r));
          return enter(r, 'join');
        }, function () { return err('offline'); });
      },
      start: function (data) {   // host of a 3-4 player room: the server checks seats + capacity, then everyone gets {t:'s'}
        if (!room || room.seat !== 0 || room.max === 2 || room.started || !anyPeer()) return Promise.resolve(err('bad_args'));
        if (data !== null && data !== undefined && (!valid(data, 0) || JSON.stringify(data).length > LIM.bytes)) return Promise.resolve(err('bad_args'));
        var r0 = room;
        return o.rpc('mp_start', { p_room: room.id }, true).then(function (r) {
          if (room !== r0) return err('error');
          if (!r || !r.ok || !r.data || r.data.ok !== true) return err(r && r.data && r.data.error === 'busy' ? 'busy' : rpcErr(r));
          room.started = true;
          for (var ks in room.peers) if (!room.peers[ks].known) delete room.peers[ks];
          room.roster = known().concat([0]).sort();
          room.startMsg = env('s', { d: data === undefined ? null : clone(data), r: room.roster }); room.startAt = now();
          room.rt.send(room.startMsg); room.lastSent = now();
          return { ok: true };
        }, function () { return err('offline'); });
      },
      send: function (input) {
        if (!room || !room.started || !anyPeer() || !valid(input, 0)) return false;
        var s = JSON.stringify(input); if (s.length > LIM.bytes) return false;
        var t = now(), rr = room.rate; bucket = Math.min(Math.min(rr, LIM.burst), bucket + (t - fillT) * rr / 1000); fillT = t; if (bucket < 1) return false; bucket -= 1;
        room.outQ++; room.lastSent = t; room.active = true;
        return room.rt.send(env('i', { q: room.outQ, d: clone(input) }));
      },
      sendEmote: function (id) { if (!room || !anyPeer() || (id | 0) !== id || id < 0 || id >= LIM.emotes) return false; room.lastSent = now(); return room.rt.send(env('e', { d: id })); },
      leave: function () { if (!room) return Promise.resolve({ ok: true }); var id = room.id; room.rt.send(env('b')); closeRoom(null, false); return o.rpc('mp_leave', { p_room: id, p_reason: 'left' }).then(function () { return { ok: true }; }, function () { return { ok: true }; }); }
    };
    P.ready = refreshStatus();
    // Re-check capacity/availability once a minute while not in a room (cheap RPC; only on pages whose game ships PLAYTOOM_MP).
    var poll = setInterval(function () { if (!room && (typeof document === 'undefined' || !document.hidden)) refreshStatus(); }, 60000);
    if (poll && poll.unref) poll.unref();   // portal: prov.ready.then(function () { F.setProvider(prov); }) and prov.refresh() after the guest session exists
    return Object.freeze(P);
  }
  root.PTMultiplayer = { create: create, contract: 1, minor: 1 };
})(root);

 return root.PTMultiplayer || null; })();
  var mpTimer = 0, mpTries = 0, mpProv = null, mpSlug = null, mpHooked = null;
  function wireMP() {
    var s = gameSlug(); if (!s || !PTMP || isDown()) return;
    var f0 = frame(); if (f0 && mpHooked !== f0) { mpHooked = f0; f0.addEventListener('load', function () { if (mpProv) mpProv.leave(); if (session) wireMP(); }); }
    clearInterval(mpTimer); mpTries = 0;
    mpTimer = setInterval(function () { if (++mpTries > 90) { clearInterval(mpTimer); return; }
      var f = frame(), w; try { w = f && f.contentWindow; } catch (e) { return; } if (!w) return;
      var F; try { F = w.PLAYTOOM_MP; } catch (e) { return; } if (!F || F.contract !== 1 || typeof F.setProvider !== 'function') return;
      var p = F.provider; if (p && p.id === 'playtoom-mp') { clearInterval(mpTimer); return; }
      if (!(p && p.id === 'offline-stub') || !session) return;
      clearInterval(mpTimer);
      if (!mpProv || mpSlug !== s) { mpSlug = s; mpProv = PTMP.create({ rpc: rpc, token: token, url: SB_URL, apikey: SB_KEY, game: s, WS: window.WebSocket }); }
      var prov = mpProv; prov.ready.then(function () { try { if (F.provider && F.provider.id === 'offline-stub') F.setProvider(prov); } catch (e) {} });
    }, 500);
  }
  var lbTimer = 0, lbTries = 0;
  function wireLB() {
    var s = gameSlug(), ns = s && ADAPTERS[s]; if (!s || isDown() || /[?&]lb=/.test(location.search)) return;   // ns null: game may expose window.PLAYTOOM_LB (studio contract)
    if (ns === undefined) { if (wireLB._chk) return; wireLB._chk = 1;   // non-adapter game: only if the server has an enabled board config for it
      return ensure(false).then(function (t) { return t ? http('GET', '/rest/v1/game_boards?select=game&enabled=eq.true&game=eq.' + encodeURIComponent(s), null, t) : null; })
        .then(function (r) { if (r && r.ok && r.data && r.data.length) { ADAPTERS[s] = ''; startLB(s, ''); } }); }
    startLB(s, ns);
  }
  function startLB(s, ns) {
    clearInterval(lbTimer); lbTries = 0;
    lbTimer = setInterval(function () { if (++lbTries > 90) { clearInterval(lbTimer); return; }
      var f = frame(), w; try { w = f && f.contentWindow; } catch (e) { return; } if (!w) return;
      var LB; try { LB = w.PLAYTOOM_LB || (ns && w[ns] && w[ns].LB); } catch (e) { return; } if (!LB || typeof LB.setProvider !== 'function') return;
      if (/[?&]lb=/.test(w.location.search || '')) return;
      var p = LB.provider; if (p && p.id === 'playtoom-cloud') return;
      if (LB.stub ? false : !(p && p.id === 'offline-stub')) return;   // wait until the game installed its stub (crowd-math keeps it in LB.stub)
      if (!session) { ensure(true).then(function (t) { if (!t) clearInterval(lbTimer); }); return; }
      try { LB.setProvider(RealProvider(s)); } catch (e) {} }, 500);
  }

  /* ---------------- UI: header button + profile page ---------------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }
  function renderHeader() { var c = cache(); document.querySelectorAll('[data-acct-btn]').forEach(function (b) { var l = b.querySelector('.hx-pill__l'); if (l) l.textContent = c.n || 'Profile';
      var av = b.querySelector('[data-acct-av]'); if (c.a && AVATARS[c.a]) { if (!av) { av = document.createElement('span'); av.setAttribute('data-acct-av', ''); av.setAttribute('aria-hidden', 'true'); av.className = 'pt-av-s'; b.insertBefore(av, b.firstChild); var ic = b.querySelector('.hx-i'); if (ic) ic.style.display = 'none'; } av.textContent = AVATARS[c.a]; } }); }
  var CSS = '.pt-acct{display:grid;gap:16px}.pt-card{display:flex;align-items:center;gap:18px;flex-wrap:wrap}.pt-av{width:84px;height:84px;border-radius:50%;background:#262626;display:grid;place-items:center;font-size:48px;line-height:1}' +
    '.pt-card h3{margin:0;font:800 26px "Fredoka",sans-serif;color:#fff}.pt-card p{margin:4px 0 0;color:#B8B8B8;font:600 15px "Nunito",sans-serif}.pt-plus{display:inline-block;margin-left:8px;padding:2px 10px;border-radius:999px;background:#FFD23F;color:#0A0A0A;font:800 13px "Nunito"}' +
    '.pt-avs{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:10px;margin-top:10px}.pt-avs button{aspect-ratio:1;border-radius:16px;border:2px solid #333;background:#1E1E1E;font-size:30px;cursor:pointer;min-height:48px}' +
    '.pt-avs button[aria-pressed=true]{border-color:#C6FF3D;background:#2A3313}.pt-names{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}.pt-names button,.pt-btn{min-height:48px;padding:0 18px;border-radius:999px;border:1.5px solid #333;background:#1E1E1E;color:#fff;font:800 16px "Nunito";cursor:pointer}' +
    '.pt-btn--go{background:#C6FF3D;color:#0A0A0A;border-color:#C6FF3D}.pt-in{min-height:48px;padding:0 14px;border-radius:14px;border:1.5px solid #333;background:#0F0F0F;color:#fff;font:700 16px "Nunito";min-width:0;flex:1 1 220px}' +
    '.pt-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:10px}.pt-msg{min-height:1.4em;margin:8px 0 0;font:700 15px "Nunito";color:#C6FF3D}.pt-msg.is-err{color:#FF8CBF}.pt-av-s{font-size:22px;line-height:1}' +
    '@media (max-width:640px){.pt-avs{grid-template-columns:repeat(4,minmax(0,1fr))}.pt-av{width:68px;height:68px;font-size:38px}}';
  function styleOnce() { if (document.getElementById('pt-acct-css')) return; var s = document.createElement('style'); s.id = 'pt-acct-css'; s.textContent = CSS; document.head.appendChild(s); }
  var sugg = [suggestName(), suggestName(), suggestName()];
  function renderProfile() {
    var host = document.querySelector('[data-acct-sec]'); if (!host) return; styleOnce();
    var body = host.querySelector('[data-acct-body]') || host, c = cache(), a = acct, off = isDown();
    if (!session && !a) {
      body.innerHTML = '<div class="hx-gcard pt-acct"><div class="pt-card"><div class="pt-av" aria-hidden="true">' + AVATARS.star + '</div><div><h3>Guest player</h3><p>' + (off ? 'You are offline. Your progress is saved on this device.' : 'Make a free player card to save your progress to the cloud. No email needed.') + '</p></div></div>' +
        (off ? '' : '<div class="pt-row"><button class="pt-btn pt-btn--go" type="button" data-acct-start>Make my player card</button><button class="pt-btn" type="button" data-acct-signin>I already have one</button></div>') + '<p class="pt-msg" data-acct-msg role="status"></p><div data-acct-email hidden></div></div>';
      return;
    }
    var name = (a && a.username) || c.n, av = (a && a.avatar) || c.a || 'star', prem = api.isPremium(), guest = a ? a.is_guest : c.g !== false, ab = (a && a.age_band) || c.ab || null, older = ab === 'teen' || ab === 'adult';
    var h = '<div class="hx-gcard pt-acct"><div class="pt-card"><div class="pt-av" aria-hidden="true">' + (AVATARS[av] || AVATARS.star) + '</div><div><h3>' + esc(name || 'Guest player') + (prem ? '<span class="pt-plus">Plus</span>' : '') + '</h3>' +
      '<p>' + (guest ? 'Guest profile · progress saved to the cloud' : 'Signed in' + (session && session.user && session.user.email ? ' as ' + esc(session.user.email) : '')) + '</p>' +
      '<p data-acct-sync>' + (off ? 'Offline: saving on this device, will sync later.' : (lastSync ? 'Cloud save up to date' + (a && a.saves != null ? ' · ' + a.saves + ' save' + (a.saves === 1 ? '' : 's') : '') : 'Syncing…')) + '</p></div></div>';
    h += '<div><b>' + (name ? 'Your player name' : 'Pick your player name') + '</b><div class="pt-names">' + sugg.map(function (n) { return '<button type="button" data-acct-name="' + esc(n) + '">' + esc(n) + '</button>'; }).join('') + '<button type="button" data-acct-shuffle aria-label="Show other names">Other names</button></div>' +
      (older ? '<div class="pt-row"><label class="sr-only" for="pt-uname">Type your own name</label><input class="pt-in" id="pt-uname" maxlength="16" placeholder="Or type your own (3–16 letters, numbers, _)" autocomplete="off" spellcheck="false"><button class="pt-btn" type="button" data-acct-own>Use this name</button></div>' : '') + '</div>';
    h += '<div><b>Pick your picture</b><div class="pt-avs" role="group" aria-label="Avatar">' + Object.keys(AVATARS).map(function (k) { return '<button type="button" data-acct-av="' + k + '" aria-pressed="' + (k === av) + '" aria-label="' + k + '">' + AVATARS[k] + '</button>'; }).join('') + '</div></div>';
    if (guest && !off) h += '<div><b>Play on other devices</b><small style="display:block;color:#B8B8B8;font:600 15px Nunito">Add an email to keep this card if you clear your browser or switch devices. For players 13 and older.</small><div class="pt-row"><button class="pt-btn" type="button" data-acct-link>Add an email</button><button class="pt-btn" type="button" data-acct-signin>Sign in on this device</button><button class="pt-btn" type="button" data-acct-syncnow>Sync now</button></div><div data-acct-email hidden></div></div>';
    else if (!guest) h += '<div class="pt-row"><button class="pt-btn" type="button" data-acct-syncnow>Sync now</button><button class="pt-btn" type="button" data-acct-signout>Sign out</button></div>';
    h += '<p class="pt-msg" data-acct-msg role="status"></p></div>';
    body.innerHTML = h;
  }
  function msg(t, err) { var m = document.querySelector('[data-acct-msg]'); if (m) { m.textContent = t; m.classList.toggle('is-err', !!err); } }
  var ERR = { taken: 'That name is taken. Try another one.', name_not_allowed: 'Please pick a different name.', name_change_too_soon: 'Wait a few seconds before changing again.', rate_limited: 'Too many changes. Try again later.', offline: 'You are offline. Try again later.' };
  function emailBox(mode) { var b = document.querySelector('[data-acct-email]'); if (!b) return; b.hidden = false;
    var ab = acct && acct.age_band;
    if (ab === 'under13') { b.innerHTML = '<p class="pt-msg">Email is for players 13 and older. Your progress still saves on this device and to your guest card.</p>'; return; }
    if (!ab && mode === 'link') { b.innerHTML = '<p style="margin:10px 0 0;font:700 16px Nunito;color:#fff">How old are you?</p><div class="pt-row"><button class="pt-btn" type="button" data-acct-age="under13">Under 13</button><button class="pt-btn" type="button" data-acct-age="teen">13 to 17</button><button class="pt-btn" type="button" data-acct-age="adult">18 or older</button></div>'; return; }
    b.innerHTML = '<div class="pt-row"><label class="sr-only" for="pt-email">Email</label><input class="pt-in" id="pt-email" type="email" autocomplete="email" placeholder="you@example.com"><button class="pt-btn pt-btn--go" type="button" data-acct-send="' + mode + '">' + (mode === 'link' ? 'Send link' : 'Email me a sign-in link') + '</button></div>'; }
  function redirectTo() { return location.origin + '/profile'; }
  function onClick(e) {
    var t = e.target.closest && e.target.closest('[data-acct-start],[data-acct-name],[data-acct-shuffle],[data-acct-own],[data-acct-av],[data-acct-link],[data-acct-signin],[data-acct-send],[data-acct-age],[data-acct-syncnow],[data-acct-signout],[data-play]');
    if (!t) return;
    if (t.hasAttribute('data-play')) { played = true; ensure(true).then(function (tk) { if (tk) { loadAccount(); schedulePush(1500); wireLB(); wireMP(); } }); return; }
    if (t.closest('.pt-avs') && t.dataset.acctAv) { updateProfile({ avatar: t.dataset.acctAv }).then(function (r) { if (!r.ok) msg(ERR[r.error] || 'Could not save. Try again.', true); renderProfile(); }); return; }
    if (t.hasAttribute('data-acct-start')) { msg('Making your card…'); ensure(true).then(function (tk) { if (!tk) return msg(ERR.offline, true); return updateProfile({ username: sugg[0] }).then(function () { return sync(); }).then(renderProfile); }); return; }
    if (t.hasAttribute('data-acct-shuffle')) { sugg = [suggestName(), suggestName(), suggestName()]; renderProfile(); return; }
    if (t.dataset.acctName != null || t.hasAttribute('data-acct-own')) {
      var n = t.dataset.acctName != null ? t.dataset.acctName : ((document.getElementById('pt-uname') || {}).value || '').trim();
      if (!/^[A-Za-z0-9_]{3,16}$/.test(n)) return msg('Use 3 to 16 letters, numbers or _.', true); if (!isClean(n)) return msg(ERR.name_not_allowed, true);
      updateProfile({ username: n }).then(function (r) { renderProfile(); msg(r.ok ? 'Name saved.' : (ERR[r.error] || 'Could not save. Try again.'), !r.ok); }); return; }
    if (t.hasAttribute('data-acct-link')) { emailBox('link'); return; }
    if (t.hasAttribute('data-acct-signin')) { emailBox('signin'); return; }
    if (t.dataset.acctAge) { var band = t.dataset.acctAge; updateProfile({ age_band: band }).then(function (r) { if (!r.ok) return msg('Could not save. Try again.', true); renderProfile(); if (band !== 'under13') emailBox('link'); else { var b = document.querySelector('[data-acct-email]'); if (b) { b.hidden = false; b.innerHTML = '<p class="pt-msg">Thanks! Your progress keeps saving to your guest card. No email needed.</p>'; } } }); return; }
    if (t.dataset.acctSend) { var em = ((document.getElementById('pt-email') || {}).value || '').trim(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) return msg('Please type a real email address.', true);
      msg('Sending…'); var mode = t.dataset.acctSend;
      var p = mode === 'link' ? ensure(true).then(function (tk) { return tk ? http('PUT', '/auth/v1/user?redirect_to=' + encodeURIComponent(redirectTo()), { email: em }, tk) : { ok: false, offline: true }; })
                              : http('POST', '/auth/v1/otp?redirect_to=' + encodeURIComponent(redirectTo()), { email: em, create_user: false });
      p.then(function (r) { if (r.ok) msg('Check your email and tap the link to finish. You can keep playing.'); else msg(r.status === 429 ? 'Too many emails right now. Try again in an hour.' : (r.offline ? ERR.offline : 'Could not send. Check the address and try again.'), true); }); return; }
    if (t.hasAttribute('data-acct-syncnow')) { msg('Syncing…'); sync().then(function (ok) { loadAccount().then(renderProfile).then(function () { msg(ok ? 'All saved.' : 'Could not reach the cloud. Your progress is safe on this device.', !ok); }); }); return; }
    if (t.hasAttribute('data-acct-signout')) { sync().then(function () { var tk = session && session.access_token; if (tk) http('POST', '/auth/v1/logout', {}, tk); session = null; acct = null; jset(LS_SESSION, null); jset(LS_CACHE, null); jset(LS_SYNC, {}); syncState = {}; lset('pt_acct', null); renderProfile(); renderHeader(); msg('Signed out. Your progress stays on this device.'); }); return; }
  }
  /* Magic-link / email-change return: #access_token=…&refresh_token=… (implicit flow). Previous guest progress stays local and merges in. */
  function readReturn() { var h = location.hash || ''; if (h.indexOf('access_token=') < 0) return false; var q = {}; h.slice(1).split('&').forEach(function (kv) { var i = kv.indexOf('='); if (i > 0) q[decodeURIComponent(kv.slice(0, i))] = decodeURIComponent(kv.slice(i + 1)); });
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    if (!q.access_token) return false; var prev = session && session.user && session.user.id;
    saveSession({ access_token: q.access_token, refresh_token: q.refresh_token, expires_in: +q.expires_in || 3600 }); lset('pt_acct', '1');
    return token().then(function (tk) { return http('GET', '/auth/v1/user', null, tk); }).then(function (r) { if (r.ok && r.data) { session.user = { id: r.data.id, is_anonymous: !!r.data.is_anonymous, email: r.data.email || null }; jset(LS_SESSION, session); }
      if (prev && session.user && prev !== session.user.id) { syncState = {}; jset(LS_SYNC, {}); } return true; }); }

  /* ---------------- public API ---------------- */
  var api = window.PTAccount = {
    _real: true, version: 1,
    /* Sync, no network: true while a paid/family Plus entitlement is active (derived server-side from entitlements). */
    isPremium: function () { var c = cache(), u = (acct && acct.premium_until) || c.p; return !!(u && Date.parse(u) > Date.now()); },
    /* Prices / checkout may be shown only to self-declared 13+ players. Unknown age = no upsell (kid-safe default). Premium players: no upsell. */
    canSeeUpsell: function () { var ab = (acct && acct.age_band) || cache().ab; return (ab === 'teen' || ab === 'adult') && !api.isPremium(); },
    ageBand: function () { return (acct && acct.age_band) || cache().ab || null; },
    setAgeBand: function (b) { return updateProfile({ age_band: b }); },
    profile: function () { return acct; },
    state: function () { return { signedIn: !!session, guest: acct ? acct.is_guest : null, premium: api.isPremium(), upsell: api.canSeeUpsell(), offline: isDown(), lastSync: lastSync }; },
    onChange: function (f) { if (typeof f === 'function') listeners.push(f); },
    sync: sync, ensureGuest: function () { return ensure(true); },
    /* votes (previews.js): signed-in RPC; creates the guest card only if the player already pressed Play on this device */
    rpc: function (fn, args) { return rpc(fn, args, !!(played || lget('pt_acct'))); },
    _merge: mergeSave, _mergeSite: mergeSite, _isClean: isClean
  };
  var ready = (readReturn() || Promise.resolve()).then(function () { return session ? token() : null; }).then(function () { if (!session) return null; return Promise.all([loadAccount(), sync()]); })
    .then(function () { if (!session && played) return ensure(true).then(function (t) { if (t) return Promise.all([loadAccount(), sync()]); }); })
    .then(function () { renderProfile(); renderHeader(); if (session) { wireLB(); wireMP(); } return api.state(); }, function () { return api.state(); });
  api.ready = ready;
  if (window.__ptAcctResolve) try { window.__ptAcctResolve(api); } catch (e) {}
  document.addEventListener('click', onClick, true);
  window.addEventListener('storage', function (e) { if (session && e.key && (e.key.indexOf('hexan:') === 0 || SITE_KEYS.indexOf(e.key) >= 0)) schedulePush(5000); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden' && session) sync(); });
  window.addEventListener('online', function () { down = false; lset(LS_DOWN, null); if (session) schedulePush(1000); });
  setInterval(function () { if (session && document.visibilityState === 'visible') sync(); }, 90000);
  renderHeader(); renderProfile();
})();
