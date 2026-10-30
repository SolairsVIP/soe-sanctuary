#!/usr/bin/env python3
"""Extract selected SoE map-related inventory sprites as transparent PNGs.

Run with a Python environment containing Pillow. The upstream sources are pinned
where possible; only the Chinese material names come from the live wiki snapshot.
"""

from __future__ import annotations

import csv
import hashlib
import html
import io
import json
import struct
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "mapping" / "mod-icons"
MOD_REPO = "https://github.com/Lukaszpg/PD2-Sanctuary-of-Exile"
MOD_REV = "961bd69f78a5657255be17297f7a05a4d73d9f21"
MOD_RAW = f"https://raw.githubusercontent.com/Lukaszpg/PD2-Sanctuary-of-Exile/{MOD_REV}"
PALETTE_URL = (
    "https://raw.githubusercontent.com/kambala-decapitator/qdc6/"
    "6cfa84f4c8b85bd06053e23d959db13ccc42742c/units_pal.dat"
)
NAMES_URL = "https://dev.wdjwxh.com/pd2-new/data/MaterialsGuide.json"

# The original mapping guide describes the first four groups as SoE's new
# mapping currencies. Infernal maps and the kiln are SoE-specific additions.
GROUPS = (
    ("glyph", "铭文 / 符文石", ("scnm", "scas", "sccn")),
    ("terror", "恐怖 / 恐惧", ("troo", "troe", "tror", "troa")),
    ("chisel", "制图凿子", ("ccsl", "ccsa", "ccpr")),
    ("hatred", "憎恶 / 仇恨宝珠", ("hor1", "hor2", "hor3", "hor4", "hor5", "hor6")),
    ("infernal_map", "炼狱地图", tuple(f"tm{i}i" for i in range(1, 10))),
    ("kiln", "炼狱熔炉", ("hffd",)),
)


def download(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "SOE-wiki-icon-extractor/1.0"})
    with urllib.request.urlopen(request, timeout=45) as response:
        return response.read()


def dc6_image(data: bytes, palette: bytes) -> Image.Image:
    """Decode a single-frame inventory DC6. Palette entries are BGR triples."""
    if len(palette) != 768 or len(data) < 60:
        raise ValueError("Invalid palette or truncated DC6")
    version, _, _, _, directions, frames = struct.unpack_from("<6I", data)
    if version != 6 or (directions, frames) != (1, 1):
        raise ValueError("Only single-frame DC6 inventory icons are supported")
    offset = struct.unpack_from("<I", data, 24)[0]
    if offset + 32 > len(data):
        raise ValueError("Invalid DC6 frame offset")
    flip, width, height, _, _, _, _, length = struct.unpack_from("<8i", data, offset)
    if flip not in (0, 1) or not (0 < width <= 512 and 0 < height <= 512):
        raise ValueError("Invalid DC6 frame dimensions")
    cursor, end = offset + 32, offset + 32 + length
    if length < 0 or end > len(data):
        raise ValueError("Invalid DC6 pixel stream")
    pixels = bytearray(width * height)
    x = y = 0
    while cursor < end:
        control = data[cursor]
        cursor += 1
        if control == 0x80:
            x = 0
            y += 1
        elif control > 0x80:
            x += control & 0x7F
        else:
            count = control
            if y >= height or x + count > width or cursor + count > end:
                raise ValueError("Invalid DC6 literal run")
            row = y if flip else height - 1 - y
            start = row * width + x
            pixels[start : start + count] = data[cursor : cursor + count]
            cursor += count
            x += count
        if x > width or y > height:
            raise ValueError("Invalid DC6 row")
    if y != height:
        raise ValueError("Incomplete DC6 frame")
    image = Image.new("RGBA", (width, height))
    image.putdata([
        (palette[i * 3 + 2], palette[i * 3 + 1], palette[i * 3], 255)
        if i else (0, 0, 0, 0)
        for i in pixels
    ])
    return image


