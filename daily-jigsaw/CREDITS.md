# Credits — Daylace

- Code: original, written for Hexan. Engine: Hexan Engine (`hexan.js`, hx@1.2.1, unmodified), original.
- Art: every picture, piece, logo, icon and table cloth is drawn procedurally on canvas at runtime by the game's own code (`src-parts/2-art.js`: skies, sun/moon, clouds, faceted mountains, pines, harbour boats and reflections, city skylines, still-life fruit/teapots, patchwork quilts, hot-air balloons, film grain and vignette). No image files, no stock or copyrighted images, no AI-generated or traced art. Thumbnails (`thumbs/*.webp`) are renders of the same procedural code (`qa/make-thumbs.js`).
- Jigsaw cut: original generator (`core.js`): each shared edge is three cubic Bézier segments with seeded knob size, position and tilt; neighbours trace the identical curve, so pieces interlock exactly (proved by `tools/solve.js`).
- Logo: original — a sunrise drawn inside a jigsaw-piece outline, the word mark "Daylace" set in the bundled brand font, with a dashed "lace" underline. Drawn in code (`src-parts/4-scenes.js`, `logo()`).
- Sound and music: synthesized at runtime with WebAudio (`HX.Audio`): snap clicks, pick/drop, chimes and two short original procedural songs. No sample files.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
- Third-party assets: none.

## Name check — "Daylace"

"Daylace" = a new picture every **day** + pieces that **lace** together. Checked on 2026-10-28 with web searches (game stores, Steam/itch.io, App Store/Google Play listings, general web) and trademark-register searches (USPTO, EUIPO/TMview, WIPO Global Brand Database):

- No game, app or software product named Daylace was found.
- No registered or pending trademark "DAYLACE" was found. Nearest hit: "DAYLAC", a French household-appliance wholesaler (different spelling, unrelated goods/services, not software or games).
- Not to be confused with lace/lingerie brands; none found using the exact word.

Candidates rejected during the search: Piecelight (existing indie puzzle project), Nubbly (existing app/brand), Knobwell (existing company name), Snug/Snugfit variants (crowded trademark space), Daypiece (close to existing daily-puzzle apps), Knubble (existing product), Snapsody (existing app).

This is a good-faith search, not legal clearance; a trademark professional should confirm before commercial launch.

## Platform brand (Playtoom)
- Logo, badge and favicon artwork: Playtoom brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
