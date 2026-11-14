# Adding comics to Fytoon Stories

Stories are driven by one static data file: `fyzen/stories.json`. The catalog (`stories.html`), home-page Stories row, and each reader (`story-<id>.html`, or `story.html?id=<id>`) all read from that file. There is no CMS and no network call.

The six series shipping in this preview are **placeholders**. Covers and pages are simple drawn samples, clearly marked “Coming soon” / “SAMPLE”. They are not published comics. Replace an entry in place when a real series is ready — do not invent fake publication credits.

## 1. Add image files

Create a folder per series:

```
assets/stories/<series-id>/
  cover.png          # 3:4 cover, used on the catalog, home row, and featured hero
  ep01-p01.png       # webtoon-style vertical pages, one image per page
  ep01-p02.png
  ...
```

Use PNG or JPG. Keep pages reasonably tall (the reader stacks them vertically). Put a “SAMPLE” mark on any stand-in art so it cannot be mistaken for a finished episode.

## 2. Edit `fyzen/stories.json`

Each object in `series` looks like this:

```json
{
  "id": "arcade-sprout",
  "title": "Arcade Sprout",
  "tagline": "A short line for cards.",
  "blurb": "A longer description for the hero and reader.",
  "genre": "Adventure",
  "status": "coming-soon",
  "placeholder": true,
  "featured": true,
  "cover": "assets/stories/arcade-sprout/cover.png",
  "episodes": [
    {
      "id": "ep-01",
      "title": "Episode 1 · First Credit",
      "sample": true,
      "pages": [
        "assets/stories/arcade-sprout/ep01-p01.png",
        "assets/stories/arcade-sprout/ep01-p02.png"
      ]
    }
  ]
}
```

To publish a real comic over a placeholder:

1. Drop the real cover and page images into `assets/stories/<id>/` (same names, or update the paths).
2. Set `"placeholder": false`.
3. Set `"status"` to `"published"` or `"new"`.
4. Set `"sample": false` on finished episodes.
5. Rewrite `title`, `tagline`, `blurb`, and episode titles so they describe the real work.
6. Add more objects to `episodes` for later issues. The reader’s Previous / Next buttons follow that array order.
7. Rebuild the site (step 3) so home, catalog, and static readers pick up the change.

`featured: true` on one series fills the featured hero on `stories.html`. `genre` values appear as filter chips; add a new genre simply by using it on a series (and, if you want it listed in the chip order, append it to the top-level `genres` array).

`story.html?id=<series-id>` jumps to `story-<series-id>.html`. Optional `&ep=ep-01` is reserved for deep links; add a hash (`#ep-ep-01`) once multiple episodes exist.

## 3. Rebuild

From the repo root:

```
python3 fyzen/build_site.py
```

This regenerates `stories.html`, `story.html`, every `story-<id>.html`, and the home-page Stories row from `stories.json`. Bump the cache-buster `V` in `fyzen/build_site.py` if you also change CSS or `fyzen/stories.js`.

The nav item “Stories” (book icon) and the mobile drawer entry are part of the shared chrome — no extra page list to edit.

## 4. Preview rules

Keep `noindex` and `robots.txt` Disallow until launch. Do not load fonts, scripts, or images from a CDN. Credit licensed fonts in `fonts/`.
