const sky = require('skybase')
let config = require('./config')
const Pack = require('./package.json')
const skyConfig = require('./skyconfig')
const $ = require('meeko')

config.beforeMount = async () => {
  // 连接mysql
  const db = require('j2sql')(config.mysql)
  await $.tools.waitNotEmpty(db, '_mysql')
  global.db = db

  // 连接redis 和 skyrts
  const redis = sky.createIoredis(config.redis)
  await redis.waitForConnected()
  global.redis = redis
  global.rts = require('skyrts')({
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
})
