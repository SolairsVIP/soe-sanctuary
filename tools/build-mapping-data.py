#!/usr/bin/env python3
"""Build a compact v13.0.2 mapping reference from the wiki and Mod tables."""
import csv
import hashlib
import io
import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WIKI = "https://dev.wdjwxh.com/pd2-new/data/MaterialsGuide.json"
VERSION = "https://dev.wdjwxh.com/pd2-new/data/version.json"
MOD_REF = "db4b47404733545bb9184b2d500a6d74bbba2696"  # v13.0.2
MISC = f"https://raw.githubusercontent.com/Lukaszpg/PD2-Sanctuary-of-Exile/{MOD_REF}/standard-mode/data/global/excel/Misc.txt"

# Wording and numbers below follow Mapping.json v13.0.2, rather than the
# material guide's occasionally conflicting abbreviated descriptions.
CURRENCY = {
    "scnm": ("glyph", ["仇敌符文石"], "地图额外增加 25% 的暗金怪物群，可与自身叠加。"),
    "scas": ("glyph", ["对手符文石"], "增加一名地图首领；首领额外掉落技能护符，这些效果不与自身叠加。"),
    "sccn": ("glyph", ["腐化符文石"], "怪物有 25% 几率掉落腐化物品，可叠加；首领额外掉落 1–3 件腐化暗金，不可叠加。"),
    "troo": ("terror", ["富饶恐惧"], "加入偏向通货掉落的恐怖怪；T1–T4 分别最多掉落 1、2、3、4 件通货。"),
    "troe": ("terror", ["虚无恐惧"], "加入偏向符文掉落的恐怖怪；T1–T4 分别最多掉落 1、2、3、4 枚符文。"),
    "tror": ("terror", ["辉煌恐惧"], "加入偏向暗金掉落的恐怖怪；T1–T4 分别最多掉落 2、3、4、5 件暗金。"),
    "troa": ("terror", ["绝对恐惧"], "加入偏向超级首领材料掉落的恐怖怪；T1–T4 分别最多掉落 1、2、3、4 份材料。"),
    "ccsl": ("chisel", ["制图师刻刀", "基础凿子"], "金币获取与魔法装备获取率提高 25%；T1–T4 怪物密度分别提高 55%、65%、75%、75%。"),
    "ccsa": ("chisel", ["贪婪制图师之凿"], "金币获取与魔法装备获取率提高 75%，经验加成提高 75%。"),
    "ccpr": ("chisel", ["采购制图师之凿"], "T1–T4 怪物密度分别提高 85%、95%、105%、105%。"),
    "hor1": ("hatred", ["仇恨宝珠·装备"], "怪物有 1% 几率额外掉落武器和护甲。"),
    "hor2": ("hatred", ["仇恨宝珠·饰品"], "怪物有 1% 几率额外掉落首饰、护身符和珠宝。"),
    "hor3": ("hatred", ["仇恨宝珠·精华"], "怪物有 1% 几率额外掉落精华。"),
    "hor4": ("hatred", ["仇恨宝珠·命运卡"], "怪物有 1% 几率额外掉落命运卡。"),
    "hor5": ("hatred", ["仇恨宝珠·符文"], "怪物有 1% 几率额外掉落符文。"),
    "hor6": ("hatred", ["仇恨宝珠·通货"], "怪物有 1% 几率额外掉落通货。"),
}
CATEGORY = {
    "glyph": {"name": "铭文", "aliases": ["符文石", "刻印"], "rule": "仅适用于稀有地图。每个铭文权重为 1，地图铭文权重随 T1–T4 阶级为 1–4。"},
    "terror": {"name": "恐怖", "aliases": ["恐惧"], "rule": "仅适用于稀有地图；每张地图最多使用一种恐怖。"},
    "chisel": {"name": "制图凿子", "aliases": ["刻刀", "凿子"], "rule": "每张地图最多使用两个凿子；地图被注入赫拉迪姆宝珠重铸时，已使用的凿子会消失且不退还。"},
    "hatred": {"name": "憎恶宝珠", "aliases": ["仇恨宝珠"], "rule": "每张地图最多使用 5 个憎恶宝珠，每个提高 1 级仇恨。"},
}
INFERNAL_BASE = {"tm1i": "t21", "tm2i": "t32", "tm3i": "t35", "tm4i": "t37", "tm5i": "t39", "tm6i": "t38", "tm7i": "t14", "tm8i": "t16", "tm9i": "t3a"}
# The Misc.txt "name" is an internal label, not necessarily the item name.
# English names below come from the Mod's v13.0.2 patchstring.tbl; Chinese
# names follow https://wiki.projectdiablo2.cn/wiki/PD2name (items t42–t44).
T4_NAMES = {
    "t42": ("折磨平原", "Plains of Torment Map"),
    "t43": ("罪恶庇护所", "Sanctuary of Sin Map"),
    "t44": ("达肯沙尔大草原", "Steppes of Daken-Shar Map"),
}


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "SOE-wiki-mapping-page/1.0"})
    with urllib.request.urlopen(request, timeout=45) as response:
        return response.read()


