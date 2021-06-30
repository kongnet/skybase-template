module.exports = {
  __swagger__: {
    name: '相关统计接口',
    description: '相关统计接口'
  },
  getAll: {
    name: '获取所有统计',
    desc: '获取所有接口调用总数，每个接口1h的count执行最长max时长 执行min时长 avg时长',
    method: 'get',
    controller: 'sky-stat/stat.getAll',
    param: {
      type: {
        name: '输出类型 [api-输出输出 mix-html输出]',
        desc: '直接输出html界面',
        req: 0,
        def: 'api',
        type: 'string'
      }
    },
    token: false,
    needSign: false,
    err_code: {},
    test: {},
    front: true
  },
  getSome: {
    name: '获取某几个统计',
    desc: '获取指定列表中 api1h同getAll一样的数据',
    method: 'get',
    controller: 'sky-stat/stat.getSome',
    param: {
      apiList: {
        name: '输出api列表名称 jsonStr',
        desc: '输出api列表名称 jsonStr 例：["_test", "_test1_test2"]',
        req: 1,
        def: null,
        type: 'string'
      },
      type: {
        name: '输出类型 [api-输出输出 mix-html输出]',
        desc: '直接输出html界面',
        req: 0,
        def: 'api',
        type: 'string'
      }
    },
    token: false,
    needSign: false,
    err_code: {},
    test: {},
    front: true
  },
  getOne: {
    name: '获取单个统计',
    desc: '获取指定api 5m 24个点，1h 24个点,1d 30个点',
    method: 'get',
    controller: 'sky-stat/stat.getOne',
    param: {
      api: {
        name: 'api名称',
        desc: '指定api名称  例： _test',
        req: 1,
        def: null,
        type: 'string'
      },
      type: {
        name: '输出类型 [api-输出输出 mix-html输出 chart-html只有图表]',
        desc: '直接输出html界面',
        req: 0,
        def: 'api',
        type: 'string'
      }
    },
    token: false,
    needSign: false,
    err_code: {},
    test: {},
    front: true
  },
  getSpecialKeys: {
    name: '获取指定几个key相应数据',
    desc: '获取指定几个key相应数据 5m 24个点，1h 24个点,1d 30个点',
    method: 'get',
    controller: 'sky-stat/stat.getSpecialKeys',
    param: {
      keyList: {
        name: '输出key列表名称 jsonStr',
        desc: '输出key列表名称 jsonStr 例：["_test", "_test1_test2"]',
        req: 1,
        def: null,
        type: 'string'
      },
      count5m: {
        name: '相应5m展示个数',
        desc: '相应5m展示个数',
        req: 0,
        def: 24,
        type: 'number'
      },
      count1h: {
        name: '相应1h展示个数',
        desc: '相应1h展示个数',
        req: 0,
        def: 24,
        type: 'number'
      },
      count1d: {
        name: '相应1d展示个数',
        desc: '相应1d展示个数',
        req: 0,
        def: 30,
        type: 'number'
      }
    },
    token: false,
    needSign: false,
    err_code: {},
    test: {},
    front: true
  }
}
