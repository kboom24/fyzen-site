# Credits — Tidepool Tumble

- Code: original, written for Hexan. Engine: Hexan Engine (`hexan.js`), original.
- Art: drawn procedurally on canvas at runtime. No image files.
- Sound and music: synthesized at runtime with WebAudio (`HX.Audio`). No sample files.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
- Third-party assets: none. If you add any, log them here with name, author, license (CC0/OFL only), and source URL.

## Tidepool Tumble specifics
- Critters (Dewdrop to Moonwhale), pools, skins, the Nimbo cloud, title logo, share card and store thumbnails: original vector art drawn in code (`art.js`), designed for this game.
- Physics: original in-house circle solver (`core.js`), no third-party libraries.
- Sound effects and both music loops: original, synthesized at runtime with WebAudio through `HX.Audio` (`art.js`, `SFX` and `SONGS`).

## Platform brand (FizzSoup)
- Logo, badge and favicon artwork: FizzSoup brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
