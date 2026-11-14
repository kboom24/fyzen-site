/* FizzSoup homepage v2 client. Local-only data: recently played, play counts, play days, favorites, bigger text.
   Popularity is pluggable: window.PT_STATS (assets/js/stats.js) or PTX.setStats({source,updated,plays:{slug:count}}).
   HOME-CATALOG: a successful site_config() replaces games.js/catalog.js for browse and play. Featured is still only an enabled home row. */
(function(){
  'use strict';
  var CAT=window.PT_CAT||{games:[],types:[],soon:[],icons:{}}, LIVE=window.PT_GAMES||{};
  var STATS=window.PT_STATS||{source:'none',plays:{}};
  var G={}; CAT.games.forEach(function(g){G[g.s]=g;});
  var isLive=function(s){return !!(LIVE[s]&&LIVE[s].live);};
  /* Park a direct game landing before app.js can start Play. The static page embeds
     <iframe src="…/index.html"> above these scripts, so the game will boot unless this
     runs first. Fresh site_config() is what releases the frame; a stale session snapshot
     must not turn a hidden game back on. */
  function pageEngineSlug(){
    var gp=document.querySelector('[data-gamepage]');
    if(gp&&gp.getAttribute('data-gamepage')) return gp.getAttribute('data-gamepage');
    var path=(location.pathname.split('/').pop()||'').replace(/\.html$/,'').toLowerCase();
    var m=/^game-([a-z0-9-]+)$/.exec(path); if(!m) return null;
    var page=m[1]; if(LIVE[page]) return page;
    for(var k in LIVE){ if(LIVE[k]&&LIVE[k].page===page) return k; }
    return page;
  }
  function holdGameFrame(){
    var s=pageEngineSlug(); if(!s) return;
    var f=document.getElementById('frame'); if(!f) return;
    var ifr=f.querySelector('iframe.gframe, iframe');
    var src=ifr?(ifr.getAttribute('src')||''):'';
    window.__ptFrameHold={slug:s, src:src, wasLive:!!(LIVE[s]&&LIVE[s].live)};
    if(ifr){ try{ ifr.removeAttribute('src'); ifr.src='about:blank'; }catch(e){} }
    if(LIVE[s]) LIVE[s].live=false;
    f.classList.remove('is-immersive');
    document.documentElement.classList.remove('pt-immersive');
    document.documentElement.setAttribute('data-pt-hold','1');
    f.__ptEnter=null; f.__ptImm=0;
  }
  var I=CAT.icons||{};
  var esc=function(s){return String(s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});};
  /* ---------- storage (safe) ---------- */
  var mem={};
  function get(k,d){ try{ var v=localStorage.getItem(k); return v==null?d:JSON.parse(v); }catch(_){ return k in mem?mem[k]:d; } }
  function set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(_){ mem[k]=v; } }
  function dkey(d){ d=d||new Date(); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
  function recent(){ return get('pt_recent',[]).filter(function(r){return r&&G[r.s];}); }
  function plays(){ return get('pt_plays',{}); }
  function days(){ return get('pt_days',[]); }
  function favs(){ return get('pt_favs',[]).filter(function(s){return G[s];}); }
  function recordPlay(s){ if(!G[s]) return;
    var r=recent().filter(function(x){return x.s!==s;}); r.unshift({s:s,t:Date.now()}); set('pt_recent',r.slice(0,30));
    var p=plays(); p[s]=(p[s]||0)+1; set('pt_plays',p);
    var d=days(), k=dkey(); if(d.indexOf(k)<0){ d.push(k); set('pt_days',d.slice(-90)); } }
  function streak(){ var d=days(); if(!d.length) return 0; var set_={}; d.forEach(function(x){set_[x]=1;});
    var c=new Date(), n=0; if(!set_[dkey(c)]) c.setDate(c.getDate()-1);
    while(set_[dkey(c)]){ n++; c.setDate(c.getDate()-1); } return n; }
  function playedToday(s){ var r=recent(); var k=dkey(); return r.some(function(x){return x.s===s&&dkey(new Date(x.t))===k;}); }
  function isFav(s){ return favs().indexOf(s)>=0; }
  function toggleFav(s){ var f=favs(), i=f.indexOf(s); if(i>=0) f.splice(i,1); else f.unshift(s); set('pt_favs',f); return i<0; }
  /* ---------- popularity, Game of the day ---------- */
  function liveSlugs(){ return CAT.games.filter(function(g){return isLive(g.s);}).map(function(g){return g.s;}); }
  function score(s){ var gp=STATS.plays||{}, max=1; for(var k in gp) if(gp[k]>max) max=gp[k];
    var base=(gp[s]||0)/max;                         /* 0..1 global popularity (editorial prior or real counts) */
    var lp=Math.min(plays()[s]||0,20);               /* this device's own play history */
    return base*(1+0.08*lp)+0.01*lp; }
  function ranked(){ return liveSlugs().sort(function(a,b){ return score(b)-score(a) || G[a].order-G[b].order; }); }
  function hash(str){ var h=2166136261; for(var i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
  function rng(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0; var t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
  function pickFor(date,exclude){ var hold=STATS.gotdHold||[];
    var pool=liveSlugs().filter(function(s){return hold.indexOf(s)<0 && s!==exclude;}); if(!pool.length) pool=liveSlugs();
    pool.sort(function(a,b){return G[a].order-G[b].order;});
    var w=pool.map(function(s){ var v=score(s); return v*v+0.0001; });   /* squared: strongly favours the most popular */
    var tot=w.reduce(function(a,b){return a+b;},0), r=rng(hash('gotd:'+dkey(date)))()*tot;
    for(var i=0;i<pool.length;i++){ r-=w[i]; if(r<=0) return pool[i]; } return pool[pool.length-1]; }
  var ANCHOR=new Date(2026,9,1,12);  /* chain starts here so "never the same game two days running" holds for every day */
  function gotd(date){ date=new Date(date||new Date()); date.setHours(12,0,0,0);
    var d=new Date(ANCHOR), prev=null, guard=0;
    if(date<ANCHOR) return pickFor(date,null);
    while(d<=date && guard++<20000){ prev=pickFor(d,prev); d.setDate(d.getDate()+1); }
    return prev; }
  /* ---------- search ---------- */
  function norm(s){ return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’'".,!?]/g,'').trim(); }
  function lev1(a,b){ if(a===b) return true; if(Math.abs(a.length-b.length)>1) return false;
    var i=0,j=0,ed=0; while(i<a.length&&j<b.length){ if(a[i]===b[j]){i++;j++;continue;} if(++ed>1) return false;
      if(a.length>b.length) i++; else if(b.length>a.length) j++; else {i++;j++;} } return ed+(a.length-i)+(b.length-j)<=1; }
  function typeLabels(g){ return g.types.map(function(t){ var x=CAT.types.filter(function(y){return y.id===t;})[0]; return x?x.label:''; }); }
  function words(s){ return norm(s).split(/[^a-z0-9]+/).filter(Boolean); }
  function scoreItem(q,name,kind,types,syn,tag){
    var nq=norm(q); if(!nq) return 0; var s=0, nn=norm(name);
    if(nn===nq) s+=100; else if(nn.indexOf(nq)===0) s+=70; else if(nn.indexOf(nq)>=0) s+=50;
    var qw=words(nq), nw=words(name), kw=words(kind+' '+types.join(' ')), sw=syn.map(norm), tw=words(tag||'');
    if(sw.indexOf(nq)>=0) s+=60;
    qw.forEach(function(w){ var hit=0;
      if(nw.some(function(x){return x.indexOf(w)===0;})) hit=Math.max(hit,40);
      if(kw.some(function(x){return x===w||(w.length>=3&&x.indexOf(w)===0)||(w.length>3&&x===w.replace(/s$/,''));})) hit=Math.max(hit,35);
      if(sw.some(function(x){return x===w||x===w.replace(/e?s$/,'')||(w.length>=3&&x.indexOf(w)===0);})) hit=Math.max(hit,35);
      if(!hit&&w.length>=4&&nw.concat(kw,sw).some(function(x){return x.length>=4&&lev1(x,w);})) hit=20;
      if(!hit&&w.length>=4&&tw.some(function(x){return x===w||x===w.replace(/s$/,'');})) hit=10;
      s+=hit; });
    return s; }
  function search(q){ var res=[];
    CAT.games.forEach(function(g){ if(!isLive(g.s)) return; var v=scoreItem(q,g.name,g.kind,typeLabels(g),g.syn,g.tag); if(v>0) res.push({s:g.s,v:v+score(g.s)}); });
    CAT.soon.forEach(function(x){ var v=scoreItem(q,x.name,'',['racing'],x.syn,''); if(v>=35) res.push({s:x.id,v:v*0.2,soon:1}); });
    res.sort(function(a,b){return b.v-a.v;});
    var types=CAT.types.filter(function(t){ var n=norm(q); return n&&(norm(t.label).indexOf(n)>=0||norm(t.short).indexOf(n)===0||res.some(function(r){return !r.soon&&G[r.s].types.indexOf(t.id)>=0&&r.v>=35;})); });
    return {hits:res,types:types}; }
  /* ---------- tile rendering (mirrors pages2.tile) ---------- */
  function popHTML(n,k){ return '<span class="hx-tile__pop" aria-hidden="true"><b>'+esc(n)+'</b><small>'+esc(k)+'</small></span>'; }
  function catL(s){ var g=G[s], t=g&&g.types&&g.types[0], x=CAT.types.filter(function(y){return y.id===t;})[0]; return x?x.label:''; }
  function popLive(s,n,sub){ return '<span class="hx-tile__pop" aria-hidden="true"><b>'+esc(n)+'</b><span class="hx-tile__st"><small>'+esc(sub||catL(s))+'</small><span class="hx-tile__nums" data-gs="'+s+'"></span></span></span>'; }
  function tileHTML(s,opt){ opt=opt||{};
    var sx=CAT.soon.filter(function(x){return x.id===s;})[0];
    if(sx) return '<div class="hx-tile hx-tile--soon" role="group" aria-label="'+esc(sx.name)+', coming soon" style="--c:'+sx.color+'"><span class="hx-tile__img hx-soonart">'+(I[sx.icon]||'')+'<b>Coming soon</b>'+popHTML(sx.name,'In the workshop')+'</span><span class="hx-tile__name">'+esc(sx.name)+'</span><span class="hx-tile__kind">In the workshop</span></div>';
    var g=G[s]; if(!g) return ''; var kind=opt.sub||g.kind;
    var b=(opt.badge!==false&&g.isNew)?'<span class="hx-badge">NEW</span>':'';
    var r=opt.rank?'<span class="hx-rank">#'+opt.rank+'</span>':'';
    var inner='<span class="hx-tile__img"><img src="'+g.tile+'" alt="" width="640" height="400" loading="lazy" decoding="async">'+b+r+'<span class="hx-tile__hover" aria-hidden="true">'+I.play+'<b>Play</b></span>'+(isLive(s)?popLive(s,g.name,opt.sub):popHTML(g.name,kind))+'</span><span class="hx-tile__name">'+esc(g.name)+'</span><span class="hx-tile__kind">'+esc(kind)+'</span>';
    var a=isLive(s)?'<a class="hx-tile__a" href="'+PT_GAME_HREF(s,'#play')+'" aria-label="Play '+esc(g.name)+', '+esc(kind)+'" data-prev="'+g.prev.join(' ')+'">'+inner+'</a>':'<div class="hx-tile__a" role="group" aria-label="'+esc(g.name)+', coming soon">'+inner+'</div>';
    return '<div class="hx-tile" data-slug="'+s+'">'+a+'<button class="hx-fav" type="button" data-fav="'+s+'" aria-pressed="false" aria-label="Add '+esc(g.name)+' to My games">'+I.heart+'</button></div>'; }
  function ago(t){ var d=new Date(t), now=new Date(); var k=dkey(d);
    if(k===dkey(now)) return 'Played today'; var y=new Date(now); y.setDate(y.getDate()-1); if(k===dkey(y)) return 'Played yesterday';
    var n=Math.round((new Date(dkey(now))-new Date(k))/864e5); return n<7?'Played '+n+' days ago':'Played '+d.toLocaleDateString('en-US',{month:'short',day:'numeric'}); }
  /* ---------- page wiring ---------- */
  var $=function(s,r){return (r||document).querySelector(s);}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
  function syncFavs(root){ var f=favs(); $$('[data-fav]',root).forEach(function(b){ var on=f.indexOf(b.dataset.fav)>=0, n=G[b.dataset.fav]?G[b.dataset.fav].name:'';
      b.setAttribute('aria-pressed',on?'true':'false');
      if(b.classList.contains('hx-fav')) b.setAttribute('aria-label',(on?'Remove ':'Add ')+n+(on?' from':' to')+' My games');
      else { b.style.color=on?'var(--magenta-500)':''; b.style.borderColor=on?'var(--magenta-500)':''; var p=b.querySelector('path'); if(p) p.setAttribute('fill',on?'currentColor':'none'); b.setAttribute('aria-label',(on?'Remove ':'Add ')+n+(on?' from':' to')+' My games'); } }); }
  document.addEventListener('click',function(e){
    var fb=e.target.closest&&e.target.closest('[data-fav]'); if(fb){ e.preventDefault(); toggleFav(fb.dataset.fav); syncFavs(); if($('[data-hx=favs]')) renderFavs(); renderGprog(); renderProfile(); syncFavs(); return; }
    var sp=e.target.closest&&e.target.closest('[data-surprise]'); if(sp){ e.preventDefault(); var L=liveSlugs(), last=get('pt_surprise_last',''); L=L.filter(function(s){return s!==last;}); var pick=L[Math.floor(Math.random()*L.length)]; set('pt_surprise_last',pick); location.href=PT_GAME_HREF(pick,'#play'); return; }
    var sc=e.target.closest&&e.target.closest('[data-scroll]'); if(sc){ var tr=sc.parentNode.querySelector('.hx-track'); tr.scrollBy({left:(+sc.dataset.scroll)*tr.clientWidth*0.9,behavior:'smooth'}); return; }
    var bt=e.target.closest&&e.target.closest('[data-bigtext]'); if(bt){ var on=!document.documentElement.classList.contains('hx-big'); document.documentElement.classList.toggle('hx-big',on); set('pt_bigtext',on?1:0); syncBig(); return; }
    var cr=e.target.closest&&e.target.closest('[data-clear-recent]'); if(cr){ set('pt_recent',[]); renderRecent(); return; }
  });
  function syncBig(){ var on=document.documentElement.classList.contains('hx-big'); $$('[data-bigtext]').forEach(function(b){ b.setAttribute('aria-pressed',on?'true':'false'); var l=b.querySelector('.hx-pill__l'); if(l) l.textContent=on?'Normal text':'Bigger text'; b.setAttribute('aria-label',on?'Switch to normal text size':'Make text bigger'); }); }
  function syncStreak(){ var n=streak(); $$('[data-streak]').forEach(function(el){ el.hidden=n<1; el.style.display=n<1?'none':''; }); $$('[data-streak-n]').forEach(function(el){ el.textContent=n; }); }
  function syncDaily(){ $$('[data-daily]').forEach(function(a){ var done=playedToday(a.dataset.daily), go=a.querySelector('[data-daily-go]'); a.classList.toggle('is-done',done); if(go) go.textContent=done?'✓ Played today':'Play'; });
  }
  function renderGotd(){ var box=$('[data-hx=gotd]'); if(!box) return; var s=gotd(), g=G[s]; if(!g) return;
    var types=typeLabels(g).filter(Boolean).filter(function(t){return norm(g.kind).indexOf(norm(t))<0;}).slice(0,1).join('');
    var dl=new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'});
    if(box.classList.contains('hx-tc')){ var a=document.createElement('a'); a.className='hx-tc hx-tc--gotd'; a.href=PT_GAME_HREF(s,'#play'); a.setAttribute('data-hx','gotd'); a.dataset.slug=s; a.setAttribute('aria-label','Game of the day: play '+g.name+', '+g.kind);
      a.innerHTML='<span class="hx-tc__img"><img src="'+g.thumb+'" alt="" width="64" height="64"><span class="hx-tc__go" aria-hidden="true">'+I.play+'</span></span><span class="hx-tc__t"><small class="hx-tc__k">'+I.star+'Game of the day</small><b>'+esc(g.name)+'</b><small>'+esc(g.kind)+'</small></span>';
      box.parentNode.replaceChild(a,box); return; }
    box.innerHTML='<a class="hx-gotd__a" href="'+PT_GAME_HREF(s,'#play')+'" aria-label="Game of the day: play '+esc(g.name)+', '+esc(g.kind)+'"><img class="hx-gotd__bg" src="'+g.wide+'" alt="" fetchpriority="high"><span class="hx-gotd__in"><span class="hx-eyebrow">'+I.star+'Game of the day · '+esc(dl)+'</span><span class="hx-gotd__t">'+esc(g.name)+'</span><span class="hx-gotd__k">'+esc(g.kind)+(types?'<span class="hx-d-only"> &nbsp;·&nbsp; '+esc(types)+'</span>':'')+'</span><span class="hx-gotd__d">'+esc(g.tag)+'</span><span class="hx-btn-play">'+I.play+'Play<span class="hx-d-only">&nbsp;now</span></span></span></a>';
    box.dataset.slug=s; }
  function renderContinue(){ var sec=$('[data-hx=continue]'); if(!sec) return; var r=recent().filter(function(x){return isLive(x.s);}).slice(0,10);
    sec.hidden=!r.length; if(!r.length) return;
    var fill=sec.querySelector('[data-hx-fill]'); fill.innerHTML=r.map(function(x,i){ return tileHTML(x.s,{badge:false,sub:ago(x.t)}).replace('class="hx-tile"','class="hx-tile'+(i>=4?' hx-m-hide':'')+'"'); }).join('');
    var row=sec.querySelector('.hx-row'); if(r.length<=5){ row.removeAttribute('data-many'); } else row.setAttribute('data-many','1'); syncArrows(); }
  /* HOME-CATALOG: site_config() v2 is the public catalog. After a successful fetch, live games and enabled
     home_rows replace the static games.js/catalog.js picture. Hidden and draft games are not merged back in.
     A failed fetch keeps the last good snapshot for this tab, or the static catalog if this tab has none.
     Featured still renders only for an enabled home row whose rule is "featured". */
  var HOME_ROWS=null;
  var LABEL_KEY={cp:'continue',mp:'popular',ng:'new','c-puzzle':'cat-puzzle','c-action':'cat-action','c-racing':'cat-racing','c-sports':'cat-sports','c-strategy':'cat-strategy','c-merge':'cat-merge','c-word':'cat-word','c-relax':'cat-relax'};
  function featFlag(v){ if(v===true||v===1||v==='true') return true; if(v===false||v===0||v==='false') return false; return null; }
  function isFeatured(g){ var f=featFlag(g.featured); if(f!==null) return f; var live=LIVE[g.s]; return featFlag(live&&live.featured)===true; }
  function featNum(v){ return typeof v==='number'&&isFinite(v)?v:null; }
  function featWeight(g){ var w=featNum(g.sort_weight); if(w==null) w=featNum(g.sortWeight); return w==null?0:w; }
  function featSeq(g){ var r=featNum(g.release_seq); if(r==null) r=featNum(g.releaseSeq); if(r==null) r=featNum(g.order); return r==null?0:r; }
  function rowKeyOk(k){ return typeof k==='string'&&/^[a-z0-9][a-z0-9-]{0,39}$/.test(k); }
  function slugOk(s){ return typeof s==='string'&&/^[a-z0-9][a-z0-9-]{0,39}$/.test(s); }
  function featuredList(){ return CAT.games.filter(function(g){ return isLive(g.s)&&isFeatured(g); }).sort(function(a,b){
      var w=featWeight(b)-featWeight(a); if(w) return w; var s=featSeq(b)-featSeq(a); if(s) return s; return (a.order||0)-(b.order||0); }); }
  function readSiteCache(){ try{ var c=JSON.parse(sessionStorage.getItem('pt_site_cfg_v2')||'null'); if(c&&Array.isArray(c.games)&&c.games.length&&Array.isArray(c.rows)) return c; }catch(e){} return null; }
  function writeSiteCache(cfg){ try{ sessionStorage.setItem('pt_site_cfg_v2', JSON.stringify({t:Date.now(), rows:cfg.rows, games:cfg.games})); }catch(e){} }
  function applyCatalogData(cfg){
    if(!cfg||!Array.isArray(cfg.games)||!cfg.games.length||!Array.isArray(cfg.rows)) return false;
    var live={}, n=0;
    cfg.games.forEach(function(g){ if(!g||!slugOk(g.slug)) return; live[g.slug]=g; n++; });
    if(!n) return false;
    var old={}; CAT.games.forEach(function(g){ old[g.s]=g; });
    Object.keys(live).forEach(function(s){ var g=live[s], prev=LIVE[s]||{};
      LIVE[s]={title:g.title||prev.title||s, page:g.page||prev.page||s, live:true, orientation:g.orientation||prev.orientation||'any'}; });
    Object.keys(LIVE).forEach(function(s){ if(!live[s]&&LIVE[s]) LIVE[s].live=false; });
    var next=[];
    Object.keys(live).forEach(function(s){ var g=live[s], o=old[s]||{};
      var types=Array.isArray(g.categories)?g.categories.slice():(g.category?[g.category]:(o.types||[]));
      next.push({s:s, name:g.title||o.name||s, kind:g.kind||o.kind||'', tag:g.tag||o.tag||'', types:types,
        tile:g.tile||o.tile||'', wide:g.wide||o.wide||'', thumb:g.thumb||o.thumb||'',
        prev:Array.isArray(g.prev)?g.prev:(o.prev||[]), daily:g.daily||o.daily||'',
        isNew:g.is_new!=null?!!g.is_new:!!o.isNew, syn:Array.isArray(g.synonyms)?g.synonyms:(o.syn||[]),
        order:typeof g.release_seq==='number'?g.release_seq:(o.order||0), featured:g.featured===true,
        sort_weight:typeof g.sort_weight==='number'?g.sort_weight:0,
        release_seq:typeof g.release_seq==='number'?g.release_seq:(o.release_seq||o.order||0),
        seo_title:g.seo_title||'', seo_description:g.seo_description||''}); });
    next.sort(function(a,b){ return (a.order||0)-(b.order||0); });
    CAT.games=next;
    Object.keys(G).forEach(function(k){ delete G[k]; });
    next.forEach(function(g){ G[g.s]=g; });
    HOME_ROWS=cfg.rows;
    window.PT_AUTH={ok:true, at:Date.now(), source:'site_config', n:next.length};
    return true;
  }
  function slugsForRow(row){ var cap=featNum(row.max_items); if(cap==null||cap<1) cap=24; if(cap>60) cap=60; var slugs;
    if(Array.isArray(row.games)) slugs=row.games.filter(function(s){ return slugOk(s)&&isLive(s)&&G[s]; });
    else if(row.rule==='featured') slugs=featuredList().map(function(g){ return g.s; });
    else return [];
    var seen={}, out=[]; slugs.forEach(function(s){ if(!seen[s]){ seen[s]=1; out.push(s); } }); return out.slice(0,cap); }
  function setRowTitle(sec, title){ var h2=sec.querySelector('h2'); if(!h2||!title) return; var ic=h2.querySelector('.hx-ic'), texts=[];
    for(var i=0;i<h2.childNodes.length;i++){ var n=h2.childNodes[i]; if(n.nodeType===3&&n.nodeValue.trim()) texts.push(n); }
    if(texts.length) texts[texts.length-1].nodeValue=title; else h2.appendChild(document.createTextNode(title)); }
  function wireSee(sec, row){ var href=null;
    if(row.rule==='category'&&row.rule_arg){ var ty=(CAT.types||[]).filter(function(t){ return t.id===row.rule_arg; })[0]; href=(ty&&ty.href)||('category-'+row.rule_arg+'.html'); }
    else if(row.rule==='popular'||row.key==='popular') href='popular.html';
    else if(row.rule==='newest'||row.key==='new') href='new.html';
    var els=[sec.querySelector('.hx-see'), sec.querySelector('.hx-m-all')];
    els.forEach(function(el){ if(!el) return; if(!href){ el.remove(); return; } var svg=el.querySelector('svg'); el.textContent='See all '; if(svg) el.appendChild(svg); el.setAttribute('href', href); }); }
  function fillRow(sec, slugs, ranked){ var track=sec.querySelector('.hx-track'); if(!track) return;
    track.innerHTML=slugs.map(function(s,i){ return tileHTML(s,{badge:false, rank:ranked?i+1:0}).replace('class="hx-tile"','class="hx-tile'+(i>=4?' hx-m-hide':'')+'"'); }).join('');
    var box=sec.querySelector('.hx-row'); if(!box) return;
    if(slugs.length>4) box.setAttribute('data-many','1'); else { box.removeAttribute('data-many'); var p=box.querySelector('.hx-arrow--prev'), n=box.querySelector('.hx-arrow--next'); if(p) p.hidden=true; if(n) n.hidden=true; } }
  function buildHomeRow(row){ var proto=document.querySelector('[data-home-key="popular"]')||document.querySelector('.hx-main > section.hx-sec:not(.hx-sec--cont)'); if(!proto) return null;
    var sec=proto.cloneNode(true); sec.classList.remove('hx-sec--cont'); if(row.rule==='featured') sec.classList.add('hx-sec--feat'); else sec.classList.remove('hx-sec--feat');
    sec.hidden=false; sec.removeAttribute('hidden'); sec.setAttribute('data-home-key', row.key);
    if(row.rule==='featured') sec.setAttribute('data-hx','featured'); else sec.removeAttribute('data-hx');
    var id='hr-'+row.key; sec.setAttribute('aria-labelledby', id);
    var h2=sec.querySelector('h2');
    if(h2){ h2.id=id; var ic=h2.querySelector('.hx-ic'); if(ic){ var col='#FFD23F', ty=null;
      if(row.rule==='category'&&row.rule_arg){ ty=(CAT.types||[]).filter(function(t){ return t.id===row.rule_arg; })[0]; if(ty&&ty.color) col=ty.color; if(ty&&I[ty.icon]) ic.innerHTML=I[ty.icon]; }
      else if(row.rule==='featured'&&I.star) ic.innerHTML=I.star;
      else if(row.rule==='newest'&&I.bolt) ic.innerHTML=I.bolt;
      ic.style.setProperty('--c', col); } }
    var track=sec.querySelector('.hx-track'); if(track){ track.innerHTML=''; track.removeAttribute('data-hx'); }
    var parent=document.querySelector('.hx-main'), end=document.querySelector('.hx-allg')||document.querySelector('.hx-foot');
    if(parent) parent.insertBefore(sec, end||null);
    return sec; }
  function syncHomeRows(){ if(!document.body.classList.contains('hx-home')||!HOME_ROWS) return;
    document.querySelectorAll('.hx-main > section.hx-sec').forEach(function(sec){ if(sec.getAttribute('data-home-key')) return; var id=sec.getAttribute('aria-labelledby')||''; if(LABEL_KEY[id]) sec.setAttribute('data-home-key', LABEL_KEY[id]); });
    var rows=HOME_ROWS.filter(function(r){ return r&&rowKeyOk(r.key)&&r.enabled!==false; });
    var want={}; rows.forEach(function(r){ want[r.rule==='recent'?'continue':r.key]=r; });
    document.querySelectorAll('.hx-main > section.hx-sec[data-home-key]').forEach(function(sec){ var k=sec.getAttribute('data-home-key'); if(!want[k]) sec.hidden=true; });
    rows.forEach(function(row){
      if(row.rule==='recent'||row.key==='continue'){ var cont=document.querySelector('[data-hx=continue]'); if(!cont) return; cont.setAttribute('data-home-key','continue'); setRowTitle(cont, row.title||'Continue playing'); renderContinue(); return; }
      if(row.rule==='daily') return;
      var slugs=slugsForRow(row), sec=document.querySelector('[data-home-key="'+row.key+'"]');
      if(!slugs.length){ if(sec){ sec.hidden=true; var tr=sec.querySelector('.hx-track'); if(tr) tr.innerHTML=''; } return; }
      if(!sec) sec=buildHomeRow(row); if(!sec) return;
      if(row.rule==='featured') sec.classList.add('hx-sec--feat');
      sec.hidden=false; setRowTitle(sec, row.title||row.key); wireSee(sec, row); fillRow(sec, slugs, row.rule==='popular'); });
    var parent=document.querySelector('.hx-main'), end=document.querySelector('.hx-allg')||document.querySelector('.hx-foot');
    if(!parent||!end) return;
    rows.forEach(function(row){ var key=(row.rule==='recent'||row.key==='continue')?'continue':row.key; var sec=document.querySelector('[data-home-key="'+key+'"]'); if(sec&&sec.parentNode===parent) parent.insertBefore(sec, end); });
  }
  function pageName(){ var path=(location.pathname.split('/').pop()||'index').replace(/\.html$/,'').toLowerCase(); return path||'index'; }
  function rebuildSimpleGrid(list){ var grid=document.querySelector('.hx-main .hx-grid'); if(!grid) return; grid.innerHTML=list.map(function(g){ return tileHTML(g.s); }).join(''); }
  function rebuildDirectory(){ if(!window.PT_AUTH||!window.PT_AUTH.ok) return; var name=pageName();
    if(name==='all-games'){ var letters={};
      CAT.games.filter(function(g){ return isLive(g.s); }).slice().sort(function(a,b){ return a.name.localeCompare(b.name); }).forEach(function(g){ var L=(g.name.charAt(0)||'#').toUpperCase(); if(!/[A-Z]/.test(L)) L='#'; (letters[L]=letters[L]||[]).push(g); });
      document.querySelectorAll('.hx-letter').forEach(function(sec){ var id=(sec.getAttribute('aria-labelledby')||'').replace(/^l-/,''); var list=letters[id]||[], grid=sec.querySelector('.hx-grid'); if(!grid) return; sec.hidden=!list.length; if(list.length) grid.innerHTML=list.map(function(g){ return tileHTML(g.s); }).join(''); });
      document.querySelectorAll('.hx-jump a').forEach(function(a){ var L=(a.getAttribute('href')||'').replace(/^#l-/,''); a.hidden=!(letters[L]&&letters[L].length); });
      return; }
    if(name==='new'){ rebuildSimpleGrid(CAT.games.filter(function(g){ return isLive(g.s); }).slice().sort(function(a,b){ return (b.release_seq||0)-(a.release_seq||0); })); return; }
    if(name.indexOf('category-')===0){ var id=name.slice(9); if(id==='relaxing') id='relax'; rebuildSimpleGrid(CAT.games.filter(function(g){ return isLive(g.s)&&g.types.indexOf(id)>=0; })); }
  }
  function scrubListings(){ if(!window.PT_AUTH||!window.PT_AUTH.ok) return;
    document.querySelectorAll('.hx-tile[data-slug]').forEach(function(el){ if(!isLive(el.getAttribute('data-slug'))) el.remove(); });
    document.querySelectorAll('[data-daily]').forEach(function(el){ var s=el.getAttribute('data-daily'); if(s&&!isLive(s)) el.remove(); });
    document.querySelectorAll('.hx-letter').forEach(function(sec){ if(sec.querySelector('.hx-grid')&&!sec.querySelector('.hx-tile')) sec.hidden=true; });
  }
  function applyPageSeo(){ var gp=document.querySelector('[data-gamepage]'); if(!gp) return; var g=G[gp.getAttribute('data-gamepage')]; if(!g||!isLive(g.s)) return;
    if(g.seo_title){ document.title=g.seo_title; var og=document.querySelector('meta[property="og:title"]'); if(og) og.setAttribute('content', g.seo_title); var tw=document.querySelector('meta[name="twitter:title"]'); if(tw) tw.setAttribute('content', g.seo_title); }
    if(g.seo_description){ var md=document.querySelector('meta[name="description"]'); if(md) md.setAttribute('content', g.seo_description); var od=document.querySelector('meta[property="og:description"]'); if(od) od.setAttribute('content', g.seo_description); }
    var h1=document.querySelector('h1'); if(h1&&!h1.querySelector('*')&&g.name) h1.textContent=g.name;
  }
  function finishAuthority(){ if(!window.PT_AUTH||!window.PT_AUTH.ok) return; syncHomeRows(); scrubListings(); rebuildDirectory(); applyPageSeo(); syncFavs(); syncArrows(); }
  function loadSiteConfig(){ if(loadSiteConfig.done||!window.fetch) return; loadSiteConfig.done=1;
    var SB='https://yopgnpermfxljstfcsrl.supabase.co', KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvcGducGVybWZ4bGpzdGZjc3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzODY2NDMsImV4cCI6MjEwODk2MjY0M30.G361hqYzMx4tp08Kv6h86bRKbK7_-AB1R-e88eVQIjI';
    fetch(SB+'/rest/v1/rpc/site_config',{method:'POST',credentials:'omit',referrerPolicy:'no-referrer',headers:{'apikey':KEY,'Authorization':'Bearer '+KEY,'Content-Type':'application/json'},body:'{}'})
      .then(function(r){ return r.ok?r.json():null; })
      .then(function(d){ if(!applyCatalogData(d)){ releaseHeldFrame(true); return; } writeSiteCache(d); renderAll(); releaseHeldFrame(false); })
      .catch(function(){ releaseHeldFrame(true); }); }
  function releaseHeldFrame(failed){
    var h=window.__ptFrameHold; if(!h) return;
    if(failed && LIVE[h.slug]) LIVE[h.slug].live=!!h.wasLive;
    document.documentElement.removeAttribute('data-pt-hold');
    if(window.PT_SYNC_GAMEPAGE) window.PT_SYNC_GAMEPAGE();
  }
  function renderMost(){ var box=$('[data-hx=most]'); if(!box) return; var top=ranked().slice(0,10);
    box.innerHTML=top.map(function(s,i){ return tileHTML(s,{rank:i+1,badge:false}).replace('class="hx-tile"','class="hx-tile'+(i>=4?' hx-m-hide':'')+'"'); }).join(''); }
  function renderPopular(){ var box=$('[data-hx=popular]'); if(!box) return; box.innerHTML=ranked().map(function(s,i){return tileHTML(s,{rank:i+1});}).join('');
    var src=$('[data-pop-src]'); if(src&&STATS.source!=='editorial') src.textContent='Ranked by how much each game is played.'; }
  function renderRecent(){ var box=$('[data-hx=recent]'); if(!box) return; var r=recent();
    box.innerHTML=r.map(function(x){return tileHTML(x.s,{badge:false,sub:ago(x.t)});}).join(''); box.hidden=!r.length;
    var em=$('[data-hx-empty]'); if(em) em.hidden=!!r.length; var cl=$('[data-hx-clear]'); if(cl) cl.hidden=!r.length; }
  function renderFavs(){ var box=$('[data-hx=favs]'); if(!box) return; var f=favs();
    box.innerHTML=f.map(function(s){return tileHTML(s);}).join(''); box.hidden=!f.length; var em=$('[data-hx-empty]'); if(em) em.hidden=!!f.length;
    var fr=$('[data-hx=favrecent]'); if(fr){ var r=recent().filter(function(x){return f.indexOf(x.s)<0;}).slice(0,5); fr.hidden=!r.length; fr.querySelector('[data-hx-fill]').innerHTML=r.map(function(x){return tileHTML(x.s,{badge:false,sub:ago(x.t)});}).join(''); } }
  function renderSearch(){ var box=$('[data-hx=search]'); if(!box) return; var q=(new URLSearchParams(location.search).get('q')||'').trim();
    var inp=$('#sq'); if(inp){ inp.value=q; } var hq=$('#hq'); if(hq) hq.value=q;
    var title=$('[data-sr-title]'), sub=$('[data-sr-sub]'), grid=$('[data-sr-grid]'), types=$('[data-sr-types]'), more=$('[data-sr-more]');
    document.title=(q?'“'+q+'” · ':'')+'Search · FizzSoup';
    if(!q){ title.textContent='All game types'; sub.textContent='Or type a word above, like “pool”, “cars” or “jigsaw”.'; grid.hidden=true; more.hidden=false; $('[data-sr-pop]').innerHTML=ranked().slice(0,10).map(function(s){return tileHTML(s);}).join(''); return; }
    var r=search(q);
    if(r.hits.length){ title.textContent=r.hits.length+' game'+(r.hits.length>1?'s':'')+' for “'+q+'”'; sub.textContent='Tap a picture to play.';
      grid.hidden=false; grid.innerHTML=r.hits.map(function(h){return tileHTML(h.s);}).join('');
      types.innerHTML=r.types.map(function(t){return '<a class="hx-tbtn" href="'+t.href+'" style="--c:'+t.color+'"><span class="hx-ic">'+I[t.icon]+'</span>'+esc(t.label)+'</a>';}).join(''); types.hidden=!r.types.length; more.hidden=true; }
    else { title.textContent='No games match “'+q+'” yet'; sub.textContent='Check the spelling, try a simpler word, or pick a type of game below.'; grid.hidden=true; types.hidden=false; more.hidden=false;
      $('[data-sr-pop]').innerHTML=ranked().slice(0,10).map(function(s){return tileHTML(s);}).join(''); } }
  /* header suggestions */
  function wireSuggest(){ var inp=$('#hq'), box=$('#hq-sug'); if(!inp||!box) return;
    var close=function(){ box.hidden=true; inp.setAttribute('aria-expanded','false'); };
    inp.addEventListener('input',function(){ var q=inp.value.trim(); if(!q){ close(); return; } var r=search(q).hits.slice(0,5);
      box.innerHTML=(r.length?r.map(function(h){ var sx=CAT.soon.filter(function(x){return x.id===h.s;})[0];
          if(sx) return '<span class="hx-sug__i is-soon"><span class="hx-sug__img" style="--c:'+sx.color+'">'+(I[sx.icon]||'')+'</span><span><b>'+esc(sx.name)+'</b><small>Coming soon</small></span></span>';
          var g=G[h.s]; return '<a class="hx-sug__i" href="'+PT_GAME_HREF(h.s,'#play')+'"><img class="hx-sug__img" src="'+g.thumb+'" alt=""><span><b>'+esc(g.name)+'</b><small>'+esc(g.kind)+'</small></span></a>'; }).join(''):'<p class="hx-sug__none">No games match yet. Press Enter to see ideas.</p>')
        +'<a class="hx-sug__all" href="search.html?q='+encodeURIComponent(q)+'">See all results for “'+esc(q)+'”</a>';
      box.hidden=false; inp.setAttribute('aria-expanded','true'); });
    inp.addEventListener('keydown',function(e){ if(e.key==='ArrowDown'&&!box.hidden){ var f=box.querySelector('a'); if(f){ e.preventDefault(); f.focus(); } } if(e.key==='Escape') close(); });
    box.addEventListener('keydown',function(e){ var L=$$('a',box), i=L.indexOf(document.activeElement); if(e.key==='ArrowDown'&&i<L.length-1){ e.preventDefault(); L[i+1].focus(); } if(e.key==='ArrowUp'){ e.preventDefault(); if(i>0) L[i-1].focus(); else inp.focus(); } if(e.key==='Escape'){ close(); inp.focus(); } });
    document.addEventListener('click',function(e){ if(!e.target.closest('.hx-search')) close(); });
    document.addEventListener('keydown',function(e){ if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)&&document.body.classList.contains('hx')){ e.preventDefault(); inp.focus(); } }); }
  function syncArrows(){ $$('.hx-row[data-many]').forEach(function(row){ var tr=row.querySelector('.hx-track'), p=row.querySelector('.hx-arrow--prev'), n=row.querySelector('.hx-arrow--next'); if(!tr||!n) return;
      var upd=function(){ var max=tr.scrollWidth-tr.clientWidth-2; p.hidden=tr.scrollLeft<=8; n.hidden=tr.scrollLeft>=max-6; };
      if(!tr.__hx){ tr.__hx=1; tr.addEventListener('scroll',upd,{passive:true}); window.addEventListener('resize',upd); } upd(); }); }
  /* hover preview: cycle the game's preview frames on mouse hover (off for touch) */
  function wirePreview(){   /* mouse hover only (pointerType check below); reduced motion does not block it: the hover is user-initiated */
    document.addEventListener('pointerover',function(e){ if(e.pointerType!=='mouse') return; var a=e.target.closest&&e.target.closest('.hx-tile__a[data-prev]'); if(!a||a.__pv) return; var tl=a.closest('.hx-tile'); if(window.PTV&&tl&&PTV.has(tl.getAttribute('data-slug'))) return;
      var fr=(a.dataset.prev||'').split(' ').filter(Boolean); if(!fr.length) return; var img=a.querySelector('img'), orig=img.getAttribute('src'), i=0; a.__pv=1;
      var t=setTimeout(function tick(){ img.src=fr[i++%fr.length]; a.__pvT=setTimeout(tick,900); },450); a.__pvT=t;
      var leave=function(){ clearTimeout(a.__pvT); img.src=orig; a.__pv=0; a.removeEventListener('pointerleave',leave); }; a.addEventListener('pointerleave',leave); }); }

  /* ---------- game info pages + profile (pt243u): real local data only, hidden when there is none ---------- */
  function agoL(t){ var a=ago(t).replace(/^Played /,''); return a.charAt(0).toUpperCase()+a.slice(1); }
  function renderGprog(){ $$('[data-gprog]').forEach(function(box){ var s=box.dataset.gprog, n=plays()[s]||0, r=recent().filter(function(x){return x.s===s;})[0];
      box.hidden=!(n||r); if(box.hidden) return;
      box.querySelector('.hx-gstat').innerHTML=(n?'<li><span>Times played</span><b>'+n+'</b></li>':'')+(r?'<li><span>Last played</span><b>'+esc(agoL(r.t))+'</b></li>':'')+(isFav(s)?'<li><span>In My games</span><b>Yes</b></li>':''); });
    $$('[data-gdaily]').forEach(function(el){ el.textContent=playedToday(el.dataset.gdaily)?'✓ You played this game today.':'You have not played it yet today.'; }); }
  function fillSec(key,list,opt){ var sec=$('[data-hx='+key+']'); if(!sec) return; sec.hidden=!list.length; sec.querySelector('[data-hx-fill]').innerHTML=list.map(function(x){return tileHTML(x.s,{badge:false,sub:x.sub});}).join(''); }
  function renderProfile(){ var st=$('[data-hx=pstats]'); if(!st) return; var p=plays(), tried=Object.keys(p).filter(function(s){return G[s]&&p[s]>0;}), tot=tried.reduce(function(a,s){return a+p[s];},0), f=favs(), d=days().length, k=streak();
    var any=tried.length>0; st.hidden=!any;
    if(any) st.querySelector('.hx-pstats').innerHTML=[[tried.length,tried.length===1?'game tried':'games tried'],[tot,tot===1?'time played':'times played'],[d,d===1?'day played':'days played'],[k,'day streak']].map(function(x){return '<div class="hx-pstat"><b>'+x[0]+'</b><span>'+x[1]+'</span></div>';}).join('');
    fillSec('pmost',tried.sort(function(a,b){return p[b]-p[a]||G[a].order-G[b].order;}).slice(0,4).map(function(s){return {s:s,sub:'Played '+p[s]+(p[s]===1?' time':' times')};}));
    fillSec('precent',recent().filter(function(x){return isLive(x.s);}).slice(0,4).map(function(x){return {s:x.s,sub:ago(x.t)};}));
    fillSec('pfavs',f.slice(0,4).map(function(s){return {s:s};}));
    var em=$('[data-hx=pempty]'); if(em) em.hidden=any||f.length>0; var cl=$('[data-hx=pclear]'); if(cl) cl.hidden=!(any||f.length||recent().length); }
  document.addEventListener('click',function(e){
    var sh=e.target.closest&&e.target.closest('[data-share]'); if(sh){ e.preventDefault(); var url=location.href.split('#')[0], l=sh.querySelector('[data-share-l]'), say=function(t){ if(l){ l.textContent=t; setTimeout(function(){ l.textContent='Share'; },2500); } };
      if(navigator.share){ navigator.share({title:document.title,url:url}).catch(function(){}); return; }
      try{ navigator.clipboard.writeText(url).then(function(){ say('Link copied'); },function(){ say('Copy the address bar'); }); }catch(_){ say('Copy the address bar'); } return; }
    var ca=e.target.closest&&e.target.closest('[data-clear-all]'); if(ca){ if(!window.confirm('Clear your FizzSoup history on this device? This removes recently played, play counts, day streak and My games.')) return;
      ['pt_recent','pt_plays','pt_days','pt_favs','pt_surprise_last'].forEach(function(k){ try{ localStorage.removeItem(k); }catch(_){ delete mem[k]; } }); renderAll(); }
  });
  function renderAll(){ renderGotd(); renderContinue(); renderMost(); renderPopular(); renderRecent(); renderFavs(); renderSearch(); renderGprog(); renderProfile(); syncFavs(); syncStreak(); syncDaily(); syncBig(); finishAuthority(); syncArrows(); }
  window.PTX={recordPlay:recordPlay,recent:recent,favs:favs,toggleFav:toggleFav,streak:streak,ranked:ranked,gotd:gotd,search:search,
    setStats:function(st){ if(st&&st.plays){ STATS=st; renderAll(); } },
    setSiteConfig:function(cfg){ if(!applyCatalogData(cfg||{})) return false; writeSiteCache(cfg); renderAll(); return true; },
    _score:score};
  /* left nav (Hexan pt366u): text-only when expanded, icon rail when collapsed; the ☰ toggle remembers the choice (pt_nav) */
  function syncNav(){ var r=document.documentElement.classList.contains('nav-rail'); $$('[data-navtog]').forEach(function(b){ var t=r?'Expand menu':'Collapse menu'; b.setAttribute('aria-expanded',r?'false':'true'); b.setAttribute('aria-label',t); b.title=t; }); }
  document.addEventListener('click',function(e){ var t=e.target.closest&&e.target.closest('[data-navtog]'); if(!t) return; e.preventDefault();
    var r=!document.documentElement.classList.contains('nav-rail'); document.documentElement.classList.toggle('nav-rail',r); set('pt_nav',r?'rail':'full'); syncNav(); syncArrows(); });
  /* homepage tiles have no caption: touch long-press (450 ms) shows the name for 1.8 s without opening the game; a normal tap still plays */
  function wirePeek(){ if(!document.body.classList.contains('hx-home')) return; var tm=null, sx=0, sy=0, cur=null, eat=false;
    document.addEventListener('pointerdown',function(e){ eat=false; if(e.pointerType==='mouse') return; var t=e.target.closest&&e.target.closest('.hx-tile'); if(!t||(e.target.closest&&e.target.closest('.hx-fav'))) return;
      sx=e.clientX; sy=e.clientY; clearTimeout(tm); tm=setTimeout(function(){ if(cur) cur.classList.remove('is-peek'); cur=t; t.classList.add('is-peek'); eat=true; setTimeout(function(){ t.classList.remove('is-peek'); },1800); },450); },{passive:true});
    ['pointerup','pointercancel'].forEach(function(ev){ document.addEventListener(ev,function(){ clearTimeout(tm); },{passive:true}); });
    document.addEventListener('pointermove',function(e){ if(Math.abs(e.clientX-sx)+Math.abs(e.clientY-sy)>10) clearTimeout(tm); },{passive:true});
    document.addEventListener('contextmenu',function(e){ if(e.target.closest&&e.target.closest('.hx-tile')) e.preventDefault(); });
    document.addEventListener('click',function(e){ if(eat&&e.target.closest&&e.target.closest('.hx-tile__a')){ e.preventDefault(); e.stopPropagation(); } eat=false; },true); }
  function boot(){ var cached=readSiteCache(); if(cached) applyCatalogData(cached); holdGameFrame(); renderAll(); loadSiteConfig(); wireSuggest(); wirePreview(); syncNav(); wirePeek(); }
  /* Run now. These scripts sit after #frame, but readyState is still "loading",
     so waiting for DOMContentLoaded lets app.js start Play before the hold. */
  if(document.body) boot(); else document.addEventListener('DOMContentLoaded',boot);
  window.addEventListener('pageshow',function(e){ if(e.persisted) renderAll(); });
  setInterval(syncDaily,60000);
})();
/* Privacy notice + choices (go-live pt385u). Notice only; nothing to consent to: essential local storage + first-party cookie-free analytics, no ad tracking.
   pt_notice=1 once dismissed. pt_pta_off=1 turns analytics off (analytics.js honors it and Global Privacy Control). Not shown on game pages (never over play). */
(function(){ 'use strict';
  function g(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function s(k,v){ try{ if(v==null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){} }
  var gpc=navigator.globalPrivacyControl===true;
  function notice(){
    if(g('pt_notice')==='1'||document.querySelector('iframe.gframe,[data-play]')||document.getElementById('pt-notice')) return;
    var d=document.createElement('div'); d.id='pt-notice'; d.className='pt-notice'; d.setAttribute('role','region'); d.setAttribute('aria-label','Privacy notice');
    d.innerHTML='<p>FizzSoup uses essential storage to save your progress and first-party, cookie-free analytics. No ad tracking. <a href="privacy.html#cookies">Privacy</a></p><button class="pt-notice__ok" type="button">OK</button>';
    d.querySelector('button').addEventListener('click',function(){ s('pt_notice','1'); d.remove(); });
    document.body.appendChild(d); }
  function choices(){
    var box=document.querySelector('[data-pta-choice]'); if(!box) return;
    var st=box.querySelector('[data-pta-status]'), b=box.querySelector('[data-pta-toggle]');
    function paint(){ var off=g('pt_pta_off')==='1';
      if(gpc){ st.textContent='Analytics is off: your browser sends a Global Privacy Control signal.'; b.hidden=true; return; }
      st.textContent=off?'Analytics is off on this device.':'Analytics is on (first-party, cookie-free).';
      b.textContent=off?'Turn analytics on':'Turn analytics off'; b.setAttribute('aria-pressed',off?'true':'false'); b.hidden=false; }
    b.addEventListener('click',function(){ var off=g('pt_pta_off')==='1'; s('pt_pta_off',off?null:'1'); if(!off){ s('pt_aid',null); } if(window.PTA&&PTA.refresh) PTA.refresh(); paint(); });
    paint(); }
  function boot(){ notice(); choices(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();

/* backend-preview: lazy account loader (only network code on the site lives in account.js, Supabase project domain only) */
(function(){ 'use strict'; if(window.__ptLoader) return; window.__ptLoader=1;
  var res; var ready=new Promise(function(r){res=r;}); window.__ptAcctResolve=res;
  /* Signed-out visitors need a labeled way in. The flows are the existing ones:
     Sign in emails a link (no password). Create account makes the free player card. */
  function acctCache(){ try{ return JSON.parse(localStorage.getItem('pt_acct_c')||'null')||null; }catch(e){ return null; } }
  function sessionRec(){ try{ return JSON.parse(localStorage.getItem('pt_sb')||'null'); }catch(e){ return null; } }
  /* Placeholder labels and is_guest:false without an email are not an email account.
     Anonymous play tokens and legacy caches must keep Sign in. */
  function realName(n){ if(!n||typeof n!=='string') return ''; var t=n.trim(); if(t.length<3||/^(account|profile|guest|guest player|player)$/i.test(t)) return ''; return t; }
  function tokenHasEmail(tok){ if(!tok||typeof tok!=='string') return false; var p=tok.split('.'); if(p.length<2) return false;
    try{ var b=p[1].replace(/-/g,'+').replace(/_/g,'/'); while(b.length%4) b+='='; var c=JSON.parse(atob(b)); if(c.is_anonymous===true) return false; return typeof c.email==='string'&&c.email.indexOf('@')>0; }catch(e){ return false; } }
  function emailLinked(){ var s=sessionRec();
    if(s&&s.user&&typeof s.user.email==='string'&&s.user.email.indexOf('@')>0&&s.user.is_anonymous!==true) return true;
    return !!(s&&tokenHasEmail(s.access_token)); }
  function authView(){ var c=acctCache()||{}, name=realName(c.n);
    if(emailLinked()) return {signin:false, create:false, acct:name||'Account'};
    if(name) return {signin:true, create:false, acct:name};
    return {signin:true, create:true, acct:''}; }
  function paintAuth(){ var box=document.querySelector('[data-hx-auth]'); if(!box) return; var v=authView();
    var sign=box.querySelector('[data-hx-signin]'), create=box.querySelector('[data-hx-create]'), acct=box.querySelector('[data-acct-btn]');
    if(sign) sign.hidden=!v.signin; if(create) create.hidden=!v.create;
    if(!acct) return; acct.hidden=!v.acct; if(!v.acct) return; var lab=acct.querySelector('.hx-auth__l'); if(lab) lab.textContent=v.acct; }
  function ensureAuth(){ var host=document.querySelector('.hx-top__r'); if(!host) return;
    if(!host.querySelector('[data-hx-auth]')){ var d=document.createElement('div'); d.className='hx-auth'; d.setAttribute('data-hx-auth','');
      d.innerHTML='<button class="hx-auth__btn" type="button" data-hx-signin>Sign in</button><button class="hx-auth__btn hx-auth__btn--go" type="button" data-hx-create>Create account</button><a class="hx-auth__btn hx-auth__acct" href="profile.html" data-acct-btn hidden><span class="hx-auth__l">Account</span></a>';
      host.appendChild(d); }
    paintAuth(); }
  function authPanel(){ var p=document.getElementById('pt-auth'); if(p) return p; p=document.createElement('div'); p.id='pt-auth'; p.className='hx-authdlg'; p.hidden=true; p.setAttribute('role','dialog'); p.setAttribute('aria-modal','true'); p.setAttribute('aria-labelledby','pt-auth-title');
    p.innerHTML='<div class="hx-authdlg__card"><button class="hx-authdlg__x" type="button" data-hx-auth-close aria-label="Close">×</button><h2 id="pt-auth-title"></h2><div data-hx-auth-body></div></div>';
    document.body.appendChild(p); return p; }
  function showAuth(mode){ var p=authPanel(), title=p.querySelector('#pt-auth-title'), body=p.querySelector('[data-hx-auth-body]');
    if(mode==='signin'){ title.textContent='Sign in'; body.innerHTML='<p>FizzSoup emails you a sign-in link. There is no password.</p><div class="pt-row"><label class="sr-only" for="pt-email">Email</label><input class="pt-in" id="pt-email" type="email" autocomplete="email" placeholder="you@example.com"><button class="pt-btn pt-btn--go" type="button" data-acct-send="signin">Email me a sign-in link</button></div><p class="pt-msg" data-acct-msg role="status"></p>'; }
    else { title.textContent='Create account'; body.innerHTML='<p>Make a free player card. No email is required to play. Players 13 and older can add an email afterwards, from the player card, to open the same card on another device.</p><div class="pt-row"><button class="pt-btn pt-btn--go" type="button" data-acct-start>Make my player card</button></div><p class="pt-msg" data-acct-msg role="status"></p><div data-acct-email hidden></div>'; }
    p.hidden=false; var focus=p.querySelector('input,button.pt-btn'); if(focus) focus.focus(); load(); }
  document.addEventListener('click',function(e){ var open=e.target.closest&&e.target.closest('[data-hx-signin],[data-hx-create]'); if(open){ e.preventDefault(); showAuth(open.hasAttribute('data-hx-signin')?'signin':'create'); return; }
    if(e.target.id==='pt-auth'){ e.target.hidden=true; return; }
    if(e.target.closest&&e.target.closest('[data-hx-auth-close]')){ var p=document.getElementById('pt-auth'); if(p) p.hidden=true; } },true);
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ var p=document.getElementById('pt-auth'); if(p&&!p.hidden){ p.hidden=true; e.stopPropagation(); } } },true);
  var path=(location.pathname.split('/').pop()||'').replace(/\.html$/,'').toLowerCase();
  if(path==='profile'&&!document.querySelector('[data-acct-sec]')){ var main=document.getElementById('main'); if(main){ var sec=document.createElement('section'); sec.className='hx-sec'; sec.setAttribute('aria-labelledby','pacct'); sec.setAttribute('data-acct-sec',''); sec.innerHTML='<div class="hx-sh"><h2 id="pacct">Your player card</h2></div><div data-acct-body><p>Loading your player card…</p></div>'; main.insertBefore(sec, main.firstChild); } }
  ensureAuth();
  try{ var setItem=localStorage.setItem; localStorage.setItem=function(k,v){ var r=setItem.apply(this,arguments); if(k==='pt_acct_c'||k==='pt_sb') paintAuth(); return r; }; }catch(e){}
  function c(){ try{ return JSON.parse(localStorage.getItem('pt_acct_c')||'{}')||{}; }catch(e){ return {}; } }
  window.PTAccount=window.PTAccount||{ _real:false, ready:ready,
    isPremium:function(){ var u=c().p; return !!(u&&Date.parse(u)>Date.now()); },
    canSeeUpsell:function(){ var x=c(); return (x.ab==='teen'||x.ab==='adult')&&!(x.p&&Date.parse(x.p)>Date.now()); },
    ageBand:function(){ return c().ab||null; },
    state:function(){ var h=false; try{ h=!!localStorage.getItem('pt_sb'); }catch(e){} return { signedIn:h, guest:c().g!==false, premium:this.isPremium(), upsell:this.canSeeUpsell(), offline:navigator.onLine===false, lastSync:0 }; } };
  var loaded=false; function load(){ if(loaded) return; if(navigator.onLine===false){ window.addEventListener('online',load,{once:true}); return; } loaded=true; var s=document.createElement('script'); s.src='assets/js/account.js?v=4d1ca5f8'; s.async=true; document.head.appendChild(s); }
  document.addEventListener('click',function(e){ var t=e.target.closest&&e.target.closest('[data-play],[data-acct-btn]'); if(!t) return; if(t.hasAttribute('data-play')) window.__ptPlayed=1; load(); },true);
  var has=false; try{ has=!!localStorage.getItem('pt_sb'); }catch(e){}
  var prof=!!document.querySelector('[data-acct-sec]'), ret=/access_token=/.test(location.hash||'');
  function idle(f,ms){ setTimeout(function(){ if(window.requestIdleCallback) requestIdleCallback(f,{timeout:3000}); else f(); },ms); }
  window.__ptLoad=load;
  if(ret) load(); else if(prof) idle(load,300); else if(has) idle(load,2500);
})();

/* backend-preview: FizzSoup first-party analytics (PTA). No cookies, no IP/UA stored server-side, no third parties: posts only to the
   Supabase project's track_events RPC. Nothing is sent until the player interacts (first tap/click/key), or, for a returning device that
   already interacted before, after the page is idle. Shares account.js's 10-min backend-down backoff (pt_acct_down), so a
   blocked/offline backend costs at most one failed request. Events: page_view, play_start/play_end (visible ms), level_complete/level_fail
   (from the game engine's HX.track), ad_reward; window.PTA.track(type, game, props) for the ad layer / house ads / Plus. */
(function(){ 'use strict'; if(window.PTA) return;
  var URL='https://yopgnpermfxljstfcsrl.supabase.co/rest/v1/rpc/track_events', KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvcGducGVybWZ4bGpzdGZjc3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzODY2NDMsImV4cCI6MjEwODk2MjY0M30.G361hqYzMx4tp08Kv6h86bRKbK7_-AB1R-e88eVQIjI', LS='pt_aid';
  var T=['page_view','play_start','play_end','level_complete','level_fail','ad_impression','ad_click','ad_reward','house_ad_impression','house_ad_click','subscribe_view'];
  function rid(){ var a=new Uint8Array(12), s=''; (window.crypto||{}).getRandomValues?crypto.getRandomValues(a):a.forEach(function(_,i){a[i]=Math.random()*256;}); for(var i=0;i<a.length;i++) s+=('0'+a[i].toString(36)).slice(-2); return s; }
  function lg(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } } function ls(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
  /* opt-out (go-live pt385u): Privacy choices sets pt_pta_off=1; Global Privacy Control also turns analytics off. While off nothing is queued or sent. */
  function off(){ return navigator.globalPrivacyControl===true||lg('pt_pta_off')==='1'; }
  var dev=off()?null:lg(LS), sid=(function(){ var o; try{ o=JSON.parse(sessionStorage.getItem('pt_asid')||'null'); }catch(e){} var n=Date.now();
    if(!o||!/^[a-z0-9]{8,40}$/.test(o.i)||n-o.t>1800000) o={i:rid()}; o.t=n; try{ sessionStorage.setItem('pt_asid',JSON.stringify(o)); }catch(e){} return o.i; })();
  var page=(location.pathname.split('/').pop()||'index').replace(/\.html$/,'').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,40)||'index';
  var gm=/^game-([a-z0-9-]{1,40})$/.exec(page), game=(function(){var el=document.querySelector('[data-gamepage]');if(el){var s=el.getAttribute('data-gamepage');if(s&&/^[a-z0-9][a-z0-9-]{0,39}$/.test(s)) return s;}return gm?gm[1]:null;})();
  var q=[], armed=false, timer=0, fails=0, leaving=false;
  function clean(p){ var o={}, n=0; if(p&&typeof p==='object') for(var k in p){ if(n>=8) break; var v=p[k]; if(!/^[a-z0-9_]{1,24}$/i.test(k)) continue;
      if(typeof v==='number'&&isFinite(v)) o[k]=Math.round(v*100)/100; else if(typeof v==='boolean') o[k]=v; else if(typeof v==='string') o[k]=v.slice(0,40); else continue; n++; }
    return JSON.stringify(o).length>480?{}:o; }
  function track(type,g,props){ if(off()||T.indexOf(type)<0||q.length>=100) return; var e={type:type,page:page}; g=g||game; if(g&&/^[a-z0-9][a-z0-9-]{0,39}$/.test(g)) e.game=g; e.props=clean(props); q.push(e); sched(4000); }
  function tok(){ try{ var s=JSON.parse(lg('pt_sb')||'null'); if(s&&s.access_token&&s.expires_at-30>Date.now()/1000) return s.access_token; }catch(e){} return KEY; }
  function sched(ms){ if(!armed||timer) return; timer=setTimeout(function(){ timer=0; flush(); },ms); }
  function flush(){ if(timer){ clearTimeout(timer); timer=0; } if(off()){ q.length=0; return; } if(!armed||!q.length||fails>=3||navigator.onLine===false||Date.now()<(+lg('pt_acct_down')||0)) return;
    var b=q.splice(0,25), t=tok();
    try{ fetch(URL,{method:'POST',keepalive:true,credentials:'omit',referrerPolicy:'no-referrer',headers:{'apikey':KEY,'Authorization':'Bearer '+t,'Content-Type':'application/json'},
        body:JSON.stringify({p_session:sid,p_device:dev,p_events:b})}).then(function(r){ if(!r.ok) fails++; else fails=0; },function(){ if(leaving) return; fails++; ls('pt_acct_down',String(Date.now()+600000)); }); }catch(e){ fails++; }
    if(q.length) sched(1000); }
  function arm(){ if(armed||off()) return; if(!dev){ dev=rid(); ls(LS,dev); } armed=true; sched(3000); }
  ['pointerdown','keydown','touchstart'].forEach(function(ev){ document.addEventListener(ev,function h(e){ if(e.isTrusted===false) return; document.removeEventListener(ev,h,true); arm(); },{capture:true,passive:true}); });
  if(dev) setTimeout(function(){ if(window.requestIdleCallback) requestIdleCallback(arm,{timeout:3000}); else arm(); },2500);
  /* play time: visible ms since play_start; one play_end per segment (tab hidden / page left), summed per session server-side */
  var playing=null, segT=0, segMs=0;
  function segEnd(){ if(!playing) return; if(segT){ segMs+=Date.now()-segT; segT=0; } if(segMs>=500) track('play_end',playing,{ms:Math.min(segMs,21600000)}); segMs=0; }
  function playStart(s){ if(!s||playing===s) return; if(playing) segEnd(); playing=s; segMs=0; segT=document.visibilityState==='hidden'?0:Date.now(); track('play_start',s); hookGame(); }
  document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='hidden'){ segEnd(); flush(); } else if(playing) segT=Date.now(); });
  window.addEventListener('pagehide',function(){ leaving=true; segEnd(); flush(); });
  window.addEventListener('pageshow',function(e){ if(e.persisted) leaving=false; });
  window.addEventListener('beforeunload',function(){ leaving=true; });
  if(window.PTX&&typeof PTX.recordPlay==='function'){ var rp=PTX.recordPlay; PTX.recordPlay=function(s){ try{ playStart(s); }catch(e){} return rp.apply(this,arguments); }; }
  /* engine events from the same-origin game iframe (HX.track sink); previous non-default sink keeps working */
  var hooked=null;
  function hookGame(){ var f=document.querySelector('iframe.gframe'); if(!f) return; try{ var w=f.contentWindow, t=w&&w.HX&&w.HX.track; if(!t||typeof t.setSink!=='function'||hooked===t) return; hooked=t;
      var prev=t.sink&&t.sink!==t.defaultSink?t.sink:null;
      t.setSink(function(b){ (b||[]).forEach(function(ev){ var n=ev&&(ev.event||ev.name), p=(ev&&(ev.props||ev.data))||{}, s=game||ev.slug;
          if(n==='level_complete') track('level_complete',s,{level:p.level,stars:p.stars});
          else if(n==='game_over') track('level_fail',s,{level:p.level,score:p.score});
          else if(n==='rewarded_complete') track('ad_reward',s,{slot:'rewarded'}); });
        if(prev) try{ prev(b); }catch(e){} }); }catch(e){} }
  if(game){ var fr=document.querySelector('iframe.gframe'); if(fr){ fr.addEventListener('load',hookGame); hookGame(); } }
  track('page_view',game);
  window.PTA={ track:track, flush:flush, refresh:function(){ if(off()){ q.length=0; armed=false; dev=null; } else arm(); }, enabled:function(){ return !off(); }, _q:q, _state:function(){ return {armed:armed,sid:sid,dev:!!dev,queued:q.length,playing:playing,fails:fails}; } };
})();

/* FizzSoup hover previews + likes (Hexan-approved mockups v2, 2026-10-30). Appended to hx.js by previews_patch.py.
   - Tiles: mouse hover only, after 250 ms, plays a 5 s muted inline loop (same-origin assets/clips/<slug>/preview.webm, MP4 fallback).
     Nothing is fetched until hover; one clip at a time; unloaded on leave. Plays on any real mouse hover (pointerType 'mouse', also on touch laptops/hybrids and with reduced motion: the hover is user-initiated); never for touch pointers; off for Save-Data.
   - Numbers (like % from 20 votes, plays from 1,000, else "New") come from the public game_stats() RPC; thresholds are applied server-side.
     Fetched lazily: first tile hover, or first interaction on a game page (0 network for a visitor who just looks).
   - Votes: Like / Dislike in the game bar + a one-time prompt after the first round. One vote per player card per game (guests too),
     after starting the game; tap again to clear. No text, no names. Network only to the Supabase project (via account.js for votes). */
(function(){ 'use strict'; if(window.PTV) return;
  var CLIPS=["arena-paint", "balloon-archery", "bike-race", "brain-riddles", "bubbletoom", "car-levels", "car-race", "chess-checkers", "couch-2p", "crowd-math", "daily-jigsaw", "deep-cast", "edge-drift", "elemental-duo", "endless-run", "evolve-io", "fernpuff-fields", "floepuck", "gem-lattice", "hole-grow", "hoop-flick", "idle-tycoon", "line-draw", "lobwhistle", "merge-defense", "merge-drop", "moatball", "nine-ball", "noodle-path", "number-pop", "plop-planets", "ragdoll-archery", "ragdoll-stunts", "reading-spelling", "rhythm-battle", "rhythm-dash", "serpent-arena", "shop-idle", "soccer-cup", "stack-sort", "stealth-heist", "swallow-city", "swarm-colony", "swingsprout", "tower-stack", "trap-door", "whirlwatch", "word-daily", "yesterlings"], SB='https://yopgnpermfxljstfcsrl.supabase.co', KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvcGducGVybWZ4bGpzdGZjc3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzODY2NDMsImV4cCI6MjEwODk2MjY0M30.G361hqYzMx4tp08Kv6h86bRKbK7_-AB1R-e88eVQIjI', HAS={}; CLIPS.forEach(function(s){ HAS[s]=1; });
  var CAT=window.PT_CAT||{games:[],types:[]}, G={}, TL={}; CAT.games.forEach(function(g){ G[g.s]=g; }); (CAT.types||[]).forEach(function(t){ TL[t.id]=t.label; });
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){ return null; } }
  function jl(k){ try{ return JSON.parse(ls(k)||'null')||{}; }catch(e){ return {}; } }
  function $$(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); }
  var UP='<svg class="hx-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M2 21h4V9H2v12zm20-11a2 2 0 0 0-2-2h-6.3l1-4.6v-.3c0-.4-.2-.8-.4-1.1L13.2 1 6.6 7.6c-.4.4-.6.9-.6 1.4V19a2 2 0 0 0 2 2h9c.8 0 1.5-.5 1.8-1.2l3-7.1c.1-.2.2-.5.2-.7v-2z"/></svg>';
  var DN=UP.replace('class="hx-i"','class="hx-i hx-i--dn"'), PL='<svg class="hx-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  /* ---------- numbers ---------- */
  function fmt(n){ n=Math.floor(n); if(n<1000) return String(n); var u=n<1e6?['K',1e3]:['M',1e6], v=Math.floor(n/u[1]*10)/10; return (v%1?v.toFixed(1):String(v))+u[0]; }
  var ST=null, stP=null, leaving=false;   /* leaving: set on beforeunload/pagehide so a stats fetch cut by click-through never marks the backend down */
  window.addEventListener('beforeunload',function(){ leaving=true; setTimeout(function(){ leaving=false; },15000); }); window.addEventListener('pagehide',function(){ leaving=true; }); window.addEventListener('pageshow',function(){ leaving=false; });
  function down(){ var d=+(ls('pt_acct_down')||0); return d>Date.now()||navigator.onLine===false; }
  function loadStats(){ if(ST) return Promise.resolve(ST); if(stP) return stP;
    var c=jl('pt_gstats'); if(c.t&&Date.now()-c.t<300000&&c.d){ ST=c.d; paint(); return Promise.resolve(ST); }
    if(down()||!window.fetch) return Promise.resolve(null);
    stP=fetch(SB+'/rest/v1/rpc/game_stats',{method:'POST',credentials:'omit',referrerPolicy:'no-referrer',headers:{'apikey':KEY,'Authorization':'Bearer '+KEY,'Content-Type':'application/json'},body:'{}'})
      .then(function(r){ return r.ok?r.json():null; }).then(function(a){ if(!a||!a.length) return null; var m={}; a.forEach(function(x){ m[x.game_slug]={p:x.like_pct,n:x.plays}; }); ST=m; ls('pt_gstats',JSON.stringify({t:Date.now(),d:m})); paint(); return m; },function(e){ if(!(e&&e.name==='AbortError')&&!leaving&&document.visibilityState!=='hidden') ls('pt_acct_down',String(Date.now()+600000)); return null; })
      .then(function(m){ stP=null; return m; });
    return stP; }
  function numsHTML(s){ var x=ST&&ST[s]; if(!x) return ''; return (x.p!=null?'<span class="hx-sv">'+UP+x.p+'%</span>':'')+'<span class="hx-sv">'+(x.n!=null?PL+fmt(x.n)+' plays':'New')+'</span>'; }
  function barText(s){ var x=ST&&ST[s]; if(!x) return ''; var a=[]; if(x.p!=null) a.push(x.p+'% liked'); a.push(x.n!=null?fmt(x.n)+' plays':'New'); return a.join(' · '); }
  function paint(root){ $$('[data-gs]',root).forEach(function(el){ var h=numsHTML(el.getAttribute('data-gs')); if(el.__h!==h){ el.innerHTML=h; el.__h=h; } });
    $$('[data-gstat]').forEach(function(el){ var t=barText(el.getAttribute('data-gstat')); el.textContent=t; el.hidden=!t; }); }
  /* ---------- hover video ---------- */
  var mm=function(q){ return window.matchMedia&&matchMedia(q).matches; };
  function videoOK(){ var c=navigator.connection; return !(c&&c.saveData); }   /* the trigger itself is mouse-only (pointerType==='mouse'), so touch never plays */
  var cur=null;
  function slugOf(a){ var t=a.closest('.hx-tile'); return t&&t.getAttribute('data-slug'); }
  function stop(){ var c=cur; if(!c) return; cur=null; clearTimeout(c.tm); cancelAnimationFrame(c.raf);
    if(c.v){ try{ c.v.pause(); }catch(e){} $$('source',c.v).forEach(function(x){ x.removeAttribute('src'); x.remove(); }); c.v.removeAttribute('src'); try{ c.v.load(); }catch(e){} c.v.remove(); }
    if(c.bar) c.bar.remove(); c.box.classList.remove('is-vid'); c.tile.classList.remove('is-vid'); }
  function start(c){ var g=G[c.s], img=c.box.querySelector('img'); var v=document.createElement('video');
    v.muted=true; v.defaultMuted=true; v.loop=true; v.playsInline=true; v.preload='none'; v.setAttribute('muted',''); v.setAttribute('playsinline',''); v.setAttribute('loop',''); v.setAttribute('preload','none');
    v.setAttribute('disablepictureinpicture',''); v.setAttribute('disableremoteplayback',''); v.setAttribute('aria-hidden','true'); v.tabIndex=-1; v.className='hx-tile__vid'; v.poster='assets/clips/'+c.s+'/poster.webp';
    var base='assets/clips/'+c.s+'/preview.'; [['webm','video/webm'],['mp4','video/mp4']].forEach(function(f){ var so=document.createElement('source'); so.src=base+f[0]; so.type=f[1]; v.appendChild(so); });
    var bar=document.createElement('span'); bar.className='hx-tile__bar'; bar.setAttribute('aria-hidden','true');
    c.v=v; c.bar=bar; c.box.appendChild(v); c.box.appendChild(bar);
    v.addEventListener('playing',function(){ if(cur!==c) return; c.box.classList.add('is-vid'); c.tile.classList.add('is-vid');
      (function tick(){ if(cur!==c) return; if(v.duration) bar.style.width=(100*v.currentTime/v.duration).toFixed(1)+'%'; c.raf=requestAnimationFrame(tick); })(); });
    v.addEventListener('error',function(){ if(cur===c) stop(); },true);
    var p=v.play(); if(p&&p.catch) p.catch(function(){ if(cur===c) stop(); }); }
  function wireHover(){
    document.addEventListener('pointerover',function(e){ if(e.pointerType!=='mouse') return; var a=e.target.closest&&e.target.closest('.hx-tile__a[href]'); if(!a) return;
      var s=slugOf(a); if(!s) return; loadStats(); var t=a.closest('.hx-tile'); paint(t);
      if(cur&&cur.a===a) return; stop(); if(a.__ptvNo||!HAS[s]||!videoOK()) return;   /* clicked: going to the game page, no restart */
      var box=a.querySelector('.hx-tile__img'); if(!box) return;
      var c={a:a,s:s,box:box,tile:t}; cur=c; c.tm=setTimeout(function(){ if(cur===c) start(c); },250);
      var leave=function(ev){ if(ev.relatedTarget&&a.contains(ev.relatedTarget)) return; a.removeEventListener('pointerout',leave); if(cur===c) stop(); };
      a.addEventListener('pointerout',leave); });
    document.addEventListener('click',function(e){ var a=e.target.closest&&e.target.closest('.hx-tile__a[href]'); if(!a) return; a.__ptvNo=1; if(cur&&cur.a===a) stop();
      var off=function(ev){ if(ev.relatedTarget&&a.contains(ev.relatedTarget)) return; a.removeEventListener('pointerout',off); a.__ptvNo=0; }; a.addEventListener('pointerout',off); },true);
    window.addEventListener('pageshow',function(){ $$('.hx-tile__a').forEach(function(a){ a.__ptvNo=0; }); });   /* click = go to the game page: stop the clip, never touch navigation */
    document.addEventListener('visibilitychange',function(){ if(document.hidden) stop(); });
    window.addEventListener('pagehide',stop); window.addEventListener('scroll',function(){ if(cur&&!cur.a.matches(':hover')) stop(); },{passive:true,capture:true}); }
  /* ---------- votes (game page) ---------- */
  var gpe=document.querySelector('[data-gamepage]'), gp=gpe&&gpe.getAttribute('data-gamepage'), my=jl('pt_myv'), busy=false;
  function setMine(s,v){ if(v) my[s]=v; else delete my[s]; ls('pt_myv',JSON.stringify(my)); sync(); }
  function sync(){ $$('[data-vote]').forEach(function(b){ var on=+b.getAttribute('data-vote')===(my[gp]||0); b.setAttribute('aria-pressed',on?'true':'false'); b.classList.toggle('on',on); }); }
  var tt=null; function toast(t){ var el=document.querySelector('[data-vtoast]'); if(!el) return; el.textContent=t; el.hidden=false; clearTimeout(tt); tt=setTimeout(function(){ el.hidden=true; },3200); }
  function playedHere(s){ var p=jl('pt_plays'); return !!(p[s]>0||window.__ptPlayed||jl('pt_gs')[s]); }
  function acct(){ if(window.__ptLoad) window.__ptLoad(); var A=window.PTAccount; return (A&&A.ready?A.ready:Promise.resolve()).then(function(){ return window.PTAccount&&window.PTAccount._real&&window.PTAccount.rpc?window.PTAccount:null; }); }
  function markStarted(s){ return acct().then(function(A){ if(!A) return false; return A.rpc('game_started',{p_game:s}).then(function(r){ if(r&&r.ok&&r.data&&r.data.ok){ var m=jl('pt_gs'); m[s]=1; ls('pt_gs',JSON.stringify(m)); return true; } return false; }); }); }
  function vote(v,from){ if(!gp||busy) return; var prev=my[gp]||0; if(v===prev) v=0;
    if(!playedHere(gp)){ toast('Play the game first, then you can vote.'); return; }
    busy=true; setMine(gp,v); hidePrompt();
    acct().then(function(A){ if(!A) return {err:'offline'};
      var go=function(){ return A.rpc('vote_game',{p_game:gp,p_vote:v}); };
      return go().then(function(r){ if(r&&r.status===400&&/play_first/.test(JSON.stringify(r.data||''))) return markStarted(gp).then(function(ok){ return ok?go():r; }); return r; }); })
    .then(function(r){ busy=false;
      if(r&&r.ok&&r.data&&r.data.ok){ setMine(gp,r.data.my_vote); var st=r.data.stats; if(st&&ST){ ST[gp]={p:st.like_pct,n:st.plays}; paint(); }
        toast(v?'Thanks! You can change your vote any time.':'Vote removed.'); return; }
      setMine(gp,prev); var d=JSON.stringify((r&&r.data)||'');
      toast(r&&r.data&&r.data.rate_limited?'That is a lot of votes. Try again later.':/banned/.test(d)?'Voting is turned off for this player card.':/play_first/.test(d)?'Play the game first, then you can vote.':'Could not save your vote. Try again later.'); },
      function(){ busy=false; setMine(gp,prev); toast('Could not save your vote. Try again later.'); }); }
  /* Vote prompt (COMMANDER 31 Oct): never over the game. It lives in the page flow right under the player (outside #frame),
     and only appears at a natural pause: a round end while the player is NOT fullscreen/immersive, or when the player leaves
     fullscreen (exit tab / Esc). A round end during fullscreen play only queues it. Nothing is ever added inside #frame. */
  var pr=null, prq=false, prt=null;
  function playing(){ var f=document.getElementById('frame'); return document.documentElement.classList.contains('pt-immersive')||!!(f&&f.classList.contains('is-immersive'))||!!document.fullscreenElement||!!document.webkitFullscreenElement; }
  function hidePrompt(){ prq=false; clearTimeout(prt); if(pr){ pr.remove(); pr=null; } }
  function showPrompt(){ var f=document.getElementById('frame'), g=G[gp]; if(!f||!g||pr||my[gp]) return; var seen=jl('pt_vprompt'); if(seen[gp]) return;
    if(playing()){ prq=true; return; }   /* in play: wait for the next pause, never cover the game */
    prq=false; seen[gp]=1; ls('pt_vprompt',JSON.stringify(seen));
    pr=document.createElement('div'); pr.className='hx hx-vprompt'; pr.setAttribute('role','group'); pr.setAttribute('aria-label','Rate '+g.name);
    pr.innerHTML='<span class="hx-vprompt__t">Did you like '+g.name.replace(/[<>&"]/g,'')+'?<small>Tap to vote. You can change it any time.</small></span><button type="button" data-vote="1" aria-label="Like">'+UP+'</button><button type="button" data-vote="-1" aria-label="Dislike">'+DN+'</button>';
    f.parentNode.insertBefore(pr,f.nextSibling); sync(); prt=setTimeout(hidePrompt,12000);
    try{ var r=pr.getBoundingClientRect(), tb=document.querySelector('.hx-tabbar'), tr=tb&&getComputedStyle(tb).display!=='none'?tb.getBoundingClientRect():null, lim=tr&&tr.height?Math.min(innerHeight,tr.top):innerHeight; if(r.bottom>lim-8) pr.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); }catch(e){} }
  function promptPause(){ if(playing()){ if(pr){ pr.remove(); pr=null; clearTimeout(prt); } return; } if(prq) setTimeout(function(){ if(prq&&!playing()) showPrompt(); },400); }
  (function(){ var f=document.getElementById('frame'); if(!gp||!f||!window.MutationObserver) return;
    new MutationObserver(promptPause).observe(document.documentElement,{attributes:true,attributeFilter:['class']}); new MutationObserver(promptPause).observe(f,{attributes:true,attributeFilter:['class']});
    document.addEventListener('fullscreenchange',promptPause); document.addEventListener('webkitfullscreenchange',promptPause); })();
  function watchRounds(){ var t0=Date.now(), seen0=-1, iv=setInterval(function(){ if(pr||Date.now()-t0>1800000||my[gp]||jl('pt_vprompt')[gp]){ clearInterval(iv); return; }
      var f=document.querySelector('#frame iframe.gframe'), ev=null; try{ ev=f&&f.contentWindow&&f.contentWindow.HX&&f.contentWindow.HX.events; }catch(e){}
      if(!ev) return; if(seen0<0){ seen0=ev.length; return; }
      for(var i=Math.max(0,seen0-1);i<ev.length;i++){ var n=ev[i]&&ev[i].event; if((n==='level_complete'||n==='game_over'||n==='daily_complete')&&(ev[i].t==null||ev[i].t>=t0-1000)){ clearInterval(iv); setTimeout(showPrompt,1200); return; } } seen0=ev.length; },1500);
    document.addEventListener('click',function(e){ if(e.target.closest&&e.target.closest('[data-exit]')&&Date.now()-t0>60000) setTimeout(showPrompt,400); },true); }
  function wireVotes(){ if(!gp) return; sync();
    document.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('[data-vote]'); if(!b) return; e.preventDefault(); vote(+b.getAttribute('data-vote')); });
    var armed=false; function arm(){ if(armed) return; armed=true; setTimeout(loadStats,3000); }
    ['pointerdown','keydown'].forEach(function(n){ document.addEventListener(n,function(e){ if(e.isTrusted!==false&&e.target.closest&&e.target.closest('.hx-gbar,#frame,[data-play]')) arm(); },{capture:true,passive:true}); });
    var played=false; document.addEventListener('click',function(e){ if(played||!(e.target.closest&&e.target.closest('[data-play]'))) return; played=true; arm(); watchRounds(); },true);
    if(ls('pt_sb')||jl('pt_gstats').t) setTimeout(function(){ loadStats(); if(ls('pt_sb')) acct().then(function(A){ if(A&&A.state().signedIn) A.rpc('my_game_votes',{}).then(function(r){ if(r&&r.ok&&r.data&&typeof r.data==='object'){ my=r.data; ls('pt_myv',JSON.stringify(my)); sync(); } }); }); },2600); }
  window.PTV={ has:function(s){ return !!HAS[s]&&videoOK(); }, clips:CLIPS, stats:function(){ return ST; }, loadStats:loadStats, fmt:fmt, _cur:function(){ return cur&&{s:cur.s,playing:!!(cur.v&&!cur.v.paused)}; }, _prompt:showPrompt };
  wireHover(); wireVotes(); paint();
})();
