# 灵枢插件仓（Lingshu Plugins）

[![CI](https://github.com/kongtong9527/lingshu-plugins/actions/workflows/ci.yml/badge.svg)](https://github.com/kongtong9527/lingshu-plugins/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Plugins](https://img.shields.io/badge/plugins-curated-blue.svg)](manifest.json)

[English](README.md) · **简体中文**

> [!IMPORTANT]
> **本仓是灵枢插件运行时的一小撮「教材级」示例插件，不是内容聚合器，也不托管任何内容。**
>
> - **本仓不含内容本体。** 没有媒体、没有正文、没有存档、没有内容流；每个插件只是一个 `.plugin.js`
>   文件，在**运行时**通过宿主的 `$lib` 接口访问公开网页。`_fixtures/` 是人工裁剪过的**离线测试快照**，
>   用途是让插件能断网测试，而不是再分发内容。
> - **本仓不接受成人、盗版与绕过付费墙的插件。** 这里只收「公开、可匿名访问、不需要账号/会员、
>   不绕过 DRM」的站点插件。提 PR 前请先读 [CONTENT-POLICY.md](CONTENT-POLICY.md)：
>   边界之外的提交会被直接关闭且不解释，且**不设例外**。
> - **本仓是人工选品，不是插件市场。** 这里只有 3 个插件；是否增加由维护者按
>   [CONTENT-POLICY.md](CONTENT-POLICY.md) 决定，不是提交者的权利。
> - **插件沙箱不是安全边界。** 插件是宿主执行的任意 JavaScript；`node:vm` 沙箱（或 iOS 上的
>   JavaScriptCore）只提供**开发期隔离与危险 API 屏蔽**，**不能**容纳恶意代码。请勿安装来源不可信的
>   插件，并阅读 [SECURITY.md](SECURITY.md)。
> - **站点是第三方的。** 本项目不托管、不审核、不背书任何插件访问的站点，也不对其服务条款、
>   robots 策略、限流或访问合法性负责——那由运行插件的人自行承担。

## 本仓内容

| 路径 | 是什么 |
| --- | --- |
| `manifest.json` | 宿主读取的仓库索引，一条一个插件，`file` 是相对本仓根目录的路径。 |
| `*.plugin.js` | 插件本体：单文件自包含 CommonJS，顶部带 `// ==Plugin== … // ==EndPlugin==` 元数据头。 |
| `_fixtures/<id>/` | 最小离线快照（HTML/JSON），用来在不碰网络的前提下跑通插件。 |
| `CONTENT-POLICY.md` | 什么能发、什么不能发、拒绝文案怎么写、版权投诉怎么提。 |
| `CONTRIBUTING.md` | 怎么提插件、本快照怎么产生、以及为什么在本仓直接改会消失。 |

### 本仓发布的插件

| 插件 id | 来源 | 能力 |
| --- | --- | --- |
| `bilibili-hot` | 哔哩哔哩热门视频公开页面 | `list`、`detail` |
| `zhihu-daily` | 知乎日报公开页面 | `list`、`detail` |
| `github-trending` | GitHub Trending 公开页面 | `list`、`detail` |

三个插件的 `nsfw` 全为 `0`。`nsfw` 字段保留在 manifest 格式里（见下）以便宿主判断，但
**本仓只会发布 `0`**——出现非 0 即是缺陷，CI 会直接失败（`.github/workflows/ci.yml`）。

## 怎么用：把本仓加进宿主

任何理解该 manifest 格式的宿主都能直接通过 HTTPS 消费本仓：没有安装步骤，也没有构建步骤，
manifest 直接指向 raw 文件。

**在灵枢 iOS App 里：**

1. 打开 **插件 tab**，点右上角 **仓库**（上游文档里也写作「我的页 → 插件仓库」）。
2. 点 **添加仓库**。
3. 粘贴下面这个地址并确认：

   ```text
   https://raw.githubusercontent.com/kongtong9527/lingshu-plugins/main/manifest.json
   ```

4. 三个插件会出现在仓库列表里。安装时会先展示元数据（id、版本、来源、要求的运行时版本）并要求确认；
   确认之后即可在插件 tab 里跑它的 list/detail。

说明：

- 宿主会缓存 manifest，并在你进入仓库页时刷新；下拉可强制重新拉取。
- `manifest.json` 里的 `file` 相对仓库基址解析，所以镜像或 fork 本仓一样可用——把宿主指向**你自己的**
  raw manifest 地址即可。
- App 本身不从本仓分发，它是另一个**自签**的源码发行仓，见[相关仓库](#相关仓库)。

## 手动使用

只想拿文件的话，克隆即可：

```bash
git clone https://github.com/kongtong9527/lingshu-plugins.git
cd lingshu-plugins
```

### 本地跑插件

插件需要**宿主**才能运行，本仓没有宿主。用运行时与它的 `lingshu` 命令行：

```bash
# 运行时上 npm 之后（目前还没上，见下方运行时仓）：
npx lingshu-runtime list --dir .
npx lingshu-runtime run github-trending list --dir .

# 在此之前，构建一份运行时仓的检出，直接用它的命令行：
node /path/to/lingshu-runtime/dist/index.js list --dir .
node /path/to/lingshu-runtime/dist/index.js run github-trending list --dir .
```

加 `--fixture` 就走本地快照、不碰网络：

```bash
node /path/to/lingshu-runtime/dist/index.js run github-trending list \
  --fixture _fixtures/github-trending/list.html
node /path/to/lingshu-runtime/dist/index.js run zhihu-daily detail https://example.com/story/1 \
  --fixture _fixtures/zhihu-daily/detail.json
```

插件开发指南（流程、`$lib` 参考、卡片 DSL、踩坑）在运行时仓的
`skills/lingshu-plugin-dev/` 下。

## manifest 格式

`manifest.json` 是一个带 `plugins` 数组的单对象，每条：

| 字段 | 必填 | 含义 |
| --- | --- | --- |
| `id` | 是 | 稳定插件标识，必须与插件元数据头和 `<id>.plugin.js` 文件名一致。 |
| `name` | 是 | 宿主展示名。 |
| `version` | 是 | 版本串；manifest 里的版本更高时宿主会提示更新。 |
| `author` | 是 | 作者/维护者。 |
| `description` | 是 | 一句话描述，必须与插件元数据头一致。 |
| `file` | 是 | 插件相对仓库根的路径，必须真实存在——CI 会校验。 |
| `sourceUrl` | 是 | 插件读取的站点（公开 URL）。 |
| `categories` | 否 | 自由标签，供宿主分组。 |
| `lang` | 否 | 内容语言，如 `zh`、`en`。 |
| `nsfw` | **是** | 内容分级。本仓只允许 `0`；字段必须存在且必须为 `0`——CI 两项都查。 |
| `capabilities` | 否 | 插件实现了哪些动作：`list`、`detail`、`reading`、`categories`、`listings`、`explore`、`tags`、`search`、`play`、`settings`、`account`。 |
| `minRuntimeVersion` | 否 | 能运行该插件的最低运行时版本。 |

插件文件自身在元数据头里携带同一份身份信息，宿主在「单文件直链导入」时解析它：

```js
// ==Plugin==
// id: github-trending
// name: GitHub 趋势
// version: 1.0.1
// author: lingshu
// description: GitHub 趋势仓库
// sourceUrl: https://github.com/trending
// tags: code,trending,github
// ==EndPlugin==
```

元数据头里的 `description` 必须与 `manifest.json` 里的一致，且插件必须从 `module.exports`
导出 `id`、`name`、`version`。

## 贡献

先读 [CONTENT-POLICY.md](CONTENT-POLICY.md)——它是本仓的硬规则而不是建议——再读
[CONTRIBUTING.md](CONTRIBUTING.md)。要点：

- 本仓是上游开发仓的**发布快照**：CI 文件由上游模板注入，**不要在本仓直接改**；PR 必须**回流上游**
  才能在后续快照里生效。
- 只接受公开、可匿名访问、不需要账号、不绕过付费墙的来源。成人 / 盗版 / 绕过付费墙的插件一律拒绝，
  代码、fixture、文档、issue 同样适用。
- 任何站点凭证、token、cookie 与个人数据都不得提交——任何位置都不行。
- 提交请带 DCO 签名（`git commit -s`），本项目不采用 CLA。
- CI（ubuntu，零额外依赖）校验 `manifest.json`、每条 `file` 路径与 `nsfw` 字段。

## 安全

沙箱是开发辅助，**不是安全边界**；请勿运行来源不可信的插件。威胁模型、受理范围与**私密**上报流程见
[SECURITY.md](SECURITY.md)。

## 许可

MIT，见 [LICENSE](LICENSE)。随仓分发的第三方材料、插件经 `$lib` 使用的运行时库、以及离线快照的
版权状态记录在 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)。

项目名「灵枢 / Lingshu」取自《黄帝内经》，是通用中文词汇，本项目**不主张商标权**，与任何第三方站点、
应用或公司无关联（Unaffiliated）。

## 相关仓库

| 仓库 | 是什么 |
| --- | --- |
| [`kongtong9527/lingshu-runtime`](https://github.com/kongtong9527/lingshu-runtime) | 运行时：`node:vm` 沙箱、`$lib` 接口、`lingshu` 命令行、契约与插件开发技能包 |
| [`kongtong9527/lingshu-devconsole`](https://github.com/kongtong9527/lingshu-devconsole) | Web 调试台：可视化跑插件、请求追踪、预览与播放诊断 |
| [`kongtong9527/lingshu-ios`](https://github.com/kongtong9527/lingshu-ios) | SwiftUI + JavaScriptCore 宿主，在设备上跑同一份 `.plugin.js`（GPL-3.0-or-later，自签源码发行） |

每个仓库都是独立快照、各自持有许可；它们都不含任何内容源。

---

快照：`2026-10-17` · 快照 tag `v0.1.7`
