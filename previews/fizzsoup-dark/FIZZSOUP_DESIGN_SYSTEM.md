# FizzSoup design system v1.0

Consult this file before any frontend change. It is the implementation standard from the FizzSoup Brand & UI design guidelines v1.0. Reproduce the approved dashboard; do not creatively redesign it.

# FizzSoup Brand & UI design guidelines v1.0 — implementation notes

Source: `/workspace/fizzsoup-brand/guide.pdf` (10 pages). Master references extracted to `refs/yellow-home-1536.png` (1536×1024), `refs/dark-home-1536.jpg` (1536×1024), and `refs/yellow-game.png` (1672×941). This is an implementation standard: reproduce the approved dashboard; not a creative redesign. Sample ratings/art in the guide are illustrative only.

## Colors

| Token | Hex | Role |
|---|---|---|
| Fizz Yellow | `#FFD500` | Brand / default page background / dark-theme accents |
| Carbon Black | `#0B0D12` | Brand black; card surfaces on yellow; dark page background |
| Pure White | `#FFFFFF` | Card text; dark-theme primary text |
| Dark Surface | `#14171E` | Dark-theme card/panel surface |
| Muted Gray | `#A1A1AA` | Card muted text; dark-theme secondary text |
| Yellow Border | `#E5BF00` | Yellow-theme borders |

Yellow is dominant, not just an accent. Default theme: solid yellow background, black typography, black cards. Dark theme: carbon black, white type, yellow accents. No pastels, cream backgrounds, or background gradients. Game artwork may introduce other colors.

## Themes (`:root` vs `[data-theme="dark"]`)

Yellow (default): `--background/--sidebar-background/--header-background: #FFD500`; `--surface: #0B0D12`; `--surface-hover: #1C2028`; `--text-primary: #0B0D12`; `--text-secondary: #393400`; `--card-text: #FFFFFF`; `--card-muted: #A1A1AA`; `--border: #E5BF00`; `--active-bg: #0B0D12`; `--active-text: #FFFFFF`; `--button-bg: #0B0D12`; `--button-text: #FFFFFF`.

Dark: `--background/--header-background: #0B0D12`; `--sidebar-background: #0E1118`; `--surface: #14171E`; `--surface-hover: #20242D`; `--text-primary: #FFFFFF`; `--text-secondary: #A1A1AA`; `--border: #252B36`; `--active-bg: #FFD500`; `--active-text: #0B0D12`; `--button-bg: #FFD500`; `--button-text: #0B0D12`. `--card-text` / `--card-muted` stay white / `#A1A1AA` (cards are always dark surfaces).

Play Now on dark artwork is always brand yellow with black text. Chrome actions on the yellow page (Upgrade, game-page Play Now) use `--button-bg`.

Both themes share the same structure, sizing, imagery, and spacing. Header sun/moon toggle persists in `localStorage` (`fs-theme`). `?theme=dark` or `?theme=yellow` applies and persists. No network.

## Typography

- Wordmark: Inter Tight Black Italic 900, letter-spacing `-0.065em`, 40px, line-height 1, capitalization `FizzSoup`, desktop width 190–205px. No outlines, gradients, shadows, or decorative symbols. Color: `--text-primary` (yellow theme) / `--brand-yellow` (dark). Use the approved SVG when one exists; the PDF did not embed an SVG, so the wordmark is live Inter Tight text.
- UI: Inter. Headings `-0.04em`; body tracking normal.
- Type scale (size / weight / line-height): Featured heading 56/800/1.05; Game detail title 36/800/1.1; Section heading 24/800/1.2; Card heading 22/700/1.2; Top/sidebar nav 15/600/20px; Primary button 16/700/22px; Game thumbnail title 14/700/18px; Body 14/400/21px; Ratings/metadata 12/500/16px; Secondary labels 12/400/16px.
- Self-host Inter and Inter Tight (OFL woff2). Do not use the Google Fonts `@import` from the guide.

## Layout (master viewport 1536×1024 CSS px)

Application dashboard, not a marketing site. Start with games; no marketing hero, welcome screen, or landing intro.

- Header 78px, horizontal padding 24px
- Sidebar 214px, internal padding 16px
- Main padding 16px
- Featured section 342px tall, 75%/25% after a 16px gap
- Category cards 116px tall, 12px gap
- Standard game cards ≈ 130×160, gap 10–12px
- Right promo card 202px
- Vertical section spacing 24px; section heading 14px above cards

Dashboard order: persistent header + category sidebar; featured banner + secondary feature; horizontal illustrated categories; Popular Right Now; New & Updated; right-side promotional panel.

Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48px.

