const path = require('path')
const packageJson = require('../package')
module.exports = {
  name: packageJson.name,
  rootDir: path.join(__dirname, '../'),
  mysql: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'mysql', // 一般root才有访问此数据库权限
    pool: 100,
    timeout: 60000,
    charset: 'utf8mb4',
    supportBigNumbers: true,
    bigNumberStrings: true,
    multipleStatements: true,
    connectionLimit: 100,
    /*
    crudExtend: {
      // 打开后 db['tablename'].ex扩展方法
    },
    */
    showSql: true // 使用BaseModel的才有效，打印sql
  },
  mysqlSkybaseTest: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'skybase-test', // 一般root才有访问此数据库权限
    pool: 1000,
    timeout: 60000,
    charset: 'utf8mb4',
    multipleStatements: true,
    connectionLimit: 10,
    showSql: true // 使用BaseModel的才有效，打印sql
  },
  redis: {
    host: 'localhost',
    port: 6379,
    auth: '',
    db: 1
  },

  redisMain: {
    host: 'localhost',
    port: 6379,
    auth: '',
    db: 2
  },

  rabbitMQ: {
    protocol: 'amqp',
    host: 'localhost',
    port: 5672,
    username: 'user',
    password: 'user',
    vhost: ''
  },

  kafka: {
    host: '10.0.2.31:9092,172.16.64.35:9092',
    topic: 'appRequest'
  },

  middleware: {
    limit: {
      // 接口锁是否使用redis锁
      // useRedisLock: true,
      code: 666, // 可以指定同一时间多次调用时返回的内容
      msg: '前面有人在执行哦~~'
    }
  },

  // 重定向配置，逻辑放在中间件 sky-check-param 内，所以必须要使用该中间件，此功能才生效
  redirect: {
    '/skyapi/redirect/original': '/skyapi/redirect/to'
  },

  middlewares: [
    // 自己实现的middle 不能以 sky- 开头
    'sky-cors',
    'sky-body-parse',
    'sky-static-server',
    'sky-check-param',
    // 'sky-check-token',
    // 'sample-middleware', //自定义例子打开
    'sky-output',
    'limit',
    'sky-api-register'
  ]

  /* 这段打开后，属性会冲掉原来skybase配置，否则使用默认skybase
   https: {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
    rejectUnauthorized: false
  },
  name: packageJson.name,
  tokenName: packageJson.name,
  rootDir: path.dirname(process.mainModule.filename),
  apiDir: './model/api',
  routerDir: './router',
  serviceDir: '',
  logger: true,
  middlewareDir: './middleware',
  staticDir: './www',
  bodyParse: {
    multipart: !0,
    formLimit: '100mb', // 100M 文件上传限制
    jsonLimit: '2mb', // body中json格式大小限制
    textLimit: '2mb', //
    extendTypes: {
      custom: [
        'text/xml'
      ]
    }
  }

  */
}
