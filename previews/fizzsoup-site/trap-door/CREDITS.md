# Credits — Heckle Hollow

A FizzSoup original (slug `trap-door`). Built on the Hexan Engine for the FizzSoup game library.

- Code: original, written for Hexan. Engine: Hexan Engine (`hexan.js`), original. Game code: `core.js` (deterministic platformer simulation + trap system), `levels.js` (30 hand-made levels), `game.js` (scenes, art, audio, narrator).
- Art: drawn procedurally on canvas at runtime (tiles, spikes, doors, the hero skins, the narrator Grinwick, backgrounds, particles). No image files. Store thumbnails in `thumbs/` are rendered from the same procedural art.
- Sound and music: synthesized at runtime with WebAudio (`HX.Audio`): every SFX, the four looping tunes and Grinwick's babble voice. No sample files.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
- Characters and names (Heckle Hollow, Grinwick, Pip and the skins, all level names): original.
- Third-party assets: none. If you add any, log them here with name, author, license (CC0/OFL only), and source URL.
- Name check (27–28 Oct 2026): "Trap Door" was dropped as a title because it is an existing game/TV franchise ("The Trap Door", Piranha Software 1986, and its sequel). "Heckle Hollow" had no game conflicts in a web search (the only use found is a nickname for a spectator section of a cyclocross race in Folsom, CA).

## Platform brand (FizzSoup)
- Logo, badge and favicon artwork: FizzSoup brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
