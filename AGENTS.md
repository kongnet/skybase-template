# AGENTS.md - Skybase Template Coding Guidelines

> Guidelines for AI agents working on this skybase-template Node.js project.

## Build/Lint/Test Commands

```bash
# Run API parameter scanning
npm run apitest

# Check for SQL injection vulnerabilities
npm run inject

# Manual linting (ESLint)
npx eslint .

# Start application
node index.js

# Using PM2
pm2 start pm2_v4.config.js
```

**Note:** No standard `npm test` configured. Use `npm run apitest` for API validation.

## Project Architecture

- **Framework**: Skybase (Koa2-based) with onion middleware model
- **Database**: MySQL via j2sql2 ORM, Redis for caching
- **Structure**:
  - `router/` - Route handlers (controllers), exports object with async functions
  - `model/` - Data models, API schema definitions in `model/api/`
  - `service/` - Business logic layer
  - `middleware/` - Custom Koa middleware
  - `config/` - Environment-based configuration
  - `tool/` - Development utilities (scanners, generators)

## Code Style

### Formatting
- **Indent**: 2 spaces (from .editorconfig)
- **Line endings**: LF
- **Quotes**: Single quotes (ESLint warning)
- **Semicolons**: Optional
- **Max complexity**: 10

### Naming Conventions
- **Files**: kebab-case (e.g., `sample-middleware.js`)
- **Directories**: lowercase with hyphens (e.g., `sky-stat/`)
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE for true constants

### ESLint Rules
```json
{
  "parser": "babel-eslint",
  "rules": {
    "no-unused-vars": 1,
    "camelcase": 0,
    "curly": 2,
    "brace-style": [2, "1tbs"],
    "quotes": [1, "single"],
    "semi": [0, "always"],
    "no-console": 0,
    "complexity": [1, 10]
  }
}
```

## Code Patterns

### Controller Pattern
```javascript
/* global $ db redis */
module.exports = {
  async functionName(ctx) {
    const { param } = ctx.checkedData.data
    // Logic here
    ctx.ok('success response')
    // or ctx.throw(400, 'error message')
  }
}
```

### API Definition (model/api/)
```javascript
module.exports = {
  __swagger__: {
    name: 'API Group Name',
    description: 'Description'
  },
  endpointName: {
    name: 'Display Name',
    desc: 'Description',
    method: 'get|post|all',
    controller: 'mock.easy.getEmpty',
    param: {
      fieldName: { type: 'string', required: true, desc: 'Description' }
    },
    token: false,
    needSign: false,
    front: true
  }
}
```

### Middleware Pattern
```javascript
/* global $ redis */
module.exports = async (ctx, next) => {
  // Pre-processing
  next && (await next())
  // Post-processing (optional)
}
```

## Global Variables

Always declare globals at top of file:
```javascript
/* global $ db redis $G describe it */
```

- `$` - meeko utility library
- `db` - MySQL database connection (j2sql2)
- `redis` - Redis connection
- `$G` - Global application state

## Error Handling

- Use `ctx.ok(data)` for successful responses
- Use `ctx.throw(status, message)` for errors
- Always validate input via `ctx.checkedData.data`

## Imports

```javascript
// Built-ins first
const fs = require('fs')
const path = require('path')

// Third-party
const $ = require('meeko')
const axios = require('axios')

// Local modules
const util = require('../model/util/someUtil')
```

## Testing

Test files located in `tests/`:
- Use Mocha for testing (available as devDependency)
- Use `request-promise-native` or `axios` for HTTP testing
- Example pattern in `tests/http_test.js`

## Common Libraries

- `meeko` ($) - Primary utilities, mocking, formatting
- `j2sql2` - MySQL ORM operations
- `speakeasy` - 2FA/TOTP authentication
- `axios` - HTTP requests
- `request-promise-native` - Alternative HTTP client

## Coding Principles

- **模块化目录结构**: 创建新功能模块时，优先在以下目录创建对应的子目录：
  - `model/api/` - API 接口定义
  - `router/` - 路由处理
  - `service/` - 业务逻辑
  - `www/` - 静态资源
  例如：创建一个"用户"模块 → `model/api/user/`, `router/user/`, `service/user/`

- **优先使用 meeko**: 后续函数实现优先使用 meeko 工具库，减少手写代码。例如：
  - 数组操作使用 `$.array` 扩展方法
  - 字符串操作使用 `$.string` 扩展方法
  - 日期操作使用 `$.date` 扩展方法
  - 类型检查使用 `$.tools.isXXX` 系列函数
  - 参数校验使用 `$.tools.checkParam`
  - 延迟等待使用 `$.wait()` 或 `$.tools.wait()`

- **模块测试用例**: 既想作为模块加载，又想单独测试部分或全部函数时，使用 meeko 的 TestCase 模式：
  ```javascript
  // 定义测试用例
  const testCases = {
    testA: async () => { /* 测试逻辑 */ },
    testB: async () => { /* 测试逻辑 */ },
    all: async () => { /* 运行所有测试 */ }
  }
  // 注册 TestCase（直接运行无输出，使用 -test 参数才执行）
  new $.tools.TestCase(testCases)
  ```
  运行方式：
  - `node xxx.js` - 无输出，不执行任何测试
  - `node xxx.js -test` - 运行所有测试
  - `node xxx.js -test testA` - 运行指定测试
  - `node xxx.js -testList` - 列出所有测试用例

## Development Tools

- **API Scanning**: `npm run apitest` - Validates API parameters
- **Security Scan**: `npm run inject` - SQL injection detection
- **PM2**: Process manager config in `pm2_v4.config.js`

## Git Workflow

```bash
# Conventional changelog + commit
npm run cz

# Version bump + publish + push
npm run push
```

## Important Notes

- Chinese comments are acceptable and common in this codebase
- Always use `ctx.checkedData.data` for validated request parameters
- Controllers must be registered in API schema files
- Middleware must call `next()` to continue the chain
- Use global declarations comment for linting globals
