# Credits — Hopabet

A Playtoom original (slug `word-daily`). Built on the Hexan Engine for the Playtoom game library.

- Code: original, written for Hexan. Engine: Hexan Engine (`hexan.js`), original, unmodified. Game code: `core.js` (word graph, puzzle generator, beam-search solver, scoring), `words.js` (generated word data), `game.js` (scenes, art, audio).
- Art: drawn procedurally on canvas at runtime (pond, lily pads, letter tiles, lotus flowers, Pip the frog, theme icons, the HOPABET logo, particles). No image files. Store thumbnails in `thumbs/` are rendered from the same procedural art.
- Sound and music: synthesized at runtime with WebAudio (`HX.Audio`): every SFX and both looping tunes. No sample files.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
- Characters and names (Hopabet, Pip, the ranks and the skin names): original.

## Word lists

Bundled in the game (inside `words.js`):

- **ENABLE** (Enhanced North American Benchmark Lexicon, Alan Beale and M. Cooper), public domain. Its 3,903 four-letter words, minus the blocklist screen below (3,841 left), are the dictionary that checks every hop.
- **SCOWL** (Spell Checker Oriented Word Lists) 2020.12.07 by Kevin Atkinson, sizes 10–50, American + English variants. These are used to choose the *common* words that may appear as start words, Words of the Day, theme finds and hints. Licence notice, as the SCOWL licence requires:

  > Copyright 2000-2018 by Kevin Atkinson
  >
  > Permission to use, copy, modify, distribute and sell these word lists, the associated scripts, the output created from the scripts, and its documentation for any purpose is hereby granted without fee, provided that the above copyright notice appears in all copies and that both that copyright notice and this permission notice appear in supporting documentation. Kevin Atkinson makes no representations about the suitability of this array for any purpose. It is provided "as is" without express or implied warranty.

  The full SCOWL copyright file is kept in `data-src/SCOWL-Copyright.txt`.
- **Themes**: 16 hand-written theme word lists (`tools/themes.js`), original.

Used only at build time to screen words (they are not shipped in the game):

- **List of Dirty, Naughty, Obscene, and Otherwise Bad Words** (LDNOOBW), `en` list, Shutterstock, CC BY 4.0. https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words
- **badwords** (`lang.json`) by Michael Price / web-mech, MIT License, © 2015 Michael Price. https://github.com/web-mech/badwords
- Supplemental blocklist and answer-avoid list: original (`data-src/blocklist-extra.txt`, `data-src/answer-avoid.txt`).

### How the family-safety screen works

1. **Dictionary blocklist.** Every ENABLE word that appears in LDNOOBW, badwords or the supplemental list, or that contains a blocked stem, is removed from the dictionary, so it cannot even be played as a hop (62 words removed).
2. **Answer-avoid list.** 146 more words are allowed as hops but never shown by the game: never a start word, Word of the Day, theme word or hint. It covers violence, alcohol and drugs, body words, insults, religion and politics, gambling, plus a manual read of all 2,186 common four-letter candidates.
3. **Common-word pool.** Puzzles, routes and hints only use SCOWL common words (size ≤ 50) that pass steps 1–2, plus the hand-curated theme words (2,127 words).
4. **Verification.** `qa/check-daily.js` regenerates 365 days of Daily Hops and checks that every start word, goal, theme word and solver route is in the safe pool. `qa/check-levels.js` does the same for practice levels. The reports are `qa/word-safety.txt`, `qa/daily-check.txt` and `qa/levels-check.txt`.

## Name check (28 Oct 2026)

Web searches for "Hopabet" (game, app, word game, trademark) found no games, apps or products with the name. The only near matches were the Swedish word *hopabete* (shared grazing land) and a Canadian trademark "HOPBETA" (a different spelling, apparently unrelated to games). Names dropped because of conflicts: Rungwise (a word-ladder app in development), Word Vine / WordVine (existing word games), Tendril (a puzzle app), Glowhop (a toy), Rummage (an iPhone word game), Lexiroam (too close to FlexiRoam), Quillhop (a character species in another game). Laddergram, Weaver, Morphl, Doublets and Poople are existing word-ladder games, so Hopabet adds theme finds, a hop budget and a Word of the Day goal instead of being a plain ladder. It does not use any Wordle name, grid, layout or colour scheme.

## Platform brand (Playtoom)
- Logo, badge and favicon artwork: Playtoom brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
