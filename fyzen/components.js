/* Fytoon component behaviour v2: theme, drawer, saved list, recently played, search, engine filter,
   tabs, in-stage play, live FPS and fullscreen. Storage is local to this browser only (no network). */
(function(){
  var I=window.FZ_ICON, D=window.FZ_DATA||{games:[],types:[],newest:[]};
  var TYPE={}; D.types.forEach(function(t){TYPE[t.id]=t;});
  var store={get:function(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}},
             set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
  var FZ=window.FZ={};
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function $$(s){return Array.prototype.slice.call(document.querySelectorAll(s));}
  FZ.game=function(s){for(var i=0;i<D.games.length;i++)if(D.games[i].s===s)return D.games[i];return null;};
  FZ.type=function(g){return TYPE[g.types[0]]||{label:'',icon:'arcade',color:'#FF5A1F'};};
  function href(g){return 'game-'+g.page+'.html';}

  /* Theme */
  var root=document.documentElement;
  function applyTheme(t){root.setAttribute('data-theme',t);$$('[data-fz-theme]').forEach(function(b){b.setAttribute('aria-label',t==='dark'?'Switch to light theme':'Switch to dark theme');b.setAttribute('aria-pressed',t==='light');});}
  FZ.setTheme=function(t){applyTheme(t);store.set('fz-theme',t);};
  applyTheme(new URLSearchParams(location.search).get('theme')||store.get('fz-theme','dark'));

  /* Real art (tile/thumb from the catalog). */
  FZ.art=function(g,size){var src=size==='thumb'?g.thumb:g.tile;return '<img src="'+esc(src)+'" alt="" loading="lazy" decoding="async">';};
  FZ.card=function(g){
    var nw=D.newest.indexOf(g.s)>-1?'<span class="fz-badge fz-badge--new">New</span>':'';
    return '<article class="fz-card" data-fz-engine="'+esc(g.engine)+'" data-fz-types="'+esc(g.types.join(' '))+'"><a class="fz-card-link" href="'+href(g)+'" aria-label="Play '+esc(g.name)+'"></a>'+
      '<div class="fz-thumb">'+FZ.art(g)+'<div class="fz-tl"><span class="fz-badge fz-badge--engine">'+esc(g.engine)+'</span>'+nw+'</div>'+
      '<div class="fz-tr"><button class="fz-icon-btn fz-bookmark" type="button" data-fz-bookmark="'+esc(g.s)+'" aria-pressed="false" aria-label="Add to Saved">'+I('bookmark')+'</button></div></div>'+
      '<div class="fz-card-body"><h3 class="fz-card-title">'+esc(g.name)+'</h3><div class="fz-card-meta"><span>'+esc(g.kind)+'</span><span class="fz-card-cat">'+esc(FZ.type(g).label)+'</span></div></div></article>';};
  FZ.spot=function(g){
    return '<article class="fz-spot">'+FZ.art(g)+'<div class="fz-spot-tags"><span class="fz-badge fz-badge--featured">Featured</span><span class="fz-eng">'+esc(g.engine)+'</span></div>'+
      '<h3 class="fz-spot-title">'+esc(g.name)+'</h3><p class="fz-spot-desc">'+esc(g.desc)+'</p>'+
      '<div class="fz-spot-foot"><span class="fz-spot-kind">'+esc(g.kind)+' · '+esc(FZ.type(g).label)+'</span><a class="fz-btn fz-btn--dark" href="'+href(g)+'">'+I('play')+'Play</a></div></article>';};
  FZ.resume=function(g){return '<a class="fz-resume" href="'+href(g)+'"><div class="fz-thumb">'+FZ.art(g,'thumb')+'</div><div><b>'+esc(g.name)+'</b><small>Resume</small></div></a>';};
  FZ.rec=function(g){return '<a class="fz-rec" href="'+href(g)+'"><div class="fz-thumb">'+FZ.art(g,'thumb')+'</div><div><b>'+esc(g.name)+'</b><small>'+esc(g.engine)+' · '+esc(FZ.type(g).label)+'</small></div></a>';};

  /* Saved + recently played (this device only) */
  function saved(){return store.get('fz-saved',[]).filter(FZ.game);}
  function recent(){return store.get('fz-recent',[]).filter(FZ.game);}
  FZ.markPlayed=function(s){var l=recent().filter(function(x){return x!==s;});l.unshift(s);store.set('fz-recent',l.slice(0,24));};
  function renderSaved(){var n=saved().length;$$('[data-fz-saved-count]').forEach(function(e){e.textContent=n;});
    $$('[data-fz-recent-count]').forEach(function(e){e.textContent=recent().length;});
    $$('[data-fz-bookmark]').forEach(function(b){var on=saved().indexOf(b.getAttribute('data-fz-bookmark'))>-1;b.setAttribute('aria-pressed',on);b.setAttribute('aria-label',(on?'Remove from':'Add to')+' Saved');});}
  FZ.toggleSaved=function(s){var l=saved(),i=l.indexOf(s);if(i>-1)l.splice(i,1);else l.push(s);store.set('fz-saved',l);renderLocal();renderSaved();};
  function renderLocal(){
    $$('[data-fz-local]').forEach(function(el){var src=el.getAttribute('data-fz-local'),kind=el.getAttribute('data-fz-kind')||'card';
      var list=(src==='saved'?saved():recent()).map(FZ.game);el.innerHTML=list.map(FZ[kind]).join('');
      var s=el.closest('.fz-local-sec');if(s)s.hidden=!list.length;
      $$('[data-fz-empty="'+src+'"]').forEach(function(e){e.hidden=!!list.length;});});
  }

  /* design-system.html showcase slots */
  function fill(){
    $$('[data-fz-render]').forEach(function(el){
      var kind=el.getAttribute('data-fz-render'), ids=(el.getAttribute('data-fz-games')||'').split(/\s+/).filter(Boolean);
      var list=ids.length?ids.map(FZ.game).filter(Boolean):D.games.slice(0,+(el.getAttribute('data-fz-limit')||D.games.length));
      el.innerHTML=list.map(function(g){return FZ[kind](g);}).join('');
    });
  }

  /* Search (static catalog, client-side) */
  function search(){var el=document.querySelector('[data-fz-search]');if(!el)return;
    var q=(new URLSearchParams(location.search).get('q')||'').trim(),inp=document.querySelector('.fz-search input');if(inp)inp.value=q;
    var sum=document.querySelector('[data-fz-search-sum]');if(!q){el.innerHTML=D.games.map(FZ.card).join('');if(sum)sum.textContent='Type in the search bar to find a game by name, type or engine. Showing every game.';return;}
    var words=q.toLowerCase().split(/\s+/);
    var hits=D.games.filter(function(g){var hay=[g.name,g.kind,g.desc,g.engine,g.types.map(function(t){return (TYPE[t]||{}).label;}).join(' '),(g.syn||[]).join(' ')].join(' ').toLowerCase();
      return words.every(function(w){return hay.indexOf(w)>-1;});});
    el.innerHTML=hits.map(FZ.card).join('');if(sum)sum.textContent=hits.length+(hits.length===1?' game matches':' games match')+' "'+q+'".';
    $$('[data-fz-empty="search"]').forEach(function(e){e.hidden=!!hits.length;});}

  /* Engine filter chips: filter the grids on this page; on pages without a grid, open home filtered. */
  function applyEngine(f){
    $$('.fz-chip[data-fz-filter]').forEach(function(c){c.setAttribute('aria-pressed',c.getAttribute('data-fz-filter')===f);});
    $$('.fz-grid .fz-card,.fz-row .fz-card').forEach(function(c){c.hidden=!!f&&c.getAttribute('data-fz-engine')!==f;});
    $$('.fz-grid').forEach(function(g){var sec=g.closest('section');var c=sec&&sec.querySelector('[data-fz-dir-count]');if(c){var n=g.querySelectorAll('.fz-card:not([hidden])').length;c.textContent=n+(n===1?' Game':' Games');}});
  }

  /* Game stage: in-stage play, live FPS, load time, fullscreen */
  function play(stage){var card=stage.closest('[data-fz-stage]'),s=card.getAttribute('data-fz-stage');if(stage.classList.contains('is-playing'))return;
    var g=FZ.game(s),t0=performance.now(),fr=document.createElement('iframe');
    fr.src=s+'/index.html';fr.title=g?g.name:s;fr.allow='fullscreen; autoplay; gamepad';fr.setAttribute('allowfullscreen','');
    stage.classList.add('is-playing');stage.appendChild(fr);FZ.markPlayed(s);renderSaved();
    fr.addEventListener('load',function(){var ms=Math.round(performance.now()-t0);$$('[data-fz-load]').forEach(function(e){e.textContent=(ms/1000).toFixed(1)+' s';});
      try{fr.contentWindow.focus();}catch(e){}
      var w=fr.contentWindow,n=0,last=performance.now();
      function tick(now){n++;if(now-last>=1000){var fps=Math.round(n*1000/(now-last));n=0;last=now;
        $$('[data-fz-fps]').forEach(function(e){e.textContent=fps;});$$('[data-fz-fps-badge]').forEach(function(e){e.textContent=fps+' FPS';});}
        try{w.requestAnimationFrame(tick);}catch(e){}}
      try{w.requestAnimationFrame(tick);}catch(e){}});
  }

  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-fz-bookmark]'); if(b){e.preventDefault();e.stopPropagation();FZ.toggleSaved(b.getAttribute('data-fz-bookmark'));return;}
    if(e.target.closest('[data-fz-theme]')){FZ.setTheme(root.getAttribute('data-theme')==='dark'?'light':'dark');return;}
    if(e.target.closest('[data-fz-drawer]')){var o=document.body.classList.toggle('fz-drawer-open');$$('[data-fz-drawer]').forEach(function(x){x.setAttribute('aria-expanded',o);});return;}
    var p=e.target.closest('[data-fz-play]'); if(p){play(p.closest('.fz-stage'));return;}
    if(e.target.closest('[data-fz-fullscreen]')){var card=document.querySelector('[data-fz-stage]'),st=card.querySelector('.fz-stage');if(!st.classList.contains('is-playing'))play(st);
      if(document.fullscreenElement)document.exitFullscreen();else if(card.requestFullscreen)card.requestFullscreen().catch(function(){});return;}
    var sh=e.target.closest('[data-fz-share]'); if(sh){var u=location.href.split('#')[0];
      if(navigator.share){navigator.share({title:document.title,url:u}).catch(function(){});}
      else if(navigator.clipboard){navigator.clipboard.writeText(u).then(function(){var l=sh.querySelector('span');if(l){l.textContent='Link copied';setTimeout(function(){l.textContent='Share';},1600);}}).catch(function(){});}
      return;}
    if(e.target.closest('[data-fz-clear]')){store.set('fz-recent',[]);if(e.target.closest('[data-fz-clear]').textContent.indexOf('saved')>-1)store.set('fz-saved',[]);renderLocal();renderSaved();return;}
    var tab=e.target.closest('[role="tab"]'); if(tab){var list=tab.closest('[role="tablist"]');
      list.querySelectorAll('[role="tab"]').forEach(function(t){var on=t===tab;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;var pn=document.getElementById(t.getAttribute('aria-controls'));if(pn)pn.hidden=!on;});return;}
    var chip=e.target.closest('.fz-chip[data-fz-filter]'); if(chip){var on=chip.getAttribute('aria-pressed')!=='true',f=on?chip.getAttribute('data-fz-filter'):'';
      if(!document.querySelector('.fz-grid .fz-card')){location.href='index.html?engine='+encodeURIComponent(f)+'#directory';return;}
      applyEngine(f);}
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')document.body.classList.remove('fz-drawer-open');
    if(e.key==='/'&&document.activeElement.tagName!=='INPUT'){var s=document.querySelector('.fz-search input');if(s){e.preventDefault();s.focus();}}});

  fill(); renderLocal(); search(); renderSaved();
  var eng=new URLSearchParams(location.search).get('engine'); if(eng)applyEngine(eng);
})();
