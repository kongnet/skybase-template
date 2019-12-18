/* global $ */
let request = require('request-promise-native')
async function req (url = 'http://www.baidu.com', isJson = false, proxy) {
  let body = await request({
    method: 'GET',
    uri: url,
    json: isJson,
    timeout: 2000,
    https_proxy: proxy,
    headers: {
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
      Cookie:
        'BIDUPSID=0E4678CB6E4BCAE5798DAE469EDA6E95; BAIDUID=E8E2EF29B5D469301338A9AD7104E8D2:FG=1; PSTM=1558438957; BD_UPN=12314753; BDUSS=1FwTWxpdFJoMm9IVTR-WjU3Qkx4UnBIbmR-aHhrb3pOb1p0N2dDdjZFbWdOZ3hkSVFBQUFBJCQAAAAAAAAAAAEAAACWffJMS8zsxr0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKCp5FygqeRcU; BDORZ=B490B5EBF6F3CD402E515D22BCDA1598; BD_HOME=1; delPer=0; BD_CK_SAM=1; ZD_ENTRY=baidu; pgv_pvi=4272933888; pgv_si=s1855449088; locale=zh; yjs_js_security_passport=67f2dccc01b63751a423a47e779c047992b6c1a8_1565661859_js; BDRCVFR[feWj1Vr5u3D]=I67x6TjHwwYf0; H_PS_PSSID=26524_1425_21106_29073_29523_29519_29098_29567_28833_29220; COOKIE_SESSION=257_0_8_9_1_16_0_3_5_4_0_6_0_0_3_0_1565662917_0_1565662914%7C9%23169278_21_1562301560%7C6; BDRCVFR[S4-dAuiWMmn]=mk3SLVN4HKm; PSINO=6; BDSVRTM=24; sugstore=1; H_PS_645EC=fcc6stWXxov8krAL6l4bp6mAvY66LWMqV6PuIYMh%2BjYGC6dxrUuZwigXIkzEVP%2B9mA'
    }
  })
  return body
}
module.exports = {
  async getEmpty (ctx) {
    ctx.ok('返回正常')
  },
  async getHtml (ctx) {
    ctx.type = 'html'
    ctx.body = '<H1>Hello World</H1>'
  },
  async getUrl (ctx) {
    const { url } = ctx.checkedData.data
    let r = await req(url)
    ctx.type = 'html'
    ctx.body = `<pre style='text-align:left'>${r.esHtml()}</pre>${r}`
  },
  async getBing (ctx) {
    let r = await req(
      'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1',
      true
    )
    ctx.type = 'html'
    ctx.body = `<img src='https://cn.bing.com${r.images[0].url}'></>`
  },
  async echo (ctx) {
    const { str } = ctx.checkedData.data
    ctx.body = str
  },
  async qrcode (ctx) {
    const { str } = ctx.checkedData.data
    ctx.body = $.qrcode.generateHTML(
      str || 'https://github.com/kongnet/skybase/blob/master/BestPractice.md'
    )
  }
}
