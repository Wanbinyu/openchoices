# OpenChoices

> 从熟悉的商业软件出发，搜索、比较并发现可信的开源替代品。

**在线访问：<https://wanbinyu.github.io/openchoices/>**

不用安装，也不用自己部署；打开链接就可以搜索和浏览目录。

OpenChoices 是一个不依赖服务器的开源软件目录。它使用公开的 JSON 数据同时服务于静态网站和未来的 Windows 管理器，重点展示“可以替代什么”、许可证、支持平台、官方来源和受控安装方式。

当前目录包含 100 个常用免费开源产品，覆盖效率办公、设计创作、音视频、开发、网络、安全和系统工具等方向。其中 93 个提供已经核对的 WinGet 包 ID。

![OpenChoices 首页预览](docs/promo-home.png)

搜索 `Photoshop` 后会直接显示对应的开源选择：

![OpenChoices 搜索 Photoshop](docs/promo-search-photoshop.png)

## 当前功能

- 按项目名、商业产品名、用途和标签即时搜索。
- 按分类、平台和安装方式筛选。
- 显示许可证、源码、官网和最近核验日期。
- 仅根据受控 WinGet 包 ID 在浏览器本地生成安装命令。
- PWA 离线缓存，目录更新失败时保留最近可用版本。
- 桌面、平板和窄屏手机响应式布局。
- 自动验证目录结构、URL、重复条目和危险字段。
- GitHub Pages 自动部署与每周链接检查。

## 本地运行

可以直接双击 `index.html` 浏览和搜索目录。直接打开时使用生成的 `data/catalog.js`，PWA 离线缓存不会启用。

如需测试与 GitHub Pages 相同的 HTTP/PWA 运行方式：

```powershell
npx --yes http-server . -p 4173 -c-1
```

打开 `http://127.0.0.1:4173/`。

## 验证

```powershell
npm run verify
npm run check:links
```

`verify` 不访问网络，适合每次提交前运行。`check:links` 会访问所有官网和源码地址，主要由计划工作流每周执行。

链接请求每次最多等待 20 秒。超时、连接错误、HTTP 408 / 429 和 5xx 会最多尝试 3 次，重试前分别等待 1 秒、2 秒；重试耗尽后仍会让检查失败。404 等其他 HTTP 错误直接报错。阻止自动访问的 HTTP 403 标为 `SKIP`，不作为链接已验证成功。

修改 `data/catalog.json` 后先运行：

```powershell
npm run generate
```

它会生成可供直接双击页面使用的 `data/catalog.js`；`npm run verify` 会检查两者是否一致。

## 数据安全边界

远程目录不能携带 PowerShell、CMD、Shell 或 JavaScript 命令。安装字段只允许声明受支持的包管理器和包 ID：

```json
{
  "provider": "winget",
  "packageId": "GIMP.GIMP"
}
```

当前网页只复制固定格式命令，不会静默安装软件。未来桌面管理器也应由本地可信代码根据包 ID 构造参数，而不是执行目录提供的字符串。

## 项目结构

```text
data/catalog.json          统一软件目录
scripts/                   结构、内容和链接校验
index.html                 静态网站入口
app.js                     搜索、筛选与卡片渲染
service-worker.js          PWA 离线缓存
.github/workflows/         验证、链接检查和 Pages 部署
```

提交新项目请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 收录范围

目录优先收录普通用户可以直接使用、源码和许可证明确、官网或发布渠道稳定的项目。项目不会因为商业替代目标相同而被排他收录，也不代表 OpenChoices 与项目作者存在合作或背书关系。

下一阶段会继续补充高需求类别和搜索别名，但保持静态、免登录、无服务器数据库的轻量结构。

## 许可证

项目代码采用 MIT License。目录中收录的软件各自遵循其原项目许可证；OpenChoices 与这些项目及其所替代的商业产品不存在隶属关系。
