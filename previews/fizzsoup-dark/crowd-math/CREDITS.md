# Credits — Multiplatoon (crowd-math)

- Game design, code and tuning: original, written for FizzSoup on Hexan Engine (`hexan.js` 1.2.1, unmodified). Only the general "crowd runner with gates" mechanic is borrowed from the genre; the name, art, sound, music and code are original.
- Title: "Multiplatoon" (multiply + platoon). The name check and rejected alternatives are in `qa/name-check.md`.
- Art: everything is drawn procedurally on canvas at runtime by `js/sprites.js`, `js/render.js`, `js/menus.js` and `js/share.js`. That covers the tin toy soldiers (8 uniforms plus the spiky-helmet rival squads), cellophane-and-pencil gates, spinning tops, the cardboard castle and its damage states, the wallpaper/skirting/floor backdrops for 3 worlds, the cardboard road, HUD chips and the share card. There are no image files and no third-party art. Store thumbnails (`thumbs/*.webp`) are frames rendered by the game's own renderer (`qa-scripts/thumbs.js`).
- Sound effects and music: synthesized at runtime with WebAudio through `HX.Audio` presets and sequencer loops (`js/audio.js`). No sample files.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts, plus a system UI fallback. Nothing is downloaded.
- Sample-player names on the offline leaderboard preview are generic ("Sample player #N").
- Third-party assets: none (no CC0 assets were needed). Any future addition must be logged here with its name, author, licence (CC0/OFL only) and source URL.

## Platform brand (FizzSoup)
- Logo, badge and favicon artwork: FizzSoup brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
