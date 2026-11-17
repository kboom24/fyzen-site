# Credits — Halftone Heat

- Code: original, written for Hexan. Engine: Hexan Engine (`hexan.js`, hx@1.2.1, unmodified), original.
- Art: drawn procedurally on canvas at runtime in the "Risograph Press" style (flat spot inks, halftone dots, plate misregistration, paper grain). No image files.
- Sound and music: synthesized at runtime with WebAudio (`HX.Audio`). No sample files.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
- Third-party assets: none. If you add any, log them here with name, author, license (CC0/OFL only), and source URL.

## Halftone Heat specifics
- The eight sticker cars (Pip, Wedgie, Bubble, Mule, Scrapper, Brute, Swallow, Comet), the twelve riso paints, the six locations (Citrus Coast, Paper Mesa, Cherry Hills, Blue Glacier, Night Market, Ember Ridge) and their props, the pseudo-3D road renderer, halftone ghost, boost flames, sparks, speed lines, title art, share card and store thumbnails: original vector art drawn in code (`art.js`), designed for this game.
- Race simulation, 24 track generators + seeded daily track, rival AI, test bot, ghost codec and the offline leaderboard stub (`core.js`): original, deterministic, in-house, no third-party libraries.
- Engine note (speed-pitched oscillator + filtered noise), sound effects and the layered race music: original, synthesized at runtime with WebAudio (`art.js`).
- Only the general pseudo-3D circuit-racer mechanic is shared with the genre; no names, characters, art, sound or code were copied from any other game.

## Platform brand (FizzSoup)
- Logo, badge and favicon artwork: FizzSoup brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
