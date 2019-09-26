
/* global $ */
module.exports = {
  async genImg (ctx) {
    const { size } = ctx.checkedData.data
    const rndColor = $.color.random()
    const rndRgb = rndColor.toRgb()
    const comColor = $.color({r:255-rndRgb.r,g:255-rndRgb.g,b:255-rndRgb.b,a:1})
    const r = $.Mock.genImg({size,bg:'#'+rndColor.toHex(),text:'加推占位符',fc:'#'+comColor.toHex()})
    if(r===-1){
      ctx.throwCode('404','格式有误')
    }else {
      ctx.type = 'image/svg+xml'
      ctx.body = r
    }
  }
}
