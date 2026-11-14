/* FizzSoup site game config. ONE place to flip a game live.
   live:true  -> cards link to the game page (#play opens the immersive player) and the page loads <slug>/index.html in its iframe.
   live:false -> card shows "Coming today", no link, no iframe.
   orientation: "any" | "portrait" | "landscape", locked only while in real fullscreen where the browser allows it.
   After deploying a game folder to the repo, change its live:false to live:true. No rebuild needed. */
window.PT_GAMES = {
  "gem-lattice":{ title: "Gem Lattice", page: "gem-lattice",     live: true  , orientation: "any" },
  "plop-planets":{ title: "Plop Planets", page: "plop-planets",    live: true  , orientation: "any" },
  "stack-sort":{ title: "Chromacomb", page: "chromacomb",      live: true  , orientation: "any" },
  "deep-cast":{ title: "Lumenhook", page: "lumenhook",       live: true  , orientation: "any" },
  "fernpuff-fields":{ title: "Fernpuff Fields", page: "fernpuff-fields", live: true  , orientation: "any" },
  "number-pop":{ title: "Pipfuse", page: "pipfuse",         live: true  , orientation: "any" },
  "swarm-colony":{ title: "Gnawnauts", page: "gnawnauts",       live: true  , orientation: "any" },
  "swingsprout":{ title: "Swingsprout", page: "swingsprout",     live: true  , orientation: "any" },
  "noodle-path":{ title: "Noodle Sprawl", page: "noodle-sprawl",   live: true  , orientation: "any" },
  "edge-drift":{ title: "Slipcrest", page: "slipcrest",       live: true  , orientation: "any" },
  "nine-ball":{ title: "Lantern Nine", page: "lantern-nine",    live: true  , orientation: "any" },
  "balloon-archery":{ title: "Skyfletch", page: "skyfletch",       live: true  , orientation: "any" },
  "trap-door":{ title: "Heckle Hollow", page: "heckle-hollow",   live: true  , orientation: "any" },
  "serpent-arena":{ title: "Swervana", page: "swervana",        live: true  , orientation: "any" },
  "merge-drop":{ title: "Tidepool Tumble", page: "tidepool-tumble", live: true  , orientation: "any" },
  "word-daily":{ title: "Hopabet", page: "hopabet",         live: true  , orientation: "any" },
  "tower-stack":{ title: "Cloudmason", page: "cloudmason",      live: true  , orientation: "any" },
  "ragdoll-stunts":{ title: "Wallopwick", page: "wallopwick",      live: true  , orientation: "any" },
  "hoop-flick":{ title: "Cinderhoop", page: "cinderhoop",      live: true  , orientation: "any" },
  "line-draw":{ title: "Wobbline", page: "wobbline",        live: true  , orientation: "any" },
  "idle-tycoon":{ title: "Thistlewhirl", page: "thistlewhirl",    live: true  , orientation: "any" },
  "endless-run":{ title: "Scamperlight", page: "scamperlight",    live: true  , orientation: "any" },
  "daily-jigsaw":{ title: "Daylace", page: "daylace",         live: true  , orientation: "any" },
  "bike-race":{ title: "Snipwheel", page: "snipwheel",       live: true  , orientation: "any" },
  "soccer-cup":{ title: "Curlicup", page: "curlicup",        live: true  , orientation: "any" },
  "couch-2p":{ title: "Jellybout", page: "jellybout",       live: true  , orientation: "any" },
  "ragdoll-archery":{ title: "Quivertwang", page: "quivertwang",     live: true  , orientation: "any" },
  "rhythm-battle":{ title: "Hollerbout", page: "hollerbout",      live: true  , orientation: "any" },
  "chess-checkers":{ title: "Oakcrown", page: "oakcrown",        live: true  , orientation: "any" },
  "shop-idle":{ title: "Bobbleboat Bazaar", page: "bobbleboat-bazaar", live: true  , orientation: "any" },
  "stealth-heist":{ title: "Tiptail", page: "tiptail",         live: true  , orientation: "any" },
  "rhythm-dash":{ title: "Thrumdash", page: "thrumdash",       live: true  , orientation: "any" },
  "hole-grow":{ title: "Burrowbelly", page: "burrowbelly",     live: true  , orientation: "any" },
  "car-race":{ title: "Halftone Heat", page: "halftone-heat",   live: true  , orientation: "any" },
  "brain-riddles":{ title: "Wrinklewit", page: "wrinklewit",      live: true  , orientation: "any" },
  "reading-spelling":{ title: "Mothabet", page: "mothabet",        live: true  , orientation: "any" },
  "car-levels":{ title: "Clackabout", page: "clackabout",      live: true  , orientation: "any" },
  "crowd-math":{ title: "Multiplatoon", page: "multiplatoon",    live: true  , orientation: "any" },
  "evolve-io":{ title: "Morphmaw.io", page: "morphmaw-io",     live: true  , orientation: "any" },
  "arena-paint":{ title: "Daubstorm", page: "daubstorm",       live: true  , orientation: "any" },
  "swallow-city":{ title: "Gulpopolis", page: "gulpopolis",      live: true  , orientation: "any" },
  "elemental-duo":{ title: "Sizzle & Mizzle", page: "sizzle-and-mizzle", live: true  , orientation: "any" },
  "merge-defense":{ title: "Origarrison", page: "origarrison",     live: true  , orientation: "any" },
  "moatball":{ title: "Moatball", page: "moatball",        live: true  , orientation: "any" },
  "whirlwatch":{ title: "Whirlwatch", page: "whirlwatch",      live: true  , orientation: "any" },
  "yesterlings":{ title: "Yesterlings", page: "yesterlings",     live: true  , orientation: "any" },
  "lobwhistle":{ title: "Lobwhistle", page: "lobwhistle",      live: true  , orientation: "any" },
  "floepuck":{ title: "Floepuck", page: "floepuck",        live: false  , orientation: "any" },
  "short-fuse":{ title: "Short Fuse", page: "short-fuse",      live: true  , orientation: "landscape" },
  "bubbletoom":{ title: "Bubbletoom", page: "bubbletoom",      live: true  , orientation: "any" }
};

/* Public wrapper URL uses brand page slug; engine slug stays for folders / saves / stats. */
window.PT_PAGE = function (s) {
  var g = window.PT_GAMES && PT_GAMES[s];
  return (g && g.page) || s;
};
window.PT_GAME_HREF = function (s, hash) {
  return "game-" + PT_PAGE(s) + (hash || "");
};
