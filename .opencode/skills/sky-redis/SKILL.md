---
name: sky-redis
description: Skybase框架使用j2sql2库封装Redis操作，基于ioredis提供Promise风格的API，支持Redis JSON模块和key限制功能。
---

# Sky-Redis 技能文档

## 概述

Skybase框架使用j2sql2库封装Redis操作,基于ioredis提供Promise风格的API,支持Redis JSON模块和key限制功能。

## 初始化配置

```javascript
const SkyDB = require('j2sql2')

const skyDB = new SkyDB({
  redis: {
    host: '127.0.0.1',
    port: 6379,
    auth: '',           // 密码
    db: 0,              // 数据库编号
    family: 4,          // IP版本 4/6
    keyLimit: ['*'],    // Key白名单规则
    showFriendlyErrorStack: true
  }
})

// 创建Redis实例
global.redis = await skyDB.redis
```

## 基础操作

### String (字符串)

```javascript
// 设置值
await redis.set('key', 'value')
await redis.set('key', 'value', 'EX', 3600)  // 设置1小时过期

// 获取值
const value = await redis.get('key')

// 删除
await redis.del('key')

// 设置过期时间
await redis.expire('key', 3600)  // 3600秒
await redis.expireat('key', timestamp)  // 指定时间戳

// 查看剩余时间
const ttl = await redis.ttl('key')  // -1永久, -2不存在

// 自增/自减
await redis.incr('counter')       // +1
await redis.incrby('counter', 5)  // +5
await redis.decr('counter')       // -1
await redis.decrby('counter', 5)  // -5
await redis.incrbyfloat('float_counter', 0.5)  // 浮点数自增

// 批量操作
await redis.mset('key1', 'val1', 'key2', 'val2')
const values = await redis.mget('key1', 'key2')

// 仅当key不存在时才设置
await redis.setnx('key', 'value')

// 设置并返回旧值
const oldVal = await redis.getset('key', 'new_value')

// 追加字符串
await redis.append('key', 'append_text')

// 获取字符串长度
const len = await redis.strlen('key')
```

### Hash (哈希)

```javascript
// 设置字段
await redis.hset('user:1', 'name', '张三')
await redis.hset('user:1', 'age', 25)

// 批量设置
await redis.hmset('user:1', {
  name: '张三',
  age: 25,
  email: 'zhangsan@example.com'
})

// 获取字段
const name = await redis.hget('user:1', 'name')

// 获取所有字段
const user = await redis.hgetall('user:1')
// 返回: { name: '张三', age: '25', email: 'zhangsan@example.com' }

// 批量获取
const values = await redis.hmget('user:1', 'name', 'age')

// 删除字段
await redis.hdel('user:1', 'age')

// 判断字段是否存在
const exists = await redis.hexists('user:1', 'name')  // 1或0

// 获取所有字段名
const fields = await redis.hkeys('user:1')

// 获取所有值
const values = await redis.hvals('user:1')

// 获取字段数量
const count = await redis.hlen('user:1')

// 字段自增
await redis.hincrby('user:1', 'login_count', 1)
await redis.hincrbyfloat('user:1', 'score', 0.5)
```

### List (列表)

```javascript
// 左侧插入
await redis.lpush('list', 'item1', 'item2')

// 右侧插入
await redis.rpush('list', 'item3', 'item4')

// 左侧弹出
const item = await redis.lpop('list')

// 右侧弹出
const item = await redis.rpop('list')

// 获取列表长度
const len = await redis.llen('list')

// 获取范围元素
const items = await redis.lrange('list', 0, -1)  // 获取全部
const items = await redis.lrange('list', 0, 9)   // 获取前10个

// 获取指定索引元素
const item = await redis.lindex('list', 0)

// 设置指定索引元素
await redis.lset('list', 0, 'new_value')

// 删除指定元素
await redis.lrem('list', 0, 'value')  // count=0删除所有

// 修剪列表
await redis.ltrim('list', 0, 99)  // 只保留前100个

// 阻塞弹出
const result = await redis.blpop('list', 30)  // 阻塞30秒
```

### Set (集合)

