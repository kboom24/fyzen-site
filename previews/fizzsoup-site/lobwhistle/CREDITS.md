# Credits — Lobwhistle

- Code: original, written for this game. Engine: Hexan Engine (`hexan.js` 1.2.1), copied byte-for-byte from `engine/hexan.js`.
- In-game art: original, drawn procedurally on canvas at runtime (court, fox, heron, ball, tiles, HUD). No ripped sprites. `art.js` is the swap point for later keyframe atlases.
- Lobwhistle cover tile: original art by STUDIO ART (FizzSoup Studio), file `thumbs/square.512x512.webp`.
- Landscape and portrait thumbnails: derived from STUDIO ART keyframes (FizzSoup Studio), cropped to 1280×720 and 720×1280. Those keyframes are a visual target only; the running game does not display them.
- Sound and music: synthesized at runtime with WebAudio (`HX.Audio`). No sample files.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
- Third-party assets: none.

## Platform brand (FizzSoup)
- Logo, badge and favicon artwork: FizzSoup brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
