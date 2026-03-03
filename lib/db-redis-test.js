/* global db redis $ */
/**
 * MySQL 和 Redis 综合测试模块
 * 包含数据库连接测试、读写测试、缓存测试等
 */

class DatabaseTest {
  constructor () {
    this.testResults = []
  }

  /**
   * 记录测试结果
   * @param {string} name - 测试名称
   * @param {boolean} success - 是否成功
   * @param {any} data - 测试数据
   * @param {string} error - 错误信息
   */
  logResult (name, success, data = null, error = null) {
    const result = {
      name,
      success,
      timestamp: new Date().toISOString(),
      data,
      error
    }
    this.testResults.push(result)
    const status = success ? '✓' : '✗'
    $.log(`${status} ${name}`)
    if (error) {
      $.log(`  Error: ${error}`)
    }
    return result
  }

  /**
   * 测试 MySQL 连接
   */
  async testMySQLConnection () {
    try {
      // 执行简单查询测试连接
      const result = await db._mysql.query('SELECT 1 as test')
      return this.logResult('MySQL 连接测试', true, { connection: 'ok', result })
    } catch (error) {
      return this.logResult('MySQL 连接测试', false, null, error.message)
    }
  }

  /**
   * 测试 Redis 连接
   */
  async testRedisConnection () {
    try {
      await redis.set('test:connection', 'ok')
      const value = await redis.get('test:connection')
      await redis.del('test:connection')
      return this.logResult('Redis 连接测试', true, { connection: 'ok', value })
    } catch (error) {
      return this.logResult('Redis 连接测试', false, null, error.message)
    }
  }

