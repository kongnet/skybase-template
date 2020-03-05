module.exports = {
  __swagger__: {
    name: '测试用例接口',
    description: '测试用例接口'
  },
  mysql: {
    name: 'mysql探针数据',
    desc: 'mysql探针数据',
    method: 'get',
    controller: 'mysqlProbe.getTableColumnSize',
    param: {
      outputType: {
        name: '输出类型',
        desc: '接口输出html或者json',
        def: 'html',
        type: 'string'
      }
    },
    token: false,
    needSign: false,
    err_code: {},
    test: {},
    front: true
  },
  mysqlTree: {
    name: 'mysql探针数据',
    desc: 'mysql探针数据',
    method: 'get',
    controller: 'mysqlProbe.getDbTable',
    param: {
      outputType: {
        name: '输出类型',
        desc: '接口输出html或者json',
        def: 'html',
        type: 'string'
      }
    },
    token: false,
    needSign: false,
    err_code: {},
    test: {},
    front: true
  },
  mysqlGrid: {
    name: 'mysql探针数据',
    desc: 'mysql探针数据',
    method: 'get',
    controller: 'mysqlProbe.getDbTableColumn',
    param: {
      outputType: {
        name: '输出类型',
        desc: '接口输出html或者json',
        def: 'html',
        type: 'string'
      }
    },
    token: false,
    needSign: false,
    err_code: {},
    test: {},
    front: true
  },
  getMysqlData: {
    name: '获取mysql数据',
    desc: '获取mysql数据',
    method: 'post',
    controller: 'mysqlProbe.getMysqlData',
    param: {
      instanceName: {
        name: '默认实例名',
        desc: '默认全局实例变量名',
        def: 'db',
        req: 1,
        type: 'string'
      },
      queryStr: {
        name: '查询字符串',
        desc: '查询字符串',
        req: 1,
        type: 'string'
      },
      accessToken: {
        name: '指定密码',
        desc: '指定密码',
        req: 1,
        type: 'string'
      }
    },
    token: false,
    needSign: false,
    err_code: {},
    test: {},
    front: true
  }
}