```javascript
// 添加成员
await redis.sadd('set', 'member1', 'member2', 'member3')

// 获取所有成员
const members = await redis.smembers('set')

// 判断成员是否存在
const isMember = await redis.sismember('set', 'member1')  // 1或0

// 获取集合大小
const count = await redis.scard('set')

// 删除成员
await redis.srem('set', 'member1')

// 随机获取成员
const member = await redis.srandmember('set')
const members = await redis.srandmember('set', 3)  // 获取3个

// 随机弹出成员
const member = await redis.spop('set')

// 集合运算
const diff = await redis.sdiff('set1', 'set2')      // 差集
const inter = await redis.sinter('set1', 'set2')    // 交集
const union = await redis.sunion('set1', 'set2')    // 并集

// 保存运算结果
await redis.sdiffstore('dest', 'set1', 'set2')
await redis.sinterstore('dest', 'set1', 'set2')
await redis.sunionstore('dest', 'set1', 'set2')
```

### Sorted Set (有序集合)

```javascript
// 添加成员
await redis.zadd('zset', 100, 'member1', 50, 'member2')

// 获取成员分数
const score = await redis.zscore('zset', 'member1')

// 获取排名(从0开始,从小到大)
const rank = await redis.zrank('zset', 'member1')

// 获取排名(从大到小)
const rank = await redis.zrevrank('zset', 'member1')

// 获取范围成员(从小到大)
const members = await redis.zrange('zset', 0, -1)
const members = await redis.zrange('zset', 0, 9, 'WITHSCORES')

// 获取范围成员(从大到小)
const members = await redis.zrevrange('zset', 0, -1)

// 根据分数范围获取成员
const members = await redis.zrangebyscore('zset', 50, 100)

// 获取集合大小
const count = await redis.zcard('zset')

// 获取分数范围成员数量
const count = await redis.zcount('zset', 50, 100)

// 删除成员
await redis.zrem('zset', 'member1')

// 根据排名范围删除
await redis.zremrangebyrank('zset', 0, 9)

// 根据分数范围删除
await redis.zremrangebyscore('zset', 0, 50)

// 分数自增
await redis.zincrby('zset', 10, 'member1')

// 集合运算
const union = await redis.zunionstore('dest', 2, 'zset1', 'zset2')
const inter = await redis.zinterstore('dest', 2, 'zset1', 'zset2')

// 获取Top N排行榜
const top10 = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES')
```

### Key操作

```javascript
// 判断key是否存在
const exists = await redis.exists('key')  // 1或0

// 查看key类型
const type = await redis.type('key')  // string/hash/list/set/zset/none

// 查看key过期时间
const ttl = await redis.ttl('key')
const pttl = await redis.pttl('key')  // 毫秒

// 删除key
await redis.del('key1', 'key2')

// 模糊删除(需要开启keyLimit包含*)
await redis.del('prefix:*')

// 重命名
await redis.rename('old_key', 'new_key')

// 仅当new_key不存在时重命名
await redis.renamenx('old_key', 'new_key')

// 随机获取一个key
const key = await redis.randomkey()

// 模糊查找key
const keys = await redis.keys('prefix:*')

// 扫描key(推荐,避免阻塞)
const stream = redis.scanStream({ match: 'prefix:*', count: 100 })
stream.on('data', keys => {
  keys.forEach(key => console.log(key))
})
```

## Redis JSON模块

j2sql2为Redis JSON模块提供了便捷方法:

```javascript
// 设置JSON值
await redis.jset('user:1', '$', {
  name: '张三',
  age: 25,
  address: { city: '北京', street: '长安街' }
})

// 获取JSON值
const user = await redis.jget('user:1')
const name = await redis.jget('user:1', '$.name')
const city = await redis.jget('user:1', '$.address.city')

// 批量获取
const users = await redis.jmget('user:1', 'user:2')

// 删除JSON路径
await redis.jdel('user:1', '$.address')
await redis.jforget('user:1', '$.hobbies')

// 数值自增
await redis.jnumincrby('user:1', '$.age', 1)
await redis.jnummultby('user:1', '$.score', 1.5)

// 布尔切换
await redis.jtoggle('user:1', '$.active')

// 字符串追加
await redis.jstrappend('user:1', '$.name', '_先生')

// 数组操作
await redis.jarrappend('user:1', '$.hobbies', 'reading', 'swimming')
await redis.jarrinsert('user:1', '$.hobbies', 0, 'gaming')
await redis.jarrpop('user:1', '$.hobbies', -1)  // 弹出最后一个
const index = await redis.jarrindex('user:1', '$.hobbies', 'reading')
const len = await redis.jarrlen('user:1', '$.hobbies')
await redis.jarrtrim('user:1', '$.hobbies', 0, 9)  // 保留前10个

// 对象操作
const keys = await redis.jobjkeys('user:1', '$.address')
const len = await redis.jobjlen('user:1', '$.address')
const type = await redis.jtype('user:1', '$.name')
await redis.jclear('user:1', '$.hobbies')
```

