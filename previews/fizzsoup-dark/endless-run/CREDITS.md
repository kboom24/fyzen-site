# Credits — Scamperlight

- Code: original, written for Hexan. Engine: Hexan Engine (`hexan.js`, hx@1.2.1, unmodified), original.
- Art: drawn procedurally on canvas at runtime. No image files.
- Sound and music: synthesized at runtime with WebAudio (`HX.Audio`). No sample files.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
- Third-party assets: none. If you add any, log them here with name, author, license (CC0/OFL only), and source URL.

## Scamperlight specifics
- Fen the lamplighter fox-kit and the other runners (Olli, Maple, Puck, Nim), the six hover boards, the five biomes (Dusk Meadow, Amber Canyon, Frostwood, Starfall Ruins, Aurora Lake), obstacles, glow motes, power-ups, lantern gates, title art, share card and store thumbnails: original vector art drawn in code (`art.js`), designed for this game.
- Runner simulation, seeded course generator, fairness solver and test bot (`core.js`): original, deterministic, in-house, no third-party libraries.
- Sound effects, the pentatonic mote runs and the layered music (seven layers that join with distance and on boost): original, synthesized at runtime with WebAudio through `HX.Audio` (`art.js`, `SFX`, `makeSong`, `menuSong`).
- Only the general three-lane runner mechanic is shared with the genre; no names, characters, art, sound or code were copied from any other game.

## Platform brand (FizzSoup)
- Logo, badge and favicon artwork: FizzSoup brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
