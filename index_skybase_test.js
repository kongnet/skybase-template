const sky = require('skybase')
let config = require('./config')
const skyConfig =require('./skyconfig')

const Pack = require('./package.json')

const $ = require('meeko')
global.$ = $
config.beforeMount = async () => {
  // 连接mysql
  const db = require('j2sql')(config.mysqlSkybaseTest) // 改成相应的数据库
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
  console.log('项目成功启动')
  console.log('http://127.0.0.1:13000/skyapi/mock/first', '查看mock例子')
  console.log('http://127.0.0.1:13000/skyapi/mock/img?size=128x128', '占位符例子')
  console.log('http://127.0.0.1:13000/skyapi/probe/mysql', '查看探针例子')
  console.log('http://127.0.0.1:13000/skyapi/sky-stat/getOne?api=_skyapi_sky-stat_getAll&type=chart', '某接口5m 1h 1d图形统计')

  let dbExt=require('./model/crud.js') //将一些操作扩展到 db.tableName.ext中去 数据库操作 详细见j2sql模块
  for(let i in db){
    if(typeof db[i]==='object' && !i.includes('_')){
      db[i].ext={}
      dbExt(db[i].ext,i)
    }
  }

  //$.log(await db.t1.R({d_flag:0}, {}, {c_time:-1}, 10000).run(0))
})
