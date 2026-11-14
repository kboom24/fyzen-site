# Credits — Fernpuff Fields

An original cozy idle merge game for the **FizzSoup** platform, built on the Hexan engine.

## Code
- Game code (`game.js`, `econ.js`, `species.js`): original, written for FizzSoup / Hexan.
- Engine: Hexan Engine (`hexan.js`, v1.2), original, owned by the Hexan games team.

## Art
- All 48 creatures (4 seasons x 12 tiers), hats, board themes, backgrounds, icons, particles and the
  Fernpuff Fields logo/mascot are drawn procedurally with Canvas 2D at runtime. No image files are shipped by the game.
- Creature names and flavour text are original.

## Sound and music
- All sound effects and the five music loops (title, spring, summer, autumn, winter, plus the Daily Rush loop)
  are synthesized at runtime with WebAudio (`HX.Audio`). No sample files.

## Fonts
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
  UI text uses Nunito; headings and the logo use Fredoka 700.

## Platform brand
- The FizzSoup splash, "Powered by FizzSoup" badge and favicons come from the engine's brand kit (`engine/brand/`); the game draws no platform name or logo itself.

## Third-party assets
- None besides the OFL fonts above. If any are added, they are logged here with name, author, licence (CC0/OFL only) and source URL. No external network requests.

## Name check
- The working title "Merge Meadow" is already used by existing mobile merge games, so the game was renamed
  "Fernpuff Fields". A web search (27 Oct 2026) found no game, app or trademark using that name.

## Platform brand (FizzSoup)
- Logo, badge and favicon artwork: FizzSoup brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
