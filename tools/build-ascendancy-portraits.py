"""Prepare consistently framed cards and detail portraits (requires Pillow).

Each tuple is (source filename, crop left, crop width, crop top); coordinates
are fractions of the original width/height. Keep the original art in assets so
future maintainers can adjust individual focal points without quality loss.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / 'assets' / 'ascendancies'
CROPS = {
    'portrait-1.webp': (0.00, 1.00, 0.14),
    'mage-1.webp':     (0.14, 0.72, 0.04),
    'portrait-5.webp': (0.00, 1.00, 0.05),
    'paladin-2.webp':  (0.06, 0.72, 0.06),
    'portrait-3.webp': (0.00, 1.00, 0.09),
    'elemental.webp':  (0.08, 0.84, 0.02),
    'sorceress-1.webp': (0.33, 0.34, 0.03),
    'portrait-4.webp': (0.00, 1.00, 0.10),
    'lich-1.webp':     (0.15, 0.70, 0.02),
    'ranger-1.webp':   (0.12, 0.76, 0.04),
    'druidwoman.webp': (0.00, 1.00, 0.04),
    'archer.webp':     (0.06, 0.88, 0.03),
    'portrait-7.webp': (0.00, 1.00, 0.08),
    'portrait-6.webp': (0.00, 1.00, 0.10),
}

for name, (left, width, top) in CROPS.items():
    with Image.open(ROOT / name) as source:
        source = source.convert('RGB')
        x0 = round(source.width * left)
        x1 = round(source.width * (left + width))
        y0 = round(source.height * top)
        crop_width = x1 - x0
        for kind, ratio, size in [('card', 1.0, (720, 720)), ('detail', 1.1, (720, 792))]:
            y1 = y0 + round(crop_width * ratio)
            if x0 < 0 or y0 < 0 or x1 > source.width or y1 > source.height:
                raise ValueError(f'Crop outside source: {name} {kind}')
            out = ROOT / 'cropped' / kind
            out.mkdir(parents=True, exist_ok=True)
            source.crop((x0, y0, x1, y1)).resize(size, Image.Resampling.LANCZOS).save(out / name, 'WEBP', quality=82, method=6)
print(f'Prepared {len(CROPS)} card and detail portraits')
