module.exports = {
  __swagger__: {
    name: '使用limit',
    description: ''
  },
  notLimit: {
    name: '使用接口锁示例',
    desc:
      '特点：同一时间本接口只能被调用一次，只有等到本次执行完成才能调用下一次。',
    method: 'get',
    controller: 'use-limit.lock',
    param: {},
    token: false,
    needSign: false,
    err_code: {},
    test: {},
    front: true
  },
  lock: {
    name: '使用接口锁示例',
    desc:
      '特点：同一时间本接口只能被调用一次，只有等到本次执行完成才能调用下一次。',
    method: 'get',
    controller: 'use-limit.lock',
    limit: {
      unlockWhenComplete: true, // 是否在接口执行完成后解锁，默认true。开启后，如果接口早于 expire 指定的时间执行完毕，会马上释放锁
      code: 666, // 可以指定同一时间多次调用时返回的内容
      msg: '您的请求正在排队...',
      expire: 6000 // 自动解锁时间，默认5000毫秒。
    },
    param: {},
    token: false,
    needSign: false,
    err_code: {},
    test: {},
    front: true
  },
  feqLimit: {
    name: '使用接口频率控制',
    desc:
      '特点： 设置每隔多久允许执行下一次，与上一个例子的区别仅是接口执行完后是否自动解锁',
    method: 'get',
    controller: 'use-limit.feqLimit',
    limit: {
      unlockWhenComplete: false, // 是否在接口执行完成后解锁。关闭后，接口会在 expire 设定的时间后允许再次被调用，无论上一次该接口是否已经执行完毕。
      code: 666, // 可以指定同一时间多次调用时返回的内容
      msg: '您的请求过快，请稍后再试...',
      expire: 500 // 自动解锁时间，默认5000毫秒
    },
    param: {},
    token: false,
    needSign: false,
    err_code: {},
    test: {},
    front: true
  }
}
