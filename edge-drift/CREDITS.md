# Credits — Slipcrest

A Playtoom game. Everything in Slipcrest was made for this game: no images, samples or third-party code.

- Code: original, written for Hexan. Engine: Hexan Engine (`hexan.js`, v1.2.1), original. The game code (`game.js`, `js/*.js`) is original work for Playtoom.
- Art: drawn procedurally on canvas at runtime. There are no image files.
  - Road, cars (stacked-slice voxel style), skyline/dunes/mountain/planet backdrops, void grids, particles, title logo and icons are all generated in code.
  - All 10 cars (Pebble, Zest, Bramble, Sundog, Halo Wedge, Frostbite, Velvet Hammer, Nebula Nine, Gilded Goose, Old Comet) are original designs, not based on any real vehicle or brand.
- Sound and music: synthesized at runtime with WebAudio (`HX.Audio`). There are no sample files.
  - The engine hum, tyre screech, wind, edge-scrape and all SFX are procedural voices (`js/sound.js`).
  - The 5 music loops (menu, Neon City, Desert Sunset, Snow Peaks, Deep Space) are original compositions sequenced in code.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
- Platform splash and "Powered by Playtoom" badge: drawn by the Hexan engine from the Playtoom brand kit (not part of this game's art).
- Third-party assets: none.

## Name check
"Slipcrest" was chosen after "Edge Drift" (the working title) turned out to be already used by other games and apps. A web search on 27 Oct 2026 found no game titled "Slipcrest" (the closest was the unrelated racer "Slipstream"). The folder or slug stays `edge-drift`.

## Platform brand (Playtoom)
- Logo, badge and favicon artwork: Playtoom brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
