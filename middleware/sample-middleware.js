/**
 * 中间件例子
 * 需要打开 ./config/config.default.js 后面的注解部分 并在相应的位置加入此中间件
 * */

/* global $ redis */
module.exports = async (ctx, next) => {
  let needToken = ctx.apiSetting.needSign
  //$.log('====',ctx.apiSetting)
  $.log(ctx.method === 'get' ? ctx.query || {} : ctx.request.fields || ctx.body || {})
  next && await next()
}
