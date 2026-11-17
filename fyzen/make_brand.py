#!/usr/bin/env python3
"""Build Fyzen web logo + icon set from assets/brand/source/fyzen-logo-official.png
(Hexan's official logo: chrome wordmark, orange-gold phoenix Y, transparent background).
Keeps alpha on every PNG/WebP derivative. Run from anywhere; paths are relative to the repo root.
"""
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
import numpy as np
import os

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
B = 'assets/brand/'
src = Image.open(B + 'source/fyzen-logo-official.png').convert('RGBA')
a = np.asarray(src).astype(np.float32)
rgb, alpha = a[..., :3], a[..., 3]
r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
H, W = alpha.shape
mx = rgb.max(2)
mn = rgb.min(2)
sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
vis = alpha > 8

# Tight trim of the wordmark, with a few pixels of transparent padding so edges don't clip when scaled.
ys, xs = np.where(vis)
pad = 8
box = (
    max(int(xs.min()) - pad, 0),
    max(int(ys.min()) - pad, 0),
    min(int(xs.max()) + 1 + pad, W),
    min(int(ys.max()) + 1 + pad, H),
)
logo = src.crop(box)
lw, lh = logo.size

def save_rgba(im, path, webp_quality=88):
    im.save(path, optimize=True)
    if path.endswith('.png'):
        im.save(os.path.splitext(path)[0] + '.webp', 'WEBP', quality=webp_quality, method=6, lossless=False)

# Primary wordmark (wide) + header sizes, all with transparency.
big = logo.resize((1200, max(1, round(lh * 1200 / lw))), Image.Resampling.LANCZOS)
save_rgba(big, B + 'fyzen-logo.png', webp_quality=86)
header_w = {}
for hh in (36, 72):
    x = logo.resize((max(1, round(lw * hh / lh)), hh), Image.Resampling.LANCZOS)
    header_w[hh] = x.size[0]
    x.save(B + 'fyzen-logo-h%d.png' % hh, optimize=True)
    x.save(B + 'fyzen-logo-h%d.webp' % hh, 'WEBP', quality=90, method=6)

# Phoenix cutout: orange-gold Y, including its dark outlines, excluding the chrome F/Z/E/N.
warm = vis & (sat > 0.35) & (r > g - 5) & ((r - b) > 30) & (r > 80)
chrome = vis & (sat < 0.28) & (np.abs(r - g) < 28) & (np.abs(g - b) < 32) & (mx > 50)
seed = Image.fromarray((warm * 255).astype('uint8'))
near = np.asarray(seed.filter(ImageFilter.MaxFilter(11))) > 0
# Grow into anti-aliased / outline pixels next to the bird, but not into chrome letter fills.
include = (near & vis & ~chrome) | warm
closed = np.asarray(
    Image.fromarray((include * 255).astype('uint8')).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
) > 0
include = (closed & near & vis & ~chrome) | warm
# Drop leftover serifs from the neighbouring F and Z: keep only the largest blob (the bird).
from scipy import ndimage
labeled, nlab = ndimage.label(include)
if nlab:
    sizes = ndimage.sum(include, labeled, range(1, nlab + 1))
    include = labeled == (1 + int(np.argmax(sizes)))
ph = np.array(src)
ph[..., 3] = np.where(include, np.asarray(src)[..., 3], 0)
ph_im = Image.fromarray(ph, 'RGBA')
bbox = ph_im.getbbox()
if not bbox:
    raise SystemExit('phoenix cutout produced an empty image')
ph_im = ph_im.crop(bbox)
p = ph_im.copy()
p.thumbnail((512, 512), Image.Resampling.LANCZOS)
save_rgba(p, B + 'fyzen-phoenix.png', webp_quality=88)

def tile(size):
    s = size * 4
    rad = int(s * 0.22)
    t = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    mask = Image.new('L', (s, s), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, s - 1, s - 1), rad, fill=255)
    base = Image.new('RGBA', (s, s), (13, 11, 11, 255))
    glow = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse((s * 0.18, s * 0.42, s * 0.82, s * 1.02), fill=(255, 138, 0, 70))
    base = Image.alpha_composite(base, glow.filter(ImageFilter.GaussianBlur(s * 0.09)))
    t.paste(base, (0, 0), mask)
    pad_frac = 0.12 if size <= 48 else 0.14
    w, h = ph_im.size
    sc = min(s * (1 - 2 * pad_frac) / w, s * (1 - 2 * pad_frac) / h)
    bird = ph_im.resize((max(1, int(w * sc)), max(1, int(h * sc))), Image.Resampling.LANCZOS)
    t.alpha_composite(bird, ((s - bird.width) // 2, (s - bird.height) // 2))
    ImageDraw.Draw(t).rounded_rectangle(
        (1, 1, s - 2, s - 2), rad, outline=(255, 138, 0, 70), width=max(2, s // 120)
    )
    return t.resize((size, size), Image.Resampling.LANCZOS)

for n in (32, 180, 512):
    tile(n).save(B + 'fyzen-icon-%d.png' % n, optimize=True)
tile(32).save(B + 'fyzen-favicon-32.png', optimize=True)
tile(180).save(B + 'fyzen-apple-touch-icon-180.png', optimize=True)
tile(64).save(B + 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

# Open Graph: official wordmark on the site's near-black, no transparency (JPEG).
og = Image.new('RGB', (1200, 630), (11, 11, 13))
ow = 1000
ox = logo.resize((ow, max(1, round(lh * ow / lw))), Image.Resampling.LANCZOS)
canvas = Image.new('RGBA', (1200, 630), (11, 11, 13, 255))
canvas.alpha_composite(ox, ((1200 - ox.width) // 2, (630 - ox.height) // 2))
canvas.convert('RGB').save(B + 'fyzen-og-1200x630.jpg', quality=86, optimize=True)

print('logo trim', logo.size, 'header 36px', header_w[36], 'x36;', '72px', header_w[72], 'x72;', 'phoenix', p.size)
