# Credits — Clackabout

- Code: original, written for Hexan. Engine: Hexan Engine (`hexan.js`, hx@1.2.1, unmodified), original.
- Art: drawn procedurally on canvas at runtime in the "toy-box diorama" style (lacquered wood planks with grain and end-grain rings, glossy primary-colour plastic toys, wind-up keys, alphabet-block logo, soft-focus playroom backdrops). No image files.
- Sound and music: synthesized at runtime with WebAudio (`HX.Audio`, `js/audio.js`): wooden clacks pitched by size, plastic rattles, wind-up motor voices per toy, ratchet swap, rubber-duck honk, splash, boing, rocket whoosh, and a toy-piano / xylophone / music-box band per world. No sample files.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
- Third-party assets: none. If you add any, log them here with name, author, license (CC0/OFL only), and source URL.

## Clackabout specifics
- The six toys (Stomper, Pinewood, Tubtug, Zoomrod, Scoopy, Boingo), the ten worlds (Playroom Rug, Block Town, Bathtub Bay, Bookshelf Cliffs, Train-Set Junction, Marble Run, Kitchen Table, Sandbox Yard, Pillow Fort, Attic Toy Chest), the 100 level names, paints, drivers and finish-line pops: original.
- Physics (`js/phys.js`: deterministic XPBD particles, 60 ticks × 8 sub-steps, polynomial sine for movers), the level DSL and 100 hand-authored levels (`js/levels.js`), the Daily Toy Box stitcher (`js/daily.js`), the input-log codec + challenge links (`js/replay.js`), the offline leaderboard preview stub (`js/lb.js`) and the beam-search par bot (`qa-scripts/bot.js`): original, in-house, no third-party libraries.
- Only the general 2D physics-vehicle obstacle-course mechanic is shared with the genre; no names, characters, art, sound, levels or code were copied from any other game.

## Name check (2026-10-29, web search: games, App Store, Google Play, itch.io, Steam, trademarks)
- "Clackabout": no game, app, toy or trademark found under that name. Nearest results: *Kickabout™ Table Soccer* (US mark KICKABOUT 99558633; different first syllable, meaning and genre), *Clackers Master* (clacker-toy app), the *CLACK!* board game.
- Rejected candidates and why are logged in `qa/PROGRESS.md` (Phase 1). Recommendation: a formal USPTO/EUIPO class 9/41 knockout search before launch.

## Platform brand (FizzSoup)
- Logo, badge and favicon artwork: FizzSoup brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
