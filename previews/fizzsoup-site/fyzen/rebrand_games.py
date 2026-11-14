#!/usr/bin/env python3
"""Rebrand the in-game splash, badge, favicons and visible strings of every game build to FizzSoup.
Code identifiers (window.PLAYTOOM_BRAND, storage keys, postMessage origins) stay as they are because
the minified builds depend on them; they are never shown to players. Run from repo root."""
import os, re, json, glob
from PIL import Image
import base64, io
B = 'assets/brand/'
def b64(im, q=88):
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q, method=6); return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
mark_src = Image.open(B + 'fizzsoup-mark-512.png').convert('RGBA')
logo = Image.open(B + 'fizzsoup-logo-h240.png').convert('RGBA')
# Bowl mark in the 1336.7x1100 splash frame
pw, phh = mark_src.size
sc = min(1336.7 / pw, 1100 / phh) * 0.88
u_mark = b64(mark_src)
mark = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1336.7" height="1100" viewBox="0 0 1336.7 1100"><image x="%.1f" y="%.1f" width="%.1f" height="%.1f" href="%s" xlink:href="%s"/></svg>' % (
    (1336.7 - pw * sc) / 2, (1100 - phh * sc) / 2, pw * sc, phh * sc, u_mark, u_mark)
# Wordmark in the 1758.2x445.1 frame
lw, lh = logo.size
logo640 = logo.resize((640, max(1, round(lh * 640 / lw))), Image.LANCZOS)
logo300 = logo.resize((300, max(1, round(lh * 300 / lw))), Image.LANCZOS)
ww = 1758.2; wh = ww * logo640.height / 640; u = b64(logo640)
wordmark = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1758.2" height="445.1" viewBox="0 0 1758.2 445.1"><image x="0" y="%.1f" width="%.1f" height="%.1f" href="%s" xlink:href="%s"/></svg>' % ((445.1 - wh) / 2, ww, wh, u, u)
# Badge: navy-blue pill, yellow stroke, FizzSoup wordmark
u2 = b64(logo300); bw = 330; bh = bw * logo300.height / 300
pill = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="378.4" height="120" viewBox="0 0 378.4 120"><rect x="2" y="2" width="374.4" height="116" rx="58" fill="#00185A" stroke="#FFD400" stroke-opacity=".9" stroke-width="3"/><image x="%.1f" y="%.1f" width="%.1f" height="%.1f" href="%s" xlink:href="%s"/></svg>' % ((378.4 - bw) / 2, (120 - bh) / 2, bw, bh, u2, u2)
BRAND = {"name": "FizzSoup", "wordmarkText": "FizzSoup", "badgeText": "Powered by FizzSoup", "tagline": "Endless fun.",
         "colors": {"bg": "#00185A", "glow": ["#002A7E", "#0056D6", "#00185A"], "surface": "#0A3A96", "magenta": "#FFD400", "cyan": "#6ED2FF",
                    "yellow": "#FFD400", "stardust": "#D6E7FF", "bar": ["#FFF6A8", "#FFD400", "#F0A000"], "barTrack": "rgba(255,255,255,0.14)"},
         "themeColor": "#002A7E"}
VISIBLE = [
    ("Play\\x20free\\x20on\\x20Playtoom", "Play\\x20free\\x20on\\x20FizzSoup"),
    ("Play\\x20free\\x20on\\x20Fyzen", "Play\\x20free\\x20on\\x20FizzSoup"),
    ("Play\\x20free\\x20on\\x20Fytoon", "Play\\x20free\\x20on\\x20FizzSoup"),
    ("Jellybout\\x20on\\x20Playtoom", "Jellybout\\x20on\\x20FizzSoup"),
    ("Jellybout\\x20on\\x20Fyzen", "Jellybout\\x20on\\x20FizzSoup"),
    ("Jellybout\\x20on\\x20Fytoon", "Jellybout\\x20on\\x20FizzSoup"),
    ("live\\x20Playtoom\\x20rankings", "live\\x20FizzSoup\\x20rankings"),
    ("live\\x20Fyzen\\x20rankings", "live\\x20FizzSoup\\x20rankings"),
    ("live\\x20Fytoon\\x20rankings", "live\\x20FizzSoup\\x20rankings"),
    ("with\\x20Playtoom\\x20accounts", "with\\x20FizzSoup\\x20accounts"),
    ("with\\x20Fyzen\\x20accounts", "with\\x20FizzSoup\\x20accounts"),
    ("with\\x20Fytoon\\x20accounts", "with\\x20FizzSoup\\x20accounts"),
    ("Powered by Fyzen", "Powered by FizzSoup"),
    ("Powered by Playtoom", "Powered by FizzSoup"),
    ("Powered by Fytoon", "Powered by FizzSoup"),
]
ico = Image.open(B + 'fizzsoup-icon-512.png').convert('RGBA')
n = 0
for idx in sorted(glob.glob('*/index.html')):
    d = os.path.dirname(idx)
    if d in ('assets', 'docs', 'fyzen', 'fonts', 'css', 'js', 'source', 'previews'): continue
    h = open(idx).read()
    m = re.search(r'window\.PLAYTOOM_BRAND=(\{.*?\});', h)
    if m:
        cfg = json.loads(m.group(1))
        for k, v in BRAND.items():
            if k == 'colors': cfg['colors'].update(v)
            else: cfg[k] = v
        h = h[:m.start(1)] + json.dumps(cfg, separators=(',', ':'), ensure_ascii=False) + h[m.end(1):]
        open(idx, 'w').write(h)
    if os.path.isdir(d + '/brand'):
        open(d + '/brand/mark.svg', 'w').write(mark)
        open(d + '/brand/wordmark.svg', 'w').write(wordmark)
        open(d + '/brand/badge.svg', 'w').write(pill)
        ico.resize((32, 32), Image.LANCZOS).save(d + '/brand/favicon-32.png')
        ico.resize((180, 180), Image.LANCZOS).save(d + '/brand/apple-touch-icon-180.png')
        ico.save(d + '/brand/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
    for js in glob.glob(d + '/app.*.js'):
        t = open(js).read(); t0 = t
        for a, b in VISIBLE: t = t.replace(a, b)
        t = t.replace('Fytoon', 'FizzSoup')
        t = t.replace('Fyzen', 'FizzSoup')
        if t != t0: open(js, 'w').write(t)
    n += 1
print('games rebranded', n)
