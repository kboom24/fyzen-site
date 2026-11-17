# Credits: Tiptail

An original game for the FizzSoup platform (slug `stealth-heist`, working title "Tiptoe Heist").

- Code: original, written for Hexan (game.js, data.js, art.js, social.js and the QA scripts in qa/). Engine: Hexan Engine 1.2.1 (`hexan.js`), original, unmodified.
- Art: the paper-cut gouache look (cream-edged cut-outs, grain, castle hall, the raccoon and 12 costumes, 40 procedurally styled monarchs, pies, the cuckoo clock, the candle, the title lettering and the share card). All of it is drawn procedurally on canvas at runtime. There are no image files, except the store thumbnails in thumbs/, which are screenshots of the game itself.
- Sound and music: synthesized at runtime with WebAudio (`HX.Audio`). That covers one original 108 bpm sneaking loop, the footsteps, the freeze "fwip", every tell sound (munch, jingle, meow, sneeze, hiccup, cuckoo, yawn, …), the "Caught!" trombone and all the UI sounds. No sample files.
- Kings' names (King Crumbleton the 3rd, Queen Spongealot, …) and all text: original.
- Fonts: the platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts, plus a system UI fallback. Nothing is downloaded from outside.
- Platform splash and "Powered by FizzSoup" badge: drawn by the Hexan engine from the platform brand config, not part of this game's art.
- Third-party assets: none.
- Inspiration: the genre of "freeze when the guard turns" timing games (e.g. Poki's *Murder*). Nothing is copied: there is no violence, and the theme, characters, mechanics twist (tells, King's Turn), art, audio and code are all original.
- Name check (27 Oct 2026): "Tiptoe Heist" is too close to the existing web game "Tiptoe: Daily Heist Puzzle" (Playgama/GamePix, a daily heist puzzle with the same key words). Raccoon/crumb/bandit names were avoided because "Crumb Bandit" (a raccoon snack-heist game) exists, and "Pie Caper"-style names were taken. "Tiptail" turned up no game, app or trademark hits; tiptail.com is an unrelated dog blog.

## Platform brand (FizzSoup)
- Logo, badge and favicon artwork: FizzSoup brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
