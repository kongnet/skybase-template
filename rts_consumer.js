// 加载项目配置和模块
const config = require('./config')
const $ = require('meeko')
const SkyDB = require('j2sql2')
const Pack = require('./package.json')

// 入口函数
async function init () {
  // 链接相应的中间件
  await loadService()

  rtsMQ.rev({
    noAck: false, // 默认false，true会自动 确认消费，会造成来不及消费就ack的情况
    prefetch: 1, // 默认每次消费一条
    cbFunc: consumerFunc,
    queueName: Pack.name + '_rts' // 这是默认的，如果要动态请设置 相应环境的config文件
  })
  /*
  其他消费者函数
  rtsMQ.rev({
    cbFunc: consumerFuncXxxx,
    queueName: 'xxx'
  })
  */
}

/*
消费者函数
此例子是skybase的api统计写入mq，从mq拿出，record到RTS
*/
let mqObj
// 这边需要 处理data 和 channel=ch两个参数
async function consumerFunc (data, ch) {
  mqObj = JSON.parse(data.content.toString())
  if (mqObj.type === 'rts_api') {
    // 注意类型需要区分
    global.rts.record(mqObj.key, mqObj.number, mqObj.method, null, mqObj.time)
  }
  ch.ack(data) // 默认不自动ack ch.ack(data) 确认本次消费才ack
  mqObj = null
  /* 其他type消费，注意这里是同一个channel
  if(mqObj.type === 'xxx'){

  }
  */
}
async function loadService () {
  const skyDB = new SkyDB({
    redis: config.redis,
    rabbitMQ: config.rabbitMQ
  })
  const rd = await skyDB.redis // 创建redis 实例
  const rabbitMQ = await skyDB.rabbitMQ // 创建redis 实例
  global.rtsMQ = rabbitMQ
  global.redis = rd
  global.rts = await require('skyrts')({
    redis: redis,
    redisAsync: redis,
    gran: '5m, 1h, 1d, 1w, 1M, 1y',
    points: 1000,
    prefix: Pack.name
  })
}
init()
