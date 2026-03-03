---
name: sky-rts
description: RTS是skybase框架中时序数据埋点和数据统计的核心组件，基于Redis实现高性能的实时统计功能，支持多时间粒度的数据统计和聚合分析。
---

# Sky-RTS 技能文档

## 概述

RTS(Real-Time Statistics)是skybase框架中时序数据埋点和数据统计的核心组件,基于Redis实现高性能的实时统计功能。支持多时间粒度(5分钟、小时、日、周、月、年)的数据统计和聚合分析。

## 核心特性

- **多时间粒度**: 支持5m, 1h, 1d, 1w, 1M, 1y多种粒度
- **自动聚合**: count/max/min/avg等多种统计维度
- **高性能**: 基于Redis Sorted Set实现,读写性能优异
- **Lua脚本**: 使用Redis Lua脚本保证原子性
- **自动归档**: 支持数据过期和自动清理

## 初始化配置

```javascript
const sky = require('skybase')
const SkyDB = require('j2sql2')
const $ = require('meeko')

config.beforeMount = async () => {
  const skyDB = new SkyDB({ mysql: config.mysql, redis: config.redis })
  global.db = await skyDB.mysql
  global.redis = await skyDB.redis
  
  // 初始化RTS
  global.rts = await require('skyrts')({
    redis: redis,                    // Redis实例
    redisAsync: redis,               // 异步Redis实例
    gran: '5m, 1h, 1d, 1w, 1M, 1y',  // 时间粒度配置
    points: 1000,                    // 每个粒度保留的数据点数
    prefix: 'myproject'              // Redis key前缀
  })
}
```

### 配置参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| redis | Object | 是 | Redis实例 |
| redisAsync | Object | 是 | 异步Redis实例 |
| gran | String | 否 | 时间粒度,默认'5m, 1h, 1d, 1w, 1M, 1y' |
| points | Number | 否 | 每个粒度保留点数,默认1000 |
| prefix | String | 否 | Redis key前缀 |

### 时间粒度说明

- `5m` - 5分钟粒度,适合实时监控
- `1h` - 小时粒度,适合日统计
- `1d` - 天粒度,适合月统计
- `1w` - 周粒度,适合季度统计
- `1M` - 月粒度,适合年统计
- `1y` - 年粒度,适合长期趋势

## 核心API

### 1. 数据打点 (rts)

```javascript
// 基础打点
await rts.rts(key, value)

// 示例:记录API响应时间
await rts.rts('api:response_time', 150)

// 示例:记录用户访问量
await rts.rts('user:visit_count', 1)
```

### 2. 批量打点 (multiRts)

```javascript
// 批量记录多个key
await rts.multiRts([
  ['api:getUser', 100],
  ['api:createOrder', 200],
  ['api:payOrder', 300]
])
```

### 3. 查询统计 (getStatAsync)

```javascript
// 获取指定时间范围的统计数据
const result = await rts.getStatAsync(
  statType,      // 统计类型: count/max/min/avg/sum
  key,           // 统计key
  gran,          // 时间粒度: 5m/1h/1d/1w/1M/1y
  beginTime,     // 开始时间(Date对象)
  endTime        // 结束时间(Date对象)
)

// 示例:获取最近1小时API调用次数
const beginTime = new Date()
beginTime.setHours(beginTime.getHours() - 1)
const endTime = new Date()

const count = await rts.getStatAsync(
  'count',
  'api:getUser',
  '1h',
  beginTime,
  endTime
)
```

**统计类型说明:**
- `count` - 数据点数
- `max` - 最大值
- `min` - 最小值
- `avg` - 平均值
- `sum` - 求和

### 4. 获取多维度统计

