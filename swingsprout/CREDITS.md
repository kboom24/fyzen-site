# Swingsprout: Credits

**Swingsprout** is an original one-button grapple-swing game for the **Playtoom** platform.

## Code
- Game code (`game.js`, `sim.js`, `art.js`): original work written for Playtoom.
- Engine: Hexan (`hexan.js`, v1.2.1), Playtoom's in-house HTML5 engine.

## Art
- All visuals are drawn procedurally on canvas at runtime by `art.js`. That covers Sprig and its 9 skins, the vine, flower buds, mushroom pads, bramble wheels, thistles, sunseeds, parallax meadows and the logo lettering. All of it is original work with no image files.
- Platform splash, badge and favicons: supplied by the engine's brand kit (`engine/brand`).

## Audio
- All music and sound effects are synthesized at runtime with HX.Audio (procedural step-sequencer songs and tone SFX). No samples, all original.

## Fonts
- Platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts. System UI fallback. Nothing is downloaded from outside.

## Third-party assets
- None. No third-party or CC0 assets are used.

## Name
- The working title "Swingline" was dropped because it collides with the Swingline stapler trademark, the 2026 Meta Quest game "Swingline Climber" and an existing browser game called "Swingline". "Swingsprout" had no game conflicts when it was name-checked (Oct 2026).

## Platform brand (Playtoom)
- Logo, badge and favicon artwork: Playtoom brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
