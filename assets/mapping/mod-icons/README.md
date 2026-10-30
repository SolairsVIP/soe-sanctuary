# 刷图新增道具图标

这里保存的是从 Sanctuary of Exile Mod 原始 DC6 素材转换的透明 PNG，供后续刷图资料页面使用。当前整理了 26 个条目：

- 3 个铭文、4 个恐怖、3 个制图凿子和 6 个憎恶宝珠；
- 9 个炼狱地图和 1 个炼狱熔炉。

这是刷图相关素材的首批清单，并非 Mod 中全部新增物品。每张图片以游戏物品代码命名，`manifest.json` 保存中英文名、原始图标名和精确来源；`preview.html` 可通过本地预览服务器打开。八张未在参考资料中找到中文名称的炼狱地图暂保留英文原名，后续需要核对。铭文、恐怖和宝珠在不同中文资料中存在不同译法，应以英文名称或物品代码为准。

## 来源与重新生成

- Mod 原始图标及物品表：[PD2-Sanctuary-of-Exile](https://github.com/Lukaszpg/PD2-Sanctuary-of-Exile)，固定版本 `961bd69f78a5657255be17297f7a05a4d73d9f21`。
- 解码所用 units 调色板：[qdc6](https://github.com/kambala-decapitator/qdc6)，来源和 SHA-256 记在清单内。
- 已有中文名称来自[原中文资料站的材料图鉴数据](https://dev.wdjwxh.com/pd2-new/data/MaterialsGuide.json)，清单内记录了下载时的数据摘要。
- 使用安装了 Pillow 的 Python 运行 `python tools/extract-mapping-icons.py` 即可重新生成图标与预览。

Mod 仓库标注了 MIT 许可，但其说明也提到资源需要与原版 PD2 内容合并，且鸣谢了其他素材作者；仓库许可不能单独证明所有游戏及第三方素材都可再发布。公开使用前应分别核对相关素材的权利和许可。
