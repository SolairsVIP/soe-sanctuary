# 流放圣所 · Sanctuary of Exile

中文首页与新赛季内容预览，使用原生 HTML、CSS 和 JavaScript 构建。

站点：https://SolairsVIP.github.io/soe-sanctuary/

## 本地预览

在项目根目录运行 `python -m http.server 4173`，然后打开 http://127.0.0.1:4173/。

## 发布

GitHub Pages 从 `main` 分支的根目录发布。更新页面或素材后，提交并推送至 `main` 即可自动更新网站。

## 素材

游戏截图、视频与美术素材来自 Sanctuary of Exile 游戏内容及参考宣传页；相关权利归原权利人所有。字体许可见 `assets/fonts/`。

## 升华职业页面

`ascendancies.html` 是独立的升华资料页，交互逻辑和样式分别位于 `ascendancies.js`、`ascendancies.css`。数据在 `data/ascendancies.json`，是 [原中文资料站](https://dev.wdjwxh.com/pd2-new/#ascendancies) v13.0.2 的快照；规则会变化，更新时需重新核对。可使用 UTF-8 原始文件刷新数据，例如：

```powershell
Invoke-WebRequest -Uri 'https://dev.wdjwxh.com/pd2-new/data/Ascendancies.json' -OutFile 'data/ascendancies.json'
```

肖像是非官方的奇幻主题示意，来源及授权见 `assets/ascendancies/README.md`。预览时请通过本地 HTTP 服务打开网站（例如 `python -m http.server 4173`），而非直接双击 HTML 文件，以便正常读取资料。

## 刷图系统页面

`mapping.html` 是独立的刷图资料页，样式和交互分别位于 `mapping.css`、`mapping.js`、`mapping-core.js`。地图与通货快照保存在 `data/mapping.json`；来源为 [中文刷图资料](https://dev.wdjwxh.com/pd2-new/#mapping)及 [Mod v13.0.2](https://github.com/Lukaszpg/PD2-Sanctuary-of-Exile/tree/v13.0.2) 的物品表。地图没有足够可靠的数据时显示“暂无数据”；T4 复用炼狱地图图标只是视觉展示，两类地图的资料保持独立。

T4 地牢中文名参照 [PD2 汉化资料](https://wiki.projectdiablo2.cn/wiki/PD2name)中 `t42`–`t44` 物品词条，英文名取自 Mod 的 `patchstring.tbl` 实际显示名称；物品表中的内部名称仍可用于搜索。

从项目根目录运行 `python tools/build-mapping-data.py` 可重新整理地图名称、阶级和已收录的获取途径。脚本会核对中文站的版本，但通货效果和页面中的规则是人工整理的；资料或版本更新时，需对照中文站的 `Mapping.json` 和 Mod 表重新核对，再更新脚本、页面与快照。已知中文材料图鉴与 Mod 配方表的部分炼狱熔炉材料数量不一致，页面暂未写入冲突数值。

搜索与数据边界可运行 `node --test tests/mapping.test.cjs` 检查。新增物品图标的来源、提取方式与权利说明见 `assets/mapping/mod-icons/README.md`；图标在页面以 28×28 像素或更小显示。
