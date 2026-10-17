# Lingshu Plugins

[![CI](https://github.com/kongtong9527/lingshu-plugins/actions/workflows/ci.yml/badge.svg)](https://github.com/kongtong9527/lingshu-plugins/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Plugins](https://img.shields.io/badge/plugins-curated-blue.svg)](manifest.json)

**English** · [简体中文](README.zh-CN.md)

> [!IMPORTANT]
> **This repository is a small, curated set of example plugins for the Lingshu plugin runtime. It is not a
> content aggregator, and it hosts no content.**
>
> - **No content is bundled.** There is no media, no article text, no archive and no feed in this repository.
>   Each plugin is a single `.plugin.js` file that talks to public web pages **at run time**, through the
>   host's `$lib` API. The `_fixtures/` directories hold minimal, hand-trimmed offline test snapshots — they
>   exist so the plugins can be tested without network access, not to redistribute content.
> - **Adult, pirate and paywall-bypassing plugins are not accepted here.** This repository only carries
>   plugins for public, anonymously reachable sites that need no account, no membership and no DRM
>   circumvention. Read [CONTENT-POLICY.md](CONTENT-POLICY.md) before you open a pull request: submissions
>   outside that boundary are closed without discussion, and the policy has no exceptions.
> - **This repository is curated, not a marketplace.** Three plugins ship here. Adding more is a maintainer
>   decision made against [CONTENT-POLICY.md](CONTENT-POLICY.md), not a right of submission.
> - **The plugin sandbox is not a security boundary.** Plugins are arbitrary JavaScript executed by the
>   host you load them into. A `node:vm` sandbox (or JavaScriptCore on iOS) provides development-time
>   isolation and blocks the usual dangerous APIs — it does **not** contain hostile code. Never install a
>   plugin from a source you do not trust, and read [SECURITY.md](SECURITY.md).
> - **Third-party sites are third-party.** This project does not host, audit, endorse or take responsibility
>   for any site a plugin talks to, nor for the terms of service, robots policy, rate limits or legality of
>   accessing it. Complying with those is the responsibility of whoever runs the plugin.

## What is in this repository

| Path | What it is |
| --- | --- |
| `manifest.json` | The repository index a host reads. One entry per plugin, with a `file` path relative to this repository's root. |
| `*.plugin.js` | The plugins themselves: one self-contained CommonJS file each, with an `// ==Plugin== … // ==EndPlugin==` metadata header. |
| `_fixtures/<id>/` | Minimal offline snapshots (HTML/JSON) used to run a plugin without touching the network. |
| `CONTENT-POLICY.md` | What may and may not be published here, how a rejection is worded, and how to raise a copyright concern. |
| `CONTRIBUTING.md` | How to propose a plugin, how this snapshot is produced, and why local changes disappear. |

### The plugins that ship here

| Plugin id | Source | Capabilities |
| --- | --- | --- |
| `bilibili-hot` | Public popular-video pages of Bilibili | `list`, `detail` |
| `zhihu-daily` | Public daily-selection pages of Zhihu Daily | `list`, `detail` |
| `github-trending` | Public GitHub Trending pages | `list`, `detail` |

All three are `nsfw: 0`. The `nsfw` field is kept in the manifest format (see below) so hosts can reason
about it, but **this repository only ever publishes the value `0`** — a non-zero entry is a bug, and CI
fails on it (`.github/workflows/ci.yml`).

## Using it: add this repository to a host

Any host that understands the manifest format can consume this repository over plain HTTPS. There is no
install step and no build step: the manifest points at raw files.

**In the Lingshu iOS app:**

1. Open the **Plugins** tab and tap **仓库** (*Repositories*) in the top-right corner — the upstream notes
   also refer to this entry as *My page → plugin repositories*.
2. Tap **添加仓库** (*Add repository*).
3. Paste this URL and confirm:

   ```text
   https://raw.githubusercontent.com/kongtong9527/lingshu-plugins/main/manifest.json
   ```

4. The three plugins appear in the repository list. Installing one shows its metadata (id, version, source,
   required runtime version) and asks for confirmation; after that its list/detail actions are runnable from
   the plugin tab.

Notes:

- The host caches the manifest and refreshes it when you open the repository page; a pull-to-refresh forces
  a fetch.
- `file` values in `manifest.json` are relative to the repository base URL, so a mirror or a fork of this
  repository works the same way — point the host at *your* raw manifest URL.
- The app itself is not distributed from this repository. It is a separate, self-signed source release; see
  [Related repositories](#related-repositories).

## Manually

A clone is enough if you only want the files:

```bash
git clone https://github.com/kongtong9527/lingshu-plugins.git
cd lingshu-plugins
```

### Running a plugin locally

Plugins need a **host** to run in; this repository has none. Use the runtime and its `lingshu` CLI:

```bash
# Once the runtime is on npm (it is not yet — see the runtime repository below):
npx lingshu-runtime list --dir .
npx lingshu-runtime run github-trending list --dir .

# Until then, build a checkout of the runtime repository and use its CLI directly:
node /path/to/lingshu-runtime/dist/index.js list --dir .
node /path/to/lingshu-runtime/dist/index.js run github-trending list --dir .
```

Add `--fixture` to run against a local snapshot instead of the network:

```bash
node /path/to/lingshu-runtime/dist/index.js run github-trending list \
  --fixture _fixtures/github-trending/list.html
node /path/to/lingshu-runtime/dist/index.js run zhihu-daily detail https://example.com/story/1 \
  --fixture _fixtures/zhihu-daily/detail.json
```

The plugin-development guide (workflow, `$lib` reference, card DSL, pitfalls) lives in the runtime
repository under `skills/lingshu-plugin-dev/`.

## Manifest format

`manifest.json` is a single object with a `plugins` array. Each entry:

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | yes | Stable plugin identifier. Must match the plugin's metadata header and `<id>.plugin.js`. |
| `name` | yes | Display name shown by the host. |
| `version` | yes | Semver-ish version string. A higher version in the manifest is what makes a host offer an update. |
| `author` | yes | Author or maintainer name. |
| `description` | yes | One-line description. Must match the plugin's metadata header. |
| `file` | yes | Path to the plugin, relative to the repository root. Must exist — CI checks it. |
| `sourceUrl` | yes | The site the plugin reads (a public URL). |
| `categories` | no | Free-form tags used for grouping in the host UI. |
| `lang` | no | Content language, e.g. `zh`, `en`. |
| `nsfw` | **yes** | Content rating. `0` only in this repository. The field must be present and must be `0` — CI checks both. |
| `capabilities` | no | Which actions the plugin implements: `list`, `detail`, `reading`, `categories`, `listings`, `explore`, `tags`, `search`, `play`, `settings`, `account`. |
| `minRuntimeVersion` | no | Lowest runtime version that can run the plugin. |

The plugin file itself carries the same identity in its metadata header, which the host parses when a file
is imported directly:

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

The `description` in the header and in `manifest.json` must match, and the plugin exports `id`, `name` and
`version` from `module.exports` as well.

## Contributing

Read [CONTENT-POLICY.md](CONTENT-POLICY.md) first — it is the binding rule here, not a suggestion — then
[CONTRIBUTING.md](CONTRIBUTING.md). In short:

- This repository is a **published snapshot** of an upstream development repository. CI files are injected
  from upstream templates and must not be edited here; a pull request has to be **carried upstream** before
  it can appear in a later snapshot.
- Submissions are limited to public, anonymously reachable, account-free, paywall-free sources. Adult,
  pirate and paywall-bypassing plugins are refused, in code, fixtures, docs and issues alike.
- No site credentials, tokens, cookies or personal data may be committed — anywhere.
- Sign every commit off (`git commit -s`, DCO). This project does not use a CLA.
- CI (ubuntu, no extra dependencies) validates `manifest.json`, every `file` path, and the `nsfw` field.

## Security

The sandbox is a development aid, **not** a security boundary. Do not run plugins from sources you do not
trust. The threat model, what is in scope, and the private reporting process are in
[SECURITY.md](SECURITY.md).

## License

MIT — see [LICENSE](LICENSE). Third-party material, the runtime libraries a plugin uses through `$lib`, and
the copyright status of the offline fixtures are documented in
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

The project name 「灵枢 / Lingshu」 is a generic Chinese term (from the *Huangdi Neijing*); no trademark is
claimed, and this project is unaffiliated with any third-party site, application or company.

## Related repositories

| Repository | What it is |
| --- | --- |
| [`kongtong9527/lingshu-runtime`](https://github.com/kongtong9527/lingshu-runtime) | The runtime: `node:vm` sandbox, `$lib` API, `lingshu` CLI, contracts and the plugin-development skill package |
| [`kongtong9527/lingshu-devconsole`](https://github.com/kongtong9527/lingshu-devconsole) | Web dev console: visual plugin runs, request tracing, preview and playback diagnostics |
| [`kongtong9527/lingshu-ios`](https://github.com/kongtong9527/lingshu-ios) | SwiftUI + JavaScriptCore host that runs the same `.plugin.js` files on device (GPL-3.0-or-later, self-signed source release) |

Each repository is an independent snapshot with its own license; none of them contains content sources.

---

Snapshot: `2026-10-17` · snapshot tag `v0.1.7`
