/* global $ rts $G */

module.exports = {
  getAll,
  getSome,
  getOne,
  getSpecialKeys
}

async function getSpecialKeys(arg) {
  if (arg.count5m < 1 || arg.count1h < 1 || arg.count1d < 1) {
    return { code: 400, msg: `参数错误` }
  }
  let list = []
  try {
    list = JSON.parse(arg.keyList)
  } catch (e) {
    $.err(e.stack)
    return { code: 400, msg: `keyList json解析错误` }
  }
  if (list.length < 1) {
    return { code: 400, msg: `至少需要一个key名称` }
  }

  let data = {}
  for (let i = 0; i < list.length; i++) {
    let key = list[i]
    let format = '5m'
    let beginTime = new Date()
    beginTime.setMinutes(beginTime.getMinutes() - 5 * (arg.count5m - 1))
    let endTime = new Date()
    let temp = {}
    temp[format] = {
      count: await rts.getStatAsync('count', key, format, beginTime, endTime),
      max: await rts.getStatAsync('max', key, format, beginTime, endTime),
      min: await rts.getStatAsync('min', key, format, beginTime, endTime),
      avg: await rts.getStatAsync('avg', key, format, beginTime, endTime)
    }

    beginTime = new Date()
    beginTime.setHours(beginTime.getHours() - (arg.count1h - 1))
    endTime = new Date()
    format = '1h'
    temp[format] = {
      count: await rts.getStatAsync('count', key, format, beginTime, endTime),
      max: await rts.getStatAsync('max', key, format, beginTime, endTime),
      min: await rts.getStatAsync('min', key, format, beginTime, endTime),
      avg: await rts.getStatAsync('avg', key, format, beginTime, endTime)
    }

    beginTime = new Date()
    beginTime.setDate(beginTime.getDate() - (arg.count1d - 1))
    endTime = new Date()
    format = '1d'
    temp[format] = {
      count: await rts.getStatAsync('count', key, format, beginTime, endTime),
      max: await rts.getStatAsync('max', key, format, beginTime, endTime),
      min: await rts.getStatAsync('min', key, format, beginTime, endTime),
      avg: await rts.getStatAsync('avg', key, format, beginTime, endTime)
    }
    data[key]=temp
  }

  return { code: 0, data }
}

async function getAll() {
  let a = []
  for (let k in $G.api) {
    a.push(k)
  }
  let result = await getRts(a)
  return { code: 0, data: result }
}

async function getSome(arg) {
  let list = []
  try {
    list = JSON.parse(arg.apiList)
  } catch (e) {
    $.err(e.stack)
    return { code: 400, msg: `apiList json解析错误` }
  }
  let result = await getRts(list)
  return { code: 0, data: result }
}

// 获取指定api 5m 36个点，1h 48个点,1d 30个点
async function getOne(arg) {
  let apiName = `api:${arg.api.replace(/\//g, '_')}`
  let format = '5m'
  let beginTime = new Date()
  beginTime.setMinutes(beginTime.getMinutes() - 5 * 23)
  let endTime = new Date()
  let data = {}
  data[format] = {
    count: await rts.getStatAsync('count', apiName, format, beginTime, endTime),
    max: await rts.getStatAsync('max', apiName, format, beginTime, endTime),
    min: await rts.getStatAsync('min', apiName, format, beginTime, endTime),
    avg: await rts.getStatAsync('avg', apiName, format, beginTime, endTime)
  }

  beginTime = new Date()
  beginTime.setHours(beginTime.getHours() - 23)
  endTime = new Date()
  format = '1h'
  data[format] = {
    count: await rts.getStatAsync('count', apiName, format, beginTime, endTime),
    max: await rts.getStatAsync('max', apiName, format, beginTime, endTime),
    min: await rts.getStatAsync('min', apiName, format, beginTime, endTime),
    avg: await rts.getStatAsync('avg', apiName, format, beginTime, endTime)
  }

  beginTime = new Date()
  beginTime.setDate(beginTime.getDate() - 29)
  endTime = new Date()
  format = '1d'
  data[format] = {
    count: await rts.getStatAsync('count', apiName, format, beginTime, endTime),
    max: await rts.getStatAsync('max', apiName, format, beginTime, endTime),
    min: await rts.getStatAsync('min', apiName, format, beginTime, endTime),
    avg: await rts.getStatAsync('avg', apiName, format, beginTime, endTime)
  }
  return { code: 0, data }
}

function getRtsData(obj) {
  if (obj && obj.data && obj.data[0] && obj.data[0].length > 1) {
    return +obj.data[0][1].toFixed(0)
  }
  return 0
}

async function getRts(apiList) {
  let beginTime = new Date()
  let endTime = new Date()
  let result = {}
  for (let i = 0; i < apiList.length; i++) {
    let sName = apiList[i].replace(/\//g, '_')
    result[sName] = {
      count: getRtsData(await rts.getStatAsync('count', 'api:' + sName, '1h', beginTime, endTime)),
      max: getRtsData(await rts.getStatAsync('max', 'api:' + sName, '1h', beginTime, endTime)) + ' ms',
      min: getRtsData(await rts.getStatAsync('min', 'api:' + sName, '1h', beginTime, endTime)) + ' ms',
      avg: getRtsData(await rts.getStatAsync('avg', 'api:' + sName, '1h', beginTime, endTime)) + ' ms'
    }
  }
  return result
}