## Key限制功能

j2sql2提供了key白名单功能,防止误操作:

```javascript
// 配置key限制
const skyDB = new SkyDB({
  redis: {
    host: '127.0.0.1',
    port: 6379,
    keyLimit: ['user*', 'order*', 'session:*']  // 只允许这些前缀
    // keyLimit: ['*']  // 允许所有(生产环境不推荐)
  }
})

// 控制key限制
redis.keysLimit.status = 1  // 开启限制
redis.keysLimit.status = 0  // 关闭限制

// 添加允许的key
redis.keysLimit.add('cache:*')

// 删除允许的key
redis.keysLimit.del('temp:*')

// 查看允许的key列表
const allowedKeys = redis.keysLimit.list()

// 检查key是否允许
const allowed = redis.keysLimit.checkLimit('user:1')  // true/false
```

**受限制的命令:**
- 所有读写命令: get/set/del/hget/hset/zadd等
- JSON命令: jget/jset/jdel等
- 批量命令: mget/mset等

**不受限制的命令:**
- 管理命令: info/ping/dbsize等
- 发布订阅: publish/subscribe等
- 事务命令: multi/exec等

## 发布订阅

```javascript
// 订阅频道
redis.subscribe('channel1', 'channel2')
redis.on('message', (channel, message) => {
  console.log(`收到${channel}的消息:`, message)
})

// 发布消息
await redis.publish('channel1', 'Hello World')

// 模式订阅
redis.psubscribe('user:*')
redis.on('pmessage', (pattern, channel, message) => {
  console.log(`模式${pattern}匹配到${channel}:`, message)
})

// 取消订阅
redis.unsubscribe('channel1')
redis.punsubscribe('user:*')
```

## 管道操作

```javascript
// 使用pipeline批量执行
const pipeline = redis.pipeline()
pipeline.set('key1', 'value1')
pipeline.get('key1')
pipeline.hset('hash', 'field', 'value')
pipeline.exec((err, results) => {
  // results是数组,包含每个命令的结果
})

// 或使用Promise
const results = await redis.pipeline()
  .set('key1', 'value1')
  .get('key1')
  .hset('hash', 'field', 'value')
  .exec()
```

## 最佳实践

1. **使用key前缀**管理不同业务数据: `user:1`, `order:1001`
2. **设置过期时间**避免数据无限增长
3. **使用Hash存储对象**替代JSON字符串,节省内存
4. **使用Sorted Set做排行榜**天然支持排序
5. **开启keyLimit**防止误删生产数据
6. **使用pipeline**批量操作提升性能
7. **大key拆分**避免单个value超过10MB
8. **使用scanStream**替代keys命令

## 常见应用场景

### 1. 会话缓存
```javascript
await redis.setex(`session:${userId}`, 3600, JSON.stringify(sessionData))
```

### 2. 验证码存储
```javascript
await redis.setex(`captcha:${email}`, 300, code)  // 5分钟过期
```

### 3. 分布式锁
```javascript
const lock = await redis.set(`lock:${resource}`, token, 'EX', 30, 'NX')
if (lock) {
  try {
    // 执行业务逻辑
  } finally {
    await redis.del(`lock:${resource}`)
  }
}
```

### 4. 限流控制
```javascript
const key = `rate_limit:${ip}`
const current = await redis.incr(key)
if (current === 1) {
  await redis.expire(key, 60)  // 1分钟窗口
}
if (current > 100) {
  throw new Error('请求过于频繁')
}
```

### 5. 排行榜
```javascript
await redis.zadd('leaderboard', score, userId)
const top10 = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES')
const rank = await redis.zrevrank('leaderboard', userId)
```
