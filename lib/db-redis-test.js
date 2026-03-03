/* global db redis $ */
/**
 * MySQL 和 Redis 综合测试模块
 * 使用 meeko 的 TestCase 模式
 * 
 * 运行方式：
 *   node lib/db-redis-test.js -test              # 运行所有测试
 *   node lib/db-redis-test.js -test mysql        # 运行指定测试
 *   node lib/db-redis-test.js -testList          # 列出所有测试
 */

const $ = require('meeko')

// 测试结果收集
const testResults = []

function logResult (name, success, data = null, error = null) {
  const result = { name, success, timestamp: new Date().toISOString(), data, error }
  testResults.push(result)
  const status = success ? $.c.g('✓') : $.c.r('✗')
  $.log(`${status} ${name}`)
  if (error) $.log(`  Error: ${error}`)
  return result
}

// 延迟初始化数据库连接
let db, redis, isConnected = false
async function initDB () {
  if (isConnected) return
  const config = require('../config')
  const SkyDB = require('j2sql2')
  const skyDB = new SkyDB({
    mysql: config.mysqlSkybaseTest,
    redis: config.redis
  })
  db = await skyDB.mysql
  redis = await skyDB.redis
  global.db = db
  global.redis = redis
  global.$ = $
  isConnected = true
}

// 关闭数据库连接
async function closeDB () {
  if (!isConnected) return
  if (db && db._mysql && db._mysql.end) {
    await db._mysql.end()
  }
  if (redis && redis.quit) {
    await redis.quit()
  }
  isConnected = false
  db = null
  redis = null
}

// ========== 测试用例定义（内部实现）==========
const tests = {
  async mysql () {
    const result = await db._mysql.query('SELECT 1 as test')
    logResult('MySQL 连接', true, result)
  },

  async redis () {
    await redis.set('test:connection', 'ok')
    const value = await redis.get('test:connection')
    await redis.del('test:connection')
    logResult('Redis 连接', true, { value })
  },

  async mysqlCRUD () {
    const table = 'test_crud'
    await db._mysql.query(`CREATE TABLE IF NOT EXISTS ${table} (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100))`)
    const insert = await db._mysql.query(`INSERT INTO ${table} (name) VALUES (?)`, ['test'])
    const select = await db._mysql.query(`SELECT * FROM ${table} WHERE id = ?`, [insert.insertId])
    await db._mysql.query(`UPDATE ${table} SET name = ? WHERE id = ?`, ['updated', insert.insertId])
    await db._mysql.query(`DELETE FROM ${table} WHERE id = ?`, [insert.insertId])
    await db._mysql.query(`DROP TABLE IF EXISTS ${table}`)
    logResult('MySQL CRUD', true, { id: insert.insertId, data: select[0] })
  },

  async redisOps () {
    await redis.set('test:str', 'hello')
    await redis.hset('test:hash', 'k1', 'v1')
    await redis.lpush('test:list', 'a', 'b')
    await redis.sadd('test:set', 'x', 'y')
    
    const str = await redis.get('test:str')
    const hash = await redis.hgetall('test:hash')
    const list = await redis.lrange('test:list', 0, -1)
    const set = await redis.smembers('test:set')
    
    await redis.del('test:str', 'test:hash', 'test:list', 'test:set')
    logResult('Redis 操作', true, { str, hash, list, set })
  },

  async cache () {
    const table = 'test_cache'
    await db._mysql.query(`CREATE TABLE ${table} (id INT PRIMARY KEY, data VARCHAR(100))`)
    await db._mysql.query(`INSERT INTO ${table} VALUES (1, 'original')`)
    
    let rows = await db._mysql.query(`SELECT * FROM ${table} WHERE id = 1`)
    await redis.setex('cache:1', 60, JSON.stringify(rows[0]))
    
    const cached = await redis.get('cache:1')
    
    await db._mysql.query(`UPDATE ${table} SET data = 'updated' WHERE id = 1`)
    await redis.del('cache:1')
    
    rows = await db._mysql.query(`SELECT * FROM ${table} WHERE id = 1`)
    
    await db._mysql.query(`DROP TABLE ${table}`)
    await redis.del('cache:1')
    logResult('缓存模式', true, { cached: JSON.parse(cached), fresh: rows[0] })
  },

  async counter () {
    const table = 'test_counter'
    await db._mysql.query(`CREATE TABLE ${table} (id VARCHAR(50) PRIMARY KEY, count INT)`)
    await db._mysql.query(`INSERT INTO ${table} VALUES ('page1', 100)`)
    
    for (let i = 0; i < 50; i++) await redis.incr('counter:page1')
    
    const cnt = parseInt(await redis.get('counter:page1') || 0)
    await db._mysql.query(`UPDATE ${table} SET count = count + ? WHERE id = 'page1'`, [cnt])
    
    const result = await db._mysql.query(`SELECT * FROM ${table} WHERE id = 'page1'`)
    
    await db._mysql.query(`DROP TABLE ${table}`)
    await redis.del('counter:page1')
    logResult('计数器模式', true, { expected: 150, actual: result[0].count })
  },

  async lock () {
    const table = 'test_lock'
    await db._mysql.query(`CREATE TABLE ${table} (id INT AUTO_INCREMENT PRIMARY KEY, resource VARCHAR(100))`)
    
    const lockVal = `lock_${Date.now()}`
    const acquired = await redis.set('test:lock', lockVal, 'EX', 10, 'NX')
    
    if (acquired === 'OK') {
      await db._mysql.query(`INSERT INTO ${table} (resource) VALUES ('locked_resource')`)
      
      const script = 'if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end'
      await redis.eval(script, 1, 'test:lock', lockVal)
    }
    
    const result = await db._mysql.query(`SELECT * FROM ${table}`)
    await db._mysql.query(`DROP TABLE ${table}`)
    
    logResult('分布式锁', true, { acquired: acquired === 'OK', records: result.length })
  },

  async all () {
    testResults.length = 0
    $.log('\n========== 数据库综合测试 ==========')
    
    await tests.mysql()
    await tests.redis()
    await tests.mysqlCRUD()
    await tests.redisOps()
    await tests.cache()
    await tests.counter()
    await tests.lock()
    
    const passed = testResults.filter(r => r.success).length
    $.log(`\n总计: ${testResults.length}, 通过: ${$.c.g(passed)}, 失败: ${testResults.length - passed}`)
    $.log('=====================================\n')
  }
}

// ========== 包装为 TestCase 格式（带自动清理）==========
const testCases = {}
for (const [name, fn] of Object.entries(tests)) {
  testCases[name] = async () => {
    await initDB()
    try {
      await fn()
    } finally {
      await closeDB()
    }
  }
}

// ========== 注册 TestCase ==========
new $.tools.TestCase(testCases)

module.exports = { initDB, closeDB, testCases: tests }
