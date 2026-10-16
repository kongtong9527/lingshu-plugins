// ==Plugin==
// id: zhihu-daily
// name: 知乎日报
// version: 1.0.1
// author: lingshu
// description: 知乎日报每日精选
// sourceUrl: https://daily.zhihu.com
// tags: news,daily,zhihu
// ==EndPlugin==

module.exports = {
  id: 'zhihu-daily',
  name: '知乎日报',
  version: '1.0.1',

  async fetchList() {
    const res = await $lib.http.get('https://daily.zhihu.com/api/4/news/latest', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
    })
    const json = JSON.parse(res.body)
    // date 形如 "20260724"，转成 "2026-07-24" 再取时间戳
    const ts = json.date ? Date.parse(json.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : undefined
    const items = (json.stories || []).map(item => ({
      id: String(item.id),
      title: item.title,
      summary: item.hint,
      coverUrl: item.images?.[0],
      url: `https://daily.zhihu.com/story/${item.id}`,
      publishTime: ts,
      metadata: { type: item.type, hint: item.hint }
    }))
    return { items }
  },

  async fetchDetail(url) {
    const id = url.match(/\/story\/(\d+)/)?.[1]
    if (!id) throw new Error('无效的知乎日报链接')
    const res = await $lib.http.get(`https://daily.zhihu.com/api/4/news/${id}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
    })
    const json = JSON.parse(res.body)
    // 去重：标题封面走顶层 title/coverUrl（宿主头部展示），正文不再重复推 heading/image。
    const blocks = []
    if (json.image_source) {
      blocks.push({ type: 'text', content: `作者: ${json.image_source}` })
    }
    blocks.push({ type: 'divider' })

    // body 字段为 HTML（非 Markdown），用 cheerio 解析为内容块
    if (json.body) {
      const $ = $lib.cheerio.load(json.body)
      const root = $('.content-inner').length ? $('.content-inner') : $.root()
      root.find('p, h1, h2, h3, img, blockquote').each((i, el) => {
        const $el = $(el)
        // 跳过头像与作者元信息（.meta 内）
        if ($el.hasClass('avatar') || $el.closest('.meta').length) return
        const node = $el.get(0)
        const tag = String((node && (node.tagName || node.name)) || '').toLowerCase()
        if (tag === 'img') {
          const src = $el.attr('src')
          if (src) blocks.push({ type: 'image', url: src })
          return
        }
        const text = $el.text().trim()
        if (!text) return
        if (tag === 'h1' || tag === 'h2') {
          blocks.push({ type: 'heading', content: text, level: 2 })
        } else if (tag === 'h3') {
          blocks.push({ type: 'heading', content: text, level: 3 })
        } else {
          blocks.push({ type: 'text', content: text })
        }
      })
    }
    return {
      title: json.title,
      sourceName: '知乎日报',
      sourceUrl: url,
      author: json.image_source,
      coverUrl: json.image,
      blocks
    }
  }
}
