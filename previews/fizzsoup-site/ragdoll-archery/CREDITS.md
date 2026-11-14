# Credits — Quivertwang

- Game design, code, physics, AI, levels and art direction: original, written for FizzSoup on Hexan Engine v1.2.1 (`hexan.js`, unedited engine copy). The Verlet-ragdoll approach follows Wallopwick (ragdoll-stunts), another FizzSoup game; the Quivertwang physics code is new.
- Art: everything (paper texture, carved sun, mountains and waves, pillars, crates, ragdoll archers, hats, bows, arrows, ink splats, stamps, logo, share card) is drawn procedurally on canvas at runtime in `js/render.js` and `js/menus.js`. No image files ship except the store thumbnails in `thumbs/`, which are renders of the game's own drawing code.
- Sound and music: all effects (bow creak and twang, whoosh, wood thunk, body thud, headshot bonk, K.O. boom, ice shimmer, parry clink, crate crack, rope, stamps, stars) and both music loops are synthesized at runtime with WebAudio (`HX.Audio.tone` / `HX.Audio.music`). The note patterns are original. No sample files.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
- Boss names (Sprig the Squire, Marrow Moss, Old Tallow, Brindle Bea, Thatch Tom, Hazel Crookshank, Sir Rumpus, The Ink Hermit, Gristle Gwen, Barnaby Bramble, Countess Quillon, The Woodcut King) are original.
- Third-party assets: none. No backends, no live leaderboards, no external network calls.

## Name check (2026-10-28)
Web searches for "Quivertwang" and "Quiver Twang" (game, app, archery, trademark) found no game, app or trademark with this name. Nearest matches are clearly distinct: Nitrome's "Twang" (a physics platformer), "Quiver Quest" (a VR game on Steam), "Quiver: Archery Scoresheets" (an iOS scoring app) and "QuivAR" (an AR hunting app). A formal trademark search (WIPO Global Brand Database / USPTO / EUIPO) is still recommended before launch.

## Platform brand (FizzSoup)
- Logo, badge and favicon artwork: FizzSoup brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
