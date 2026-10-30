# 新手教程材料图标

本目录的 PNG 来自[流放圣所档案馆材料图鉴](https://dev.wdjwxh.com/pd2-new/#materials)，对应[新手教程](https://dev.wdjwxh.com/pd2-new/#tutorial)引用的游戏物品。游戏素材权利归原权利人所有；文件保留原始分辨率，页面按比例显示。

物品代码与图像名称按档案馆的 `MaterialsGuide.json` 和 SoE v13.0.2 诅咒模式 `Misc.txt` 核对：`oroc` 机遇宝珠使用 `invmfo`，`exo` 崇高宝珠使用 `invexo`，`oros` / `exos` 为两种碎片；`cm4` / `mjw` 为华丽护身符与神话珠宝；`ncoi` / `jewp` 为永恒之币与珠宝匠棱镜；`ooe` / `lbox` / `lucb` / `wss` / `ccsl` / `pk1` 分别为萃取宝珠、拉苏克谜盒、恶魔徽章、世界之石碎片、制图凿子与恐惧之钥；`hfcr` 为晶化烬魂。升华石碑 `ascc` 使用 `invreso`，依据游戏物品表匹配。

掉落表中的钥匙 `pk2` / `pk3`、洗点精华 `tes` / `ceh` / `bet` / `fed`、恶魔方块 `imrn`、拉玛下颌骨 `rtmo`、远古碎片 `ubaa` / `ubab` / `ubac`、背信护身符 `lucc`、恶意之肉 `lucd`、纯粹恶魔精华 `dcbl` 和首恶之魂 `dcso` 的图标也来自档案馆材料图鉴，并按对应物品代码核对。

炼狱熔炉图标复用 `assets/mapping/mod-icons/hffd.png`，来源见该目录说明。赫拉迪姆方块图标来源见项目根目录 README。

升华魂石 `assc` 在该图鉴中没有可用 PNG，因此使用 `tools/extract-damnation-icons.py` 从 [SoE v13.0.2 源码的 invassc1.dc6](https://github.com/Lukaszpg/PD2-Sanctuary-of-Exile/blob/db4b47404733545bb9184b2d500a6d74bbba2696/assets/data/global/items/invassc1.dc6) 转换到 `assets/soe-mode-icons/assc.png`；命运卡 `fa07` 同样从源码 `invfaca.dc6` 提取。解码器与调色板同刷图图标。部分基础 PD2 道具的原始图标未包含在 SoE 仓库中，不能从该仓库直接提取。
