/* Playtoom prototype behavior (draft). No network calls. */
(function(){
  const qs=new URLSearchParams(location.search), reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* ---- Hover video preview: start after --pv-preview-delay (300ms), muted, poster fallback, off for reduced motion / touch ---- */
  const delay=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--pv-preview-delay'))||300;
  document.querySelectorAll('[data-preview]').forEach(c=>{
    let t; const on=()=>{ if(reduce) return; t=setTimeout(()=>c.classList.add('is-previewing'),delay); };
    const off=()=>{ clearTimeout(t); c.classList.remove('is-previewing'); };
    c.addEventListener('pointerenter',e=>{ if(e.pointerType==='mouse') on(); });
    c.addEventListener('pointerleave',off); c.addEventListener('focus',on); c.addEventListener('blur',off);
  });
  /* ---- Carousel ---- */
  const car=document.querySelector('.car');
  if(car){
    const slides=[...car.querySelectorAll('.car__slide')], tabs=[...car.querySelectorAll('.car__thumb')]; let i=0, timer=null;
    const go=n=>{ i=(n+slides.length)%slides.length; slides.forEach((s,k)=>{s.classList.toggle('is-active',k===i); s.hidden=k!==i;}); tabs.forEach((b,k)=>b.setAttribute('aria-selected',k===i)); };
    tabs.forEach((b,k)=>b.addEventListener('click',()=>go(k)));
    car.querySelector('[data-car=prev]').onclick=()=>go(i-1); car.querySelector('[data-car=next]').onclick=()=>go(i+1);
    const pb=car.querySelector('[data-car=pause]');
    const play=()=>{ if(reduce||qs.has('static')) return; timer=setInterval(()=>go(i+1),7000); };
    pb.onclick=()=>{ if(timer){clearInterval(timer);timer=null;pb.setAttribute('aria-label','Resume auto-rotation');} else {play();pb.setAttribute('aria-label','Pause auto-rotation');} };
    car.addEventListener('focusin',()=>{clearInterval(timer);timer=null;}); play();
  }
  /* ---- Dialog helpers + mockup states (?state=interstitial|save|consent) ---- */
  const open=id=>{ const d=document.getElementById(id); if(!d) return; d.classList.add('is-open'); const f=d.querySelector('button:not([disabled]),a,input,select'); f&&f.focus({preventScroll:true}); };
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.close).classList.remove('is-open')));
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') document.querySelectorAll('.modal.is-open').forEach(m=>m.classList.remove('is-open'));
    if(e.key==='/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){ const s=document.getElementById('hq')||document.getElementById('sq'); if(s){e.preventDefault(); s.focus();} } });
  const st=qs.get('state');
  if(st==='interstitial'){ const fi=document.querySelector('#frame img'); document.querySelectorAll('#frame img').forEach(im=>{ if(im.src.includes('/play.jpg')) im.src=im.src.replace('/play.jpg','/complete.jpg'); }); open('inter'); } if(st==='save') open('save'); if(st==='consent') document.getElementById('consent').classList.add('is-open');
  if(qs.has('hover')) document.querySelectorAll('.card[data-preview]')[+qs.get('hover')||0]?.classList.add('is-hover','is-previewing');
  /* interstitial countdown demo */
  const inter=document.getElementById('inter');
  if(inter && st==='interstitial' && !qs.has('static')){ let n=5; const c=inter.querySelector('.count'), b=inter.querySelector('[data-close]'), lbl=c.nextSibling;
    const tk=setInterval(()=>{ n--; c.textContent=n; if(n<=0){clearInterval(tk); b.disabled=false; lbl.textContent='You can continue now';} },1000); }
  /* ---- Live/coming switch, driven by assets/js/games.js (window.PT_GAMES) ---- */
  const L=window.PT_GAMES||{}, isLive=s=>!!(L[s]&&L[s].live);
  document.querySelectorAll('[data-game]').forEach(el=>{
    const s=el.dataset.game, live=isLive(s), isA=el.tagName==='A';
    if(live===isA) return;
    const n=document.createElement(live?'a':'div');
    for(const a of el.attributes) n.setAttribute(a.name,a.value);
    n.innerHTML=el.innerHTML; n.classList.toggle('card--coming',!live);
    if(live){ n.href=PT_GAME_HREF(s,'#play'); n.removeAttribute('role'); n.querySelectorAll('.badge--soon').forEach(b=>b.remove()); }
    else { n.removeAttribute('href'); n.setAttribute('role','group'); const bd=n.querySelector('.card__badges'); if(bd) bd.innerHTML='<span class="badge badge--soon">Coming today</span>'; }
    el.replaceWith(n);
  });
  function unavailableLabel(){ return (window.PT_AUTH&&window.PT_AUTH.ok)?'Not available':'Coming today'; }
  function frameIsBlank(ifr){ if(!ifr) return true; const a=ifr.getAttribute('src')||''; const p=ifr.src||''; return !a || a==='about:blank' || /about:blank$/i.test(p); }
  function frameUrl(slug){ const held=window.__ptFrameHold&&window.__ptFrameHold.slug===slug&&window.__ptFrameHold.src; if(held && held!=='about:blank' && !/about:blank$/i.test(held)) return held; return slug+'/index.html'; }
  function loadFrame(ifr, url){ if(!ifr||!url) return; ifr.setAttribute('src', url); ifr.src=url; }
  function syncGamePage(){
    const gp=document.querySelector('[data-gamepage]'); if(!gp) return;
    const s=gp.dataset.gamepage, live=isLive(s), f=document.getElementById('frame'); if(!f) return;
    const ifr=f.querySelector('iframe.gframe');
    const label=unavailableLabel();
    if(live && ifr && frameIsBlank(ifr)) loadFrame(ifr, frameUrl(s));
    if(live && !ifr){ const title=(L[s]&&L[s].title||s).replace(/"/g,'&quot;');
      f.__ptImm=0; f.__ptEnter=null; f.__ptBound=0;
      f.innerHTML='<iframe class="gframe" src="'+s+'/index.html" title="'+title+'" allow="fullscreen; autoplay; gamepad" allowfullscreen tabindex="-1"></iframe><button class="frame__cover" type="button" data-play aria-label="Play '+title+' full screen"><span class="frame__go"><span class="frame__goic"><svg viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5z" fill="currentColor"/></svg></span><span class="frame__golbl" data-golbl>Play</span></span></button><button class="pt-exit" type="button" data-exit aria-label="Exit game, back to page"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" fill="none"/></svg></button>';
      gp.querySelectorAll('.gbar [data-play][aria-disabled], .gbar .btn--ghost').forEach(pb=>{ const b=document.createElement('button'); b.type='button'; b.className='btn btn--play'; b.dataset.play=''; b.textContent='Play'; pb.replaceWith(b); });
    }
    if(!live && document.documentElement.getAttribute('data-pt-hold')==='1'){ f.__ptEnter=null; f.__ptImm=0; return; }
    if(!live){ const old=f.querySelector('iframe.gframe'); if(old) old.src='about:blank';
      f.__ptImm=0; f.__ptEnter=null; f.__ptBound=0; f.classList.remove('is-immersive');
      document.documentElement.classList.remove('pt-immersive');
      f.innerHTML='<div class="frame__soon" role="status"><span class="badge badge--soon">'+label+'</span></div>';
      gp.querySelectorAll('[data-play]').forEach(pb=>{ const sp=document.createElement('span'); sp.className='btn btn--ghost'; sp.textContent=label; pb.replaceWith(sp); });
      let robots=document.querySelector('meta[name=robots]'); if(!robots){ robots=document.createElement('meta'); robots.setAttribute('name','robots'); document.head.appendChild(robots); }
      if(window.PT_AUTH&&window.PT_AUTH.ok) robots.setAttribute('content','noindex, nofollow');
      return;
    }
    if(!f.__ptEnter){ immersive(f, (L[s]&&L[s].orientation)||'any', s); f.__ptImm=1; }
  }
  window.PT_SYNC_GAMEPAGE=syncGamePage;
  syncGamePage();
  /* ---- Immersive player ----
     Play / cover / Fullscreen -> #frame becomes a fixed 100dvw x 100dvh layer (site chrome hidden, page scroll locked).
     Real Fullscreen API is requested on the layer when allowed (desktop, Android); iOS Safari keeps the fixed-layer fallback.
     Exit: corner button, Esc (page or game), browser back (a history entry is pushed on enter), or leaving real fullscreen.
     Exit always returns to the embedded player on this page (iframe kept, never reloaded); Esc on the page / leaving fullscreen also pause the game
     (Esc inside the game frame reaches the game, which pauses itself). */
  function immersive(f, orient, slug){
    const root=document.documentElement, ifr=f.querySelector('iframe'); if(!ifr) return;
    if(f.__ptBound){ f.__ptEnter=function(opts){ if(frameIsBlank(ifr)&&isLive(slug)) loadFrame(ifr, frameUrl(slug)); if(f.__ptEnterCore) f.__ptEnterCore(opts); }; return; }
    f.__ptBound=1;
    const vp=document.querySelector('meta[name=viewport]'), vp0=vp&&vp.content;
    let on=false, y=0, idleT=null, returnFocus=null;
    const fsEl=()=>document.fullscreenElement||document.webkitFullscreenElement;
    const safe=fn=>{ try{ const r=fn(); if(r&&r.catch) r.catch(()=>{}); return r; }catch(_){ } };
    const lockOrient=()=>{ if(orient&&orient!=='any'&&fsEl()&&screen.orientation&&screen.orientation.lock) safe(()=>screen.orientation.lock(orient)); };
    const reqFS=()=>{ if(fsEl()) return; const rq=f.requestFullscreen||f.webkitRequestFullscreen; if(!rq) return;
      const r=safe(()=>rq.call(f,{navigationUI:'hide'})); if(r&&r.then) r.then(lockOrient,()=>{}); };
    const idle=()=>{ f.classList.remove('is-idle'); clearTimeout(idleT); idleT=setTimeout(()=>f.classList.add('is-idle'),2000); };
    let mvT=0; const wake=()=>{ const t=Date.now(); if(on&&t-mvT>200){ mvT=t; idle(); } };
    /* pause via the engine's own in-game pause (window.HXGAME.pause(), same-origin frame); no-op for games without it */
    const pauseGame=()=>{ safe(()=>{ const g=ifr.contentWindow&&ifr.contentWindow.HXGAME; if(g&&typeof g.pause==='function') g.pause(); }); };
    const focusGame=()=>{ safe(()=>ifr.focus({preventScroll:true})); safe(()=>ifr.contentWindow&&ifr.contentWindow.focus()); };
    const hookFrame=()=>{ let w; try{ w=ifr.contentWindow; if(!w||w.__ptHooked) return; w.__ptHooked=1; }catch(_){ return; }
      safe(()=>w.addEventListener('keydown',e=>{ if(e.key==='Escape') onEsc(e); },true));
      /* Do not request OS fullscreen again from inside the game. A pointer-lock
         game (Short Fuse) makes Chrome drop fullscreen, and a second request fights the lock. */
      safe(()=>w.addEventListener('pointerdown',()=>{ if(on) idle(); },true));
      safe(()=>w.addEventListener('pointermove',wake,{capture:true,passive:true})); safe(()=>w.addEventListener('keydown',wake,true)); };
    ifr.addEventListener('load',hookFrame); safe(()=>{ if(ifr.contentDocument&&ifr.contentDocument.readyState==='complete') hookFrame(); });
    function enter(opts){ if(frameIsBlank(ifr) && isLive(slug)) loadFrame(ifr, frameUrl(slug)); if(on) return; on=true; opts=opts||{};
      returnFocus=document.activeElement; y=window.scrollY;
      if(vp&&!/viewport-fit/.test(vp0)) vp.content=vp0+',viewport-fit=cover';
      root.classList.add('pt-immersive'); document.body.style.top=(-y)+'px';
      f.classList.add('is-immersive'); f.classList.remove('is-resume'); f.setAttribute('aria-modal','true');
      if(opts.push!==false && !(history.state&&history.state.ptPlay)) safe(()=>history.pushState({ptPlay:1},'',location.pathname+location.search+'#play'));
      if(opts.gesture) reqFS();
      hookFrame(); focusGame(); setTimeout(focusGame,60); idle();
      safe(()=>window.PTX&&window.PTX.recordPlay(slug));
    }
    function teardown(){ if(!on) return; on=false; clearTimeout(idleT);
      if(fsEl()){ safe(()=>screen.orientation&&screen.orientation.unlock&&screen.orientation.unlock()); safe(()=>(document.exitFullscreen||document.webkitExitFullscreen).call(document)); }
      f.classList.remove('is-immersive','is-idle'); f.classList.add('is-resume'); f.removeAttribute('aria-modal');
      f.querySelectorAll('[data-golbl]').forEach(l=>l.textContent='Resume');
      root.classList.remove('pt-immersive'); document.body.style.top=''; if(vp) vp.content=vp0;
      window.scrollTo(0,y); safe(()=>(returnFocus&&returnFocus.focus?returnFocus:f.querySelector('.frame__cover')).focus({preventScroll:true}));
    }
    let closing=false;
    function exit(){ if(!on||closing) return; closing=true;
      /* Drop the #play entry in place. history.back() here raced: Escape runs
         from both the game frame and the page, and the second back landed on
         the next click (in-game Resume) and closed the layer. */
      if(history.state&&history.state.ptPlay) safe(()=>history.replaceState(null,'',location.pathname+location.search));
      teardown(); closing=false; }
    window.addEventListener('popstate',e=>{ if(e.state&&e.state.ptPlay) enter({push:false}); else if(on) teardown(); });
    function pointerLocked(){ try{ const w=ifr.contentWindow; return !!(w&&w.document&&w.document.pointerLockElement); }catch(e){ return false; } }
    /* Escape while the game holds the pointer pauses that game (it listens for
       the lock dropping) and must not also leave the play layer. Escape with no
       lock — paused, or a game that does not lock — leaves the layer. */
    function onEsc(e){ if(!on||e.key!=='Escape') return; if(pointerLocked()) return; e.preventDefault(); pauseGame(); exit(); }
    /* Losing OS fullscreen must not close the play layer. Chrome drops fullscreen
       when the embedded game takes pointer lock. */
    const onFs=()=>{ if(fsEl()) lockOrient(); };
    document.addEventListener('fullscreenchange',onFs); document.addEventListener('webkitfullscreenchange',onFs);
    document.addEventListener('keydown',onEsc);
    f.addEventListener('pointermove',idle);
    f.__ptEnterCore=enter; f.__ptEnter=enter;
    if(!window.__ptPlayDeleg){ window.__ptPlayDeleg=1;
      document.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('[data-play]:not([aria-disabled])'); if(!b) return; const fr=document.getElementById('frame'); if(!fr||!fr.__ptEnter) return; if(!fr.contains(b)&&!(b.closest&&b.closest('.gbar, .hx-gbar'))) return; e.preventDefault(); fr.__ptEnter({gesture:true}); },true); }
    f.querySelectorAll('[data-exit]').forEach(b=>b.addEventListener('click',e=>{ e.preventDefault(); exit(); }));
    /* links from cards (game-<slug>.html#play or ?play=1) open this page with the game embedded; Play / Fullscreen start it */
    if(location.hash==='#play'||qs.get('play')==='1'){
      const clean=new URLSearchParams(location.search); clean.delete('play'); const q=clean.toString();
      safe(()=>history.replaceState(null,'',location.pathname+(q?'?'+q:'')));
    }
  }
  /* ---- Search ---- */
  const G=window.PV_GAMES;
  if(G){
    const q=(qs.get('q')||'').trim(), inp=document.getElementById('sq'); inp.value=q;
    document.getElementById('sclear').onclick=()=>{ location.search=''; };
    const esc=s=>s.replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
    const hl=(s,q)=>{ const i=s.toLowerCase().indexOf(q.toLowerCase()); return i<0?esc(s):esc(s.slice(0,i))+'<mark>'+esc(s.slice(i,i+q.length))+'</mark>'+esc(s.slice(i+q.length)); };
    if(q){
      const ql=q.toLowerCase(); const hits=G.filter(g=>(g.name+' '+g.cats.join(' ')+' '+g.tag).toLowerCase().includes(ql));
      document.getElementById('s-empty').hidden=true;
      if(hits.length){
        document.getElementById('s-results').hidden=false;
        document.getElementById('rh').innerHTML=`${hits.length} game${hits.length>1?'s':''} for “${esc(q)}”`;
        document.getElementById('rsub').textContent='Matched on name, category and description.';
        document.getElementById('rgrid').innerHTML=hits.map(g=>(isLive(g.slug)?`<a class="card" href="${PT_GAME_HREF(g.slug,'#play')}" aria-label="${esc(g.name)}">`:`<div class="card card--coming" role="group" aria-label="${esc(g.name)}, coming today">`)+`<img class="card__img" src="${g.thumb}" alt=""><span class="card__shade" aria-hidden="true"></span><span class="card__meta">${''}<span class="card__title">${hl(g.name,q)}</span><span class="card__cat">${hl(g.cats.join(' · '),q)}</span></span><span class="card__play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5z" fill="currentColor"/></svg></span>`+(isLive(g.slug)?'</a>':'<span class="card__badges"><span class="badge badge--soon">Coming today</span></span></div>')).join('');
        const cats=[...new Set(hits.flatMap(g=>g.cats))]; document.getElementById('rcats').innerHTML=cats.map(c=>`<a class="cchip" href="category.html">${esc(c)}</a>`).join('');
      } else { document.getElementById('s-none').hidden=false; document.getElementById('nh').textContent=`No games match “${q}”, yet`; }
    }
  }
})();
