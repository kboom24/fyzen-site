# Credits — Pipfuse

Pipfuse is an original game made for the **FizzSoup** browser-game platform (Hexan studio).

- Code: original, written for Hexan. Engine: Hexan Engine (`hexan.js`), original.
- Game rules, level designs (30 levels), themes and the PIPFUSE logo: original. The logo is drawn on canvas at runtime.
- Art: drawn procedurally on canvas at runtime. No image files (the store thumbnails in `thumbs/` are screenshots of the game itself).
- Sound and music: synthesized at runtime with WebAudio (`HX.Audio`). The music is an original pentatonic loop. There are no sample files.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
- Third-party assets: none.

## Genre note (mechanics only)
Tap a group of touching equal numbers to merge it into a bigger number. This is a public-domain style of puzzle mechanic (the "tap-group merge" genre, e.g. *Just Get 10*). Pipfuse copies no names, art, sound, text or code from any game. Its own twists are original: the fused tile lands where you tap, the "hot tile" chain rule, frost and rock blockers, goal levels with three stars, the Daily Board and the unlockable themes. It is not a 2048-style slide game; there is no swiping and no board-wide movement.

## Name check (27 Oct 2026, web search, not legal clearance)
- The working title "Number Pop" was rejected because it is already used by several games: a "Number Pop" browser game (Bbeol), "Number-Pop" on iOS (Avakai), "Bubble Shooter Number Pop" and a "Number Pop" kids' maths game.
- These alternatives were also rejected because they were taken or too close: Numbloom (a number-merge puzzle by Dark Point Studios), Pip Bloom, Tally Bloom, Tallypop (a Box Turtle Games mobile game) and Plusplop.
- **Pipfuse:** the searches found no game, app or brand by this name. The only hit was an academic infrared image-fusion paper titled "PIPFuse". The nearest trademark found was PIXFUSE (photo software, class 9), which is a different word in a different field.

## Platform brand (FizzSoup)
- Logo, badge and favicon artwork: FizzSoup brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