def make_preview(items: list[dict]) -> str:
    sections = []
    for category, label, _ in GROUPS:
        cards = []
        for item in items:
            if item["category"] != category:
                continue
            name = item["nameZh"] or "炼狱地图"
            cards.append(
                '<article class="card">'
                f'<div class="icon"><img src="{html.escape(item["file"], quote=True)}" alt=""></div>'
                f'<h3>{html.escape(name)}</h3><p>{html.escape(item["nameEn"])}</p>'
                f'<small>{html.escape(item["code"])}</small></article>'
            )
        sections.append(f'<section><h2>{html.escape(label)}</h2><div class="grid">{"".join(cards)}</div></section>')
    return '''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>刷图新增道具 · 图标预览</title>
<style>
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#11100f;color:#e8dcc6;font:15px/1.6 system-ui,"Microsoft YaHei",sans-serif}
main{max-width:1160px;margin:auto;padding:52px 30px 80px}header{border-bottom:1px solid #49392a;padding-bottom:26px}
.eyebrow,small{color:#bd9361;letter-spacing:.12em}h1,h2,h3{font-family:Georgia,"Microsoft YaHei",serif;font-weight:500}
h1{font-size:clamp(28px,4vw,40px);margin:7px 0}header p{color:#ada18e;margin:0}section{margin-top:36px}
h2{font-size:20px;margin:0 0 15px;color:#e0c39a}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
.card{min-width:0;border:1px solid #33291f;background:#191714;padding:16px}.icon{height:48px;display:grid;place-items:center;background:#11100e}
img{width:28px;height:28px;object-fit:contain;image-rendering:pixelated}h3{font-size:15px;margin:13px 0 3px}
.card p{font-size:12px;color:#a69989;margin:0;min-height:3em;overflow-wrap:anywhere}small{font-size:11px}
.note{color:#a99b89;font-size:13px;margin-top:40px}.note a{color:#d8b17e}
@media(max-width:500px){main{padding:32px 18px 60px}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style></head><body><main><header><span class="eyebrow">SANCTUARY OF EXILE · MAPPING</span>
<h1>刷图新增道具 · 图标预览</h1><p>从 Mod 原始素材转换的透明图标。炼狱地图未收录中文名称的条目暂显示英文原名。</p></header>''' + "".join(sections) + '''
<p class="note">图标以原始像素尺寸保存和展示。来源和物品代码见 <a href="manifest.json">素材清单</a> 与 README。</p></main></body></html>'''


def main() -> None:
    palette = download(PALETTE_URL)
    raw_misc = download(f"{MOD_RAW}/standard-mode/data/global/excel/Misc.txt")
    raw_names = download(NAMES_URL)
    names = json.loads(raw_names)["items"]
    rows = {row["code"]: row for row in csv.DictReader(io.StringIO(raw_misc.decode("utf-8-sig")), delimiter="\t")}
    requests = []
    for category, _, codes in GROUPS:
        for code in codes:
            row = rows[code]
            icon = row["invfile"]
            entry = names.get(code, {})
            if entry.get("icon") and entry["icon"].lower() != icon.lower():
                raise ValueError(f"Icon mismatch for {code}: {entry['icon']} != {icon}")
            requests.append((category, code, row, entry, icon, f"{MOD_RAW}/assets/data/global/items/{icon}.dc6"))

    with ThreadPoolExecutor(max_workers=8) as pool:
        files = list(pool.map(download, [entry[-1] for entry in requests]))

    # Decode everything before writing anything, so an invalid source cannot
    # leave a partial export behind.
    decoded = [dc6_image(data, palette) for data in files]
    OUTPUT.mkdir(parents=True, exist_ok=True)
    result = []
    for (category, code, row, entry, icon, url), image in zip(requests, decoded):
        filename = f"{code}.png"
        image.save(OUTPUT / filename, optimize=True)
        result.append({
            "code": code,
            "nameZh": entry.get("nameZh") or None,
            "nameEn": row["name"],
            "aliases": entry.get("aliases", []),
            "category": category,
            "file": filename,
            "sourceIcon": icon,
            "sourceUrl": url,
            "width": image.width,
            "height": image.height,
        })
    manifest = {
        "scope": "Selected SoE mapping additions; not a complete inventory of all mod items.",
        "modRepository": MOD_REPO,
        "modRevision": MOD_REV,
        "miscTable": f"{MOD_RAW}/standard-mode/data/global/excel/Misc.txt",
        "paletteSource": PALETTE_URL,
        "paletteSha256": hashlib.sha256(palette).hexdigest(),
        "chineseNamesSource": NAMES_URL,
        "chineseNamesSha256": hashlib.sha256(raw_names).hexdigest(),
        "items": result,
    }
    (OUTPUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUTPUT / "preview.html").write_text(make_preview(result), encoding="utf-8")
    print(f"Exported {len(result)} icons to {OUTPUT}")


if __name__ == "__main__":
    main()
