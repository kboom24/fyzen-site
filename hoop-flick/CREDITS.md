# Credits — Cinderhoop

A Playtoom original (slug `hoop-flick`). Built on the Hexan Engine for the Playtoom game library.

- Code: original, written for Hexan. Engine: Hexan Engine (`hexan.js`), original, unmodified (byte-identical copy of hx@1.2.1). Game code: `core.js` (ball/rim/backboard physics, ideal-shot solver and aim assist, flick detector, scoring, levels, daily shootout, arcade spots) and `game.js` (scenes, perspective renderer, verlet net, input, audio, share).
- Art: drawn procedurally on canvas at runtime. That covers the perspective courts (Dusk Lot, School Gym, Rooftop Night, Beach Court, Neon Arena), crowd silhouettes, backboard, rim and the verlet-cloth net. It also covers the six ball skins, the flames, the CINDERHOOP logo (a flaming ball over the word mark) and the share card. There are no image files. The store thumbnails in `thumbs/` are rendered from the same procedural art.
- Sound and music: synthesized at runtime with WebAudio (`HX.Audio`). This includes the swish, rim rattle, backboard thud, floor bounce, ignition and buzzer, the crowd bed (looped noise through a band-pass filter that swells with your streak) and both music loops. There are no sample files.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts. System UI is the fallback. Nothing is downloaded from outside.
- Names (Cinderhoop, mode names, court and ball names, trick callouts): original.

## Name check (28 Oct 2026)

I searched the web for "Cinderhoop" as a game, app, basketball game and trademark, and found no game, app, product or trademark with that name. The nearest names were *CinderHook* (an action game on Remix) and *Cinderhoard* (a dragon tower-defense game). Both have different words and genres. Rejected candidates:

- **Netblaze**: too close to *Netblazer*, a Flash basketball game.
- **Rimblaze**: in use as a streamer/Reddit handle.
- **Torchrim**: no conflict, but a weaker name.
- **Scorchnet**: an old BBS network and a fan-fiction character.

The brief asked me to stay away from Basketball FRVR, Flick Shoot, Hoop Shot and Swish. Cinderhoop shares no words with any of them. "Swish" is only used inside the game as the basketball term for a clean make.

## Platform brand (Playtoom)
- Logo, badge and favicon artwork: Playtoom brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
