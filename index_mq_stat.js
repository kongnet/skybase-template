const sky = require('skybase')
let config = require('./config')
const Pack = require('./package.json')
const skyConfig = require('./skyconfig')
const $ = require('meeko')
const SkyDB = require('j2sql2')
const path = require('path')
config.beforeMount = async () => {
  // const skyDB = new SkyDB({ mssql: config.mssql}) //可支持sqlserver
  const skyDB = new SkyDB({
    mysql: config.mysql,
    redis: config.redis,
    rabbitMQ: config.rabbitMQ
  })
  const db = await skyDB.mysql // 创建mysql实例
  const rd = await skyDB.redis // 创建redis 实例
  const rabbitMQ = await skyDB.rabbitMQ // 创建mq 实例
  global.db = db
  global.redis = rd
  global.rtsMQ = rabbitMQ
  global.rts = await require('skyrts')({
    redis: redis,
    redisAsync: redis,
    gran: '5m, 1h, 1d, 1w, 1M, 1y',
    points: 1000,
    prefix: Pack.name
  })
}
config = Object.assign(config, skyConfig) // 将默认config和本地的config合并
sky.start(config, async () => {
  console.log('mq-redis 成功启动')
  console.log('使用ab.exe进行压力测试')
  console.log('ab -c 100 -n 10000 http://127.0.0.1:13000/skyapi/mock/getEmpty')
  console.log('nodemon rts_comsumer.js ', '进行消费')
  console.log(
    'http://127.0.0.1:13000/skyapi/sky-stat/getAll?type=mix',
    '查看消费情况'
  )
})
