/* FizzSoup hover previews: a short, silent, sped-up clip of real gameplay on game cards.
   Mouse: hover (or keyboard focus) for 150 ms. Touch: long-press (450 ms); no autoplay otherwise.
   One clip at a time, preload="none" until asked for, off under prefers-reduced-motion and Save-Data.
   Same-origin assets only: assets/clips/<slug>/preview.webm (VP9) with preview.mp4 (H.264) fallback. */
(function(){
  'use strict';
  try{
    if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cn=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
    if(cn && cn.saveData) return;
  }catch(e){ return; }
  var v=document.createElement('video');
  var canWebm=!!(v.canPlayType && v.canPlayType('video/webm; codecs="vp9"'));
  var canMp4=!!(v.canPlayType && v.canPlayType('video/mp4; codecs="avc1.4D401E"'));
  if(!canWebm && !canMp4) return;

  var st=document.createElement('style');
  st.textContent=    '.gcard .fs-hv{position:absolute;inset:0;z-index:1;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 160ms ease-out;pointer-events:none;background:transparent}'+
    '.gcard .fs-hv.is-on{opacity:1}'+
    '.gcard.fs-hv-press{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}';
  document.head.appendChild(st);

  var RATE=1; /* clips are already encoded at about 2.2x */
  var cur=null, timer=0;

  function clipFor(card){
    var vid=card.__fsv;
    if(vid) return vid;
    var slug=card.getAttribute('data-slug'); if(!slug) return null;
    var thumb=card.querySelector('.thumb'); if(!thumb) return null;
    var base='assets/clips/'+encodeURIComponent(slug)+'/';
    vid=document.createElement('video');
    vid.className='fs-hv';
    vid.muted=true; vid.defaultMuted=true; vid.loop=true; vid.playsInline=true;
    vid.setAttribute('muted',''); vid.setAttribute('playsinline',''); vid.setAttribute('preload','none');
    vid.setAttribute('aria-hidden','true'); vid.setAttribute('tabindex','-1'); vid.disablePictureInPicture=true;
    vid.poster=base+'poster.webp';
    if(canWebm){ var a=document.createElement('source'); a.src=base+'preview.webm'; a.type='video/webm'; vid.appendChild(a); }
    if(canMp4){ var b=document.createElement('source'); b.src=base+'preview.mp4'; b.type='video/mp4'; vid.appendChild(b); }
    vid.addEventListener('playing', function(){ if(cur===card) vid.classList.add('is-on'); });
    vid.addEventListener('error', function(){ card.__fsvDead=true; stop(card); }, true);
    thumb.appendChild(vid);
    card.__fsv=vid;
    return vid;
  }
  function start(card){
    if(card.__fsvDead) return;
    if(cur && cur!==card) stop(cur);
    var vid=clipFor(card); if(!vid) return;
    cur=card;
    vid.playbackRate=RATE;
    var p=vid.play(); if(p && p.catch) p.catch(function(){});
  }
  function stop(card){
    var vid=card && card.__fsv;
    if(cur===card) cur=null;
    if(!vid) return;
    vid.classList.remove('is-on');
    try{ vid.pause(); vid.currentTime=0; }catch(e){}
  }
  function cardOf(t){ return t && t.closest ? t.closest('.gcard[data-slug]') : null; }

  /* Mouse / pen hover (only on devices that really hover) */
  var hoverOK=!window.matchMedia || matchMedia('(hover: hover) and (pointer: fine)').matches;
  if(hoverOK){
    document.addEventListener('mouseover', function(e){
      var c=cardOf(e.target); if(!c || c.contains(e.relatedTarget)) return;
      clearTimeout(timer); timer=setTimeout(function(){ start(c); }, 150);
    });
    document.addEventListener('mouseout', function(e){
      var c=cardOf(e.target); if(!c || c.contains(e.relatedTarget)) return;
      clearTimeout(timer); stop(c);
    });
    document.addEventListener('focusin', function(e){
      var c=cardOf(e.target); if(!c) return;
      clearTimeout(timer); timer=setTimeout(function(){ start(c); }, 150);
    });
    document.addEventListener('focusout', function(e){
      var c=cardOf(e.target); if(!c || c.contains(e.relatedTarget)) return;
      clearTimeout(timer); stop(c);
    });
  }

  /* Touch: long-press plays; a normal tap still opens the game. */
  var pressT=0, pressCard=null, sx=0, sy=0, suppress=null;
  document.addEventListener('touchstart', function(e){
    var c=cardOf(e.target);
    if(cur && cur!==c) stop(cur);
    if(!c || e.touches.length!==1) return;
    pressCard=c; sx=e.touches[0].clientX; sy=e.touches[0].clientY;
    c.classList.add('fs-hv-press');
    clearTimeout(pressT);
    pressT=setTimeout(function(){ if(pressCard===c){ suppress=c; start(c); } }, 450);
  }, {passive:true});
  document.addEventListener('touchmove', function(e){
    if(!pressCard) return;
    var t=e.touches[0];
    if(Math.abs(t.clientX-sx)>10 || Math.abs(t.clientY-sy)>10){ clearTimeout(pressT); pressCard=null; }
  }, {passive:true});
  document.addEventListener('touchend', function(){ clearTimeout(pressT); if(pressCard) pressCard.classList.remove('fs-hv-press'); pressCard=null; }, {passive:true});
  document.addEventListener('touchcancel', function(){ clearTimeout(pressT); pressCard=null; }, {passive:true});
  document.addEventListener('contextmenu', function(e){ var c=cardOf(e.target); if(c && (c===suppress || c===pressCard)) e.preventDefault(); });
  document.addEventListener('click', function(e){
    var c=cardOf(e.target);
    if(c && c===suppress){ e.preventDefault(); suppress=null; }   /* the click that ends a long-press stays on the page */
  }, true);
  window.addEventListener('scroll', function(){ if(cur && !hoverOK) stop(cur); }, {passive:true});
  document.addEventListener('visibilitychange', function(){ if(document.hidden && cur) stop(cur); });
})();
