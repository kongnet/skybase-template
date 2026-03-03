---
name: sky-base
description: Skybase是基于Koa2的企业级Node.js Web框架，提供完整的MVC架构、API管理、参数校验、数据统计等能力。
---

# Sky-Base Framework Skill

## Overview

Skybase是基于Koa2的企业级Node.js Web框架，提供完整的MVC架构、API管理、参数校验、数据统计等能力。

## Directory Structure

```
project/
├── config/                 # 配置文件目录
│   ├── config.default.js   # 默认配置
│   ├── config.development.js
│   └── config.production.js
├── middleware/             # 中间件目录(Koa2洋葱皮模式)
├── model/                  # 业务基础类和API定义
│   └── api/                # API定义目录(重要!)
│       ├── mock.js
│       └── skyapi/
│           └── xxx.js
├── router/                 # 路由实现目录(重要!)
│   ├── mock/
│   └── skyapi/
├── service/                # 业务逻辑层目录(重要!)
│   └── sky-stat/
├── lib/                    # 公共函数库(代码超500行时抽取)
├── template/               # 模板文件目录
├── www/                    # 静态页面目录
├── tool/                   # 工具脚本目录
├── ai-tmp/                 # 测试临时文件目录
├── index.js                # 入口文件
└── skyconfig.js            # skybase配置
```

## Usage

### 1. API Definition

**Location**: `model/api/`目录下

```javascript
// model/api/skyapi/demo.js
module.exports = {
  __swagger__: {
    name: 'Demo API',
    description: '演示API模块'
  },
  
  // 接口定义
  getList: {
    name: '获取列表',
    desc: '获取用户列表数据',
    method: 'get',
    controller: 'demo/list.getList',
    param: {
      page: {
        name: '页码',
        desc: '当前页码',
        type: 'int',
        req: 0,
        def: 1
      },
      size: {
        name: '每页条数',
        desc: '每页显示数量',
        type: 'int',
        req: 0,
        def: 20,
        size: [1, 100]
      }
    },
    token: false,
    needSign: false,
    front: true
  }
}
```

**API路径规则:**
- 普通定义: `域名/skyapi/文件名/属性名`
- 绝对路径: `属性名以'/'开头` → `域名/属性名`

### 2. Router Implementation

**Location**: `router/`目录下

```javascript
// router/demo/list.js
'use strict'
/* global $ db $G rts redis */

const demoService = require('../../service/demo/demo.js')

module.exports = {
  getList
}

async function getList (ctx) {
  const r = await demoService.getList(ctx.checkedData.data)
  
  if (!r || r.code !== 0) {
    ctx.throwCode(r.code || 500, r.msg || '服务器错误')
    return
  }
  
  ctx.ok(r.data)
}
```

### 3. Service Layer

**Location**: `service/`目录下

```javascript
// service/demo/demo.js
'use strict'
/* global $ db redis */

module.exports = {
  getList
}

async function getList (params) {
  const { page, size } = params
  
  try {
    const data = await db.user_table.R({}, {}, { id: -1 }, size).run()
    
    return { 
      code: 0, 
      data: {
        list: data,
        page,
        size
      }
    }
  } catch (e) {
    $.err(e)
    return { code: 500, msg: '查询失败' }
  }
}
```

### 4. Entry Point

```javascript
// index.js
const sky = require('skybase')
let config = require('./config')
const skyConfig = require('./skyconfig')
const $ = require('meeko')
const SkyDB = require('j2sql2')

config.beforeMount = async () => {
  const skyDB = new SkyDB({ mysql: config.mysql, redis: config.redis })
  global.db = await skyDB.mysql
  global.redis = await skyDB.redis
  global.rts = await require('skyrts')({
    redis: redis,
    redisAsync: redis,
    gran: '5m, 1h, 1d, 1w, 1M, 1y',
    points: 1000,
    prefix: 'project-name'
  })
}

config = Object.assign(config, skyConfig)
sky.start(config, async () => {
  console.log('项目启动成功')
})
```

## Module Creation Flow

When creating a new module:

```bash
# 1. Create API definition directory
mkdir -p model/api/skyapi/{module-name}

# 2. Create router directory
mkdir -p router/{module-name}

# 3. Create service directory
mkdir -p service/{module-name}

# 4. Create lib directory (if needed)
mkdir -p lib/{module-name}
```

## Configuration Files

### config.default.js
```javascript
module.exports = {
  name: 'project-name',
  port: 13000,
  
  // MySQL配置
  mysql: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'test',
    connectionLimit: 100,
    crudExtend: true
  },
  
  // Redis配置
  redis: {
    host: '127.0.0.1',
    port: 6379,
    auth: '',
    db: 0,
    keyLimit: ['*']
  },
  
  // RabbitMQ配置
  rabbitMQ: {
    host: '127.0.0.1',
    port: 5672,
    user: 'guest',
    password: 'guest',
    queue: 'queue_name'
  }
}
```

### skyconfig.js
```javascript
module.exports = {
  middlewares: [
    'sky-cors',
    'sky-body-parse',
    'sky-static-server',
    'sky-check-param',
    'sky-check-token',
    'sky-output',
    'sky-api-register'
  ],
  apiDir: './model/api',
  routerDir: './router',
  serviceDir: './service'
}
```

## Code Standards

1. **Global variables declaration**: `/* global $ db $G rts redis */`
2. **Use single quotes**, 2-space indentation
3. **Service return format**: `{ code: 0, data: ... }` or `{ code: 400, msg: 'error' }`
4. **Controller usage**: `ctx.ok(data)` or `ctx.throwCode(code, msg)`
5. **Error handling**: Use try-catch for async operations, `$.err(e)` for logging
6. **Prefer meeko library** for utilities
7. **Code > 500 lines**: Extract to lib directory

## Built-in Middleware

- `sky-cors` - Cross-origin handling
- `sky-body-parse` - Body parsing
- `sky-static-server` - Static file serving
- `sky-check-param` - API parameter validation
- `sky-check-token` - Token validation
- `sky-output` - Request logging
- `sky-api-register` - API route registration

## Startup Commands

```bash
# Development mode
nodemon

# With config
nodemon index.js

# Production mode
NODE_ENV=production node index.js
```

## Supported Parameter Types

- `int` - Integer
- `positive` - Positive integer
- `negative` - Negative integer
- `string` - String (auto trim)
- `datetime` - DateTime
- `file` - File type (requires size/fileType)
- `enum` - Enum type (requires size array)
- `bool` - Boolean
- `number` - Number
- `array` - Array type (can specify items)
- `object` - Object type
