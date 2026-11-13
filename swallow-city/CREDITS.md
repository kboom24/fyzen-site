# Credits — Gulpopolis

- Code: original, written for Playtoom by PLAYVERSY | Game Builder 3. Engine: Hexan Engine (`hexan.js` 1.2.1, unmodified), original.
- Art: the "Pop-Up Map" style — every building, car, tree, person, hole rim, UI card, logo, share card and store thumbnail is drawn procedurally on canvas in code (`js/art.js`, `js/share.js`, `js/scenes.js`). No image files. Designed for this game; deliberately distinct from other Playtoom games (e.g. the car racer's risograph style).
- Sound and music: synthesized at runtime with WebAudio (`HX.Audio` + `js/audio.js`): gulps, slurps, size-up fanfares, chomps, the countdown tick and the looping bass/marimba groove are all original. No sample files.
- Names: Gulpopolis, the rival holes (Munchkin, Big Burp, Slurpo, Nom Noir, Chompette, Gobbo, Wolfgang, Maw Maw, Gullet, Snaccident), shop signs (MUNCH MART, NOM & CO, SNAX, BITE SHOP) and skins are original. Only the genre mechanic (a hole that grows by swallowing smaller things) is shared with other games; no names, art, sound or code from hole.io / Voodoo or any other game are used.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
- Third-party assets: none.

## Name check (2026-10-30)
See `qa/name-check.md`. "Gulpopolis": no game, app or brand found by web search (nearest: Grepolis, Gluttonopolis, Goblinopolis — different names). "Slurpopolis" rejected (too close to the Slurpee trademark). Not a formal legal clearance.

## Platform brand (Playtoom)
- Logo, badge and favicon artwork: Playtoom brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
