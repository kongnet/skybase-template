/* global $ */
const svgCaptcha = require('svg-captcha')
module.exports = {
  async genImg (ctx) {
    const { size } = ctx.checkedData.data
    const rndColor = $.color.random()
    const rndRgb = rndColor.toRgb()
    const comColor = $.color({
      r: 255 - rndRgb.r,
      g: 255 - rndRgb.g,
      b: 255 - rndRgb.b,
      a: 1
    })
    const r = $.Mock.genImg({
      size,
      bg: '#' + rndColor.toHex(),
      text: '加推占位符',
      fc: '#' + comColor.toHex()
    })
    if (r === -1) {
      ctx.throwCode('404', '格式有误')
    } else {
      ctx.type = 'image/svg+xml'
      ctx.body = r
    }
  },
  async captcha (ctx) {
    const captcha = svgCaptcha.create({ color: 1, noise: 5 })
    // await redis.set("user_session_key", captcha.text, "EX", 10) 超时单位秒 将验证码放到用户
    // 在登陆之前，建议使用一个ticket的值给每个页面做唯一标记，形成user_session_key
    ctx.type = 'image/svg+xml'
    ctx.body = captcha.data
  }
}
