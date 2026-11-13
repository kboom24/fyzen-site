# Credits — Lantern Nine

- Code: original, written for Hexan. Engine: Hexan Engine (`hexan.js`), original.
- Art: drawn procedurally on canvas at runtime. No image files.
- Sound and music: synthesized at runtime with WebAudio (`HX.Audio`). No sample files.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
- Third-party assets: none. If you add any, log them here with name, author, license (CC0/OFL only), and source URL.
- Physics: original deterministic billiards simulation (`physics.js`), fixed 1/480 s sub-steps with exact time-of-impact, sliding/rolling friction, spin, throw and cushion grip.
- Table, balls (per-pixel shaded sprites), cues, lamp light and share image: procedural canvas drawing.
- Music: an original lounge loop written as note data for `HX.Audio.music`.
- Platform logo on the share image: the engine's own brand assets (`HX.Brand`), never redrawn.

## Platform brand (Playtoom)
- Logo, badge and favicon artwork: Playtoom brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