## Radii and motion

Featured banners / information panels 18px; game and category cards 14px; game thumbnails 12px; sidebar active item 14px; primary buttons and search 999px; avatar 50%. Hover: 180ms ease-out, max scale 1.025; subtle press. Avoid heavy shadows, extra borders, glow, and generic SaaS styling. Artwork is edge-to-edge. Cards use carbon-black surfaces, white text, and yellow rating icons in both themes.

## Icons

Lucide only, 22px, stroke 2px, 12px gap between icon and label. Do not mix packs or use emojis as navigation icons.

Mapped labels: Games `gamepad-2`, Trending `flame`, New `sparkles`, Popular `star`, Multiplayer `users`, Action `zap`, Racing `car`, Puzzle `puzzle`, Adventure `swords`, Sports `volleyball`, Arcade `joystick`, Strategy `chess-pawn`, Simulation `box`, More `layout-grid`, Premium `crown`, Search `search`, Notifications `bell`, Favorites `heart`, Light theme `sun`, Dark theme `moon`.

Real catalog categories are Action, Racing, Puzzle, Sports, Strategy, Merge, Word, Relax, plus Multiplayer. Do not invent Adventure / Arcade / Simulation / More just to match the reference screenshot.

## Responsive

| Width | Sidebar | Game grid |
|---|---|---|
| 1440+ | 214px | 8–10 columns |
| 1200–1439 | 200px | 6–8 columns |
| 1024–1199 | 72px (icons) | 5–6 columns |
| 768–1023 | 64px (icons) | 4–5 columns |
| <768 | Bottom navigation | 2–3 columns |

Mobile should feel like a native gaming app, not a compressed desktop site.

## Game detail

Keep the dashboard header and category sidebar (the concept’s Home/Library sidebar is illustrative, not required). Prioritize the playable viewport, title, Play Now, fullscreen, and related games. Screenshots, description, features, controls, and reviews sit beneath. Never force a trailer before play. Do not fabricate a duration.

## Content rules (product, not just the guide)

Real FizzSoup games and art only. Guide ratings are illustrative — do not fabricate ratings, play counts, or reviews. Use a real-fact metadata line at 12px/500 (e.g. “New”, “Featured”, “1P · Touch”). Short Fuse stays hidden. No ads. Upgrade and Rewards are Coming soon, no payment code. Official mascot is the FizzSoup bowl.

## Handoff

Keep `FIZZSOUP_DESIGN_SYSTEM.md` at the project root and consult it before frontend changes.

## Image-matched type (vs the guide table)

The official table values render thinner and smaller than the approved 1536×1024 dashboard raster. Implementation matches the **image**, not the table, when they disagree. Inter static OTFs (400/500/600/700/800/900) are self-hosted; computed styles confirm the named weights load (no faux bold, `font-synthesis: none`).

| Role | Guide table | Implemented (matches the raster) |
|---|---|---|
| Wordmark | 40px / 900 italic, −0.065em, 190–205px wide | **46px / 900 italic**, −0.045em, ~200px, with ® |
| Top nav & sidebar labels | 15px / 600 / 20 | **18px / 700 / 22**, row height 46px, 24px icons |
| Section heading | 24px / 800 | **28px / 800** |
| Card title (thumbnail) | 14px / 700 | **16px / 800** |
| Ratings / metadata | 12px / 500 | **13px / 600** (still real facts only; no fabricated ratings) |
| Secondary / category under card | 12px / 400 | **13px / 500** |
| Primary button | 16px / 700 | **16px / 800** |
| “Go Premium” title | 22px / 700 | **24px / 800** |
| “Play More. Be More.” | (not in the table) | **20px / 800**, 44px bold-outline smile |
| Search field | (token was a light tint) | **42px tall**, solid `#0B0D12` on yellow, 15px / 500 placeholder |
| Icons | 22px, stroke 2 | **24px**; filled Lucide for star/flame/sparkles/heart/crown/bell/users; stroke **2.75** on outline icons |

Sidebar: 11 rows (real categories + Multiplayer + Favorites, which reads `fs-saved` on this device). Go Premium matches the reference: on yellow, a yellow card with a thin `#E5BF00` outline (16px radius), a black outline crown, black title and body, and a solid black Upgrade pill. Honest copy only (no “no ads” claim). A thin `#E5BF00` divider sits above the card, and the sidebar has a subtle right-edge border. Dark theme: dark-surface card, yellow border, yellow Upgrade button.
