'use strict'

const logPrex = '【自动编译swagger文件】' // 执行本文件时打印的log的前缀
const apiDocPath = '../www/swagger/jsons/' // json文件输出文件夹

// ----- 配置结束 -----

const path = require('path')
const util = require('util')
const fs = require('fs')

const $ = require('meeko')

const pack = require('../package.json')

// 默认拿测试环境的配置
process.env.NODE_ENV = (process.argv && process.argv[2]) || 'test'

const hfs = {
  // 复制文件， 如果目标文件已存在，会覆盖
  async copyFile () {
    try {
      await util.promisify(fs.copyFile)(...arguments)
      return true
    } catch (e) {
      console.log(e)
      return false
    }
  },

  // 给文件/文件夹重命名，成功返回true，否则返回false
  async rename (oldPath, newPath) {
    try {
      return !(await util.promisify(fs.rename)(oldPath, newPath))
    } catch (e) {
      return false
    }
  },

  /**
   * 创建多级目录，如果成功，或者目录早已存在，则返回true，否则返回false
   * @param dir string 需要创建的文件夹
   * @param isRecursion Boolean 外部无需使用，是递归的标志位
   * @return boolean
   * */
  async mkdir (dir, isRecursion) {
    if (!dir) {
      return false
    }
    try {
      await util.promisify(fs.mkdir)(dir, {
        recursive: true
      })
      return true
    } catch (e) {
      let msg = '文件夹创建失败：'
      if (e.code === 'EEXIST') {
        return true
      } else if (e.code === 'ENOENT') {
        // 它的上级目录不存在，只有 recursive 不为true才会有这种情况
        msg = '上级目录不存在：'
      }
      console.log(msg, e.code, e.message)
    }
    return false
  },

  /**
   * 保存文件
   *
   * ps. 这个方法默认会覆盖文件全部内容
   *
   * @param filePath string 文件路径，要含文件名和扩展名，反正这个方法里不会自动给你加
   * @param fileData string | buffer 可以是字符串，也可以是buffer，是要保存的内容
   * @return boolean 保存成功还是失败
   * */
  saveFile (filePath, fileData) {
    return this.mkdir(
      filePath
        .split(path.sep)
        .slice(0, -1)
        .join(path.sep)
    ).then(function (succ) {
      if (!succ) {
        return false
      }

      return new Promise((resolve, reject) => {
        if (!(fileData instanceof Buffer)) {
          fileData = Buffer.from(fileData)
        }

        // 块方式写入文件
        const wstream = fs.createWriteStream(filePath)

        wstream.on('open', () => {
          const blockSize = 128
          const nbBlocks = Math.ceil(fileData.length / blockSize)
          for (let i = 0; i < nbBlocks; i++) {
            const currentBlock = fileData.slice(
              blockSize * i,
              Math.min(blockSize * (i + 1), fileData.length)
            )
            wstream.write(currentBlock)
          }

          wstream.end()
        })
        wstream.on('error', err => {
          console.log('文件存储失败：', err)
          resolve(false)
        })
        wstream.on('finish', () => {
          resolve(true)
        })
      })
    })
  },

  /**
   * 读取文件
   * */
  async readFile (filePath) {
    try {
      return await util.promisify(fs.readFile)(filePath)
    } catch (e) {
      return false
    }
  },

  // 读取目录
  async readdir (path, options) {
    try {
      return await util.promisify(fs.readdir)(path, options)
    } catch (e) {
      return false
    }
  }
}

const collection = $.requireAll(path.join(__dirname, '../model/api'))

if (!pack.author || !pack.author.name || !pack.author.email) {
  console.log(
    `${logPrex}package.json文件联系人未填写完整，示例： {author:{name:'xxx',email:'xx@xx.cn'}}`
  )
}

