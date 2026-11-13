# Credits — Lumenhook

An original game for the Playtoom platform (slug `deep-cast`).

- Code: original, written for Hexan. Engine: Hexan Engine (`hexan.js`), original.
- Art: drawn procedurally on canvas at runtime (all 20 species, boat, lures, zones, logo). No image files.
- Sound and music: synthesized at runtime with WebAudio (`HX.Audio`): 3 original loops (Shore, Dive, Deep) and all SFX. No sample files.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
- Platform splash and "Powered by Playtoom" badge: drawn by the Hexan engine from the platform brand config (`engine/brand/brand.json`), not part of this game's art.
- Third-party assets: none.
- Name check: "Deep Cast" is already used by a web fishing game with the same mechanic, so the game ships as "Lumenhook" (no conflicting game found on 27 Oct 2026).

## Platform brand (Playtoom)
- Logo, badge and favicon artwork: Playtoom brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
