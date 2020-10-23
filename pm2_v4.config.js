/**
 * pm2 的配置文件 4进程负载 不建议使用 cluster模式
 * */
const Package = require('./package.json')
const port = []
const appName = []
const apps = []
const env = 'test'
for (let i = 0; i < 4; i++) {
  port.push(13000 + i)
  appName.push(Package.name + ':' + env + ':' + port[i])
  apps.push({
    name: appName[i],
    script: 'index.js',
    kill_timeout: 10000,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    log_date_format: 'YYYY-MM-DD HH:mm:ss SSS',

    // 默认启动这个环境
    env: {
      NODE_ENV: env,
      node_port: port[i]
    }
  })
}

module.exports = {
  apps
}
