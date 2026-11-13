# Fyzen design system v1 (step 1)

Open `design-system.html` at the site root. It shows every token and component, using real catalog games.

## Files
- `fyzen/tokens.css`: colors, accent gradient, type scale (system font stack, no web-font requests), radii, shadows, spacing, layout sizes. Dark is the default; `[data-theme="light"]` is the light set.
- `fyzen/components.css`: sidebar, nav and category items, small-caps section headers, engine spec chips, top bar, search, sponsor strip, theme toggle, Saved count, buttons, badges, game card, spotlight card, continue-playing chip, 300x250 ad placeholder, tabs, stat cards, game stage, recommended list, drawer and responsive rules.
- `fyzen/icons.js`: original inline SVG icon sprite (`FZ_ICON(name)`).
- `fyzen/components.js`: theme toggle (saved in localStorage), phone drawer, Saved list (localStorage only), tabs, engine filter chips, card renderers.
- `fyzen/catalog-data.js`: generated from `assets/js/catalog.js` and `assets/js/games.js`. Real titles, kinds, categories, orientations. Engine is `Hexan.js` for every game except Short Fuse (`Three.js`, vendored in `short-fuse/vendor/three.min.js`).
- `fyzen/design-system.css`: showcase layout only.
- `assets/brand/fyzen-badge.svg` + `fyzen-wordtype(-light).svg`: the top-bar logo. `assets/brand/fyzen-*`: other logo lockups (dark, light, gradient), wordmark (dark/light), square icon, favicon SVG, 32/180/512 PNGs. New file names, so no existing Playtoom brand file is overwritten in this step.

## Honesty rules applied
- Ratings, play counts, active sessions and FPS show "—" until real stats exist. "Your best" is a local, per-device value.
- Ad and sponsor slots are empty, labelled placeholders. No ad network.
- Games without vector art in the repo show a category-coloured "Art pending" tile in this showcase. The home build (step 2) will use the real `assets/img/games/<slug>/tile.webp` thumbnails.
- `noindex,nofollow` meta. No external requests (verified with headless Chrome).

## Layout (matched to Hexan's iPad mockups at 1024x768)
- Full-width 44px top bar above the sidebar: filter button, logo (circular flame badge + FYZEN + GAMES pill + tagline), search, empty sponsor strip, theme toggle, Saved (count).
- 190px sidebar: Navigation (Arcade Home active as a gradient pill, Trending Flame), Categories (gamepad icon rows, real category names), divider, Engine Spec chips.
- Home: Continue Playing chips (120x46), Fyzen Spotlight (2 featured cards + empty 300x250 ad card, 145px tall), Arcade Directory in 6 columns (68px thumbs).
- Game page: return pill + category, stage card (engine pill, "— FPS", gradient "Instant Play In-Stage", "— Active Sessions", sound/fullscreen), info card with underline tabs and 3 stat cards; 180px right rail with an empty sponsored unit and Recommended Titles.

## Breakpoints
- <= 900px: sidebar becomes a drawer (menu button, scrim, Esc closes); sponsor strip hidden; 4-column grid; game rail stacks below.
- <= 640px: 2-column grid, search on its own row.
