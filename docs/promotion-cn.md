# OpenChoices 宣传素材

## 推荐主标题

我整理了 100 个免费开源软件：输入 Photoshop、Notion 或 Office，就能找到替代品

## 备选标题

- 不知道开源项目的名字？这个网站可以从商业软件反查开源替代品
- 100 个免费开源软件，一页搜索，无需登录，也不需要服务器
- 我做了一个开源软件搜索页：帮你找到 Photoshop、Office、Notion 的免费替代品

## 主文章

平时我们经常看到“Awesome 开源软件合集”，但它们有一个共同问题：你得先知道项目叫什么，才能判断它是不是自己需要的工具。

大多数普通用户的搜索方式其实是：“有没有免费的 Photoshop？”“Notion 有没有开源替代品？”“除了 Office 还能用什么？”

因此我做了 **OpenChoices**：一个可以从熟悉的商业软件出发，反向查找免费开源替代品的静态目录。

在线地址：https://wanbinyu.github.io/openchoices/

GitHub：https://github.com/Wanbinyu/openchoices

### 目前能做什么

OpenChoices 现已整理 100 个常用免费开源项目，覆盖效率办公、图形设计、音视频、开发工具、网络、安全隐私和系统工具等方向。

你可以直接搜索：

- Photoshop，找到 GIMP、Krita；
- Notion，找到 AppFlowy、Trilium Notes；
- Microsoft Office，找到 LibreOffice、ONLYOFFICE；
- Docker Desktop，找到 Podman、Rancher Desktop；
- TeamViewer，找到 RustDesk。

除了项目名称，页面也能按照中文用途、商业替代目标、分类、平台和安装方式筛选。93 个项目提供了已经核对的 WinGet 包 ID，可以直接复制由网页本地生成的安装命令。

### 它和普通链接合集有什么不同

我希望它保持简单，但至少解决几个实际问题：

1. 不要求用户先知道开源项目名称，而是可以搜索自己熟悉的软件；
2. 每个项目都会标注许可证、支持平台、官网和源码地址；
3. 不重新托管任何安装包，只链接项目官方来源；
4. 不接收远程命令，安装信息只能是受控的 WinGet 包 ID；
5. 不需要账号、广告、跟踪、服务器或数据库，甚至可以下载后直接双击打开。

整个网站是静态页面，目录数据公开保存在 JSON 中。每次更新都会自动检查数据结构、重复项目和官网、源码链接，并通过 GitHub Pages 发布。

### 为什么现在只有 100 个

这个项目并不追求短时间堆出几千条链接。第一批优先选择普通用户真正可能安装、许可证和官方来源比较明确的项目。

100 个项目时页面非常流畅。未来接近 500～1,000 个项目后，我会加入分批渲染或“加载更多”；即使扩展到更大规模，也仍然可以保持纯静态，不需要维护服务器数据库。

### 欢迎补充

OpenChoices 仍处于早期阶段。如果你发现描述、许可证、平台或链接有误，或者有值得收录的免费开源项目，欢迎在 GitHub 提交 Issue 或 Pull Request。

在线体验：https://wanbinyu.github.io/openchoices/

项目源码：https://github.com/Wanbinyu/openchoices

## V2EX / 群聊短版

我整理了一个免费开源软件搜索页 OpenChoices，目前收录 100 个项目。

它和普通 Awesome List 的区别是：可以直接输入 Photoshop、Notion、Office、Docker Desktop、TeamViewer 等熟悉的软件，反查对应的开源替代品，也支持中文用途、平台和 WinGet 筛选。

纯静态、无账号、无广告、无跟踪，不重新托管安装包。93 个项目有核对过的 WinGet ID。

在线体验：https://wanbinyu.github.io/openchoices/

GitHub：https://github.com/Wanbinyu/openchoices

欢迎反馈错误或推荐值得收录的项目。

## 掘金技术版导语

我用纯 HTML、CSS、JavaScript 和一份 JSON 做了一个开源替代品目录。它不需要服务器数据库，支持离线打开、PWA 缓存、中文别名搜索和受控 WinGet 命令生成。本文介绍为什么选择静态架构，以及 100 条目录数据如何进行结构、链接和安全校验。

## 推荐标签

开源、效率工具、软件推荐、GitHub、前端、独立开发、Windows、免费软件
