# Credits — Skyfletch

- Game design, code, levels and solver: original, written for Playtoom on Hexan Engine v1.2.1 (`hexan.js`, unedited engine copy).
- Art: everything (balloons and faces, archer "Pip", bows and arrows, six world backdrops, clouds, rain, snow, fireflies, aurora, obstacles, icons, logo, share card) is drawn procedurally on canvas at runtime by `art.js` / `game.js`. No image files are shipped except the store thumbnails in `thumbs/`, which are screenshots of the game's own rendering.
- Sound and music: all SFX (bow stretch and twang, pitched pops, gold chime, stick thuds, blasts, thunder, combo stingers, gust warning, star dings) and the eight music loops are synthesized at runtime with WebAudio (`HX.Audio.tone` / `HX.Audio.music`). The note patterns are original. No sample files.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
- Third-party assets: none. No backends, no leaderboards, no external network calls.

## Name check (2026-10-27)
Web searches for "Skyfletch", "Skyfletch game app archery" and "Skyfletch trademark" found no game, app or trademark with this name. The only matches are two unrelated private companies called Skyfletch Limited (Hong Kong, 2019; UK online retail, 2020) with no game products and no trademark shown. The nearest app names are "Fletch: Archery Training" and "Fletch: Daily Arrow Puzzle" (iOS), which are clearly distinct. A formal trademark search (WIPO Global Brand Database / USPTO / EUIPO) is still recommended before launch.

## Platform brand (Playtoom)
- Logo, badge and favicon artwork: Playtoom brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
