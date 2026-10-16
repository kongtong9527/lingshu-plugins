// ==Plugin==
// id: github-trending
// name: GitHub 趋势
// version: 1.0.1
// author: lingshu
// description: GitHub 趋势仓库
// sourceUrl: https://github.com/trending
// tags: code,trending,github
// ==EndPlugin==

function relativeTime(ts) {
  const diff = Date.now() - ts
  const min = 60 * 1000, hour = 60 * min, day = 24 * hour
  if (diff < min) return '刚刚'
  if (diff < hour) return Math.floor(diff / min) + '分钟前'
  if (diff < day) return Math.floor(diff / hour) + '小时前'
  if (diff < 30 * day) return Math.floor(diff / day) + '天前'
  return $lib.dayjs(ts).format('YYYY-MM-DD')
}

module.exports = {
  id: 'github-trending',
  name: 'GitHub 趋势',
  version: '1.0.1',

  async fetchList(context) {
    const lang = context?.category ? `/${context.category}` : ''
    const url = `https://github.com/trending${lang}?since=daily`
    const res = await $lib.http.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
    })
    const $ = $lib.cheerio.load(res.body)
    const items = []
    $('article.Box-row').each((i, el) => {
      const $row = $(el)
      const href = $row.find('h2 a').attr('href') || ''
      const fullName = href.replace(/^\//, '').replace(/\s+/g, '')
      if (!fullName) return
      const [owner] = fullName.split('/')
      const desc = $row.find('p').first().text().trim()
      items.push({
        id: fullName,
        title: fullName,
        summary: desc,
        url: `https://github.com/${fullName}`,
        coverUrl: `https://github.com/${owner}.png?size=40`
      })
    })
    if (items.length === 0) {
      console.warn('GitHub 趋势: 未解析到仓库，页面结构可能已变化')
    }
    return { items }
  },

  async fetchDetail(url) {
    const match = url.match(/github\.com\/([^/]+\/[^/]+)/)
    if (!match) throw new Error('无效的 GitHub 链接')
    const repo = match[1].replace(/\s+/g, '')
    const res = await $lib.http.get(`https://api.github.com/repos/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'LingshuPlugin/1.0'
      }
    })
    const data = JSON.parse(res.body)
    if (res.status !== 200 || (!data.full_name && data.message)) {
      throw new Error('GitHub API 错误: ' + (data.message || `HTTP ${res.status}`))
    }
    // 去重：标题走顶层 title（宿主头部展示），正文不再重复推 heading。
    const blocks = [
      { type: 'text', content: data.description || '无描述' },
      { type: 'divider' },
      { type: 'text', content: `⭐ ${data.stargazers_count} | 🍴 ${data.forks_count} | 语言: ${data.language || 'N/A'}` },
      { type: 'text', content: `更新: ${relativeTime(new Date(data.updated_at).getTime())}` },
      { type: 'divider' },
      { type: 'text', content: `主页: ${data.homepage || '无'}` },
      { type: 'text', content: `许可: ${data.license?.spdx_id || '无'}` }
    ]
    return {
      title: data.full_name,
      sourceName: 'GitHub 趋势',
      sourceUrl: url,
      publishTime: new Date(data.pushed_at).getTime(),
      author: data.owner?.login,
      coverUrl: data.owner?.avatar_url,
      blocks
    }
  }
}
