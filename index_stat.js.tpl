const sky = require('skybase')
let config = require('./config')
const Pack = require('./package.json')
const skyConfig = require('./skyconfig')
const $ = require('meeko')
const SkyDB = require('j2sql2')
const path = require('path')
config.beforeMount = async () => {
  // const skyDB = new SkyDB({ mssql: config.mssql}) //可支持sqlserver
  const skyDB = new SkyDB({ mysql: config.mysql, redis: config.redis })
  const db = await skyDB.mysql // 创建mysql实例
  const rd = await skyDB.redis // 创建redis 实例
  global.db = db
  global.redis = rd
  global.rts = await require('skyrts')({
    redis: redis,
    redisAsync: redis,
    gran: '5m, 1h, 1d, 1w, 1M, 1y',
    points: 1000,
    prefix: Pack.name
  })
/*
  // 连接mysql main实例
  const dbMain = require('j2sql')(config.mysqlMain)
  await $.tools.waitNotEmpty(dbMain, '_mysql')
  global.dbMain = dbMain

  // 连接redis main实例
  const redisMain = createIoredis(config.redisMain)
  await redis.waitForConnected()
  global.redisMain = redisMain

  // 连接mq
  global.MQ = await createRbmq(config.rabbitMQ)

  // 连接kafka
  global.Kafka = await createKafka(config.kafka) */
}
config = Object.assign(config,skyConfig) //将默认config和本地的config合并
sky.start(config, async () => {
  console.log('{{d.proName}} 项目成功启动')
  console.log('http://127.0.0.1:13000/skyapi/mock/first', '查看mock例子')
  console.log('http://127.0.0.1:13000/skyapi/mock/img?size=128x128', '占位符例子')
  console.log('http://127.0.0.1:13000/skyapi/probe/mysql', '查看探针例子')
  console.log('http://127.0.0.1:13000/skyapi/sky-stat/getOne?api=_skyapi_sky-stat_getAll&type=chart', '某接口5m 1h 1d图形统计')
  // console.log(global.$G)
  let r = await rts.loadOneScript('会员', path.join(__dirname, '会员统计.lua'))  // 加载一个rts的统计算法实例
  console.log(rts.scriptSha1s)
})
