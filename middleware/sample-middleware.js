/**
 * 中间件例子
 * 需要打开 ./config/config.default.js 后面的注解部分 并在相应的位置加入此中间件
 * */

/* global $ redis */
const crypto = require('crypto')
function signHash (str) {
  /*
   验签自定义函数
  */
  const salt = '' //可加盐
  const hash = crypto.createHash('sha1')
  return hash.update(str + salt).digest('hex') //sha1摘要
}
function checkSign (reqObj) {
  /*
  1.这里的needSign验证是get模式，你也可以改成post模式
  2.api定义needSign 后必须至少要提交t（时间整型）和sign 2个参数，自己定义这个验签的函数
  3.验签sign不放到签名的里面验
  4.参数按字母排序，形成参数=v1参数=v2 再使用signHash
  5.可以进一步必对t 做超时判断
  */
  if (reqObj.t && reqObj.sign) {
    // if (Math.abs(+$.now() - +reqObj.t) > 60000) return { code: 401 } //时间差判断
    let reqArr = Object.keys(reqObj).sort() //升序
    let checkStr = ''
    reqArr.forEach(x => {
      if (x !== 'sign') {
        //过滤掉sign字段
        checkStr += x + '=' + reqObj[x] //参数=v1参数=v2 这种形式，当然也可以保留get参数中的&
      }
    })
    //console.log(checkStr, signHash(checkStr))
    return { code: signHash(checkStr) === reqObj['sign'] ? 200 : 401 }
  } else {
    return { code: 400 } //不符合needSign规则
  }
}
module.exports = async (ctx, next) => {
  const reqObj =
    ctx.method === 'GET'
      ? ctx.query || {}
      : ctx.request.fields || ctx.body || {}
  $.log('sample-middleware自定义中间件截取并返回', ctx.method, reqObj)
  let ip =
    ctx.req.headers['x-forwarded-for'] ||
    ctx.req.connection.remoteAddress ||
    ctx.req.socket.remoteAddress ||
    ctx.req.connection.socket.remoteAddress
  const url = ctx.request.url
  const apiPath = url.split('?')[0]
  console.log(ip, url) //,$G.api
  if ($G.api[apiPath] && $G.api[apiPath].needSign) {
    //需要验证
    if (checkSign(reqObj).code === 400) {
      ctx.throwCode(400, '验签字段不完整') //返回给前端，缺少t 和 sign
      return 0 //跳出中间件
    }
    if (checkSign(reqObj).code === 401) {
      ctx.throwCode(400, '验签失败') //返回给前端
      return 0 //跳出中间件
    }
  }

  next && (await next())
}
