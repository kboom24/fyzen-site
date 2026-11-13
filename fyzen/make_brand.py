#!/usr/bin/env python3
"""Build Fyzen web logo + icon set from assets/brand/source/fyzen-logo-official.png (Hexan's official logo)."""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np, os
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
B = 'assets/brand/'
src = Image.open(B + 'source/fyzen-logo-official.png').convert('RGB')
a = np.asarray(src).astype(float) / 255
r, g, b = a[..., 0], a[..., 1], a[..., 2]
mx = a.max(axis=2); mn = a.min(axis=2); sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
H, W = mx.shape; Y, X = np.mgrid[0:H, 0:W]
warm = (r >= g - 0.02) & (g >= b - 0.05)
core = (sat > 0.45) & (mx > 0.3) & warm
region = np.zeros_like(core); region[140:600, 630:1200] = True
band = (Y >= 492)
line = 765 - (Y - 505) * (55 / 75)
region &= ~band | (np.abs(X - line - 4) < 13)
core &= region
near = np.asarray(Image.fromarray((core * 255).astype('uint8')).filter(ImageFilter.MaxFilter(7))) > 0
alpha = np.clip((sat - 0.25) / 0.25, 0, 1) * np.clip((mx - 0.15) / 0.2, 0, 1) * warm
bright = (mx > 0.6) & near & (r > b + 0.08)
alpha = np.maximum(alpha, bright.astype(float)) * near * region
am = Image.fromarray((alpha * 255).astype('uint8'))
closed = np.asarray(am.filter(ImageFilter.MaxFilter(11)).filter(ImageFilter.MinFilter(11))).astype(float) / 255
alpha = np.maximum(alpha, closed * region)
ph = Image.fromarray((np.dstack([a, alpha]) * 255).astype('uint8'), 'RGBA')
ph = ph.crop(ph.getbbox())

def tile(size):
    s = size * 4; rad = int(s * 0.22)
    t = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    mask = Image.new('L', (s, s), 0); ImageDraw.Draw(mask).rounded_rectangle((0, 0, s - 1, s - 1), rad, fill=255)
    base = Image.new('RGBA', (s, s), (13, 11, 11, 255))
    glow = Image.new('RGBA', (s, s), (0, 0, 0, 0)); ImageDraw.Draw(glow).ellipse((s * .2, s * .5, s * .8, s * 1.0), fill=(255, 130, 0, 60))
    base = Image.alpha_composite(base, glow.filter(ImageFilter.GaussianBlur(s * .09)))
    t.paste(base, (0, 0), mask)
    pad = 0.11 if size <= 48 else 0.14
    w, h = ph.size; sc = min(s * (1 - 2 * pad) / w, s * (1 - 2 * pad) / h)
    p = ph.resize((int(w * sc), int(h * sc)), Image.LANCZOS)
    t.alpha_composite(p, ((s - p.width) // 2, (s - p.height) // 2))
    ImageDraw.Draw(t).rounded_rectangle((1, 1, s - 2, s - 2), rad, outline=(255, 138, 0, 70), width=max(2, s // 120))
    return t.resize((size, size), Image.LANCZOS)

for n in (32, 180, 512): tile(n).save(B + 'fyzen-icon-%d.png' % n, optimize=True)
tile(32).save(B + 'fyzen-favicon-32.png', optimize=True)
tile(180).save(B + 'fyzen-apple-touch-icon-180.png', optimize=True)
tile(64).save(B + 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
p = ph.copy(); p.thumbnail((512, 512), Image.LANCZOS); p.save(B + 'fyzen-phoenix.png', optimize=True); p.save(B + 'fyzen-phoenix.webp', quality=88, method=6)

ys, xs = np.where(mx > 0.12)
logo = src.crop((max(xs.min() - 24, 0), max(ys.min() - 20, 0), min(xs.max() + 24, W), min(ys.max() + 20, H)))
lw, lh = logo.size
big = logo.resize((1200, round(lh * 1200 / lw)), Image.LANCZOS)
big.quantize(256, method=Image.Quantize.MEDIANCUT).save(B + 'fyzen-logo.png', optimize=True)
big.save(B + 'fyzen-logo.webp', quality=86, method=6)
for hh in (36, 72):
    x = logo.resize((round(lw * hh / lh), hh), Image.LANCZOS)
    x.save(B + 'fyzen-logo-h%d.webp' % hh, quality=90, method=6); x.save(B + 'fyzen-logo-h%d.png' % hh, optimize=True)
og = Image.new('RGB', (1200, 630), (9, 9, 11)); w = 1000; x = logo.resize((w, round(lh * w / lw)), Image.LANCZOS)
og.paste(x, ((1200 - w) // 2, (630 - x.height) // 2)); og.save(B + 'fyzen-og-1200x630.jpg', quality=86)
print('logo', logo.size, '-> header', round(lw * 36 / lh), 'x36')
