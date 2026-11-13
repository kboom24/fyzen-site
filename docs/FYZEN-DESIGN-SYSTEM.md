# Fyzen design system v1 (step 1)

Open `design-system.html` at the site root. It shows every token and component, using real catalog games.

## Files
- `fyzen/tokens.css`: colors, accent gradient, type scale (system font stack, no web-font requests), radii, shadows, spacing, layout sizes. Dark is the default; `[data-theme="light"]` is the light set.
- `fyzen/components.css`: sidebar, nav and category items, small-caps section headers, engine spec chips, top bar, search, sponsor strip, theme toggle, Saved count, buttons, badges, game card, spotlight card, continue-playing chip, 300x250 ad placeholder, tabs, stat cards, game stage, recommended list, drawer and responsive rules.
- `fyzen/icons.js`: original inline SVG icon sprite (`FZ_ICON(name)`).
- `fyzen/components.js`: theme toggle (saved in localStorage), phone drawer, Saved list (localStorage only), tabs, engine filter chips, card renderers.
- `fyzen/catalog-data.js`: generated from `assets/js/catalog.js` and `assets/js/games.js`. Real titles, kinds, categories, orientations. Engine is `Hexan.js` for every game except Short Fuse (`Three.js`, vendored in `short-fuse/vendor/three.min.js`).
- `fyzen/design-system.css`: showcase layout only.
- `assets/brand/fyzen-*`: logo lockups (dark, light, gradient), wordmark (dark/light), square icon, favicon SVG, 32/180/512 PNGs. New file names, so no existing Playtoom brand file is overwritten in this step.

## Honesty rules applied
- Ratings, play counts, active sessions and FPS show "—" until real stats exist. "Your best" is a local, per-device value.
- Ad and sponsor slots are empty, labelled placeholders. No ad network.
- Games without vector art in the repo show a category-coloured "Art pending" tile in this showcase. The home build (step 2) will use the real `assets/img/games/<slug>/tile.webp` thumbnails.
- `noindex,nofollow` meta. No external requests (verified with headless Chrome).

## Breakpoints
- > 1180px: sidebar + 2 spotlight cards + 300x250 ad in one row.
- 901 to 1180px: ad moves into the directory grid (2x2 cell).
- <= 900px: sidebar becomes a drawer (menu button, scrim, Esc closes).
- <= 640px: 2-column grid, search on its own row, compact theme toggle.
