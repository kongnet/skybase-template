const skyapiService = require('../../service/sky-stat/stat.js')
const htmlOutModel = require('../../model/sky-stat/htmlOut.js')

module.exports = {
  async getAll (ctx) {
    const r = await skyapiService.getAll(ctx.checkedData.data)
    if (!r || r.code !== 0) {
      ctx.throwCode(r.code, r.msg)
      return
    }

    if (ctx.checkedData.data && ctx.checkedData.data.type === 'mix') {
      ctx.type = 'text/html'
      let tdTitle = ['序号', '接口名称', 'max', 'min', 'avg', 'count']
      let objHtml = {}
      for (let i in r.data) {
        objHtml[`<a href='getOne?api=${i}&type=mix'>${i}</a>`] = r.data[i]
      }
      ctx.body = htmlOutModel.outHtml('获取所有统计 (1h)', [
        {
          title: '获取所有统计 (1h)',
          dataTitleArr: tdTitle,
          dataArr: processData(objHtml)
        }
      ])
    } else {
      ctx.throwCode(200, '成功', r.data)
    }
  },
  async getSome (ctx) {
    const r = await skyapiService.getSome(ctx.checkedData.data)
    if (!r || r.code !== 0) {
      ctx.throwCode(r.code, r.msg)
      return
    }

    if (ctx.checkedData.data && ctx.checkedData.data.type === 'mix') {
      ctx.type = 'text/html'
      let tdTitle = ['序号', '接口名称', 'max', 'min', 'avg', 'count']
      ctx.body = htmlOutModel.outHtml('获取部分接口统计 (1h)', [
        {
          title: '获取部分接口统计 (1h)',
          dataTitleArr: tdTitle,
          dataArr: processData(r.data)
        }
      ])
    } else {
      ctx.throwCode(200, '成功', r.data)
    }
  },
  async getOne (ctx) {
    const r = await skyapiService.getOne(ctx.checkedData.data)
    if (!r || r.code !== 0) {
      ctx.throwCode(r.code, r.msg)
      return
    }

    if (
      ctx.checkedData.data &&
      (ctx.checkedData.data.type === 'mix' ||
        ctx.checkedData.data.type === 'chart')
    ) {
      ctx.type = 'text/html'
      let data = []
      data.push(processGetOneData(ctx.checkedData.data.api, '5m', r.data))
      data.push(processGetOneData(ctx.checkedData.data.api, '1h', r.data))
      data.push(processGetOneData(ctx.checkedData.data.api, '1d', r.data))
      ctx.body = htmlOutModel.outHtml(
        ctx.checkedData.data.api + ' 单个统计',
        data,
        true,
        ctx.checkedData.data.type === 'chart'
      )
    } else {
      ctx.throwCode(200, '成功', r.data)
    }
  },
  async getSpecialKeys (ctx) {
    const r = await skyapiService.getSpecialKeys(ctx.checkedData.data)
    if (!r || r.code !== 0) {
      ctx.throwCode(r.code, r.msg)
      return
    }
    ctx.throwCode(200, '成功', r.data)
  },
  async getMysql (ctx) {
    let r = await skyapiService.getMysql() //如果有多个实例需要有个db的数组

    ctx.type = 'text/html'
    ctx.body = $.tools.genTemp.genHtml('Mysql Status', r)
  },
  async getRedis (ctx) {
    let r = await skyapiService.getRedis() //如果有多个实例需要有个Redis的数组

    ctx.type = 'text/html'
    ctx.body = $.tools.genTemp.genHtml('Redis Status', r)
  }
}

function processGetOneData (apiName, format, srcData) {
  if (
    !srcData[format] ||
    !srcData[format].count ||
    !srcData[format].count.data
  ) {
    return { dataTitleArr: [], dataArr: [], title: '' }
  }
  let title = `${apiName} ${format} 统计数据`
  let dataTitleArr = ['序号', '时间', 'max', 'min', 'avg', 'count']
  let dataArr = []
  let chartData = []
  for (let i = 0; i < 4; i++) {
    chartData.push({
      id: `${format}_${Date.now()}_${i + 1}`,
      label: [],
      data: []
    })
  }

  for (let i = 0; i < srcData[format].count.data.length; i++) {
    const count = srcData[format].count.data[i]
    const max = srcData[format].max.data[i]
    const min = srcData[format].min.data[i]
    const avg = srcData[format].avg.data[i]
    let date = new Date(count[0]).date2Str()
    if (format === '1d') {
      date = new Date(count[0]).date2Str().split(' ')[0]
    }
    dataArr.push([
      i + 1,
      date,
      max[1] + ' ms',
      min[1] + ' ms',
      avg[1] + ' ms',
      count[1]
    ])

    for (let i = 0; i < 4; i++) {
      // add time label
      chartData[i].label.push(date)
    }
    chartData[0].data.push(max[1])
    chartData[1].data.push(min[1])
    chartData[2].data.push(avg[1])
    chartData[3].data.push(count[1])
  }

  chartData[0].type = 'max'
  chartData[1].type = 'min'
  chartData[2].type = 'avg'
  chartData[3].type = 'count'

  return { dataTitleArr, title, dataArr, chartData }
}

function processData (srcData) {
  let data = []
  let n = 1
  for (let k in srcData) {
    const item = srcData[k]
    data.push([n++, k, item.max, item.min, item.avg, item.count])
  }
  return data
}