```javascript
// 同时获取多个统计维度
async function getApiStats (apiName, gran, beginTime, endTime) {
  const data = {
    count: await rts.getStatAsync('count', apiName, gran, beginTime, endTime),
    max: await rts.getStatAsync('max', apiName, gran, beginTime, endTime),
    min: await rts.getStatAsync('min', apiName, gran, beginTime, endTime),
    avg: await rts.getStatAsync('avg', apiName, gran, beginTime, endTime)
  }
  return data
}

// 使用示例
const beginTime = new Date()
beginTime.setMinutes(beginTime.getMinutes() - 5 * 23)  // 23个5分钟点
const endTime = new Date()

const stats = await getApiStats('api:getUser', '5m', beginTime, endTime)
console.log(stats)
// {
//   count: { data: [[timestamp1, count1], ...] },
//   max: { data: [[timestamp1, max1], ...] },
//   min: { data: [[timestamp1, min1], ...] },
//   avg: { data: [[timestamp1, avg1], ...] }
// }
```

## 实战应用场景

### 场景1: API性能监控

```javascript
// service/api-monitor.js
'use strict'
/* global $ rts */

module.exports = {
  recordApiCall,
  getApiStats
}

// 在API调用时记录
async function recordApiCall (apiName, responseTime) {
  // 将API路径中的/替换为_
  const key = `api:${apiName.replace(/\//g, '_')}`
  await rts.rts(key, responseTime)
}

// 获取API统计数据
async function getApiStats (apiName) {
  const key = `api:${apiName.replace(/\//g, '_')}`
  const now = new Date()
  
  // 最近24小时(5分钟粒度)
  const begin5m = new Date(now)
  begin5m.setMinutes(begin5m.getMinutes() - 5 * 23)
  const data5m = {
    count: await rts.getStatAsync('count', key, '5m', begin5m, now),
    max: await rts.getStatAsync('max', key, '5m', begin5m, now),
    min: await rts.getStatAsync('min', key, '5m', begin5m, now),
    avg: await rts.getStatAsync('avg', key, '5m', begin5m, now)
  }
  
  // 最近24天(小时粒度)
  const begin1h = new Date(now)
  begin1h.setHours(begin1h.getHours() - 23)
  const data1h = {
    count: await rts.getStatAsync('count', key, '1h', begin1h, now),
    max: await rts.getStatAsync('max', key, '1h', begin1h, now),
    min: await rts.getStatAsync('min', key, '1h', begin1h, now),
    avg: await rts.getStatAsync('avg', key, '1h', begin1h, now)
  }
  
  // 最近30天(天粒度)
  const begin1d = new Date(now)
  begin1d.setDate(begin1d.getDate() - 29)
  const data1d = {
    count: await rts.getStatAsync('count', key, '1d', begin1d, now),
    max: await rts.getStatAsync('max', key, '1d', begin1d, now),
    min: await rts.getStatAsync('min', key, '1d', begin1d, now),
    avg: await rts.getStatAsync('avg', key, '1d', begin1d, now)
  }
  
  return {
    code: 0,
    data: {
      '5m': data5m,
      '1h': data1h,
      '1d': data1d
    }
  }
}
```

### 场景2: 用户行为分析

```javascript
// service/user-analytics.js
'use strict'
/* global $ rts */

module.exports = {
  recordUserAction,
  getUserActivity,
  getUserRetention
}

// 记录用户行为
async function recordUserAction (userId, action, value = 1) {
  const key = `user:action:${action}`
  await rts.rts(key, value)
  
  // 同时记录到用户个人统计
  const userKey = `user:${userId}:action:${action}`
  await rts.rts(userKey, value)
}

// 获取用户活跃度(按小时统计)
async function getUserActivity (hours = 24) {
  const now = new Date()
  const begin = new Date(now)
  begin.setHours(begin.getHours() - hours + 1)
  
  const data = await rts.getStatAsync(
    'count',
    'user:action:login',
    '1h',
    begin,
    now
  )
  
  return {
    code: 0,
    data: data.data  // [[timestamp, count], ...]
  }
}

// 获取用户留存数据
async function getUserRetention () {
  const now = new Date()
  const days = [1, 3, 7, 15, 30]
  const retention = {}
  
  for (const day of days) {
    const begin = new Date(now)
    begin.setDate(begin.getDate() - day)
    
    const data = await rts.getStatAsync(
      'count',
      'user:action:login',
      '1d',
      begin,
      now
    )
    
    retention[`${day}d`] = data.data.reduce((sum, item) => sum + item[1], 0)
  }
  
  return {
    code: 0,
    data: retention
  }
}
```

### 场景3: 业务指标监控

```javascript
// service/business-metrics.js
'use strict'
/* global $ rts */

module.exports = {
  recordOrderMetrics,
  getSalesStats,
  getSystemHealth
}

// 记录订单相关指标
async function recordOrderMetrics (orderData) {
  const now = new Date()
  
  // 记录订单金额
  await rts.rts('business:order_amount', orderData.amount)
  
  // 记录订单处理时间
  await rts.rts('business:order_process_time', orderData.processTime)
  
  // 记录支付成功率(成功为1,失败为0)
  await rts.rts('business:payment_success', orderData.paymentSuccess ? 1 : 0)
}

// 获取销售统计
async function getSalesStats (gran = '1d', periods = 30) {
  const now = new Date()
  const begin = new Date(now)
  
  switch (gran) {
    case '5m':
      begin.setMinutes(begin.getMinutes() - 5 * periods)
      break
    case '1h':
      begin.setHours(begin.getHours() - periods)
      break
    case '1d':
      begin.setDate(begin.getDate() - periods)
      break
    case '1w':
      begin.setDate(begin.getDate() - 7 * periods)
      break
    case '1M':
      begin.setMonth(begin.getMonth() - periods)
      break
  }
  
  const stats = {
    orderCount: await rts.getStatAsync('count', 'business:order_amount', gran, begin, now),
    totalAmount: await rts.getStatAsync('sum', 'business:order_amount', gran, begin, now),
    avgAmount: await rts.getStatAsync('avg', 'business:order_amount', gran, begin, now),
    avgProcessTime: await rts.getStatAsync('avg', 'business:order_process_time', gran, begin, now)
  }
  
  return {
    code: 0,
    data: stats
  }
}

// 获取系统健康度
async function getSystemHealth () {
  const now = new Date()
  const begin = new Date(now)
  begin.setHours(begin.getHours() - 1)
  
  // API平均响应时间
  const apiAvg = await rts.getStatAsync('avg', 'api:response_time', '5m', begin, now)
  
  // 支付成功率
  const paymentSuccess = await rts.getStatAsync('avg', 'business:payment_success', '5m', begin, now)
  
  // 错误率(通过错误日志统计)
  const errorCount = await rts.getStatAsync('count', 'system:error', '5m', begin, now)
  
  return {
    code: 0,
    data: {
      apiResponseTime: apiAvg,
      paymentSuccessRate: paymentSuccess,
      errorCount: errorCount,
      healthScore: calculateHealthScore(apiAvg, paymentSuccess, errorCount)
    }
  }
}

function calculateHealthScore (apiAvg, paymentSuccess, errorCount) {
  // 自定义健康度算法
  let score = 100
  if (apiAvg.data && apiAvg.data[0] && apiAvg.data[0][1] > 500) score -= 20
  if (paymentSuccess.data && paymentSuccess.data[0] && paymentSuccess.data[0][1] < 0.95) score -= 30
  if (errorCount.data) {
    const totalErrors = errorCount.data.reduce((sum, item) => sum + item[1], 0)
    if (totalErrors > 10) score -= 20
  }
  return Math.max(0, score)
}
```

## 中间件集成

### API自动埋点中间件

```javascript
// middleware/sky-rts-monitor.js
'use strict'
/* global rts */

module.exports = async (ctx, next) => {
  const startTime = Date.now()
  const apiName = ctx.path.replace(/\//g, '_')
  
  try {
    await next()
    
    // 记录成功请求
    const responseTime = Date.now() - startTime
    await rts.rts(`api:${apiName}`, responseTime)
    
    // 记录状态码分布
    await rts.rts(`api:${apiName}:status:${ctx.status}`, 1)
    
  } catch (err) {
    // 记录错误请求
    await rts.rts(`api:${apiName}:error`, 1)
    throw err
  }
}
```

### 在skyconfig.js中启用

```javascript
module.exports = {
  middlewares: [
    'sky-cors',
    'sky-body-parse',
    'sky-static-server',
    'sky-check-param',
    'sky-rts-monitor',  // 添加RTS监控中间件
    'sky-api-register'
  ]
}
```

## Lua脚本扩展

RTS支持加载自定义Lua脚本进行复杂统计:

```javascript
// 在beforeMount中加载自定义脚本
config.beforeMount = async () => {
  global.rts = await require('skyrts')({
    redis: redis,
    redisAsync: redis,
    gran: '5m, 1h, 1d',
    points: 1000,
    prefix: 'myproject'
  })
  
  // 加载自定义统计脚本
  const path = require('path')
  const result = await rts.loadOneScript('custom_stat', path.join(__dirname, 'custom_stat.lua'))
  console.log('Lua脚本SHA1:', rts.scriptSha1s)
}
```

### 自定义Lua脚本示例

```lua
-- custom_stat.lua
-- 自定义统计逻辑

local key = KEYS[1]
local value = tonumber(ARGV[1])
local timestamp = tonumber(ARGV[2])

-- 获取当前统计
local current = redis.call('zscore', key, timestamp)
if not current then
    current = 0
end

-- 自定义聚合逻辑(例如:加权平均)
local newValue = (current * 0.7) + (value * 0.3)

-- 保存结果
redis.call('zadd', key, timestamp, newValue)

return newValue
```

## 数据可视化

### 生成图表数据

```javascript
// service/chart-data.js
'use strict'
/* global $ rts */

module.exports = {
  generateChartData
}

async function generateChartData (key, gran, periods) {
  const now = new Date()
  const begin = new Date(now)
  
  // 计算开始时间
  const granMap = {
    '5m': () => begin.setMinutes(begin.getMinutes() - 5 * periods),
    '1h': () => begin.setHours(begin.getHours() - periods),
    '1d': () => begin.setDate(begin.getDate() - periods)
  }
  granMap[gran]?.()
  
  // 获取统计数据
  const stats = {
    count: await rts.getStatAsync('count', key, gran, begin, now),
    avg: await rts.getStatAsync('avg', key, gran, begin, now),
    max: await rts.getStatAsync('max', key, gran, begin, now),
    min: await rts.getStatAsync('min', key, gran, begin, now)
  }
  
  // 转换为图表格式
  const chartData = {
    xAxis: [],
    series: {
      count: [],
      avg: [],
      max: [],
      min: []
    }
  }
  
  // 处理count数据
  if (stats.count.data) {
    stats.count.data.forEach(item => {
      const time = new Date(item[0])
      chartData.xAxis.push(formatTime(time, gran))
      chartData.series.count.push(item[1])
    })
  }
  
  // 处理其他数据...
  
  return {
    code: 0,
    data: chartData
  }
}

function formatTime (date, gran) {
  const pad = n => n.toString().padStart(2, '0')
  switch (gran) {
    case '5m':
    case '1h':
      return `${pad(date.getHours())}:${pad(date.getMinutes())}`
    case '1d':
      return `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    default:
      return date.toISOString()
  }
}
```

## 最佳实践

1. **Key命名规范**: 使用冒号分隔层级,如`api:user_login`, `business:order_amount`
2. **合理选择粒度**: 高频数据用5m,低频数据用1d
3. **设置points上限**: 避免数据无限增长,points建议1000-10000
4. **批量打点**: 使用`multiRts`减少Redis往返
5. **异步处理**: 打点操作不要阻塞主业务逻辑
6. **定期清理**: 超过points的数据会自动过期
7. **监控Redis内存**: 统计会占用内存,需要监控

## 注意事项

1. **数据精度**: RTS存储的是浮点数,可能存在精度损失
2. **时间对齐**: 数据统计按粒度自动对齐时间戳
3. **空数据处理**: 查询范围内无数据时返回空数组
4. **性能考虑**: 大量keys时查询性能会下降,建议按业务分离
5. **内存占用**: 每个key每个粒度会占用Redis内存,注意控制key数量
