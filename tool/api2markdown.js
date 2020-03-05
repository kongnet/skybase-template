/**
 * api描述文件直接生成markdown文件
 *
 * 之前是根据swagger的json来生成 markdown，不怎么自由
 *
 * ps. 这里会根据每个api描述文件来分组，生成的文件主要是给 docsify 使用
 * */

const $ = require('meeko')
const path = require('path')
const fs = require('fs')
const util = require('util')
const pack = require('../package.json')

const apiDir = path.join(__dirname, '../model/api')
const docsifyPath = `../www/markdown/` // markdown文件输出文件夹
const apiDocPath = `apis/` // markdown文件输出文件夹

const hFs = {
  // 给文件/文件夹重命名，成功返回true，否则返回false
  async rename (oldPath, newPath) {
    try {
      return !(await util.promisify(fs.rename)(oldPath, newPath))
    } catch (e) {
      return false
    }
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
   * 创建多级目录，如果成功，或者目录早已存在，则返回true，否则返回false
   * @param dir string 需要创建的文件夹
   * @return boolean
   * */
  async mkdir (dir) {
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
  }
}

// markdown主模板
// const mdTemp = `# JS_title_
//
// JS_description_
//
// JS_apis_
//
// `

// 每组参数的模板
const paramTemp = `

**JS_type_参数**：

JS_paramsTable_

`
// 每个接口的模板
const apiTemp = `
### JS_apiName_

JS_api_description_

**地址**： \`JS_apiPath_\`

**方法**： \`JS_method_\`

JS_allTypeOfParams_

JS_returnDesc_

---
`

// 根据swagger json数据描述创建markdown格式的参数说明表
function createMDFromDataDesc (desc, parentPath = '') {
  const lines = []
  const data = [
    parentPath + (parentPath && desc.name ? '.' : '') + (desc.name || ''),
    desc.required ? 'true' : 'false',
    desc.type || '-',
    desc.description ? desc.description.replace(/\n[\w\W]*/, '') : '-' // 描述里有可能有换行，在这里无需换行的参数
  ]

  if (data.type === 'array' && !data[0]) {
    data[0] = 'array'
  }
  if (data[0]) {
    lines.push(data)
  }
  if (desc.items) {
    lines.push(...createMDFromDataDesc(desc.items, data[0] + '[0]'))
  } else if (desc.properties) {
    for (const [k, v] of Object.entries(desc.properties)) {
      v.name = k
      lines.push(...createMDFromDataDesc(v, data[0]))
    }
  }
  return lines
}

/**
 * 生成表格
 * @param datas 第一个是表头，后面的是每行
 * */
function createTable (datas) {
  return datas
    .map(item => {
      return (
        '| ' +
        item
          .map(t =>
            t.replace ? t.replace(/\|/g, '\\|').replace(/\n/g, '<br>') : t
          )
          .join(' | ') +
        ' |'
      )
    })
    .join('\n')
}

// 生成markdown的格式
async function generate (apiDir, apiPath = '') {
  const markdowns = {}

  const files = fs.readdirSync(apiDir)
  for (const file of files) {
    const thisApiPath = `${apiPath}/${file.split('.')[0]}`.replace(
      /^\/+|\/+$/g,
      ''
    )
    const dir = path.join(apiDir, file)
    const stat = fs.statSync(dir)
    if (stat.isDirectory()) {
      // 是文件夹
      const mds = await generate(dir, thisApiPath)
      Object.assign(markdowns, mds)
    } else {
      const apis = require(dir)

      const group = {
        name:
          (apis['__swagger__'] && apis['__swagger__'].name) ||
          thisApiPath.replace(/\//g, '_'), // 默认以文件名作为组名
        description:
          (apis['__swagger__'] && apis['__swagger__'].description) || '',
        apiMDs: []
      }

      for (const [p, opt] of Object.entries(apis)) {
        const path = (p.indexOf('/') === 0
          ? p
          : `${apiPath}/${file.split('.')[0]}/${p}`
        )
          .split('/')
          .filter(v => !!v)
          .join('/')
        const api = await generateOneApi(`/${path}`, opt)
        if (api) {
          group.apiMDs.push(api)
        }
      }

      if (group.apiMDs.length) {
        markdowns[thisApiPath.replace(/\//g, '_')] = {
          name: group.name,
          md: `${group.description} \n\n` + group.apiMDs.join('\n\n')
        }
      }
    }
  }

  return markdowns
}

async function generateOneApi (path, apiConf) {
  if (!apiConf['front']) {
    // 不是给前端用的接口
    return
  }
  if (!apiConf['method']) {
    console.log(`${path}无method属性，跳过此api`)
    return
  }

  // path = path.replace(/\/+$/, '') // 把后面的 / 去掉

  const method = apiConf['method'].toUpperCase()

  // 遍历参数
  const allParams = {}
  if (apiConf['token']) {
    allParams['header'] = [
      ['参数名', '必须', '类型', '默认值', '说明'],
      ['---:', ':---:', ':---:', ':---', ':---'],
      ['token', 'true', 'string', '', 'token值']
    ]
  }
  if (apiConf['param']) {
    for (const [name, opt] of Object.entries(apiConf['param'])) {
      const paramIn =
        (opt.isPath && 'path') ||
        (method === 'GET' && 'query') ||
        'formData 或 raw-JSON' // swagger对body支持得不好，算了吧
      if (!allParams[paramIn]) {
        allParams[paramIn] = [
          ['参数名', '必须', '类型', '默认值', '说明'],
          ['---:', ':---:', ':---:', ':---', ':---']
        ]
      }

      const paramType =
        (typeof opt.type === 'string' && opt.type) ||
        (opt.type.name && opt.type.name.toLowerCase()) ||
        'string'

      allParams[paramIn].push([
        name,

        (opt.req === undefined ? !!opt.required : !!opt.req) ? '是' : '否',

        paramType,

        `默认：${opt.def === undefined ? '无' : JSON.stringify(opt.def)}\n` +
          (paramType === 'enum'
            ? `枚举：\`${opt.size.join('`\n`')}\``
            : opt.size
            ? `最小：${opt.size[0]}${
                paramType === 'string' ? 'B' : ''
              } \n最大：${opt.size[1]}${paramType === 'string' ? 'B' : ''}`
            : '') +
          (opt.match || opt.reg
            ? `\n正则：\`${(opt.match || opt.reg).toString()}\``
            : ''),

        (opt.name ? `**${opt.name}**\n` : '') + (opt.desc || '')
      ])
    }
  }
  const allParamArr = []
  for (const [posi, params] of Object.entries(allParams)) {
    allParamArr.push(
      paramTemp
        .replace('JS_type_', posi)
        .replace('JS_paramsTable_', createTable(params))
    )
  }

  // 遍历返回值说明
  const allReturns = []
  if (apiConf['err_code'] && Object.keys(apiConf['err_code']).length) {
    for (let [code, data] of Object.entries(apiConf['err_code'])) {
      if (data.schema) {
        // 其实data这里可以直接写数据的类型，但是有可能有时候写错了，就把类型描述写到schema里去了
        const schema = data.schema
        delete data.schema
        data = { ...data, ...schema }
      }
      allReturns.push(
        '**' +
          code +
          '返回说明**：' +
          (data.type || '') +
          '\n\n' +
          (data.description || '') +
          '\n'
      )

      // 返回示例
      if (data.temp) {
        const jsonStr = JSON.stringify(data.temp, undefined, 2)
        allReturns.push('```json\nJS_temp_\n```'.replace('JS_temp_', jsonStr))
      }

      // 返回字段说明
      const descs = [
        ['参数名', '必须', '类型', '说明'],
        [':---', ':---:', ':---:', ':---']
      ]
      descs.push(...createMDFromDataDesc(data))
      allReturns.push(createTable(descs))
    }
  }

  return apiTemp
    .replace('JS_apiName_', apiConf['name'] || apiConf['desc'])
    .replace('JS_api_description_', apiConf['desc'] || '')
    .replace('JS_apiPath_', path)
    .replace('JS_method_', method)
    .replace('JS_allTypeOfParams_', allParamArr.join('\n'))
    .replace('JS_returnDesc_', allReturns.join('\n')) // 返回值的表格说明
}

// 把markdown数据存到文件
async function saveMDs (mds) {
  const time = $.now().format('YYYYMMDDHHmmss')
  const fileDir = `${docsifyPath}${apiDocPath}newest/`

  const historys = await readFiles(path.join(__dirname, fileDir))

  const catalog = []
  const catalogTemp = '* [JS_name_](/JS_path_)'

  const historyFileName = await updateHistory(mds, historys, time)

  if (!historyFileName) {
    return '' // 接口未改变，无需更新文档
  }
  catalog.push(
    catalogTemp
      .replace('JS_name_', '文档版本')
      .replace('JS_path_', historyFileName)
  )

  // 把旧的文件存起来
  await hFs.rename(
    path.join(__dirname, fileDir),
    path.join(__dirname, `${docsifyPath}${apiDocPath}${time}/`)
  )

  for (const [name, md] of Object.entries(mds)) {
    const filePath = path.join(__dirname, fileDir, `${name}.md`)
    if (await hFs.saveFile(filePath, md.md)) {
      catalog.push(
        catalogTemp
          .replace('JS_name_', md.name)
          .replace('JS_path_', `${apiDocPath}newest/${name}`)
      )
    }
  }

  await updateSideBar(catalog)

  await hFs.saveFile(path.join(__dirname, fileDir, `_navbar.md`), '') // docsify 会读这个文件夹里的这个配置

  return path.join(__dirname, fileDir)
}

// 更新导航栏
async function updateSideBar (catalog) {
  const mark = '<!-- 自动添加 -->'
  // const markForReg = mark.replace(/([!])/g, '\\$1')

  const filePath = path.join(__dirname, docsifyPath, '_sidebar_template.md')
  const sideBar = ((await hFs.readFile(filePath)) || '').toString()
  // .replace(new RegExp(`\\n*${markForReg}[\\w\\W]*${markForReg}`, 'g'), '') // 删掉自动添加的内容，现在使用template文件了不会有自动添加的

  return hFs.saveFile(
    path.join(__dirname, docsifyPath, '_sidebar.md'),
    sideBar + `\n${mark}\n\n${catalog.join('\n')}\n\n${mark}`
  )
}

// 更新历史记录
async function updateHistory (nowDatas, historys, historyApiDir) {
  let totalApiNum = 0
  const historyFileName = `history.md`
  const historyFile = path.join(__dirname, `${docsifyPath}`, historyFileName)
  const today = $.now().format('YYYY年MM月DD日HHmm')
  const historyTexts = [
    `### \`${pack.version}\` ${today} \`最新\``,
    `&ensp;&ensp;&ensp;&ensp;共${totalApiNum}个接口`
  ]
  const colorMap = {
    GET: '#57b382',
    POST: '#f47023'
  }
  for (const [name, md] of Object.entries(nowDatas)) {
    const nowApis = await analysisMD(md.md)
    const oldApis =
      historys[`${name}_md`] && (await analysisMD(historys[`${name}_md`]))

    for (const [path, api] of Object.entries(nowApis)) {
      if (!api.method) {
        console.error('从新接口的md解析后，丢失了method：', {
          path,
          api,
          md: md.md
        })
        continue
      }
      totalApiNum++
      const url = `/${apiDocPath}newest/${name}?id=${encodeURIComponent(
        api.name
      )}`
      const METHOD = span(
        api.method.toUpperCase(),
        colorMap[api.method.toUpperCase()] || 'red'
      )
      if (!oldApis || !oldApis[path]) {
        historyTexts.push(
          `&ensp;&ensp;&ensp;&ensp;${span(
            '新增',
            '#7ad839'
          )} ${METHOD} [${path} ${api.name}](${url})`
        )
      } else if (nowApis[path].md !== oldApis[path].md) {
        historyTexts.push(
          `&ensp;&ensp;&ensp;&ensp;${span(
            '修改',
            '#0075e2'
          )} ${METHOD} [${path} ${api.name}](${url})`
        )
      }
    }
  }

  for (const [name, md] of Object.entries(historys)) {
    const nowApis =
      nowDatas[name.replace('_md', '')] &&
      (await analysisMD(nowDatas[name.replace('_md', '')].md))
    const oldApis = await analysisMD(md)

    for (const [path, api] of Object.entries(oldApis)) {
      if (!nowApis || !nowApis[path]) {
        const METHOD = api.method.toUpperCase()
        historyTexts.push(
          `&ensp;&ensp;&ensp;&ensp; 移除 ~~${METHOD} ${path} ${api.name}~~`
        )
      }
    }
  }

  historyTexts[1] = `&ensp;&ensp;&ensp;&ensp;共${totalApiNum}个接口`

  const hadChange = historyTexts.length > 2
  if (hadChange) {
    historyTexts[1] += `，本次更新${historyTexts.length - 2}个`
    let nowHistoryText = ((await hFs.readFile(historyFile)) || '')
      .toString()
      .replace(/`最新`/g, '')
    // 要把历史的链接都换成老链接，方便跳转回去看老版本
    if (historyApiDir) {
      nowHistoryText = nowHistoryText.replace(
        new RegExp(
          `\\]\\(\\/${apiDocPath.replace(/\//g, '\\/')}newest\\/`,
          'g'
        ),
        `](/${apiDocPath}${historyApiDir}/`
      )
    }
    await hFs.saveFile(
      historyFile,
      historyTexts.join('\n\n') + '\n\n' + nowHistoryText
    )
  }

  return hadChange && historyFileName
}

// 启动
async function start () {
  const mds = await generate(apiDir)

  const filePath = await saveMDs(mds)
  if (filePath) {
    // 移动README文件
    const data = await hFs.readFile(path.join(__dirname, '../README.md'))
    if (data) {
      await hFs.saveFile(
        path.join(__dirname, '../www/markdown/README.md'),
        data
      )
    }
  }
  return filePath
}

start()
  .then(function (filePath) {
    console.log(`编译完成`)
    if (filePath) {
      console.log(`MARKDOWN文件位于：`, filePath)
    } else {
      console.log(`接口无变化，无需更新文档`)
    }
  })
  .catch(function (err) {
    console.log(`出错了：${err.message}`)
    console.log(err)
    console.log(err.stack)
  })

// 获取一组历史接口
async function readFiles (dir) {
  const files = (await hFs.readdir(dir)) || []
  const modules = {}
  for (const file of files) {
    const [name, ext] = file.split('.')
    const key = `${name}${ext ? `_${ext}` : ''}`
    try {
      if (ext) {
        modules[key] = (
          (await hFs.readFile(path.join(dir, file))) || ''
        ).toString()
      } else {
        // 是一个文件夹
        modules[key] = await readFiles(path.join(dir, name))
      }
    } catch (e) {
      modules[key] = false
    }
  }
  return modules
}

// 分析一个markdown，把里面的接口解析出来
async function analysisMD (md) {
  if (!md) {
    return {}
  }
  const lines = md.split(/\n+/)
  const data = {}
  let nowApiName = ''
  let nowApiUrl = ''
  let nowApiAllMD = []
  for (const l of lines) {
    if (nowApiName) {
      nowApiAllMD.push(l)
    }
    // 接口名
    if (/###.+/.test(l)) {
      // 新发现了一个接口，就把已发现的MD内容放回上一个接口里去
      if (nowApiUrl && nowApiAllMD.length) {
        data[nowApiUrl].md = nowApiAllMD.join('\n')
      }
      nowApiAllMD = []
      nowApiName = l.match(/###\s?(.*)/)[1]
      continue
    }
    // 接口地址
    if (/\*\*地址\*\*：.+/.test(l)) {
      nowApiUrl = l.match(/\*\*地址\*\*：\s?`?([^`]*)`?/)[1]
      data[nowApiUrl] = { name: nowApiName }
      continue
    }

    if (!nowApiUrl) {
      continue
    }

    // 接口类型
    if (/\*\*方法\*\*：.+/.test(l)) {
      data[nowApiUrl].method = l.match(/\*\*方法\*\*：\s?`?([^`]*)`?/)[1]
    }
  }

  if (nowApiUrl && nowApiAllMD.length) {
    data[nowApiUrl].md = nowApiAllMD.join('\n')
  }
  nowApiAllMD = []

  return data
}

function span (text, color = 'red', bold = true) {
  return `<span style="${
    bold ? 'font-weight: bold;' : ''
  }color: ${color};">${text}</span>`
}
