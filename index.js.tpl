const sky = require('skybase')
const config = require('./config')
const $ = require('meeko')
const SkyDB = require('j2sql2')

config.beforeMount = async () => {
  // 连接mysql

  const skyDB = new SkyDB({ mysql: config.mysql})
  const db = await skyDB.mysql // 创建mysql实例
  global.db = db

  /* j2sql老的方案
  // 连接mysql main实例
  const dbMain = require('j2sql')(config.mysqlMain)
  await $.tools.waitNotEmpty(dbMain, '_mysql')
  global.dbMain = dbMain

   // 连接redis
  const redis = createIoredis(config.redis)
  await redis.waitForConnected()
  global.redis = redis

  // 连接redis main实例
  const redisMain = createIoredis(config.redisMain)
  await redis.waitForConnected()
  global.redisMain = redisMain

  // 连接mq
  global.MQ = await createRbmq(config.rabbitMQ)

  // 连接kafka
  global.Kafka = await createKafka(config.kafka) */
}

sky.start(config, async () => {
  console.log('{{d.proName}} 项目成功启动')
  console.log('http://127.0.0.1:13000/skyapi/mock/first','查看mock例子')
  console.log('http://127.0.0.1:13000/skyapi/mock/img','占位符互补色例子')
  console.log('http://127.0.0.1:13000/skyapi/probe/mysql','查看探针例子')
  console.log('http://127.0.0.1:13000/skyapi/mock/getEmpty','最简单的api例子')
  console.log('http://127.0.0.1:13000/skyapi/mock/getHtml','html返回例子')
  console.log('http://127.0.0.1:13000/skyapi/mock/getUrl?url=http://www.baidu.com','获取url代码和内容')
  console.log('http://127.0.0.1:13000/skyapi/mock/getBing','获取bing最新的背景图')

  console.log('http://127.0.0.1:13000/upload_demo.html','上传例子 控制器查看router/mock/upload.js')
  console.log('http://127.0.0.1:13000/skyapi/mock/captcha','验证码显示')


})