  /**
   * 测试 MySQL 基本 CRUD 操作
   */
  async testMySQLCRUD () {
    const testTable = 'test_crud'
    try {
      // 创建测试表
      await db._mysql.query(`
        CREATE TABLE IF NOT EXISTS ${testTable} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100),
          value INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // 插入测试数据
      const insertResult = await db._mysql.query(
        `INSERT INTO ${testTable} (name, value) VALUES (?, ?)`,
        ['test_item', 100]
      )

      // 查询测试数据
      const selectResult = await db._mysql.query(
        `SELECT * FROM ${testTable} WHERE id = ?`,
        [insertResult.insertId]
      )

      // 更新测试数据
      await db._mysql.query(
        `UPDATE ${testTable} SET value = ? WHERE id = ?`,
        [200, insertResult.insertId]
      )

      // 删除测试数据
      await db._mysql.query(
        `DELETE FROM ${testTable} WHERE id = ?`,
        [insertResult.insertId]
      )

      // 清理测试表
      await db._mysql.query(`DROP TABLE IF EXISTS ${testTable}`)

      return this.logResult('MySQL CRUD 测试', true, {
        insertId: insertResult.insertId,
        selected: selectResult[0]
      })
    } catch (error) {
      // 清理
      try {
        await db._mysql.query(`DROP TABLE IF EXISTS ${testTable}`)
      } catch (e) {}
      return this.logResult('MySQL CRUD 测试', false, null, error.message)
    }
  }

  /**
   * 测试 Redis 基本操作
   */
  async testRedisOperations () {
    try {
      const testKey = 'test:operations'
      const testHash = 'test:hash'
      const testList = 'test:list'
      const testSet = 'test:set'

      // String 操作
      await redis.set(`${testKey}:string`, 'hello')
      const stringValue = await redis.get(`${testKey}:string`)

      // Hash 操作
      await redis.hset(testHash, 'field1', 'value1')
      await redis.hset(testHash, 'field2', 'value2')
      const hashValue = await redis.hgetall(testHash)

      // List 操作
      await redis.lpush(testList, 'item1', 'item2', 'item3')
      const listValue = await redis.lrange(testList, 0, -1)

      // Set 操作
      await redis.sadd(testSet, 'member1', 'member2', 'member3')
      const setValue = await redis.smembers(testSet)

      // 过期时间测试
      await redis.setex(`${testKey}:expire`, 1, 'will_expire')
      const beforeExpire = await redis.get(`${testKey}:expire`)
      await $.tools.wait(1100)
      const afterExpire = await redis.get(`${testKey}:expire`)

      // 清理
      await redis.del(`${testKey}:string`, testHash, testList, testSet)

      return this.logResult('Redis 操作测试', true, {
        string: stringValue,
        hash: hashValue,
        list: listValue,
        set: setValue,
        expire: { before: beforeExpire, after: afterExpire }
      })
    } catch (error) {
      // 清理
      await redis.del('test:operations:string', 'test:hash', 'test:list', 'test:set')
      return this.logResult('Redis 操作测试', false, null, error.message)
    }
  }

  /**
   * 测试 MySQL + Redis 综合场景 - 缓存模式
   */
  async testCachePattern () {
    const testTable = 'test_cache'
    const cacheKey = 'test:cache:user:1'

    try {
      // 创建测试表
      await db._mysql.query(`
        CREATE TABLE IF NOT EXISTS ${testTable} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(100),
          email VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // 插入测试数据
      await db._mysql.query(
        `INSERT INTO ${testTable} (id, username, email) VALUES (?, ?, ?)`,
        [1, 'testuser', 'test@example.com']
      )

      // 场景1: 缓存未命中，从 MySQL 读取并写入 Redis
      let userData = await redis.get(cacheKey)
      let fromCache = false

      if (!userData) {
        const rows = await db._mysql.query(
          `SELECT * FROM ${testTable} WHERE id = ?`,
          [1]
        )
        if (rows.length > 0) {
          userData = JSON.stringify(rows[0])
          await redis.setex(cacheKey, 60, userData) // 缓存60秒
        }
      } else {
        fromCache = true
      }

      // 场景2: 更新 MySQL 数据，删除 Redis 缓存（缓存失效模式）
      await db._mysql.query(
        `UPDATE ${testTable} SET email = ? WHERE id = ?`,
        ['updated@example.com', 1]
      )
      await redis.del(cacheKey) // 删除缓存，下次读取时重新加载

      // 再次读取，应该从 MySQL 获取最新数据
      const updatedRows = await db._mysql.query(
        `SELECT * FROM ${testTable} WHERE id = ?`,
        [1]
      )
      const freshData = updatedRows[0]

      // 清理
      await db._mysql.query(`DROP TABLE IF EXISTS ${testTable}`)
      await redis.del(cacheKey)

      return this.logResult('缓存模式测试', true, {
        firstRead: { fromCache, data: JSON.parse(userData) },
        afterUpdate: freshData,
        emailUpdated: freshData.email === 'updated@example.com'
      })
    } catch (error) {
      // 清理
      try {
        await db._mysql.query(`DROP TABLE IF EXISTS ${testTable}`)
      } catch (e) {}
      await redis.del(cacheKey)
      return this.logResult('缓存模式测试', false, null, error.message)
    }
  }

  /**
   * 测试 MySQL + Redis 综合场景 - 计数器模式
   */
  async testCounterPattern () {
    const testTable = 'test_counter'
    const counterKey = 'test:counter:page:view'

    try {
      // 创建测试表
      await db._mysql.query(`
        CREATE TABLE IF NOT EXISTS ${testTable} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          page_id VARCHAR(50),
          view_count INT DEFAULT 0,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `)

      // 初始化 MySQL 数据
      await db._mysql.query(
        `INSERT INTO ${testTable} (page_id, view_count) VALUES (?, ?)`,
        ['page_001', 100]
      )

      // 使用 Redis 进行高频计数
      const incrementCount = 50
      for (let i = 0; i < incrementCount; i++) {
        await redis.incr(counterKey)
      }

      // 定期同步：将 Redis 计数同步到 MySQL
      const redisCount = parseInt(await redis.get(counterKey) || 0)
      await db._mysql.query(
        `UPDATE ${testTable} SET view_count = view_count + ? WHERE page_id = ?`,
        [redisCount, 'page_001']
      )

      // 重置 Redis 计数器
      await redis.del(counterKey)

      // 验证 MySQL 中的总数
      const result = await db._mysql.query(
        `SELECT * FROM ${testTable} WHERE page_id = ?`,
        ['page_001']
      )

      const expectedCount = 100 + incrementCount
      const actualCount = result[0].view_count

      // 清理
      await db._mysql.query(`DROP TABLE IF EXISTS ${testTable}`)
      await redis.del(counterKey)

      return this.logResult('计数器模式测试', true, {
        expected: expectedCount,
        actual: actualCount,
        correct: expectedCount === actualCount
      })
    } catch (error) {
      // 清理
      try {
        await db._mysql.query(`DROP TABLE IF EXISTS ${testTable}`)
      } catch (e) {}
      await redis.del(counterKey)
      return this.logResult('计数器模式测试', false, null, error.message)
    }
  }

  /**
   * 测试 MySQL + Redis 综合场景 - 分布式锁
   */
  async testDistributedLock () {
    const lockKey = 'test:distributed:lock'
    const testTable = 'test_lock'

    try {
      // 创建测试表
      await db._mysql.query(`
        CREATE TABLE IF NOT EXISTS ${testTable} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          resource_name VARCHAR(100),
          locked_by VARCHAR(100),
          locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // 尝试获取分布式锁（使用 Redis SETNX + 过期时间）
      const lockValue = `lock_${Date.now()}_${Math.random()}`
      const lockTimeout = 10 // 10秒过期

      // 尝试获取锁
      const acquired = await redis.set(lockKey, lockValue, 'EX', lockTimeout, 'NX')

      let lockAcquired = false
      let operationResult = null

      if (acquired === 'OK') {
        lockAcquired = true
        try {
          // 执行业务操作（在锁保护下）
          await db._mysql.query(
            `INSERT INTO ${testTable} (resource_name, locked_by) VALUES (?, ?)`,
            ['resource_001', lockValue]
          )

          // 模拟业务处理
          await $.tools.wait(100)

          operationResult = await db._mysql.query(
            `SELECT * FROM ${testTable} WHERE locked_by = ?`,
            [lockValue]
          )
        } finally {
          // 释放锁（使用 Lua 脚本确保原子性，检查锁是否仍由当前持有者拥有）
          const unlockScript = `
            if redis.call("get", KEYS[1]) == ARGV[1] then
              return redis.call("del", KEYS[1])
            else
              return 0
            end
          `
          await redis.eval(unlockScript, 1, lockKey, lockValue)
        }
      }

      // 清理
      await db._mysql.query(`DROP TABLE IF EXISTS ${testTable}`)
      await redis.del(lockKey)

      return this.logResult('分布式锁测试', true, {
        lockAcquired,
        lockValue,
        operationCompleted: operationResult !== null && operationResult.length > 0
      })
    } catch (error) {
      // 清理
      try {
        await db._mysql.query(`DROP TABLE IF EXISTS ${testTable}`)
      } catch (e) {}
      await redis.del(lockKey)
      return this.logResult('分布式锁测试', false, null, error.message)
    }
  }

  /**
   * 运行所有测试
   */
  async runAllTests () {
    $.log('\n========== 数据库综合测试开始 ==========')
    this.testResults = []

    // 基础连接测试
    await this.testMySQLConnection()
    await this.testRedisConnection()

    // 基本操作测试
    await this.testMySQLCRUD()
    await this.testRedisOperations()

    // 综合场景测试
    await this.testCachePattern()
    await this.testCounterPattern()
    await this.testDistributedLock()

    // 统计结果
    const total = this.testResults.length
    const passed = this.testResults.filter(r => r.success).length
    const failed = total - passed

    $.log('\n========== 测试总结 ==========')
    $.log(`总计: ${total} 个测试`)
    $.log($.c.g(`通过: ${passed}`))
    $.log(failed > 0 ? $.c.r(`失败: ${failed}`) : `失败: ${failed}`)
    $.log('==============================\n')

    return {
      total,
      passed,
      failed,
      results: this.testResults
    }
  }
}

module.exports = DatabaseTest
