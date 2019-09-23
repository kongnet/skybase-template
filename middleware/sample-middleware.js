/**
 * 中间件例子
 * 需要打开 ./config/config.default.js 后面的注解部分 并在相应的位置加入此中间件
 * */

/* global $ redis */
module.exports = async (ctx, next) => {
  $.log('sample-middleware自定义中间件截取并返回',ctx.method,ctx.method === 'GET' ? ctx.query || {} : ctx.request.fields || ctx.body || {})
  let ip = ctx.req.headers['x-forwarded-for'] ||
  ctx.req.connection.remoteAddress ||
  ctx.req.socket.remoteAddress ||
  ctx.req.connection.socket.remoteAddress
  console.log(ip,ctx.req.url)//,$G.api

  next && await next()
}
