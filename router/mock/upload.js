const fs = require('fs')
const Config = require('../../config')
const crypto = require('crypto')
let sharp
try {
  sharp = require('sharp')
  sharp.cache(false)
} catch (e) {
  $.log($.c.y('⚠️'), '有文件处理，一般涉及sharp模块，未安装')
  sharp = function () {}
}
function md5 (str) {
  const decipher = crypto.createHash('md5')
  return decipher.update(str).digest('hex')
}
function resizeImg (file, w, h) {
  // 需要sharp
  sharp(file)
    .resize(w, h)
    .jpeg()
    .toFile(file + `_${w}x${h}.jpg`)
  return 1
}
const uploadRule = {
  demo: {
    allowType: ['image/png', 'image/jpg', 'image/jpeg'], // 去除可传任意文件。允许的后缀 必须是mime值，这边可以和api配置同步
    size: 1024 * 1024 * 5, // 5M 注意总的上传字节限制在index和nginx，这边可以和api配置同步
    path: 'demo',
    nameRule: function () {
      // 文件名的生成算法
      return $.fake.randStr(18).toUp()
    }
  },
  banner: {
    allowType: ['image/png', 'image/jpg', 'image/jpeg'], // 允许的后缀 必须是mime值
    size: 1024 * 1024 * 0.3, // 300KB
    path: 'banner',
    nameRule: function () {
      return Date.now()
    }
  },
  avatar: {
    allowType: ['image/png', 'image/jpg', 'image/jpeg'], // 允许的后缀 必须是mime值
    size: 1024 * 1024 * 0.1, // 100KB
    path: 'avatar',
    nameRule: function (s) {
      return md5(s + 'avatar')
    }
  },
  ip: {
    allowType: ['image/png', 'image/jpg', 'image/jpeg'], // 允许的后缀 必须是mime值
    size: 1024 * 1024 * 0.05,
    path: 'ip',
    nameRule: function (s) {
      return s + '_' + md5(+new Date() + 'ip')
    }
  },
  person: {
    allowType: ['image/png', 'image/jpg', 'image/jpeg'], // 允许的后缀 必须是mime值
    size: 1024 * 1024 * 0.05,
    path: 'person',
    nameRule: function (s) {
      return s + '_' + md5(+new Date() + 'person')
    }
  }
}
/* global $ */
module.exports = {
  async demo (ctx) {
    const data = ctx.request.fields
    const file = data.file && data.file[0]
    const rule = uploadRule.demo
    const fileName = rule.nameRule() // 文件名产生规则
    let fileFullName
    $.log('demo upload')
    if (file) {
      if (rule.allowType && rule.allowType.indexOf(file.type) < 0) {
        ctx.throwCode(400, '文件类型不允许.')
        return
      }
      if (rule.size < file.size) {
        ctx.throwCode(400, '文件长度大于限制.')
        return
      }
      fileFullName = fileName
      const fileFullPath = `${__dirname}/../../www/${Config.upload_path ||
        'upload'}/${rule.path}/${fileFullName}`
      fs.createReadStream(file.path)
        .pipe(fs.createWriteStream(fileFullPath))
        .on('close', function () {
          $.log('uploadDemoFile finish')
          // resizeImg(fileFullPath, 128, 128) 安装sharp的话，缩放图片
        })
    }
    ctx.response.set('Access-Control-Allow-Origin', '*')
    ctx.ok({
      name: fileFullName,
      size: file.size,
      type: file.type
    })
  }
}
