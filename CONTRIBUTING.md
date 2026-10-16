# 贡献指南 · Contributing

感谢你有兴趣参与。本文说明**本仓是怎么产生的**、**什么能进这里**、以及**一个改动要长什么样才能在
下一次发布后仍然存在**。

## 1. 先读这一节：本仓是发布快照

`kongtong9527/lingshu-plugins` 是上游开发仓的**发布快照**。每次发布由发布工具取上游白名单子集、应用脱敏规则、
注入模板里的社区文件与 `.github/`，然后提交到本仓。由此产生两条**绕不过去**的后果：

- **在本仓合入的提交不会长期存在。** 下一次发布会用新的上游快照整体替换受版本控制的文件树，
  只存在于本仓的改动会消失。**PR 必须回流到上游才能生效**：维护者把被接受的补丁导入上游仓
  （保留原作者署名），再由下一次快照带回来。在那之前，请把本仓当作「读多写少」。
- **不要在本仓改 CI。** `.github/` 下的全部内容——workflow、issue 模板、PR 模板——都由上游模板
  **每次发布注入**。本地改动会被静默覆盖，且无法被 review。workflow 需要改，请在 issue 或 PR
  描述里说明，维护者会去改上游模板。

## 2. 边界：先读内容政策

**动手之前必须先读 [CONTENT-POLICY.md](CONTENT-POLICY.md)。** 一句话版本：

> 本仓只接受**公开、可匿名访问、不需要账号或会员、不绕过任何技术措施**的站点插件。
> **不接受**：成人内容站点、盗版内容站点、需要绕过会员 / 付费墙 / DRM 的站点，
> 以及带任何站点凭证（账号、token、Cookie、密钥）的提交。

边界之外的提交会被直接关闭且不解释，**不设例外**，也不接受换载体的变体（改个说辞、只放 README、
只在 issue 里贴，同样不受理）。拒绝模板见 [CONTENT-POLICY.md §4](CONTENT-POLICY.md#4-拒绝模板可直接复制)。

## 3. 本仓有什么、没什么

本仓**只有**：`manifest.json`、三个示例插件（`bilibili-hot` / `zhihu-daily` / `github-trending`）、
`_fixtures/` 离线快照，以及本仓自己的社区文档。

本仓**没有**：运行时（宿主）、iOS App、内容本体、站点清单、内容策略之外的任何筛选。
插件需要宿主才能运行；宿主与插件开发技能包在
[`kongtong9527/lingshu-runtime`](https://github.com/kongtong9527/lingshu-runtime)。

## 4. 本地自检（提交前请自己跑一遍）

CI 只做**结构性校验**（ubuntu、零额外依赖），你也可以在本地跑同一套：

```bash
# 1) manifest 可解析、每条 file 存在、nsfw 存在且为 0（与 CI 同口径的简写版）
node -e '
const fs = require("node:fs")
const m = JSON.parse(fs.readFileSync("manifest.json", "utf8"))
let bad = 0
for (const p of m.plugins) {
  if (!p.file || !fs.existsSync(p.file)) { console.error(`${p.id}: file 不存在`); bad++ }
  if (!("nsfw" in p) || p.nsfw !== 0) { console.error(`${p.id}: nsfw 必须存在且为 0`); bad++ }
  if (p.file !== `${p.id}.plugin.js`) { console.error(`${p.id}: 文件名必须等于 <id>.plugin.js`); bad++ }
}
if (bad) process.exit(1)
console.log(`manifest.json OK（${m.plugins.length} 个插件）`)
'
```

```bash
# 2) 真跑一遍插件（需要一份运行时检出，见「本仓有什么」）
node /path/to/lingshu-runtime/dist/index.js run github-trending list --dir . \
  --fixture _fixtures/github-trending/list.html
```

完整的校验逻辑以上游模板里的 `.github/workflows/ci.yml` 为准（本仓那份是注入的副本）。

## 5. 提交一个插件：要求清单

**先看第 2 节**——边界之外的插件不必准备材料。边界之内，一个提交必须满足：

- [ ] 站点可匿名访问（无 Cookie 可取得列表页），你在 PR 里说明这一点；
- [ ] 单文件 `<id>.plugin.js`，自包含，不 `require` 外部模块，只经 `$lib` 访问外部能力；
- [ ] 顶部 `// ==Plugin== … // ==EndPlugin==` 元数据头完整（`id` / `name` / `version` 必填），
      `description` 与 `manifest.json` 条目**逐字一致**；
- [ ] `module.exports` 导出 `id` / `name` / `version`；
- [ ] `manifest.json` 追加一条，`file` 为 `<id>.plugin.js`，**`nsfw: 0`**，
      `capabilities` 与实际实现的方法一一对应；
- [ ] 附带 `_fixtures/<id>/` 最小离线快照，断网可跑通 `list`（及其声明的其它能力）；
- [ ] fixture 是**手裁过的最小片段**，不是整站镜像；不含个人数据、不含凭证、不含可识别到具体用户的内容；
- [ ] 不含站点密钥、账号、Cookie、token（包括注释与示例数据里的）；
- [ ] 说明**为什么这个站点值得作为示例**（教学价值），而不仅是「能用」。

## 6. PR 流程

1. 较大的改动先开 issue 讨论（用仓库里的模板），再花时间写代码。
2. 一个 PR 只做一件事。
3. 描述请写清 **why**（不只是 what）与你实际跑过的命令。
4. 每个提交带 DCO 签名（`git commit -s`），声明同意
   [Developer Certificate of Origin](https://developercertificate.org/)。
   本项目**使用 DCO 而不是 CLA**——没有版权转让要签。
5. 沟通保持**内容中立**：不要在 issue / PR / 评论里粘贴边界外站点的名字、域名、截图或数据。
6. 请预期延迟：被接受的改动要先回流上游，才会在后续快照里出现，review 也在上游进行。

## 7. 报告问题与安全

- 插件跑不通、解析失效、fixture 对不上：用仓库里的 issue 模板，**保持内容中立**（用代称描述站点，
  不要粘贴真实 URL 与内容）。
- **安全漏洞：不要开公开 issue**，按 [SECURITY.md](SECURITY.md) 走私密通道。

## 8. 许可

提交即表示你同意你的贡献按本仓的 MIT 许可（见 [LICENSE](LICENSE)）授权。
你新增的第三方材料必须与 MIT 兼容，并登记到 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)。
请确认你**有权**提交该插件与 fixture（尤其是 fixture 里的页面快照）。
