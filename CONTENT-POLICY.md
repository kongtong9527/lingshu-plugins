# 内容政策 · Content Policy

> 本文是 **`kongtong9527/lingshu-plugins` 的硬规则**，优先于任何其它文档、惯例或「别人也这么干」。
> 维护者对边界判定有最终解释权，且**不设例外**。
>
> This document is the binding rule of this repository. There are no exceptions, and no
> case-by-case negotiation.

## 0. 一句话

本仓只收**公开、可匿名访问、不需要账号或会员、不绕过任何技术措施**的站点插件。
**成人内容站点、盗版内容站点、以及任何以绕过会员 / 付费墙 / DRM 为目的的插件，一律不收——
不写进代码、不写进 fixture、不写进文档、不写进 issue。**

## 1. 受理范围

一个插件要被本仓接收，必须**同时**满足：

1. **公开可匿名访问**：目标页面不需要登录、不需要邀请码、不需要账号，匿名（无 Cookie）即可取到内容。
   需要账号才能看到主体的站点不收。
2. **不绕过任何技术措施**：不破解会员墙、不伪造订阅态、不解 DRM、不解密付费内容、不使用泄露的
   站点密钥。以「拿掉 is_trailer / 去掉前端遮罩 / 直接打内部 API 取会员资源」为目的的实现不收。
3. **非成人内容**：站点本身与其主体内容不是成人/色情内容（manifest 的 `nsfw` 恒为 `0`）。
4. **非盗版内容**：站点不是未经授权聚合、转载、搬运受版权保护作品（漫画、影视、图书、音乐）的站点。
5. **无凭证**：插件与 fixture 内不含任何站点账号、token、Cookie、App Secret、签名密钥或个人信息。
6. **可离线验证**：附带最小 fixture，能在断网状态下跑通 list（及声明的其它能力），不依赖实时站点。
7. **单文件自包含**：不 `require` 外部模块，只通过宿主的 `$lib` 接口访问外部能力。

## 2. 不受理（红线）

以下内容**任何形式**都不受理（代码、fixture、文档、issue、PR 描述、评论、附件均同）：

- 成人 / 色情 / 擦边内容站点及其插件、域名、插件 id、截图、示例数据；
- 盗版、聚合搬运、破解资源站点及其插件；
- 需要或借助以下手段的实现：会员/付费墙绕过、DRM 规避、密钥泄漏利用、验证码打码服务、
  批量代理轮换以规避站点风控、伪造 App 指纹以骗取接口权限；
- 站点凭证、账号、Cookie、密钥（包括「只放占位符但指向真实服务」的写法）；
- 以「私人自用」「只放 README」「只在 issue 里贴」为理由的变体请求——**边界不因载体改变**。

**也请注意**：本仓是快照仓（见 [CONTRIBUTING.md](CONTRIBUTING.md)），在本仓新增的内容会在下次发布时
被覆盖，因此即使边界允许，也必须回流上游才会长期存在。

## 3. 判定与流程

1. 提交者按 [`.github/ISSUE_TEMPLATE/plugin_submission.yml`](.github/ISSUE_TEMPLATE/plugin_submission.yml)
   填写声明（第 1 节的 7 条逐条勾选）。
2. 维护者按第 1 节核对，必要时要求**能证明站点可匿名访问**的最小证据（例如匿名 curl 的响应头）。
3. 通过后由维护者在上游仓实现/合入，并在下一次快照发布时带到本仓。
4. 不通过则按第 4 节回复并关闭，**不解释**具体条款之外的细节。

## 4. 拒绝模板（可直接复制）

**A. 边界外（成人 / 盗版 / 绕过付费墙）**

```text
Closing this. This repository only accepts plugins for public, anonymously reachable sites that
require no account, no membership and no circumvention of technical measures. Adult content sites,
pirate content sites and paywall/DRM circumvention are out of scope by policy, and the policy has no
exceptions.

Please do not resubmit a variant of this request (a different repository, a "personal use only"
wording, or a documentation-only version) — the boundary does not change with the packaging.
```

**B. 其它不受理（账号站、无 fixture、含凭证、非单文件等）**

```text
Closing this for now: <one of: the site requires an account / there is no offline fixture / the
submission contains credentials / the plugin is not self-contained / this repository does not accept
new plugins right now>. See CONTENT-POLICY.md §1 for what a submission has to satisfy.
```

两条模板都**刻意不复述站名、域名或插件 id**：本仓的 issue 区不得变成边界外站点的索引。
维护者在关闭时也不要粘贴截图、链接或示例数据。

## 5. 版权投诉 / DMCA

本仓**不含内容本体**（没有媒体、没有正文、没有存档），只含插件代码与离线测试快照。
即便如此，若你认为本仓某个文件（例如 `_fixtures/**` 里的页面快照）侵犯了你的权利：

1. **首选**：在本仓开一个标题为 `copyright concern` 的 issue，正文只写**最小必要信息**——
   涉及的文件路径或插件 id、你的身份与授权依据（权利人 / 代理人）、你的联系方式、
   以及你希望的处理方式。**不要在 issue 里粘贴受版权保护的内容本体。**
2. **备选**：GitHub 提供官方 DMCA 提交通道 <https://github.com/contact/dmca>；本仓托管在 GitHub 上，
   该通道同样有效，且更适合需要正式法律文书的情形。
3. 本仓**不公布任何邮箱地址**：维护者不为本仓维护专用邮箱，公开仓库的 issue 与上述官方通道就是
   全部受理入口。请不要把投诉发到与本仓无关的私人渠道。

**我们收到有效通知后会怎么做**：**先移除或屏蔽**被指称的文件/条目（下架该插件条目、相关 fixture），
再与提交者沟通；不复述争议内容、不公开评论具体权利争议。若指称不成立或范围过大，会请你收窄到
具体文件后重新提交。

## 6. 免责

- 插件由第三方提供；本项目不提供、不托管、不审核、不背书任何站点或内容，也不对插件的行为、
  访问的站点、或使用者如何使用其结果承担责任。
- 通过插件访问任何站点，均由使用者自行确认并承担其服务条款、robots 策略、限流规则与当地法律的
  合规责任。
- 沙箱**不是安全边界**（见 [SECURITY.md](SECURITY.md)）；请勿运行来源不可信的插件。

## 7. 政策变更

边界只会**收紧**，不会为个案放宽。变更以本文件在本仓的正文为准；本仓是快照仓，
政策正文同样以后续快照为准。
