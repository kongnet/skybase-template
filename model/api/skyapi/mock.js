/**
 * 测试mock数据内容
 * 参考网址 ： http://mockjs.com/examples.html
 * */

module.exports = {
  __swagger__: {
    name: 'mock数据接口',
    description: 'mock数据接口 - 在mock基础上扩展了若干模拟函数'
  },
  first: {
    name: '模拟函数返回测试',
    desc: '模拟函数返回测试支持get/post',
    method: 'all',
    controller: '',
    param: {},
    mock: {
      // 属性 list 的值是一个数组，其中含有 1 到 10 个元素
      'list|1-2': [
        {
          // 属性 id 是一个自增数，起始值为 1，每次增 1
          'id|+1': 100,
          name: '@genName()',
          str: "@genData('abcdefghijklmnopqrstuvwxyz',10)",
          datetime: "@genDatetime('2016-1-1', '2020-1-1')",
          chineseCard: '@genCard()',
          url: '@genUrl(5)',
          phoneNum: '@genPhone()',
          color: '@genColor()',
          colorRGBA: "@genColor('rgba')",
          ip: '@genIp()',
          word10: '@genWord(10)',
          word1: '@genWord()',
          sentence20: '@genText()',
          sentence30: '@genText(30)',
          sentence10: '@genText(10)',
          sentence1000: '@genText(1000)',
          genBeautyText: '@genBeautyText()',
          constellation: '@genConstellation()',
          bool: '@genBool()',
          genEnum1: "@genEnum(['5',6,7])",
          genEnum2: "@genEnum(['5x','6x','7x'])",
          genEnum3: "@genEnum([[],null,''])",
          img:
            "@genEnum(['https://','http://'])resource.xxx.com/@genData('0123456789',11)/company/moments/@genData('abcdefghijklmnopqrstuvwxyz0123456789',32).jpeg",
          bingImg:
            'https://uploadbeta.com/api/pictures/random/?key=BingEverydayWallpaperPicture',
          skuCode: /NO-\d{4}-\d{4}-\d{2}/,
          arrList: '@genList(10)',
          arrList2: '@genList(10,2)',
          svg: '@genImg()',
          svg1: '@genImg({isText:"n"})',
          svg2: '@genImg({size:"100"})',
          'list|5-10': [/\d{8,8}/]
        }
      ]
    },
    err_code: {
      200: {
        temp: {
          data: {},
          code: 0,
          msg: 'ok',
          t: 1559204889719
        },
        properties: {
          data: {
            type: 'Object|Array',
            description: '对象或数组,建议统一返回对象',
            required: true
          },
          code: {
            type: 'Number',
            description: '200-500 或者 业务自定义代码',
            required: true
          },
          msg: {
            type: 'String',
            description: '非国际化消息说明',
            required: true
          },
          t: {
            type: 'Number',
            description: '时间戳',
            required: true
          }
        }
      }
    },
    test: {},
    token: false,
    needSign: false,
    front: true
  },
  captcha: {
    name: '验证码返回',
    desc: '验证码返回',
    method: 'get',
    controller: 'mock/img.captcha',
    param: {},
    test: {},
    token: false,
    needSign: false,
    front: true
  },
  img: {
    name: '模拟函数widthxheight图片',
    desc: '模拟函数图片',
    method: 'get',
    controller: 'mock/img.genImg',
    param: {
      size: {
        name: 'widthxheight',
        desc: '图片长宽',
        def: '100x100',
        type: 'string'
      }
    },
    test: {},
    token: false,
    needSign: false,
    front: true
  },
  getEmpty: {
    name: 'getEmpty',
    desc: 'getEmpty',
    method: 'get',
    controller: 'mock/easy.getEmpty',
    param: {},
    test: {},
    token: false,
    needSign: false,
    front: true
  },
  getSign: {
    name: 'getSign',
    desc: 'getSign',
    method: 'get',
    controller: 'mock/easy.getSign',
    param: {
      t: {
        name: 't',
        desc: '时间戳',
        type: 'int',
        req: 0 // 即使不必填也需要有，想看./middleware/sample-middleware.js
      },
      sign: {
        name: 'sign',
        desc: 'sign算法得到的hash值',
        type: 'string',
        req: 0 // 即使不必填也需要有，想看./middleware/sample-middleware.js
      }
    },
    test: {},
    token: false,
    needSign: true,
    front: true
  },
  getHtml: {
    name: 'getHtml',
    desc: 'getHtml',
    method: 'get',
    controller: 'mock/easy.getHtml',
    param: {},
    test: {},
    token: false,
    needSign: false,
    front: true
  },
  getUrl: {
    name: 'getUrl',
    desc: 'getUrl',
    method: 'get',
    controller: 'mock/easy.getUrl',
    param: {
      url: {
        name: 'url',
        desc: '获取url内容',
        def: 'http://www.baidu.com',
        type: 'string'
      }
    },
    test: {},
    token: false,
    needSign: false,
    front: true
  },
  getBing: {
    name: 'getBing',
    desc: 'getBing',
    method: 'get',
    controller: 'mock/easy.getBing',
    param: {},
    test: {},
    token: false,
    needSign: false,
    front: true
  },
  echo: {
    name: 'echo',
    desc: 'echo',
    method: 'post',
    controller: 'mock/easy.echo',
    param: {
      str: {
        name: 'str',
        desc: 'echo的字符串',
        type: 'string'
      }
    },
    test: {},
    token: false,
    needSign: false,
    front: true
  },
  qrcode: {
    name: 'qrcode',
    desc: '二维码生成',
    method: 'get',
    controller: 'mock/easy.qrcode',
    param: {
      str: {
        name: 'str',
        desc: 'qrcode的字符串',
        type: 'string'
      }
    },
    test: {},
    token: false,
    needSign: false,
    front: true
  },
  upload: {
    name: '上传',
    desc: '上传图片',
    method: 'post',
    controller: 'mock/upload.demo',
    param: {
      jsonstr: {
        name: 'jsonstr',
        desc: 'file同时提交的jsonstr',
        type: 'string',
        req: 1
      },
      file: {
        name: 'file',
        desc: '上传的file对象',
        type: 'file',
        size: [0, 1024 * 1024 * 0.5],
        fileType: ['image/png', 'image/jpg', 'image/jpeg'],
        req: 1
      }
    },
    test: {},
    token: false,
    needSign: false,
    front: true
  },
  googleQR: {
    name: 'google验证二维码添加',
    desc: 'google验证二维码添加',
    method: 'get',
    controller: 'mock/easy.googleQR',
    param: {},
    test: {},
    token: false,
    needSign: false,
    front: true
  },
  googleVerify: {
    name: 'google验证',
    desc: 'google验证',
    method: 'get',
    controller: 'mock/easy.googleVerify',
    param: {
      userToken: {
        name: 'userToken',
        desc: 'userToken字符串',
        type: 'string'
      }
    },
    test: {},
    token: false,
    needSign: false,
    front: true
  }
}
