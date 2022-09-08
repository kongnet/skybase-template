/* global $ rts $G */

module.exports = {
  getAll,
  getSome,
  getOne,
  getSpecialKeys,
  getMysql,
  getRedis
}

async function getSpecialKeys (arg) {
  if (arg.count5m < 1 || arg.count1h < 1 || arg.count1d < 1) {
    return { code: 400, msg: '参数错误' }
  }
  let list = []
  try {
    list = JSON.parse(arg.keyList)
  } catch (e) {
    $.err(e.stack)
    return { code: 400, msg: 'keyList json解析错误' }
  }
  if (list.length < 1) {
    return { code: 400, msg: '至少需要一个key名称' }
  }

  let data = {}
  for (let i = 0; i < list.length; i++) {
    let key = list[i]
    let format = '5m'
    let beginTime = new Date()
    beginTime.setMinutes(beginTime.getMinutes() - 5 * (arg.count5m - 1))
    let endTime = new Date()
    let temp = {}
    temp[format] = {
      count: await rts.getStatAsync('count', key, format, beginTime, endTime),
      max: await rts.getStatAsync('max', key, format, beginTime, endTime),
      min: await rts.getStatAsync('min', key, format, beginTime, endTime),
      avg: await rts.getStatAsync('avg', key, format, beginTime, endTime)
    }

    beginTime = new Date()
    beginTime.setHours(beginTime.getHours() - (arg.count1h - 1))
    endTime = new Date()
    format = '1h'
    temp[format] = {
      count: await rts.getStatAsync('count', key, format, beginTime, endTime),
      max: await rts.getStatAsync('max', key, format, beginTime, endTime),
      min: await rts.getStatAsync('min', key, format, beginTime, endTime),
      avg: await rts.getStatAsync('avg', key, format, beginTime, endTime)
    }

    beginTime = new Date()
    beginTime.setDate(beginTime.getDate() - (arg.count1d - 1))
    endTime = new Date()
    format = '1d'
    temp[format] = {
      count: await rts.getStatAsync('count', key, format, beginTime, endTime),
      max: await rts.getStatAsync('max', key, format, beginTime, endTime),
      min: await rts.getStatAsync('min', key, format, beginTime, endTime),
      avg: await rts.getStatAsync('avg', key, format, beginTime, endTime)
    }
    data[key] = temp
  }

  return { code: 0, data }
}

async function getAll () {
  let a = []
  for (let k in $G.api) {
    a.push(k)
  }
  let result = await getRts(a)
  return { code: 0, data: result }
}

async function getSome (arg) {
  let list = []
  try {
    list = JSON.parse(arg.apiList)
  } catch (e) {
    $.err(e.stack)
    return { code: 400, msg: 'apiList json解析错误' }
  }
  let result = await getRts(list)
  return { code: 0, data: result }
}

// 获取指定api 5m 36个点，1h 48个点,1d 30个点
async function getOne (arg) {
  let apiName = `api:${arg.api.replace(/\//g, '_')}`
  let format = '5m'
  let beginTime = new Date()
  beginTime.setMinutes(beginTime.getMinutes() - 5 * 23)
  let endTime = new Date()
  let data = {}
  data[format] = {
    count: await rts.getStatAsync('count', apiName, format, beginTime, endTime),
    max: await rts.getStatAsync('max', apiName, format, beginTime, endTime),
    min: await rts.getStatAsync('min', apiName, format, beginTime, endTime),
    avg: await rts.getStatAsync('avg', apiName, format, beginTime, endTime)
  }

  beginTime = new Date()
  beginTime.setHours(beginTime.getHours() - 23)
  endTime = new Date()
  format = '1h'
  data[format] = {
    count: await rts.getStatAsync('count', apiName, format, beginTime, endTime),
    max: await rts.getStatAsync('max', apiName, format, beginTime, endTime),
    min: await rts.getStatAsync('min', apiName, format, beginTime, endTime),
    avg: await rts.getStatAsync('avg', apiName, format, beginTime, endTime)
  }

  beginTime = new Date()
  beginTime.setDate(beginTime.getDate() - 29)
  endTime = new Date()
  format = '1d'
  data[format] = {
    count: await rts.getStatAsync('count', apiName, format, beginTime, endTime),
    max: await rts.getStatAsync('max', apiName, format, beginTime, endTime),
    min: await rts.getStatAsync('min', apiName, format, beginTime, endTime),
    avg: await rts.getStatAsync('avg', apiName, format, beginTime, endTime)
  }
  return { code: 0, data }
}

