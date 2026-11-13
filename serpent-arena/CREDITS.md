# Credits — Swervana

- Game design, code and all in-game content: original, written for Hexan / Playtoom. Only the general snake-arena mechanic is borrowed from the genre; no names, art, sound or code from any other game.
- Engine: Hexan Engine 1.2.1 (`hexan.js`), original, used unmodified.
- Art: everything is drawn procedurally on canvas at runtime: snakes, orbs, arena floor, logo, share card. No image files ship in the game. The store thumbnails in `thumbs/` were rendered from the game's own renderer (no third-party art).
- Sound and music: synthesized at runtime with WebAudio (`HX.Audio` tones and step-sequencer loops written for this game). No sample files.
- Rival names: generated at runtime from short original syllable lists; they are not real people or accounts.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
- Third-party assets: none.

## Platform brand (Playtoom)
- Logo, badge and favicon artwork: Playtoom brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
