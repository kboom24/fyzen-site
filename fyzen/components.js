/* Fyzen component behaviour v1: theme toggle, drawer, saved list, tabs, chips, card rendering.
   Storage is local to this browser only (no network). */
(function(){
  var I=window.FZ_ICON, D=window.FZ_DATA||{games:[],types:[]};
  var TYPE={}; D.types.forEach(function(t){TYPE[t.id]=t;});
  var store={get:function(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}},
             set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
  var FZ=window.FZ={};
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  FZ.game=function(s){for(var i=0;i<D.games.length;i++)if(D.games[i].s===s)return D.games[i];return null;};
  FZ.type=function(g){return TYPE[g.types[0]]||{label:'',icon:'arcade',color:'#FF5A1F'};};

  /* Theme */
  var root=document.documentElement;
  function applyTheme(t){root.setAttribute('data-theme',t);document.querySelectorAll('[data-fz-theme]').forEach(function(b){b.setAttribute('aria-label',t==='dark'?'Switch to light theme':'Switch to dark theme');b.setAttribute('aria-pressed',t==='light');});}
  FZ.setTheme=function(t){applyTheme(t);store.set('fz-theme',t);};
  var q=new URLSearchParams(location.search).get('theme');
  applyTheme(q||store.get('fz-theme','dark'));

  /* Saved (bookmarks) */
  function saved(){return store.get('fz-saved',[]);}
  function renderSaved(){var n=saved().length;document.querySelectorAll('[data-fz-saved-count]').forEach(function(e){e.textContent=n;});document.querySelectorAll('[data-fz-dir-total]').forEach(function(){});
    document.querySelectorAll('[data-fz-bookmark]').forEach(function(b){var on=saved().indexOf(b.getAttribute('data-fz-bookmark'))>-1;b.setAttribute('aria-pressed',on);b.setAttribute('aria-label',(on?'Remove from':'Add to')+' Saved');});}
  FZ.toggleSaved=function(s){var l=saved(),i=l.indexOf(s);if(i>-1)l.splice(i,1);else l.push(s);store.set('fz-saved',l);renderSaved();};

  /* Art: real art when the repo has it, otherwise a category-coloured placeholder (never fake screenshots). */
  FZ.art=function(g,note){var t=FZ.type(g);
    if(g.art)return '<img src="'+esc(g.art)+'" alt="" loading="lazy" decoding="async">';
    return '<div class="fz-art" style="--cat:'+t.color+'">'+I(t.icon)+(note?'<span class="fz-art-note">Art pending</span>':'')+'</div>';};

  var STAR=function(){return '<span class="fz-rating" data-empty title="No ratings yet">'+I('star')+'—</span>';};
  FZ.card=function(g){
    return '<article class="fz-card" data-fz-engine="'+esc(g.engine)+'" data-fz-types="'+esc(g.types.join(' '))+'">'+
      '<div class="fz-thumb">'+FZ.art(g,true)+
        '<div class="fz-tl"><span class="fz-badge fz-badge--engine">'+esc(g.engine)+'</span></div>'+
        '<div class="fz-tr"><button class="fz-icon-btn fz-bookmark" type="button" data-fz-bookmark="'+esc(g.s)+'" aria-pressed="false" aria-label="Add to Saved">'+I('bookmark')+'</button></div>'+
      '</div>'+
      '<div class="fz-card-body"><h3 class="fz-card-title"><a href="game-'+esc(g.page)+'">'+esc(g.name)+'</a></h3>'+
        '<div class="fz-card-meta">'+STAR()+'<span class="fz-plays" title="Play counts not tracked yet">—</span></div>'+
      '</div></article>';};

  FZ.spot=function(g){
    return '<article class="fz-spot">'+FZ.art(g)+
      '<div class="fz-spot-tags"><span class="fz-badge fz-badge--featured">Featured</span><span class="fz-eng">'+esc(g.engine)+'</span></div>'+
      '<h3 class="fz-spot-title">'+esc(g.name)+'</h3><p class="fz-spot-desc">'+esc(g.desc)+'</p>'+
      '<div class="fz-spot-foot"><span class="fz-rating" data-empty title="No ratings yet">'+I('star')+'— <span style="opacity:.6">(—)</span></span>'+
      '<a class="fz-btn fz-btn--dark" href="game-'+esc(g.page)+'">'+I('play')+'Play</a></div></article>';};

  FZ.resume=function(g){return '<a class="fz-resume" href="game-'+esc(g.page)+'"><div class="fz-thumb">'+FZ.art(g)+'</div><div><b>'+esc(g.name)+'</b><small>Resume</small></div></a>';};

  FZ.rec=function(g){return '<a class="fz-rec" href="game-'+esc(g.page)+'"><div class="fz-thumb">'+FZ.art(g)+'</div><div><b>'+esc(g.name)+'</b>'+STAR()+'</div></a>';};

  /* Fill [data-fz-render] slots */
  function fill(){
    document.querySelectorAll('[data-fz-render]').forEach(function(el){
      var kind=el.getAttribute('data-fz-render'), ids=(el.getAttribute('data-fz-games')||'').split(/\s+/).filter(Boolean);
      var list=ids.length?ids.map(FZ.game).filter(Boolean):D.games.slice(0,+(el.getAttribute('data-fz-limit')||D.games.length));
      var html=list.map(function(g){return FZ[kind](g,el.getAttribute('data-fz-sub'));});el.innerHTML=html.join('');
    });
  }

  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-fz-bookmark]'); if(b){e.preventDefault();e.stopPropagation();FZ.toggleSaved(b.getAttribute('data-fz-bookmark'));return;}
    if(e.target.closest('[data-fz-theme]')){FZ.setTheme(root.getAttribute('data-theme')==='dark'?'light':'dark');return;}
    if(e.target.closest('[data-fz-drawer]')){var o=document.body.classList.toggle('fz-drawer-open');document.querySelectorAll('[data-fz-drawer]').forEach(function(x){x.setAttribute('aria-expanded',o);});return;}
    var tab=e.target.closest('[role="tab"]'); if(tab){var list=tab.closest('[role="tablist"]');
      list.querySelectorAll('[role="tab"]').forEach(function(t){var on=t===tab;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;var p=document.getElementById(t.getAttribute('aria-controls'));if(p)p.hidden=!on;});return;}
    var chip=e.target.closest('.fz-chip[data-fz-filter]'); if(chip){var on=chip.getAttribute('aria-pressed')!=='true';
      chip.parentNode.querySelectorAll('.fz-chip').forEach(function(c){c.setAttribute('aria-pressed','false');});chip.setAttribute('aria-pressed',on);
      var f=on?chip.getAttribute('data-fz-filter'):'';document.querySelectorAll('.fz-grid .fz-card').forEach(function(c){c.hidden=!!f&&c.getAttribute('data-fz-engine')!==f;});
      var c=document.querySelector('[data-fz-dir-count]');if(c)var n=document.querySelectorAll('.fz-grid .fz-card:not([hidden])').length;c.textContent=n+(n===1?' Game':' Games');}
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')document.body.classList.remove('fz-drawer-open');
    if(e.key==='/'&&document.activeElement.tagName!=='INPUT'){var s=document.querySelector('.fz-search input');if(s){e.preventDefault();s.focus();}}});

  fill(); renderSaved();
})();
