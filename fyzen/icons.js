/* Fytoon icon sprite: original 24x24 stroke icons, injected once as an inline <svg> sprite. */
(function(){
  var P={
    compass:'<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    trending:'<path d="m3.5 17 6-6 4 4 7-7.5"/><path d="M15 7.5h5.5V13"/>',
    sliders:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    gamepad:'<path d="M7 7.5h10a4.5 4.5 0 0 1 4.4 5.5l-.8 3.4a2.2 2.2 0 0 1-3.8.9L14.5 15h-5l-2.3 2.3a2.2 2.2 0 0 1-3.8-.9L2.6 13A4.5 4.5 0 0 1 7 7.5z"/><path d="M7.5 10v3M6 11.5h3"/><circle cx="16" cy="11" r=".8" fill="currentColor"/><circle cx="17.5" cy="12.8" r=".8" fill="currentColor"/>',
    external:'<path d="M8 6h10v10M18 6 6 18"/>',
    megaphone:'<path d="M4 10v4h3l7 4V6L7 10z"/><path d="M17.5 9a4 4 0 0 1 0 6"/>',
    home:'<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/>',
    flame:'<path d="M12 21c-4 0-7-2.7-7-6.6 0-3.1 2-5.2 3.6-7 .4 1.8 1.4 3 2.6 3.5C11 7.6 12.4 5 15 3c-.3 3 1.3 4.6 2.6 6.2A7.3 7.3 0 0 1 19 14.4C19 18.3 16 21 12 21z"/>',
    puzzle:'<path d="M9 4h3.5a2 2 0 1 1 3.5 1.5V8H19v3.5a2 2 0 1 0 0 3.5V20h-4.5a2 2 0 1 0-3.5 0H5v-5a2 2 0 1 0 0-3.5V8h4z"/>',
    arcade:'<rect x="2.5" y="7" width="19" height="11" rx="5"/><path d="M7.5 10.5v4M5.5 12.5h4"/><circle cx="15.5" cy="11.5" r=".9" fill="currentColor"/><circle cx="17.8" cy="13.8" r=".9" fill="currentColor"/>',
    car:'<path d="M4 16.5V12l2-5h12l2 5v4.5"/><path d="M3 16.5h18v2H3z"/><circle cx="7.5" cy="13.5" r="1"/><circle cx="16.5" cy="13.5" r="1"/>',
    sports:'<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17M3.5 12h17M6 6c3.5 3 3.5 9 0 12M18 6c-3.5 3-3.5 9 0 12"/>',
    strategy:'<path d="M5 20.5h14M6.5 20.5 7.5 12h9l1 8.5M7.5 12V5h2.2v2h1.6V5h1.4v2h1.6V5h2.2v7"/>',
    merge:'<circle cx="7" cy="7.5" r="3"/><circle cx="17" cy="7.5" r="3"/><circle cx="12" cy="17" r="3.8"/><path d="M8.7 10 10.6 13.5M15.3 10l-1.9 3.5"/>',
    word:'<rect x="3" y="6.5" width="8" height="11" rx="2"/><rect x="13" y="6.5" width="8" height="11" rx="2"/><path d="M5.5 14.5 7 9.5l1.5 5M6 13h2"/>',
    leaf:'<path d="M5 19C5 10 10 5 20 4c-.5 10-5.5 15-14 15z"/><path d="M5 19 13 11"/>',
    cpu:'<rect x="6" y="6" width="12" height="12" rx="2.5"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 2.5V6M15 2.5V6M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5"/>',
    filter:'<path d="M4 6h16M7 12h10M10 18h4"/>',
    search:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
    moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    bookmark:'<path d="M6.5 3.5h11v17L12 16.5l-5.5 4z"/>',
    star:'<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/>',
    play:'<path d="M7.5 4.5v15l12-7.5z" fill="currentColor"/>',
    users:'<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5"/><path d="M16 5.3a3.4 3.4 0 0 1 0 6.4M18 14.8c2 .7 3.2 2.5 3.5 5.2"/>',
    eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    volume:'<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>',
    expand:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    share:'<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="m8.2 10.8 7.6-4M8.2 13.2l7.6 4"/>',
    left:'<path d="m14.5 5.5-6.5 6.5 6.5 6.5"/>',
    right:'<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    gauge:'<path d="M4.5 17a8.5 8.5 0 1 1 15 0"/><path d="m12 13 4-4.5"/><circle cx="12" cy="13" r="1.3" fill="currentColor"/>',
    keyboard:'<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6 10h.01M9.3 10h.01M12.6 10h.01M15.9 10h.01M18 10h.01M7 14h10"/>',
    info:'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.2"/>',
    grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    palette:'<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.3 0 1.8-1 1.3-2-.6-1.2.2-2.5 1.6-2.5H17a3.5 3.5 0 0 0 3.5-3.5c0-5-3.8-9-8.5-9z"/><circle cx="7.5" cy="11" r="1" fill="currentColor"/><circle cx="10" cy="7.5" r="1" fill="currentColor"/><circle cx="14.5" cy="7.5" r="1" fill="currentColor"/>',
    type:'<path d="M5 7V5h14v2M12 5v14M9 19h6"/>',
    layers:'<path d="m12 3.5 9 4.5-9 4.5L3 8z"/><path d="m3 12 9 4.5 9-4.5M3 16l9 4.5 9-4.5"/>',
    phone:'<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    monitor:'<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8.5 20.5h7M12 17v3.5"/>',
    trophy:'<path d="M7.5 4.5h9v4a4.5 4.5 0 0 1-9 0z"/><path d="M7.5 6.5H4.5a3 3 0 0 0 3 4M16.5 6.5h3a3 3 0 0 1-3 4M12 13v3.5M8.5 20h7l-1-3.5h-5z"/>',
    rotate:'<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20.5 4v4.5H16"/>',
    book:'<path d="M4 4.5h12.5A2.5 2.5 0 0 1 19 7v13.5H6.5A2.5 2.5 0 0 0 4 23"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 7H19"/><path d="M8 10.5h7M8 14h6"/>'
  };
  var s='<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">';
  for(var k in P){s+='<symbol id="fz-i-'+k+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+P[k]+'</symbol>';}
  s+='</svg>';
  document.body.insertAdjacentHTML('afterbegin',s);
  window.FZ_ICON=function(n,cls){return '<svg class="fz-i'+(cls?' '+cls:'')+'" aria-hidden="true" focusable="false"><use href="#fz-i-'+n+'"/></svg>';};
})();
