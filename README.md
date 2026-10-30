# 流放圣所 · Sanctuary of Exile

中文首页与新赛季内容预览，使用原生 HTML、CSS 和 JavaScript 构建。

站点：https://pd2soe.wdjwxh.com/

## 本地预览

在项目根目录运行 `python -m http.server 4173`，然后打开 http://127.0.0.1:4173/。

## 首页资料入口

右上角“资料索引”集中列出本站页面、天梯服务与档案馆栏目；首页“探索资料”提供尚未在首页其他位置出现的资料入口，装备和物品内容按分类收起，技能资料可直接打开；首页搜索也涵盖其他区域的入口。图鉴直接进入档案馆对应栏目。技能入口包括流放圣所新增技能及部分职业技能改动；资料更新日志记录的是档案馆的更新。新手教程与诅咒模式规则集中在本地服务器设定页。

## 发布

更新页面或素材后，提交并推送至 `main`，GitHub Actions 检查通过后自动更新网站。

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

## 炼狱熔炉页面

`kiln.html` 整理诅咒模式的熔炉获取方式、常用配方和灌注对应表；`kiln.css`、`kiln.js` 与 `kiln-core.js` 提供样式和配方搜索。页面正文不依赖脚本加载。配方以[中文熔炉资料](https://dev.wdjwxh.com/pd2-new/#kiln)与 [Mod v13.0.2 诅咒模式配方表](https://github.com/Lukaszpg/PD2-Sanctuary-of-Exile/blob/db4b47404733545bb9184b2d500a6d74bbba2696/damnation-mode/data/global/excel/CubeMain.txt)核对；部分材料图鉴提示与配方表不一致，本页数量采用配方表。赛季更新时需重新核对。

“在方块中合成”使用的赫拉迪姆方块图标来自 Blizzard 的 [Arreat Summit](https://classic.battle.net/diablo2exp/items/cube.shtml)，已去除纯色背景并以 28×28 像素显示。

运行 `node --test tests/kiln.test.cjs` 可检查配方搜索和分类的组合行为。

## 诅咒模式服务器设定页

`damnation.html` 和 `damnation.css` 说明服务器当前采用的诅咒模式：以[档案馆标准模式](https://dev.wdjwxh.com/pd2-new/#standard)为基础，使用[诅咒模式](https://dev.wdjwxh.com/pd2-new/#damnation)中明确的变化覆盖或补充。资料版本为 v13.0.2；页面无需 JavaScript 即可阅读，版本或服务器规则更新时需逐项复核。

新手路线与 PD2 和原版暗黑 2 的核心差异参考[档案馆新手教程](https://dev.wdjwxh.com/pd2-new/#tutorial)和 [PD2 通用改动](https://wiki.projectdiablo2.cn/wiki/General_Changes)；共享仓库页数和全球天梯标为 PD2 官服信息。符文降级范围与配方按服务器补充说明编写，1 号为最低阶符文。

教程中对应的物品图标保存在 `assets/archive-materials/`，图鉴缺少的升华魂石素材由 `python tools/extract-damnation-icons.py` 从 SoE v13.0.2 原始 DC6 提取到 `assets/soe-mode-icons/`。物品代码、素材来源及复用说明见[图标说明](assets/archive-materials/README.md)。

档案馆的标准规则中将 Sacred Orb 的中文名称混写为“神授宝珠”，本页依据英文名称及物品代码 `sror` 使用“圣化宝珠”，并与被禁用的 Divine Orb（`dvo`）区分。标准和诅咒资料对恶魔方块的标准数值不一致，页面采用诅咒模式明确写出的当前数值。
