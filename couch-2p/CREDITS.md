# Credits — Jellybout

- Game design, code, art direction and audio: original, written for Playtoom on the Hexan Engine (`hexan.js` 1.2.1, unmodified).
- Art: everything is drawn procedurally on canvas at runtime by the game's own art kit (`core.js`: gummy jellies, tufted quilt backdrops, stitched cushions and patches, wobbly logo). No image files except the three store thumbnails in `thumbs/`, which are rendered from the same art kit by `qa/thumbs.js`.
- Sound effects and music loops: synthesized at runtime with WebAudio (`HX.Audio.tone` / `HX.Audio.music`). No sample files.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
- Character names (Gumdrop, Blubb, Minto, Butterbun, Plumbo, Tangy, Cocoa, Frosty, Limey, Nebula, Rubyhorn) and microgame names (Hot Jam, Flop Hoops, Wobble Bows, Pouf Sumo, Flap Duel, Snack Snap) are original to this game.
- Genre inspiration only (no code, art, audio or names reused): same-device 2-player party games such as tag, flop-basketball, archer duels, sumo and jousting.
- Third-party assets: none.

## Platform brand (Playtoom)
- Logo, badge and favicon artwork: Playtoom brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
