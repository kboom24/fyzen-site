# Credits — Snipwheel

- Code: original, written for Hexan. Engine: Hexan Engine (`hexan.js`), original.
- Art: drawn procedurally on canvas at runtime. No image files.
- Sound and music: synthesized at runtime with WebAudio (`HX.Audio`). No sample files.
- Fonts: platform brand fonts Nunito and Fredoka (Latin WOFF2 subsets, SIL Open Font License 1.1), bundled locally by the engine build into `brand/fonts/` with their licence texts; system UI fallback. Nothing is downloaded from outside.
- Third-party assets: none. If you add any, log them here with name, author, license (CC0/OFL only), and source URL.

## Name check (2026-10-28)
Web searches for an original title. Rejected: Kirimoto (voice actor), Paperback Rider (paperbackrider.org; "The Paperback Rider" bike-art brand), Pinwheel Moto (generic; results map to Moto Wheelie), Flipfold ("Flipfold: Cambio Card Game", Mikisu Studio, Oct 2026; FlipFold app/puzzle), Fold Rider (foldride.com bikes; Riders Republic), Papercut Moto ("Paperway Moto" exists), Splitpin (weak, usernames), Tumblefold (1919 novel; backup).
Winner: **Snipwheel** — two searches found no game, app or trademark using it (only the unrelated fintech "Spinwheel" and the domain nipwheel.com).

## Art direction
"Stitch & Snip": a layered cut-paper / felt diorama — depth shadows, torn deckle edges, sewing-stitch seams, brass split-pin joints, pinwheel wheels, foil sheen and tracing-paper ghosts. All drawn in code. Deliberately distinct from the parallel car racer's risograph/halftone style.

## Bots
Par times, stunt targets and the "Pace bot" ghosts come from an in-house MPC bot (qa-scripts/bot.js) run on the game's own physics; proofs in qa/bot-proofs.json.

## Platform brand (Playtoom)
- Logo, badge and favicon artwork: Playtoom brand kit (Hexan, original work), copied by tools/build.sh into brand/.
- Fonts: Nunito, Fredoka (Latin subsets, WOFF2), SIL Open Font License 1.1; licence texts in brand/fonts/ (OFL-fredoka.txt, OFL-nunito.txt).
  Nunito © 2014 The Nunito Project Authors (SIL OFL 1.1)
  Fredoka © 2016 The Fredoka Project Authors (SIL OFL 1.1)
