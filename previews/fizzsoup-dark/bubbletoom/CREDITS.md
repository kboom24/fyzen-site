# Credits — Bubbletoom

- **Code:** original, written for Hexan. Engine: Hexan Engine (`hexan.js` 1.2.1), original, unmodified.
- **Art:** everything is drawn procedurally on canvas at runtime by `art.js` and `share.js`. That covers the dusk sky, lighthouse, sea, pier, bunting and festoon lights, the festival bubbles and their six motifs (shell, star, fish, heart, leaf, drop), the Storm bubble, the lifebuoy launcher, the puffin mascot and the 1200x630 share card. There are no image files in the game. The store thumbnails in `thumbs/` and the hover clip in `qa-evidence/` are captures of the game's own rendering.
- **Sound and music:** synthesized at runtime with WebAudio through `HX.Audio`, using the engine's sfx presets and an original 116 bpm festival loop written for this game in `game.js`. There are no sample files.
- **Fonts:** platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1). The engine build bundles them locally into `brand/fonts/` with their licence texts, with a system UI fallback. Nothing is downloaded from outside.
- **Brand:** the FizzSoup splash and "Powered by FizzSoup" badge come from `engine/brand/`.
- **Third-party assets:** none.

## Platform brand (FizzSoup)
- Logo, badge and favicon artwork: FizzSoup brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
