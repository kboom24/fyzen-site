#!/usr/bin/env python3
"""Stamp FizzSoup splash, bowl-mark corner badge, favicons and brand config into every game build.
Run from repo root."""
import os, re, json, glob
from PIL import Image, ImageDraw
import base64, io
B = 'assets/brand/'
def b64(im, q=88):
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q, method=6); return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
mark_src = Image.open(B + 'fizzsoup-mark-512.png').convert('RGBA')
logo = Image.open(B + 'fizzsoup-logo-h240.png').convert('RGBA')
# Bowl mark in the splash frame
pw, phh = mark_src.size
sc = min(1336.7 / pw, 1100 / phh) * 0.88
u_mark = b64(mark_src)
mark = ('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1336.7" height="1100" viewBox="0 0 1336.7 1100">'
        '<image x="%.1f" y="%.1f" width="%.1f" height="%.1f" href="%s" xlink:href="%s"/></svg>' % (
            (1336.7 - pw * sc) / 2, (1100 - phh * sc) / 2, pw * sc, phh * sc, u_mark, u_mark))
# Wordmark in the splash frame
lw, lh = logo.size
logo640 = logo.resize((640, max(1, round(lh * 640 / lw))), Image.LANCZOS)
ww = 1758.2; wh = ww * logo640.height / 640; u = b64(logo640)
wordmark = ('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1758.2" height="445.1" viewBox="0 0 1758.2 445.1">'
            '<image x="0" y="%.1f" width="%.1f" height="%.1f" href="%s" xlink:href="%s"/></svg>' % ((445.1 - wh) / 2, ww, wh, u, u))
# Corner badge: FizzSoup bowl mark on a navy rounded tile (no other wordmark)
tile = Image.new('RGBA', (256, 256), (0, 0, 0, 0))
d = ImageDraw.Draw(tile)
d.rounded_rectangle((4, 4, 252, 252), radius=56, fill=(0, 24, 90, 255), outline=(255, 212, 0, 255), width=8)
bowl = mark_src.copy()
bowl.thumbnail((200, 200), Image.LANCZOS)
tile.paste(bowl, ((256 - bowl.size[0]) // 2, (256 - bowl.size[1]) // 2), bowl)
u_badge = b64(tile)
pill = ('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="120" height="120" viewBox="0 0 120 120">'
        '<image width="120" height="120" href="%s" xlink:href="%s"/></svg>' % (u_badge, u_badge))
BRAND = {"name": "FizzSoup", "wordmarkText": "FizzSoup", "badgeText": "FizzSoup", "tagline": "Endless fun.",
         "portalOrigins": [],
         "colors": {"bg": "#00185A", "glow": ["#002A7E", "#0056D6", "#00185A"], "surface": "#0A3A96", "magenta": "#FFD400", "cyan": "#6ED2FF",
                    "yellow": "#FFD400", "stardust": "#D6E7FF", "bar": ["#FFF6A8", "#FFD400", "#F0A000"], "barTrack": "rgba(255,255,255,0.14)"},
         "themeColor": "#002A7E",
         "badge": {"minCssWidth": 72, "corner": "bl"}}
ico = Image.open(B + 'fizzsoup-icon-512.png').convert('RGBA')
SKIP = {'assets', 'docs', 'fz', 'fonts', 'css', 'js', 'source', 'previews'}
n = 0
for idx in sorted(glob.glob('*/index.html')):
    d = os.path.dirname(idx)
    if d in SKIP: continue
    h = open(idx).read()
    m = re.search(r'window\.FIZZSOUP_BRAND=(\{.*?\});', h)
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
    n += 1
print('games rebranded', n)
