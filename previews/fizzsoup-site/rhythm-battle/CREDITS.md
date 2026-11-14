# Credits — Hollerbout

- Code: original, written for Hexan by FizzSoup Builder. Engine: Hexan Engine 1.2.1 (`hexan.js`), unmodified.
- Mechanic: an alternating call-and-echo four-lane rhythm battle, a widely used game mechanic. No names, characters, story, music, art, sound or code from any other rhythm game were used.
- Characters: Mox, Dumpling Dee, Coo Carl, Slurpa, Bricky, Meter Maude and Gargo are original designs, drawn procedurally on canvas at runtime (`art.js`).
- Art: the "wheatpaste" street-poster style (torn paper, ink outlines, sticker arrows, masking tape, rubber stamps) is drawn procedurally at runtime. There are no image files in the game; the thumbnails in `thumbs/` are screenshots of the game itself.
- Music: six songs plus a daily song generator, composed by an original procedural composer (`music.js`, seeded `HX.RNG`) and synthesized live with WebAudio: drum machine, bass, chords, and a formant "scat" voice for every character. No samples or recordings.
- Sound effects: synthesized at runtime (`HX.Audio` and `music.js`).
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
- Platform logo on the share card and the badge: the engine's own brand assets (`HX.Brand`), never redrawn.
- Third-party assets: none. If you add any, log them here with name, author, license (CC0/OFL only) and source URL.

## Platform brand (FizzSoup)
- Logo, badge and favicon artwork: FizzSoup brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