// swagger JSON 的例子 生成时请参看下列结构
const swagger = {
  swagger: '2.0',
  info: {
    title: `${pack.name}接口文档`,
    description: pack.description, // 文档概述
    version: pack.version,
    contact: {
      name: (pack.author && pack.author.name) || '',
      email: (pack.author && pack.author.email) || ''
    }
  },
  schemes: ['http', 'https'],
  host: [process.argv[2] || '127.0.0.1:13000'], // 域名，不以 / 结尾
  basePath: '//',
  consumes: [
    // 接收的数据类型
    'application/x-www-form-urlencoded',
    'application/json'
  ],
  produces: [
    // 返回的数据类型
    'application/json'
  ],
  tags: [
    // 标签，在swagger里，以组的形式展示，所有接口都可以放在标签里
    {
      name: '分组名',
      description: '分组描述',
      externalDocs: {
        // 更多，可以点击这个链接找到更多
        description: '0个接口',
        url: ''
      }
    }
  ],
  paths: {
    '/pet/findByStatus': {
      post: {
        deprecated: false, // 是否已弃用
        tags: ['分组名'], // 该接口放在哪个标签里
        summary: 'Finds Pets by status', // 接口名
        description: '接口描述',
        operationId: 'findPetsByStatus', // 该接口描点名称
        consumes: [
          // 接收的数据类型
          'application/json'
        ],
        produces: ['application/json'],
        parameters: [
          // {
          //   name: 'sid', // 参数名
          //   in: 'path', // 是queryString还是body，可选：query/body/path/formData/header
          //   description: '数组参数示例',
          //   required: true,
          //   allowEmptyValue: false, // 允许为空
          //   type: 'string' // 参数类型，可选：array/string/integer/file
          // }, {
          //   name: 'status', // 参数名
          //   in: 'query', // 是queryString还是body，可选：query/body/path/formData/header
          //   description: '数组参数示例',
          //   required: true,
          //   allowEmptyValue: true, // 允许为空
          //   type: 'array', // 参数类型，可选：array/string/integer/file
          //   items: { // 类型为array的话，要填每个item的类型
          //     type: 'string',
          //     enum: [ // 每个值的可选类型
          //       'available',
          //       'pending',
          //       'sold'
          //     ],
          //     default: 'available', // 默认值
          //     format: 'date-time' // 格式，如果是string，则可选：date/date-time
          //   },
          //   collectionFormat: 'multi' // 看不懂，没用的吧
          // },
          {
            name: 'obj', // 参数名
            in: 'body', // 是queryString还是body，可选：query/body/path/formData/header
            description: '对象参数示例',
            required: false,
            allowEmptyValue: true, // 允许为空
            type: 'object', // 参数类型，可选：array/string/integer/file
            properties: {
              // 类型为array的话，要填每个item的类型
              prop1: {
                type: 'string',
                description: '测试1',
                required: true,
                enum: [
                  // 每个值的可选类型
                  'available',
                  'pending',
                  'sold'
                ],
                default: 'available' // 默认值
              },
              prop2: {
                type: 'string',
                enum: [
                  // 每个值的可选类型
                  'available',
                  'pending',
                  'sold'
                ],
                default: 'available' // 默认值
              }
            }
          }
        ],
        responses: {
          200: {
            description: '成功',
            schema: {
              type: 'array',
              items: {
                return1: {
                  name: 'obj', // 参数名
                  in: 'body', // 是queryString还是body，可选：query/body/path/formData/header
                  description: '对象参数示例',
                  required: false,
                  allowEmptyValue: true, // 允许为空
                  type: 'object', // 参数类型，可选：array/string/integer/file
                  properties: {
                    // 类型为array的话，要填每个item的类型
                    prop1: {
                      type: 'string',
                      enum: [
                        // 每个值的可选类型
                        'available',
                        'pending',
                        'sold'
                      ],
                      default: 'available', // 默认值
                      format: 'date-time' // 格式，如果是string，则可选：date/date-time
                    }
                  }
                }
              }
            }
          },
          400: {
            description: '错误描述'
          }
        }
      }
    }
  },
  definitions: {
    // 所有接口都默认这种格式的输出
    Default: {
      description:
        '所有接口返回的JSON数据最外层均为此结构，其他地方就不重复补充了',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'integer',
            description: '状态码'
          },
          msg: {
            type: 'string',
            description: '状态描述'
          },
          data: {
            description:
              '该字段在不同接口下，可能为字符串、数组、对象、数字、布尔值',
            type: 'object' // 参数类型，可选：array/string/integer/file
          }
        }
      }
    },
    DefaultPage: {
      description:
        '所有接口返回的JSON数据最外层均为此结构，其他地方就不重复补充了',
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'integer',
            description: '状态码,业务返回码'
          },
          msg: {
            type: 'string',
            description: '状态描述'
          },
          t: {
            type: 'integer',
            description: '时间戳'
          },
          data: {
            $ref: '#/definitions/Page'
          }
        }
      }
    },
    Page: {
      description:
        '分页接口的data字段都是这种数据结构，其他地方就直接描述list数组内的item类型了',
      type: 'object', // 参数类型，可选：array/string/integer/file
      properties: {
        list: {
          description: '具体数据数组，items一般是对象',
          type: 'array', // 参数类型，可选：array/string/integer/file
          items: {
            type: 'object',
            properties: {}
          }
        },
        more_page: {
          type: 'boolean',
          description: '是否有下一页'
        },
        page: {
          type: 'integer',
          description:
            '当前返回的是第几页。除非前端传入的page参数小于0，否则此值会与前端传入的一致',
          minLength: 1
        },
        page_size: {
          type: 'integer',
          description:
            '当前每页多少条数据。除非前端传入的此值小于0，或者后端不允许一次性查太多数据，否则此值与前端传入的一致',
          minLength: 1
        },
        total: {
          type: 'integer',
          description:
            '一共有多少条数据，如果传入的need_total_num为0或不传，此值固定为-1',
          minLength: 0
        }
      }
    }
  }
}

