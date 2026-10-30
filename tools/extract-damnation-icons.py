#!/usr/bin/env python3
"""Extract mode-page inventory icons that are missing from the archive."""

from __future__ import annotations

import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tools" / "extract-mapping-icons.py"
OUTPUT = ROOT / "assets" / "soe-mode-icons"
MOD_REV = "db4b47404733545bb9184b2d500a6d74bbba2696"
MOD_RAW = f"https://raw.githubusercontent.com/Lukaszpg/PD2-Sanctuary-of-Exile/{MOD_REV}"

# Code and invfile are taken from the v13.0.2 damnation-mode Misc.txt.
ICONS = {"assc": "invassc1", "fa07": "invfaca"}  # Soulstone and Fate Card


def main() -> None:
    spec = importlib.util.spec_from_file_location("mapping_icons", SOURCE)
    if spec is None or spec.loader is None:
        raise RuntimeError("Cannot load the existing DC6 decoder")
    decoder = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(decoder)
    palette = decoder.download(decoder.PALETTE_URL)
    decoded = {
        code: decoder.dc6_image(decoder.download(f"{MOD_RAW}/assets/data/global/items/{icon}.dc6"), palette)
        for code, icon in ICONS.items()
    }
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for code, image in decoded.items():
        image.save(OUTPUT / f"{code}.png", optimize=True)
        print(f"{code}: {image.width}x{image.height}")


if __name__ == "__main__":
    main()
