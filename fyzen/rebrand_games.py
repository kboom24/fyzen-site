#!/usr/bin/env python3
"""Rebrand the in-game splash, badge, favicons and visible strings of every game build to Fyzen.
Code identifiers (window.PLAYTOOM_BRAND, storage keys, postMessage origins) stay as they are because
the minified builds depend on them; they are never shown to players. Run from repo root."""
import os, re, json, glob, shutil
from PIL import Image
B = 'assets/brand/'
import base64, io
def b64(im, q=88):
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q, method=6); return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
phx = Image.open(B + 'fyzen-phoenix.png').convert('RGBA'); pw, phh = phx.size
logo = Image.open(B + 'fyzen-logo.png').convert('RGBA'); lw, lh = logo.size
logo640 = logo.resize((640, round(lh * 640 / lw)), Image.LANCZOS)
logo300 = logo.resize((300, round(lh * 300 / lw)), Image.LANCZOS)
# mark.svg: phoenix, in the 1336.7x1100 frame the splash expects
sc = min(1336.7 / pw, 1100 / phh) * 0.92
mark = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1336.7" height="1100" viewBox="0 0 1336.7 1100"><image x="%.1f" y="%.1f" width="%.1f" height="%.1f" href="%s" xlink:href="%s"/></svg>' % (
    (1336.7 - pw * sc) / 2, (1100 - phh * sc) / 2, pw * sc, phh * sc, b64(phx), b64(phx))
# wordmark.svg: official transparent logo, in the 1758.2x445.1 frame (no baked-in black field)
ww = 1758.2; wh = ww * logo640.height / 640; u = b64(logo640)
wordmark = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1758.2" height="445.1" viewBox="0 0 1758.2 445.1"><image x="0" y="%.1f" width="%.1f" height="%.1f" href="%s" xlink:href="%s"/></svg>' % ((445.1 - wh) / 2, ww, wh, u, u)
# badge.svg: dark pill with the logo, in the 378.4x120 frame
u2 = b64(logo300); bw = 330; bh = bw * logo300.height / 300
pill = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="378.4" height="120" viewBox="0 0 378.4 120"><rect x="2" y="2" width="374.4" height="116" rx="58" fill="#0B0B0D" stroke="#FF8A00" stroke-opacity=".5" stroke-width="3"/><image x="%.1f" y="%.1f" width="%.1f" height="%.1f" href="%s" xlink:href="%s"/></svg>' % ((378.4 - bw) / 2, (120 - bh) / 2, bw, bh, u2, u2)
BRAND = {"name": "Fyzen", "wordmarkText": "Fyzen", "badgeText": "Powered by Fyzen", "tagline": "instant play",
         "colors": {"bg": "#0B0B0D", "glow": ["#3A1A0E", "#1A100C", "#0B0B0D"], "surface": "#16161A", "magenta": "#FF8A00", "cyan": "#FFB21A",
                    "yellow": "#FFD23F", "stardust": "#C9C2BA", "bar": ["#FFB21A", "#FF8A00", "#FF5E0A"], "barTrack": "rgba(255,255,255,0.14)"},
         "themeColor": "#0B0B0D"}
VISIBLE = [("Play\\x20free\\x20on\\x20Playtoom", "Play\\x20free\\x20on\\x20Fyzen"),
           ("Jellybout\\x20on\\x20Playtoom", "Jellybout\\x20on\\x20Fyzen"),
           ("live\\x20Playtoom\\x20rankings", "live\\x20Fyzen\\x20rankings"),
           ("with\\x20Playtoom\\x20accounts", "with\\x20Fyzen\\x20accounts")]
ico = Image.open(B + 'fyzen-icon-512.png').convert('RGBA')
n = 0
for idx in sorted(glob.glob('*/index.html')):
    d = os.path.dirname(idx)
    if d in ('assets', 'docs', 'fyzen'): continue
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
        if t != t0: open(js, 'w').write(t)
    n += 1
print('games rebranded', n)
