// ==Plugin==
// id: bilibili-hot
// name: B站热门
// version: 1.0.0
// author: lingshu
// description: B站热门视频列表与详情
// sourceUrl: https://www.bilibili.com/v/popular
// tags: video,hot,bilibili
// ==EndPlugin==

/** B 站 API/媒体请求统一头（playurl 直链实测校验 Referer，缺 Referer 403） */
const BILI_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  'Referer': 'https://www.bilibili.com/'
}

module.exports = {
  id: 'bilibili-hot',
  name: 'B站热门',
  version: '1.0.0',

  async fetchList(context) {
    const page = context?.page || 1
    const url = `https://api.bilibili.com/x/web-interface/popular?pn=${page}&ps=20`
    const res = await $lib.http.get(url, { headers: BILI_HEADERS })
    const json = JSON.parse(res.body)
    if (json.code !== 0) throw new Error('B站 API 错误: ' + json.message)
    const items = json.data.list.map(item => ({
      id: String(item.aid),
      title: item.title,
      summary: item.desc,
      coverUrl: item.pic,
      coverWidth: item.dimension?.width,
      coverHeight: item.dimension?.height,
      url: `https://www.bilibili.com/video/${item.bvid}`,
      publishTime: item.pubdate ? item.pubdate * 1000 : undefined,
      metadata: {
        playCount: item.stat?.view,
        danmakuCount: item.stat?.danmaku
      }
    }))
    return {
      items,
      pagination: {
        strategy: 'page',
        hasMore: json.data.no_more !== true,
        page,
        pageSize: 20
      }
    }
  },

  async fetchDetail(url) {
    const bvid = url.match(/BV\w+/)?.[0]
    if (!bvid) throw new Error('无效的B站链接')
    const res = await $lib.http.get(
      `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`,
      BILI_HEADERS
    )
    const json = JSON.parse(res.body)
    if (json.code !== 0) throw new Error('B站 API 错误: ' + json.message)
    const data = json.data
    const publishTs = data.pubdate ? data.pubdate * 1000 : undefined
    const publishDate = publishTs !== undefined
      ? $lib.dayjs(publishTs).format('YYYY-MM-DD HH:mm')
      : '未知'
    const blocks = [
      // B 站详情页 URL 不是媒体直链，不能当 video.url 硬播；走懒解析（ADR-0026）：
      // 点播时才 fetchPlayUrl（bvid → cid → HTML5 playurl 接口）现算出 mp4 直链。
      { type: 'video', target: { action: 'play', url: `https://www.bilibili.com/video/${bvid}` }, poster: data.pic, duration: data.duration, platform: 'bilibili' },
      { type: 'heading', content: '视频简介', level: 3 },
      ...(data.desc || '').split('\n').filter(Boolean).map(p => ({ type: 'text', content: p })),
      { type: 'divider' },
      { type: 'text', content: `发布时间: ${publishDate}  |  播放: ${data.stat?.view ?? '-'}  |  弹幕: ${data.stat?.danmaku ?? '-'}` }
    ]
    return {
      title: data.title,
      sourceName: 'B站热门',
      sourceUrl: url,
      publishTime: publishTs,
      author: data.owner?.name,
      coverUrl: data.pic,
      blocks
    }
  },

  async fetchPlayUrl(url) {
    // 懒播放解析（ADR-0020/0026）：B站视频页 → cid → HTML5 playurl（免 wbi 签名）→ mp4 直链。
    const bvid = String(url).match(/BV\w+/)?.[0]
    if (!bvid) throw new Error('无效的B站链接')
    const view = JSON.parse((await $lib.http.get(
      `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`,
      BILI_HEADERS
    )).body)
    if (view.code !== 0) throw new Error('B站 API 错误: ' + view.message)
    const cid = view.data?.cid
    if (!cid) throw new Error('B站未返回视频 cid')
    const play = JSON.parse((await $lib.http.get(
      // platform=html5 免 wbi 签名；qn=64（720P）公开可拿，登录墙更高的清晰度不冒充能力
      `https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=64&platform=html5&high_quality=1`,
      BILI_HEADERS
    )).body)
    if (play.code !== 0) throw new Error('B站播放地址解析失败: ' + play.message)
    const videoUrl = play.data?.durl?.[0]?.url
    if (!videoUrl) throw new Error('B站未返回可播放地址（可能需要登录）')
    // 直链实测校验 Referer（带鉴权参数，缺 Referer 403）→ 返回给宿主代理带上
    return {
      url: videoUrl,
      referer: 'https://www.bilibili.com/',
      platform: 'bilibili',
      duration: view.data?.duration,
    }
  }
}
