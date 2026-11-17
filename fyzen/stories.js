/* Fytoon Stories: catalog filters, reader page counter, story.html?id= renderer. Local JSON only. */
(function(){
  function $(s, r){return (r||document).querySelector(s);}
  function $$(s, r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}

  /* Catalog filters on stories.html */
  var grid = $('[data-fz-story-grid]');
  if(grid){
    var chips = $$('[data-fz-story-filter]');
    function apply(key){
      chips.forEach(function(c){c.setAttribute('aria-pressed', c.getAttribute('data-fz-story-filter')===key ? 'true':'false');});
      var n=0;
      $$('.fz-story-card', grid).forEach(function(card){
        var ok = key==='all'
          || (key==='coming-soon' && (card.getAttribute('data-fz-story-status')==='coming-soon'))
          || card.getAttribute('data-fz-genre')===key;
        card.hidden = !ok;
        if(ok) n++;
      });
      var count = $('[data-fz-story-count]');
      if(count) count.textContent = n;
    }
    chips.forEach(function(c){c.addEventListener('click', function(){apply(c.getAttribute('data-fz-story-filter'));});});
  }

  /* Reader: update "n / total" as pages enter the viewport */
  var reader = $('[data-fz-reader]');
  if(reader){
    var pages = $$('[data-fz-page]', reader);
    var label = $('[data-fz-page-count]');
    var total = pages.length;
    function set(n){ if(label) label.textContent = n+' / '+total; }
    if('IntersectionObserver' in window && pages.length){
      var current=1;
      var io=new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if(!en.isIntersecting) return;
          var n=parseInt(en.target.getAttribute('data-fz-page'),10);
          if(n>=current || en.intersectionRatio>0.55){ current=n; set(n); }
        });
      }, {root:null, threshold:[0.35,0.55]});
      pages.forEach(function(p){io.observe(p);});
    }
  }

  /* Generic story.html?id=slug&ep=ep-01 — render from local stories.json */
  var host = $('[data-fz-story-host]');
  if(!host) return;
  var params=new URLSearchParams(location.search);
  var id=params.get('id');
  if(!id){
    host.innerHTML='<p class="fz-note">Add a series id to the URL, for example <a href="story.html?id=arcade-sprout">story.html?id=arcade-sprout</a>, or browse <a href="stories.html">Stories</a>.</p>';
    return;
  }
  fetch('fyzen/stories.json').then(function(r){return r.json();}).then(function(data){
    var s=(data.series||[]).filter(function(x){return x.id===id;})[0];
    if(!s){ host.innerHTML='<div class="fz-empty"><b>Story not found</b><p>No series with id “'+id.replace(/</g,'')+'” in stories.json.</p><a class="fz-btn fz-btn--primary" href="stories.html">Back to Stories</a></div>'; return; }
    /* Prefer the static reader when it exists so images and chrome are identical. */
    var dest='story-'+encodeURIComponent(s.id)+'.html';
    var ep=params.get('ep');
    if(ep) dest+='#ep-'+encodeURIComponent(ep);
    location.replace(dest);
  }).catch(function(){
    host.innerHTML='<div class="fz-empty"><b>Could not load stories.json</b><p>This reader only uses a local data file.</p><a class="fz-btn fz-btn--primary" href="stories.html">Back to Stories</a></div>';
  });
})();
