# Credits — Plop Planets

- Game design, code, the "Plop Planets" working title and the logo are original work written for Hexan / Playtoom.
  Name check (web search, 27 Oct 2026 PT): an unrelated 2013 iOS game called **"Planet Plop"** (PiVi & Co, a rotate-the-planet colour-matching arcade game) exists. "Plop Planets" is a word swap of that name, so a formal trademark review (or a rename) is recommended before launch.
- Engine: Hexan Engine 1.1 (`hexan.js`), original. Circle physics (`physics.js`) and game rules (`core.js`): original, written for this game.
- Art: every object (Pebble, Asteroid, Comet, Moon, Rusty Planet, Ocean Planet, Gas Giant, Ringed Planet, Star, Black Hole), their faces, the saucer dropper, the box, the starfield, the nebulae and the wordmark are drawn procedurally with Canvas 2D at runtime. No image files.
- Sound and music: synthesized at runtime with WebAudio (`HX.Audio` presets, a custom pitched "plop" voice and an original 32-step ambient loop). No sample files.
- Fonts: the system UI font stack. Nothing is bundled or downloaded.
- RNG: xmur3 / mulberry32 (public-domain algorithms), reimplemented.
- Genre note: drop-and-merge physics puzzles are a common, unprotected mechanic. No names, art, sounds, UI layouts or data were taken from any existing game.
- Third-party / CC0 assets: none.
- Dev-only QA tooling (not shipped): playwright-core (Apache-2.0) with system Chrome, ffmpeg.