// 启动
async function start () {
  await editSwagger()
  return createApiDoc()
}

// 提取swagger
async function editAPI (tagName, apis, tags, paths, pPath = '') {
  let tag = apis['__swagger__'] || {}
  tag = {
    name: tagName,
    description: '',
    ...tag,
    externalDocs: {
      description: '0个接口'
    }
  }

  let apiNum = 0

  // 遍历接口
  for (let [path, apiConf] of Object.entries(apis)) {
    if (!apiConf['front']) {
      // 不是给前端用的接口
      continue
    }
    if (!apiConf['method']) {
      console.log(`${logPrex}${path}无method属性，跳过此api`)
      continue
    }
    apiNum++

    path = path.replace(/\/+$/, '') // 把后面的 / 去掉
    if (path.charAt(0) !== '/') {
      path = pPath === '' ? path : `${pPath}/${path}`
    }

    const method = apiConf['method'].toUpperCase()

    // 遍历参数
    const parameters = []
    if (apiConf['param']) {
      if (apiConf['token']) {
        parameters.push({
          name: 'token',
          description: 'token值' + '\n\n**参数位置**：`header`',
          in: 'header',
          required: true,
          type: 'string'
        })
      }
      if (apiConf['needSign']) {
        parameters.push(
          {
            name: 'sign',
            description: '签名' + '\n\n**参数位置**：`header`',
            in: (method === 'GET' && 'query') || 'formData',
            required: true,
            type: 'string'
          },
          {
            name: 'account',
            description: '调用接口的账号' + '\n\n**参数位置**：`header`',
            in: (method === 'GET' && 'query') || 'formData',
            required: true,
            type: 'string'
          },
          {
            name: 'noncestr',
            description: '随机字符串' + '\n\n**参数位置**：`header`',
            in: (method === 'GET' && 'query') || 'formData',
            required: true,
            type: 'string'
          },
          {
            name: 'timestamp',
            description: '0时区1970年至今的秒数' + '\n\n**参数位置**：`header`',
            in: (method === 'GET' && 'query') || 'formData',
            required: true,
            type: 'string'
          }
        )
      }
      for (const [name, opt] of Object.entries(apiConf['param'])) {
        const paramIn =
          (opt.isPath && 'path') || (method === 'GET' && 'query') || 'formData' // swagger对body支持得不好，算了吧
        if (paramIn === 'path') {
          path += `/{${name}}`
        }
        const param = {
          name: name, // 参数名
          in: paramIn, // 是queryString还是body，可选：query/body/path/formData/header
          description:
            (opt.desc || '') +
            `\n\n**参数位置**：\`${paramIn}\`` +
            (opt.match || opt.reg
              ? `\n\n**匹配正则**：\`${(opt.match || opt.reg).toString()}\``
              : '') +
            (opt.err || opt.message
              ? `\n\n**错误提示**：\`${opt.err || opt.message}\``
              : ''),
          required: opt.req === undefined ? !!opt.required : !!opt.req,
          // allowEmptyValue: true, // 允许为空，好像这个参数被遗弃了
          type:
            (typeof opt.type === 'string' && opt.type) ||
            (opt.type.name && opt.type.name.toLowerCase()) ||
            'string' // 参数类型，可选：array/string/integer/file
        }
        if (opt.def !== undefined && opt.def !== null) {
          param.default = opt.def
        }
        if (opt.items) {
          // 类型为array的话，要填每个item的类型
          param.items = opt.items
          param.collectionFormat = 'multi'
        }
        if (opt.properties) {
          // 类型为object的话，要填每个item的类型
          param.properties = opt.properties
        }
        parameters.push(param)
      }
    }

    const resp = {
      default: {
        $ref: apiConf['isPage']
          ? '#/definitions/DefaultPage'
          : '#/definitions/Default'
      },
      ...(apiConf['err_code'] || {})
    }

    if (!paths[path]) {
      paths[path] = {}
    }
    let methodObj = {
      tags: [tag.name],
      summary: apiConf['name'] || apiConf['desc'],
      description: apiConf['desc'] || '',
      operationId: path.replace(/\//g, '_'),
      consumes: [
        // 接收的数据类型
        'application/x-www-form-urlencoded',
        'application/json'
      ],
      produces: ['application/json'],
      parameters: parameters,
      responses: resp
    }
    if (apiConf['method'].toLowerCase() === 'all') {
      let getObj = JSON.parse(JSON.stringify(methodObj))
      getObj.operationId += '-get'
      paths[path]['get'] = getObj
      let postObj = JSON.parse(JSON.stringify(methodObj))

      methodObj.operationId += '-post'
      paths[path]['post'] = postObj
    } else {
      paths[path][apiConf['method']] = methodObj
    }
  }

  if (apiNum) {
    tag.externalDocs.description = `${apiNum}个接口`
    tags.push(tag)
  }
}

// 递归查找swagger
async function findAPI (collection, tags, paths, path = '') {
  for (const [tagName, apis] of Object.entries(collection)) {
    if (apis['__swagger__']) {
      await editAPI(
        tagName,
        apis,
        tags,
        paths,
        path === '' ? tagName : `${path}/${tagName}`
      )
    } else {
      await findAPI(
        apis,
        tags,
        paths,
        tagName,
        path === '' ? tagName : `${path}/${tagName}`
      )
    }
  }
}
// 根据 model/api 修改
async function editSwagger () {
  const tags = []
  const paths = {}
  await findAPI(collection, tags, paths)
  swagger.tags = tags
  swagger.paths = paths
}

// 创建apiDoc的JSON文件
async function createApiDoc () {
  const apiDocs = (await getAllHistory()) || []
  if (apiDocs.length) {
    const nowData = JSON.stringify(swagger)
    const lastApiDoc = require(`${apiDocPath}${apiDocs[apiDocs.length - 1]}`)
    if (lastApiDoc.info.description) {
      lastApiDoc.info.description = lastApiDoc.info.description.replace(
        /\n\n\n###\s文档版本：[\w\W]*/,
        ''
      ) // 把以前的历史都去掉
    }
    if (JSON.stringify(lastApiDoc) === nowData) {
      console.log(`${logPrex}文档无改变`)
      return
    }
  }

  const fileName = `${pack.name}_${$.now().format('YYYY_MM_DD_HH_mm_ss')}.json`

  // 把历史记录加进去，倒序
  apiDocs.push(fileName)
  apiDocs.reverse()

  const filePath = path.join(__dirname, apiDocPath, fileName)
  await hfs.saveFile(filePath, JSON.stringify(swagger))
  await hfs.saveFile(
    path.join(__dirname, apiDocPath, 'index.js'),
    `window.newestApiDoc = '${fileName}'`
  )
  return filePath
}

// 找到所有历史swagger api文档
async function getAllHistory () {
  const apiDocs = (await hfs.readdir(path.join(__dirname, apiDocPath))) || []
  apiDocs.splice(apiDocs.indexOf('index.js'), 1)
  return apiDocs
}

function span (text, color = 'red', bold = true) {
  return `<span style="${
    bold ? 'font-weight: bold;' : ''
  }color: ${color};">${text}</span>`
}

start()
  .then(function (filePath) {
    console.log(`${logPrex}编译完成`)
    if (filePath) {
      console.log(`${logPrex}JSON文件位于：`, filePath)
    }
  })
  .catch(function (err) {
    console.log(`${logPrex}出错了：${err.message}`)
    console.log(err.stack)
  })
