
/* global $ */
module.exports = {
  async genImg (ctx) {
    const { size } = ctx.checkedData.data
    const r = $.Mock.genImg({size,bg:$.fake.randColor(),text:'加推占位符'})
    if(r===-1){
      ctx.throwCode('404','格式有误')
    }else {
      ctx.type = 'image/svg+xml'
      ctx.body = r
    }
  }
}
