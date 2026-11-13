# Credits — Burrowbelly

- Game design, code and tuning: original, written for Playtoom on Hexan Engine (`hexan.js` 1.2.1, unmodified, original).
- Art: every sprite (37 garden objects, 12 critter skins, holes, lawn, paths, ponds, lanterns, tilt-shift and vignette) is drawn procedurally on canvas at runtime by `js/sprites.js` and `js/render.js`. No image files, no third-party art.
- Sound effects and music: synthesized at runtime with WebAudio through `HX.Audio` presets and sequencer loops (`js/audio.js`). No sample files.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
- Rival names are generated from an original word list (`BB.botName`); any resemblance to real usernames is coincidental.
- Third-party assets: none (no CC0 assets were needed). Any future addition must be logged here with name, author, licence (CC0/OFL only) and source URL.

## Platform brand (Playtoom)
- Logo, badge and favicon artwork: Playtoom brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
