/**
 * 接口限流
 *
 * 1 - 可为接口设置每秒最多被执行次数
 * 2 - 可为接口设置是否同一时间只能执行一次，等待该次执行完成后才允许下一次的执行
 * */
const { limit: limitConfig = {} } = require('../config').middleware || {}
const pack = require('../package.json')
const $G = (global.$G = global.$G || {})
const apiLimit = {}
const locks = {}
const api = $G.api || {}

async function lock (limit, apiPath) {
  if (limit) {
    if (limitConfig.useRedisLock && !global.redis) {
      return [502, 'redis未配置']
    }
    const lockKey = limitConfig.useRedisLock
      ? await redisLock(apiPath, limit.expire)
      : memoryLock(apiPath, limit.expire)
    if (!lockKey) {
      return [
        limit.code || limitConfig.code || 402,
        limit.msg || limitConfig.msg || '访问过快请稍后再试！'
      ]
    }
    return [
      200,
      '',
      {
        lockKey
      }
    ]
  }
  return [200, '', {}]
}

function unlock (apiPath, lockKey) {
  return limitConfig.useRedisLock
    ? redisUnLock(apiPath, lockKey)
    : memoryUnlock(apiPath, lockKey)
}

// 内存锁
function memoryLock (apiPath, expire) {
  const now = Date.now()
  const it = apiLimit[apiPath]
  if (it.lockKey && !(it.lockExpire && it.lockExpire <= now)) {
    // 当锁存在，且未过期时，不能再加锁
    return false
  }

  it.lockKey = Symbol(apiPath)
  it.lockExpire = now + (expire || 5000)
  return it.lockKey
}

// 内存解锁
function memoryUnlock (apiPath, lockKey) {
  if (lockKey && apiLimit[apiPath].lockKey === lockKey) {
    apiLimit[apiPath].lockKey = null
    apiLimit[apiPath].lockExpire = 0
  }
}

function getKeyName (lockName) {
  return `${pack.name}:${lockName.replace(/\/+/g, '_')}:apiLock`
}

/**
 * 基于单机redis的锁
 *
 * todo 有空看看基于分布式redis的锁： https://redis.io/topics/distlock
 *
 * 用法： 定义一个锁名，当调用此方法返回false时，肯定就是该锁已经存在，则应该走已锁逻辑，如果返回一个随机字符串，则应该走未锁逻辑。
 * ps. 每次使用不同的 lockName，永远不会返回false.
 * ps. 第一次锁定成功后，在有效期内使用相同的锁名再
 *
 * @param {string} lockName 自定义一个锁名
 * @param {int} [msec=5000] 锁有效期持续时间，单位毫秒。只能传大于0的整数，默认5000
 * @return symbol|string|boolean 这里返回的是一个随机数，用于解锁时作为钥匙(key)
 * */
async function redisLock (lockName, msec) {
  if (!msec || msec < 0) msec = 5000
  const kn = getKeyName(lockName)
  const now = Date.now()
  if (locks[kn]) {
    // 把内存也当作一道锁。这个可以不要，要的话能快一点，虽然过了单元测试，但是不知道会不会引发别的问题
    if (locks[kn] >= Date.now()) {
      return false
    } else {
      locks[kn] = 0
    }
  }
  const key = Date.now() + Math.random().toString()
  const res = (await global.redis.set(kn, key, 'NX', 'PX', msec)) === 'OK'
  if (res) {
    locks[kn] = now + msec
    return key
  }
  return false
}

/**
 * @param {string} lockName 要解的锁
 * @param {symbol} lockKey 解锁的钥匙，即lock函数的返回值
 * */
async function redisUnLock (lockName, lockKey) {
  const kn = getKeyName(lockName)
  if (lockKey !== (await global.redis.get(kn))) {
    return false
  }
  if ((await global.redis.del(kn)) > 0) {
    locks[kn] = 0
    return true
  }
  return false
}

module.exports = async (ctx, next) => {
  const start = Date.now()

  const url = ctx.request.url
  const apiPath = url.split('?')[0]

  const { limit = {} } = api[apiPath] || {}

  apiLimit[apiPath] = apiLimit[apiPath] || {
    lockKey: null,
    lockExpire: 0
  }

  const lockRes = await lock(limit, apiPath, start)
  if (lockRes[0] !== 200) {
    return ctx.throwCode(lockRes)
  }

  const { lockKey } = lockRes[2]

  if (next) {
    await next()
  }

  // 解锁
  if (limit.unlockUntilComplete !== false) {
    await unlock(apiPath, lockKey)
  }
}
