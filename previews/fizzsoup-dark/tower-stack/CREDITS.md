# Credits — Cloudmason

- Code: original, written for Hexan. Engine: Hexan Engine (`hexan.js`), original.
- Art: drawn procedurally on canvas at runtime. No image files.
- Sound and music: synthesized at runtime with WebAudio (`HX.Audio`). No sample files.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
- Third-party assets: none. If you add any, log them here with name, author, license (CC0/OFL only), and source URL.

## Cloudmason specifics
- Pip the cloud mason, the slabs and all seven block skins, the five sky zones (Meadow, Cloud Sea, Sunset Heights, Aurora Veil, Starfield), the four sky themes, the title art, share card and store thumbnails: original vector art drawn in code (`art.js`), designed for this game.
- Stacking simulation (slicing, perfect snap, grow-back, seeded slab patterns, Sky Levels): original, deterministic, in-house (`core.js`), no third-party libraries.
- Sound effects, the perfect-drop melody and the layered music (six layers that join as you climb and as your streak grows): original, synthesized at runtime with WebAudio through `HX.Audio` (`art.js`, `SFX` and `makeSong`).
- Only the general one-tap stacking mechanic is shared with the genre; no names, art, sound or code were copied from any other game.

## Platform brand (FizzSoup)
- Logo, badge and favicon artwork: FizzSoup brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
