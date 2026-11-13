# Credits — Morphmaw.io

- Game design, code, simulation, bots, netcode seam and art direction: original, written for Playtoom on Hexan Engine v1.2.1 (`hexan.js`, unedited engine copy). Only the genre mechanic (eat to grow, evolve, brawl other monsters, as in .io evolution games) is borrowed; no names, art, sound or code from any other game.
- Art: every sticker monster (34 forms across the Chomp, Spike and Puff lines), the doodle maps (graph, lined and dotted paper, ponds, rocks, bushes, pen doodles), snacks, cocoons, attack effects, stamps, sticker buttons, logo and share card are drawn procedurally on canvas at runtime (`js/art.js`, `js/play.js`, `js/menus.js`, `js/social.js`). No image files ship except the store thumbnails in `thumbs/`, which are renders of the game's own drawing code.
- Sound and music: all effects (munch with combo pitch, chomp, spin whoosh, spit, glob splat, hits, hurt, KO pop, cocoon, evolve fanfare, apex fanfare, danger heartbeat, stars) and both music loops are synthesized at runtime with WebAudio (`HX.Audio.tone` / `HX.Audio.music`). The note patterns are original. No sample files.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
- Names: the game title, all 34 form names (Blip, Nibbit … Maw Monarch, Prickle … Thornado, Puffkin … Nimbusaur), arena names and generated bot names are original.
- Third-party assets: none. No backends, no live leaderboards, no external network calls.
- Name check: see NAME-CHECK.md.

## Platform brand (Playtoom)
- Logo, badge and favicon artwork: Playtoom brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
