/* Mascot tips, corner-peek dismissal, shop filters, home row arrows, game-load overlay.
   Does not touch the thumbnail hover module in app.js. */
(function(){
  var $ = function(s, r){ return (r||document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };

  /* Daily tip — honest, real site behavior only. Same tip all day. */
  var TIPS = [
    'tap the heart on a game to keep it in Favorites.',
    'switch between yellow and dark with the sun and moon button.',
    'search for a game by name in the bar at the top.',
    'Favorites stay on this device — nothing is sent anywhere.',
    'games play in your browser. There is no download.',
    'swipe a category row, or use the arrows, to see every game in it.'
  ];
  function tipIndex(){
    var d = new Date();
    var day = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.floor(day / 86400000) % TIPS.length;
  }
  var tip = TIPS[tipIndex()];
  $$('[data-daily-tip]').forEach(function(el){
    var kind = el.getAttribute('data-daily-tip') || 'daily';
    var label = kind === 'short' ? 'Tip: ' : 'Daily tip: ';
    var b = el.querySelector('b');
    var text = document.createTextNode(label + tip);
    /* keep the heading, replace the rest */
    Array.prototype.slice.call(el.childNodes).forEach(function(n){
      if (n !== b) el.removeChild(n);
    });
    el.appendChild(text);
  });

  /* Phone corner peek: closable, remembered in localStorage */
  var PEEK_KEY = 'fs-corner-peek-dismissed';
  var corner = $('[data-corner-peek]');
  if (corner){
    try{
      if (localStorage.getItem(PEEK_KEY) === '1') corner.classList.add('is-dismissed');
    }catch(e){}
    var closer = $('[data-corner-close]', corner);
    if (closer){
      closer.addEventListener('click', function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        corner.classList.add('is-dismissed');
        try{ localStorage.setItem(PEEK_KEY, '1'); }catch(e){}
      });
    }
  }

  /* Shop category chips — actually filter sections */
  var chips = $$('[data-shop-filter]');
  if (chips.length){
    var sections = $$('[data-shop-section]');
    chips.forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = btn.getAttribute('data-shop-filter');
        chips.forEach(function(c){ c.classList.toggle('is-on', c === btn); });
        sections.forEach(function(sec){
          var show = (id === 'all' || sec.getAttribute('data-shop-section') === id);
          sec.hidden = !show;
        });
      });
    });
  }

  /* Horizontal category rows: desktop arrows, swipe already works via overflow */
  function updateArrows(wrap){
    var row = $('.row', wrap);
    if (!row) return;
    var prev = $('[data-row-prev]', wrap);
    var next = $('[data-row-next]', wrap);
    var max = row.scrollWidth - row.clientWidth - 2;
    var overflow = max > 4;
    wrap.classList.toggle('has-overflow', overflow);
    if (prev) prev.hidden = !overflow || row.scrollLeft <= 2;
    if (next) next.hidden = !overflow || row.scrollLeft >= max;
  }
  $$('[data-row]').forEach(function(wrap){
    var row = $('.row', wrap);
    if (!row) return;
    var step = function(){ return Math.max(row.clientWidth * 0.8, 200); };
    var prev = $('[data-row-prev]', wrap);
    var next = $('[data-row-next]', wrap);
    if (prev) prev.addEventListener('click', function(){ row.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function(){ row.scrollBy({ left: step(), behavior: 'smooth' }); });
    row.addEventListener('scroll', function(){ updateArrows(wrap); }, { passive: true });
    updateArrows(wrap);
    window.addEventListener('resize', function(){ updateArrows(wrap); });
  });

  /* Game-page loading overlay (listens alongside app.js, does not replace it) */
  function bindLoad(stage){
    var overlay = $('[data-stage-load]', stage);
    if (!overlay) return;
    function show(){
      stage.classList.add('is-loading');
      var fr = stage.querySelector('iframe');
      if (!fr) return;
      var hide = function(){ stage.classList.remove('is-loading'); };
      fr.addEventListener('load', function(){ setTimeout(hide, 280); }, { once: true });
      setTimeout(hide, 8000);
    }
    var root = stage.parentNode && stage.parentNode.parentNode ? stage.parentNode.parentNode : document;
    $$('[data-play]', root).forEach(function(b){
      b.addEventListener('click', show);
    });
  }
  $$('[data-stage]').forEach(bindLoad);
})();
