# Credits — Gnawnauts

- Game design, code, the "Gnawnauts" name and the logo are original work for FizzSoup, built on the Hexan Engine. Name check (web search, 27 Oct 2026 PT): the working title "Swarm Colony" was dropped because ArcadeOwl runs a "Swarm Colonies" series of browser idle colony games, and "Swarm Simulator: Evolution" is an existing idle swarm game. A search for "Gnawnauts" found no game, app or product with that name; the only hit was an unrelated Reddit pun ("gnawnautical"). A formal trademark search is still needed before launch.
- Engine: Hexan Engine (`hexan.js`, v1.2), original, used unmodified.
- Art: all 30 objects (food, toys, street, city, space), the swarm critters/bots/wisps and their sprite atlases, the nest, the five world backdrops, the icons and the bitten "GNAWNAUTS" wordmark are drawn procedurally with Canvas 2D at runtime. No image files.
- Sound and music: synthesized at runtime with WebAudio (`HX.Audio` presets, original crunch/zap/chime voices, and an original per-world step-sequenced loop). No sample files.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
- Platform brand: the FizzSoup splash, "Powered by FizzSoup" badge and favicons are the FizzSoup brand kit, drawn and shipped by the engine.
- Genre note: idle/incremental mechanics (upgrades, offline earnings, prestige) are common, unprotected game mechanics. No names, art, sounds, UI layouts or numbers were taken from any existing game.
- Third-party assets: only the OFL fonts above.

## Platform brand (FizzSoup)
- Logo, badge and favicon artwork: FizzSoup brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
