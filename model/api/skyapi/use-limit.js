module.exports = {
  __swagger__: {
    name: '使用limit',
    description: ''
  },
  'lock': {
    name: '使用接口锁示例',
    desc: '特点：同一时间本接口只能被调用一次，只有等到本次执行完成才能调用下一次。',
    method: 'get',
    controller: 'use-limit.lock',
    limit: {
      unlockWhileComplete: true, // 是否在接口执行完成后解锁，默认true
      code: 666, // 可以指定同一时间多次调用时返回的内容
      msg: '前面有人在执行哦',
      expire: 6000 // 自动解锁时间，默认5000毫秒
    },
    param: {},
    'token': false,
    'needSign': false,
    'err_code': {},
    'test': {},
    'front': true
  },
  'feqLimit': {
    name: '使用接口频率控制',
    desc: '特点： 设置每隔多久允许执行下一次，与上一个例子的区别仅是接口执行完后是否自动解锁',
    method: 'get',
    controller: 'use-limit.feqLimit',
    limit: {
      unlockWhileComplete: false, // 是否在接口执行完成后解锁
      expire: 500 // 自动解锁时间，默认5000毫秒
    },
    param: {},
    'token': false,
    'needSign': false,
    'err_code': {},
    'test': {},
    'front': true
  }
}