function getRtsData (obj) {
  if (obj && obj.data && obj.data[0] && obj.data[0].length > 1) {
    return +obj.data[0][1].toFixed(0)
  }
  return 0
}

async function getRts (apiList) {
  let beginTime = new Date()
  let endTime = new Date()
  let result = {}
  for (let i = 0; i < apiList.length; i++) {
    let sName = apiList[i].replace(/\//g, '_')
    result[sName] = {
      count: getRtsData(
        await rts.getStatAsync(
          'count',
          'api:' + sName,
          '1h',
          beginTime,
          endTime
        )
      ),
      max:
        getRtsData(
          await rts.getStatAsync(
            'max',
            'api:' + sName,
            '1h',
            beginTime,
            endTime
          )
        ) + ' ms',
      min:
        getRtsData(
          await rts.getStatAsync(
            'min',
            'api:' + sName,
            '1h',
            beginTime,
            endTime
          )
        ) + ' ms',
      avg:
        getRtsData(
          await rts.getStatAsync(
            'avg',
            'api:' + sName,
            '1h',
            beginTime,
            endTime
          )
        ) + ' ms'
    }
  }
  return result
}
async function getMysql () {
  let r
  let htmlStr = ''
  if (global.db) {
    r = await db.cmd('show GLOBAL status;show GLOBAL variables;').run()
    let mObj = {
      Uptime: { v: '', note: '上次启动后运行时间', class: 'System' },
      Max_used_connections: { v: '', note: '历史最大连接数', class: 'Connect' },
      Max_used_connections_time: {
        v: '',
        note: '最大连接数发生的时间',
        class: 'Connect'
      },
      Innodb_buffer_pool_reads: {
        v: '',
        note: '未从缓冲池读取的次数',
        class: 'bufferCache'
      },
      Innodb_buffer_pool_read_requests: {
        v: '',
        note: '从缓冲池读取的次数',
        class: 'bufferCache'
      },
      Innodb_buffer_pool_pages_total: {
        v: '',
        note: '缓冲池的总页数',
        class: 'bufferCache'
      },
      Innodb_buffer_pool_pages_free: {
        v: '',
        note: '缓冲池空闲的页数',
        class: 'bufferCache'
      },
      Innodb_row_lock_waits: { v: '', note: '锁等待个数', class: 'lock' },
      Innodb_row_lock_time_avg: {
        v: '',
        note: '平均每次锁等待时间',
        class: 'lock'
      },
      ifLockTable: {
        v: 'show open TABLES where in_use>0',
        note: '查看是否存在表锁',
        class: 'lock'
      },
      Com_insert: { v: '', note: '从上次启动 insert 数量', class: 'statement' },
      Com_delete: { v: '', note: '从上次启动 delete 数量', class: 'statement' },
      Com_update: { v: '', note: '从上次启动 update 数量', class: 'statement' },
      Com_select: { v: '', note: '从上次启动 select 数量', class: 'statement' },
      Com_commit: {
        v: '',
        note: '从上次启动 执行的提交语句总数量',
        class: 'statement'
      },
      Com_rollback: {
        v: '',
        note: '从上次启动 执行的回退语句总数量',
        class: 'statement'
      },
      Bytes_sent: {
        v: '',
        note: '发送吞吐量',
        class: 'throughputs'
      },
      Bytes_received: {
        v: '',
        note: '接收吞吐量',
        class: 'throughputs'
      },
      slow_query_log: {
        v: '',
        note: '满查询是否打开',
        class: 'slowSQL'
      },
      long_query_time: {
        v: '',
        note: '慢查询秒数阈值',
        class: 'slowSQL'
      },
      slow_query_log_file: {
        v: '',
        note: '慢查询文件位置',
        class: 'slowSQL'
      },
      slowQueryPrint: {
        v: 'mysqldumpslow -s at -t 10 /export/data/mysql/log/slow.log',
        note: '命令行打印慢查询方式',
        class: 'slowSQL'
      }
    }

    if (Array.isArray(r)) {
      let mysqlStatus = []
      r[0].map(x => {
        if (x['Variable_name'] in mObj) {
          mObj[x['Variable_name']].v = x['Value']
        }
      })
      r[1].map(x => {
        if (x['Variable_name'] in mObj) {
          mObj[x['Variable_name']].v = x['Value']
        }
      })
      Object.assign(mObj, {
        bufferInUseRatio: {
          v:
            (
              (1 -
                mObj['Innodb_buffer_pool_reads'].v /
                  mObj['Innodb_buffer_pool_read_requests'].v) *
              100
            ).toFixed(2) + '%',
          note: '缓存命中率',
          class: 'bufferCache'
        },
        bufferPoolUseRatio: {
          v:
            (
              ((mObj['Innodb_buffer_pool_pages_total'].v -
                mObj['Innodb_buffer_pool_pages_free'].v) /
                mObj['Innodb_buffer_pool_pages_total'].v) *
              100
            ).toFixed(2) + '%',
          note: '缓存池使用率为',
          class: 'bufferCache'
        },
        totalThroughputs: {
          v: (+mObj['Bytes_sent'].v + +mObj['Bytes_received'].v).prettyBytes(),
          note: '吞吐总量',
          class: 'throughputs'
        }
      })

      for (let i in mObj) {
        mysqlStatus.push([i, mObj[i].v, mObj[i].note, mObj[i].class])
      }
      mysqlStatus = mysqlStatus.orderBy([3], ['asc'])
      htmlStr = $.tools.genTemp.gridTable(
        [
          {
            dataTitleArr: ['指标', '值', '说明', '分类'],
            dataArr: mysqlStatus,
            dataTitle: 'Mysql Monitor ' + new Date().date2Str()
          }
        ],
        'open',
        true
      )
    }
  }
  return htmlStr
}
async function getRedis () {
  if (!global.redis) {
    return ''
  }
  let r
  let htmlStr = ''

  let className = ''
  let redisArr = []
  let redisObj = {}
  let redisDescObj = {
    latency: 'Redis响应一个请求的时间',
    hitRate: '缓存命中率',
    instantaneous_ops_per_sec: '平均每秒处理请求总数',
    used_memory: '已使用内存',
    used_memory_human: '已使用内存',
    mem_fragmentation_ratio: '内存使用率',
    evicted_keys: '由于最大内存限制被移除的key数量',
    blocked_clients: '由于BLPOP,BRPOP,or BRPOPLPUSH而备阻塞的客户端',
    connected_clients: '客户端连接数',
    connected_slaves: 'slave数量',
    master_last_io_seconds_ago: '最近一次主从交互之后的秒数',
    db0: '数据库中key的情况',
    db1: '数据库中key的情况',
    db2: '数据库中key的情况',
    db3: '数据库中key的情况',
    db4: '数据库中key的情况',
    db5: '数据库中key的情况',
    db6: '数据库中key的情况',
    db7: '数据库中key的情况',
    db8: '数据库中key的情况',
    db9: '数据库中key的情况',
    db10: '数据库中key的情况',
    db11: '数据库中key的情况',
    db12: '数据库中key的情况',
    db13: '数据库中key的情况',
    db14: '数据库中key的情况',
    db15: '数据库中key的情况',
    rdb_last_save_time: '最后一次持久化保存磁盘的时间戳',
    rdb_changes_since_last_save: '自最后一次持久化以来数据库的更改数',
    rejected_connections: '由于达到maxclient限制而被拒绝的连接数',
    keyspace_hits: 'key值查找成功(命中)次数',
    keyspace_misses: 'key值查找失败(没命中)次数',
    master_link_down_since_seconds: '主从断开的持续时间(秒)',
    sync_partial_err: '从半同步复制失败的次数,是否需要增加同步缓存'
  }
  ;(await redis.info()).split('\r\n').map(x => {
    if (x.at(0) === '#') {
      className = x.slice(1)
    } else {
      if (x.length > 0) {
        let item = x.split(':')
        redisObj[item[0]] = {
          v: item[1],
          class: className
        }
        redisArr.push({
          Variable_name: item[0],
          Value: item[1],
          class: className
        })
      }
    }
  })
  redisArr = redisArr
    .filter(x => redisDescObj[x['Variable_name']])
    .map(x => [
      x['Variable_name'],
      x['Value'],
      redisDescObj[x['Variable_name']] || '',
      x['class']
    ])
  redisObj['hitRate'] = {
    v:
      (
        (+redisObj['keyspace_hits'].v /
          (+redisObj['keyspace_hits'].v + +redisObj['keyspace_misses'].v)) *
        100
      ).toFixed() + '%',
    class: redisObj['keyspace_hits'].class
  }
  redisArr.push([
    'hitRate',
    redisObj['hitRate'].v,
    redisDescObj['hitRate'],
    redisObj['hitRate'].class
  ])
  redisArr = redisArr.orderBy([3], ['asc'])
  htmlStr = $.tools.genTemp.gridTable(
    [
      {
        dataTitleArr: ['指标', '值', '说明', '分类'],
        dataArr: redisArr,
        dataTitle: 'Redis Monitor ' + new Date().date2Str()
      }
    ],
    'open',
    true
  )
  return htmlStr
}