def extract_hint(item):
    text = " ".join(item.get("wolfHint", [])).replace("%LIGHT_GRAY%", " ")
    boss = re.search(r"Boss伤害类型\s*:\s*([^|]+)", text)
    monsters = re.search(r"怪物类型\s*:\s*(.*?)(?=怪物最高抗性|$)", text)
    res = re.search(r"怪物最高抗性\s*:\s*(.*)", text)
    boss = boss.group(1).strip() if boss else None
    if boss and "暂无数据" in boss:
        boss = None
    values = dict(re.findall(r"(火|冰|电|毒|魔法|物理)\s*:\s*(\d+)", res.group(1))) if res else {}
    return boss, monsters.group(1).strip(" ,") if monsters else None, values or None


def main():
    raw_names, raw_misc, raw_version = fetch(WIKI), fetch(MISC), fetch(VERSION)
    game_version = json.loads(raw_version)["gameTag"]
    if game_version != "v13.0.2":
        raise ValueError(f"中文站版本已变化：{game_version}；请先复核规则后再更新")
    names = json.loads(raw_names)["items"]
    rows = {r["code"]: r for r in csv.DictReader(io.StringIO(raw_misc.decode("utf-8-sig")), delimiter="\t")}
    maps = []
    for item in names.values():
        if item.get("group") != "map_t1_t3":
            continue
        row = rows[item["code"]]
        tiers = {"t1m": "T1", "t2m": "T2", "t3m": "T3"}
        if row["type"] not in tiers:
            raise ValueError(f"地图类型异常：{item['code']} {row['type']}")
        boss, monsters, res = extract_hint(item)
        maps.append({"code": item["code"], "nameZh": item["nameZh"], "nameEn": item["nameEn"],
                     "tier": tiers[row["type"]], "bossDamage": boss, "monsters": monsters,
                     "resistances": res, "icon": None, "nameSource": "中文材料图鉴"})

    for code, base_code in INFERNAL_BASE.items():
        row = rows[code]
        base = names[base_code]
        chinese = names.get(code, {})
        boss, monsters, res = extract_hint(chinese)
        maps.append({"code": code, "nameZh": chinese.get("nameZh") or ("炼狱 · " + base["nameZh"]),
                     "nameEn": row["name"], "tier": "T3.5", "bossDamage": boss, "monsters": monsters,
                     "resistances": res, "icon": f"./assets/mapping/mod-icons/{code}.png",
                     "nameSource": "中文材料图鉴" if chinese.get("nameZh") else "基于对应地图的展示名称"})

    for index, code in enumerate(("t42", "t43", "t44"), 1):
        row = rows[code]
        if row["type"] != "t4m" or row["spawnable"] != "1":
            raise ValueError(f"T4 地图类型异常：{code}")
        name_zh, name_en = T4_NAMES[code]
        maps.append({"code": code, "nameZh": name_zh, "nameEn": name_en, "aliases": [row["name"]], "tier": "T4", "bossDamage": None,
                     "monsters": None, "resistances": None,
                     "icon": f"./assets/mapping/mod-icons/tm{index}i.png", "nameSource": "PD2 汉化资料及 Mod 英文语言表"})

    tier_order = {"T1": 1, "T2": 2, "T3": 3, "T3.5": 4, "T4": 5}
    maps.sort(key=lambda item: (tier_order[item["tier"]], item["code"]))

    currencies = []
    for code, (category, aliases, summary) in CURRENCY.items():
        entry, row = names[code], rows[code]
        if entry["icon"].lower() != row["invfile"].lower():
            raise ValueError(f"图标名称不匹配：{code}")
        acquisition = []
        for text in entry.get("manualSources", []):
            # Formula quantities differ between the material guide and the Mod
            # table. The recipes section calls this out rather than picking one.
            if "熔炉转化" not in text:
                acquisition.append({"text": text, "mode": None})
        for drop in entry.get("drops", []):
            part = {"text": drop.get("label"), "mode": drop.get("mode")}
            if part["text"] and part not in acquisition:
                acquisition.append(part)
        currencies.append({"code": code, "nameZh": entry["nameZh"], "nameEn": row["name"],
                           "aliases": aliases + CATEGORY[category]["aliases"], "category": category,
                           "categoryName": CATEGORY[category]["name"], "summary": summary,
                           "rule": CATEGORY[category]["rule"], "acquisition": acquisition,
                           "icon": f"./assets/mapping/mod-icons/{code}.png"})

    data = {"version": game_version, "modRevision": MOD_REF, "sources": {"materials": WIKI, "misc": MISC,
            "materialsSha256": hashlib.sha256(raw_names).hexdigest()}, "maps": maps, "currencies": currencies}
    target = ROOT / "data" / "mapping.json"
    target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(maps)} maps and {len(currencies)} currencies to {target}")


if __name__ == "__main__":
    main()
