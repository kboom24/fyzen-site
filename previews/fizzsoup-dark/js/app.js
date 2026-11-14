/* Theme toggle: yellow default, dark optional, localStorage only. */
(function(){
  var KEY='fs-theme';
  function current(){
    return document.documentElement.getAttribute('data-theme')==='dark' ? 'dark' : 'yellow';
  }
  function apply(t){
    if(t==='dark') document.documentElement.setAttribute('data-theme','dark');
    else document.documentElement.removeAttribute('data-theme');
    try{ localStorage.setItem(KEY, t==='dark'?'dark':'yellow'); }catch(e){}
    var b=document.querySelector('[data-theme-toggle]');
    if(b) b.setAttribute('aria-label', t==='dark' ? 'Switch to yellow theme' : 'Switch to dark theme');
    var meta=document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute('content', t==='dark' ? '#0B0D12' : '#FFD500');
  }
  document.querySelectorAll('[data-theme-toggle]').forEach(function(b){
    b.addEventListener('click', function(){ apply(current()==='dark' ? 'yellow' : 'dark'); });
  });
  apply(current());
})();

/* FizzSoup dark UI. Local only — no network. */
(function(){
  var $ = function(s, r){ return (r||document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };

  /* Drawer */
  $$('[data-drawer]').forEach(function(b){
    b.addEventListener('click', function(){ document.body.classList.toggle('nav-open'); });
  });
  document.addEventListener('keydown', function(e){
    if(e.key==='Escape'){ document.body.classList.remove('nav-open'); closeModal(); }
  });

  /* Coming soon modal */
  function openModal(){
    var m=$('[data-modal]'); if(!m) return;
    m.hidden=false;
    var c=$('[data-modal-close]', m); if(c) c.focus();
  }
  function closeModal(){
    var m=$('[data-modal]'); if(!m) return;
    m.hidden=true;
  }
  $$('[data-soon]').forEach(function(b){ b.addEventListener('click', function(e){ e.preventDefault(); openModal(); }); });
  $$('[data-modal-close]').forEach(function(b){ b.addEventListener('click', closeModal); });
  var modal=$('[data-modal]');
  if(modal) modal.addEventListener('click', function(e){ if(e.target===modal) closeModal(); });

  /* Hero carousel */
  var hero=$('[data-hero]');
  if(hero){
    var slides=$$('[data-hero-slide]', hero);
    var dots=$$('[data-hero-dot]', hero);
    var i=0, timer;
    function show(n){
      i=(n+slides.length)%slides.length;
      slides.forEach(function(s,k){ s.hidden=k!==i; });
      dots.forEach(function(d,k){ d.classList.toggle('is-on', k===i); });
    }
    function next(d){ show(i+(d||1)); restart(); }
    function restart(){
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      clearInterval(timer);
      timer=setInterval(function(){ show(i+1); }, 7000);
    }
    var prev=$('[data-hero-prev]', hero), nx=$('[data-hero-next]', hero);
    if(prev) prev.addEventListener('click', function(){ next(-1); });
    if(nx) nx.addEventListener('click', function(){ next(1); });
    dots.forEach(function(d,k){ d.addEventListener('click', function(){ show(k); restart(); }); });
    show(0); restart();
  }

  /* Favorites (this device only) */
  var KEY='fs-saved';
  function saved(){ try{ return JSON.parse(localStorage.getItem(KEY)||'[]'); }catch(e){ return []; } }
  function store(a){ localStorage.setItem(KEY, JSON.stringify(a)); }
  function isSaved(s){ return saved().indexOf(s)!==-1; }
  $$('[data-fav]').forEach(function(b){
    var s=b.getAttribute('data-fav');
    function sync(){
      var on=isSaved(s);
      b.setAttribute('aria-pressed', on?'true':'false');
      var lab=b.querySelector('[data-fav-label]');
      if(lab) lab.textContent=on?'Saved':'Favorite';
    }
    sync();
    b.addEventListener('click', function(){
      var a=saved();
      var x=a.indexOf(s);
      if(x>=0) a.splice(x,1); else a.push(s);
      store(a); sync();
    });
  });

  /* Share (local clipboard, no network) */
  $$('[data-share]').forEach(function(b){
    b.addEventListener('click', function(){
      var url=location.href;
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(url).then(function(){ b.classList.add('is-on'); }, function(){});
      }
    });
  });

  /* Game stage: play in place, no ads, no gate */
  $$('[data-stage]').forEach(function(stage){
    var src=stage.getAttribute('data-src');
    function play(){
      if(!src) return;
      var fr=stage.querySelector('iframe');
      if(!fr){
        fr=document.createElement('iframe');
        fr.title='Game';
        fr.allow='fullscreen; autoplay; gamepad';
        fr.setAttribute('allowfullscreen','');
        stage.appendChild(fr);
      }
      fr.src=src;
      stage.classList.add('is-playing');
    }
    $$('[data-play]', stage.parentNode.parentNode).forEach(function(b){ b.addEventListener('click', play); });
    var fab=stage.querySelector('[data-play]');
    if(fab) fab.addEventListener('click', play);
  });
  /* Play buttons outside the media column still work */
  $$('[data-play]').forEach(function(b){
    if(b._bound) return;
    b._bound=true;
  });

  /* Thumbnail switcher */
  $$('[data-thumbs]').forEach(function(row){
    var stage=$('[data-stage]');
    if(!stage) return;
    var art=stage.querySelector('.stage-art');
    $$('button', row).forEach(function(btn){
      btn.addEventListener('click', function(){
        if(stage.classList.contains('is-playing')) return;
        $$('button', row).forEach(function(x){ x.classList.remove('is-on'); });
        btn.classList.add('is-on');
        var img=btn.getAttribute('data-img');
        if(art&&img) art.src=img;
      });
    });
  });
})();
  /* Client-side search (no network) */
  (function(){
    var grid=document.querySelector('[data-search-grid]');
    if(!grid) return;
    var empty=document.querySelector('[data-search-empty]');
    var box=document.querySelector('#q');
    function run(){
      var q=(box && box.value || new URLSearchParams(location.search).get('q') || '').trim().toLowerCase();
      if(box && !box.value && q) box.value=q;
      var n=0;
      Array.prototype.forEach.call(grid.querySelectorAll('.gcard'), function(c){
        var ok=!q || (c.getAttribute('data-name')||'').indexOf(q)!==-1;
        c.hidden=!ok; if(ok) n++;
      });
      if(empty) empty.hidden=n>0;
    }
    if(box){ box.addEventListener('input', run); }
    run();
  })();
