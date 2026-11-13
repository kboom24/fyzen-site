# Credits — Wobbline

A Playtoom original (slug `line-draw`). Built on the Hexan Engine for the Playtoom game library.

- **Code:** original, written for Hexan. Engine: Hexan Engine (`hexan.js`), a byte-identical, unmodified copy of hx@1.2.1.
  - `core.js` holds the game's own deterministic 2D rigid-body physics: circles and capsules, compound bodies, sequential impulses with warm starting, pins and hinges, kinematic movers, wind and gravity flip. It also holds stroke simplification (Ramer–Douglas–Peucker plus a minimum segment length), the level generator, goals, scoring, the daily pool and the baked reference solutions.
  - `game.js` holds the scenes, the renderer, pointer, pen and palm input, audio and sharing.
  - `tools/solve.js` is the offline solver that finds and verifies the reference solutions.
- **Art:** drawn procedurally on canvas at runtime. This covers the notebook-paper backdrop, marker-drawn geometry, ice, bouncy pads, pins, no-draw stripes, wind bands, the googly-eyed balls, the critter, rocks, the wooden target block, the ink strokes and the WOBBLINE logo (a hand-drawn wobbly line with a ball rolling along it). There are no image files. The store thumbnails in `thumbs/` and the share card are rendered from the same procedural art.
- **Sound and music:** synthesized at runtime with WebAudio (`HX.Audio`). This includes the pen scratch, line pop, thuds, bounce, cup jingle, star chimes and two step-sequencer music loops. There are no sample files.
- **Fonts:** the platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts. The system UI font is the fallback. Nothing is downloaded from outside.
- **Names:** Wobbline, the chapter names (First Lines, Umbrella Time, Pins & Hinges, Boing, Timber!, Black Ice, Keep Out, On the Move, Meet Cute, Gusty, Crowd Control, Upside Down, Grand Mix) and the ink names are all original.

## Name check (28 Oct 2026)

**Final name: Wobbline.** It is "wobble" plus "line", because every line you draw becomes a wobbly physical object. An exact-phrase web search for "Wobbline", and searches for it as a game, app and trademark, found no game, app, product or trademark with that name. The nearest results:

- *Wobblins*: soft-plastic fishing worms (WamBaits), a Swedish figurine brand, and EU trademark filings for confectionery and for toys (one opposed).
- *Three Goblin Wobblin'*: a 2024 Steam/mobile action game.

Both use different words in different genres.

Candidates rejected along the way:

- **Wobblink**: my first pick. A second search showed it sounds identical to *Woblink*, a Polish e-book store with its own Google Play app, so I dropped it.
- **Inkwright**: an existing Steam game and an itch.io creator.
- **Scrawlworks**: too close to existing "Scrawl" apps.
- **Squigglesmith**: too close to Noodlecake's draw-physics game *Squiggle Drop*.
- **Inkrig**: a tattoo business.
- **Scribbleforge**: an art blog. The nearest game is *Please Don't Scribble Me*.
- **Inkplank**: too close to *Ink Ball*, a draw-ink-planks physics game.
- **Wiggleway**: a children's race-track toy (WiggleWay).
- **Doodlehinge**: "Doodle" is strongly associated with Google Doodles and Doodle Jump.
- **Tumbline**: sounds like *Tumblin' Terracotta*, an iPad physics game, and *Triple Tumblin' Totems*, a Play'n GO game trademark.
- **Scribbridge**: close to the US mark SCRIBEBRIDGE.
- **Plonkline**: *Plonk* is an existing puzzle game.

The brief asked me to stay away from Brain It On, Draw Physics, Love Balls, Save the Doge, Draw Joust, Draw Climber, Physics Drop and Crayon Physics. Wobbline shares no words with any of them, and the game avoids the words "draw", "physics", "brain", "doge", "balls" and "crayon" in its title.

## Platform brand (Playtoom)
- Logo, badge and favicon artwork: Playtoom brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
