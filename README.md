# OpenChoices

> 从熟悉的商业软件出发，搜索、比较并发现可信的开源替代品。

OpenChoices 是一个不依赖服务器的开源软件目录。它使用公开的 JSON 数据同时服务于静态网站和未来的 Windows 管理器，重点展示“可以替代什么”、许可证、支持平台、官方来源和受控安装方式。

![OpenChoices 首页预览](docs/preview.png)

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

静态资源需要通过 HTTP 打开，才能正常载入目录和注册 Service Worker：

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

## 路线图

- 增加功能对比、部署难度和数据导出能力说明。
- 由计划工作流生成活跃度与最新版本快照。
- 建立中英文界面和目录内容。
- 开发只读 Windows 客户端，复用相同目录。
- 在安全模型稳定后加入安装检测、更新与卸载。

## 许可证

项目代码采用 MIT License。目录中收录的软件各自遵循其原项目许可证；OpenChoices 与这些项目及其所替代的商业产品不存在隶属关系。
