---
name: sky-mysql
description: Skybase框架使用j2sql2库进行MySQL数据库操作，提供Promise风格的API和表级CRUD扩展。
---

# Sky-MySQL 技能文档

## 概述

Skybase框架使用j2sql2库进行MySQL数据库操作。j2sql2是对mysql2/promise的封装,提供Promise风格的API和表级CRUD扩展。

## 初始化配置

```javascript
const SkyDB = require('j2sql2')

const skyDB = new SkyDB({
  mysql: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'test',
    connectionLimit: 100,      // 连接池大小
    crudExtend: true,          // 启用CRUD扩展(自动创建ex属性)
    columnCamelize: false      // 是否自动驼峰命名转换
  }
})

// 创建MySQL实例
global.db = await skyDB.mysql
```

## 基础操作

### 1. 直接执行SQL

```javascript
// 使用预处理语句(推荐,防止SQL注入)
const result = await db.run('SELECT ? + ? AS sum', [3, 2])

// 多条SQL执行
const result = await db.run(`
  INSERT INTO users (name) VALUES ('test');
  SELECT * FROM users;
`)
```

### 2. 使用cmd构建SQL

```javascript
// 链式调用
const result = await db.cmd('SELECT * FROM users')
  .cmd('WHERE age > ?', [18])
  .cmd('ORDER BY id DESC')
  .run()

// 带参数
const result = await db.cmd('SELECT * FROM users WHERE name = ?', ['张三'])
  .run()
```

## CRUD操作

### 表对象API

j2sql2会自动加载数据库中的所有表,每个表都有C/R/U/D方法:

```javascript
// 假设有user_table表
const userTable = db.user_table
```

### Create (增)

```javascript
// 单条插入
const result = await db.user_table.C({
  username: '张三',
  email: 'zhangsan@example.com',
  age: 25
}).run()

// 防重复插入(uniqCol指定唯一列)
const result = await db.user_table.C({
  username: '张三',
  email: 'zhangsan@example.com'
}, 'username').run()  // 如果username已存在则不插入
```

### Read (查)

```javascript
// 基础查询
const list = await db.user_table.R().run()

// 条件查询
const list = await db.user_table.R({
  status: 1,
  age: { '>=': 18, '<': 60 }  // 范围查询
}).run()

// 指定列
const list = await db.user_table.R({}, {
  id: 1,
  username: 1,
  email: 1
}).run()

// 排序 + 限制条数
const list = await db.user_table.R(
  { status: 1 },           // WHERE条件
  { id: 1, username: 1 },  // SELECT列
  { created_at: -1 },      // ORDER BY (1升序,-1降序)
  100                      // LIMIT
).run()

// 单条查询
const user = await db.user_table.R({ id: 1 }).run()
```

**WHERE条件语法:**
```javascript
// 等于
{ status: 1 }

// 范围查询
{ age: { '>=': 18, '<': 60 } }

// IN查询
{ id: [1, 2, 3] }

// LIKE查询
{ username: /zhang/ }

// IS NULL
{ deleted_at: null }

// 时间范围
{ created_at: { '>=': new Date('2024-01-01') } }
```

### Update (改)

```javascript
// 基础更新
const result = await db.user_table.U(
  { id: 1 },                          // WHERE条件
  { username: '李四', age: 26 }        // SET值
).run()

// 字段自增/自减
const result = await db.user_table.U(
  { id: 1 },
  { view_count: 'view_count + 1' }     // 自增
).run()
```

### Delete (删)

```javascript
// 物理删除
const result = await db.user_table.D({ id: 1 }).run()

// 强制删除(无视条件)
const result = await db.user_table.D({}, true).run()  // 危险!
```

## CRUD扩展(ex)

启用`crudExtend: true`后,每个表会有`ex`属性,提供常用业务方法:

```javascript
// ex扩展要求表必须有以下字段:
// - d_flag: 删除标记(0正常,1删除)
// - c_time: 创建时间
// - m_time: 修改时间
```

### 扩展方法

```javascript
// 1. 列表查询(自动过滤d_flag=1)
const list = await db.user_table.ex.list(
  { status: 1 },           // WHERE
  { id: 1, username: 1 },  // SELECT列
  { c_time: -1 },          // ORDER BY
  100                      // LIMIT
)

// 2. 分页查询(游标分页,性能好)
const page = await db.user_table.ex.page(
  { status: 1 },           // WHERE
  { id: 1, username: 1 },  // SELECT列
  1,                       // pageNum 页码
  20,                      // num 每页条数
  'id',                    // 排序字段
  true                     // ifDesc 是否倒序
)

// 3. 简单分页(使用LIMIT)
const page = await db.user_table.ex.page2(
  { status: 1 },
  { id: 1, username: 1 },
  1, 20, 'id', true
)

// 4. 根据ID查询
const user = await db.user_table.ex.getById(1)

// 5. 插入
const result = await db.user_table.ex.insert({
  username: '王五',
  email: 'wangwu@example.com'
})

// 6. 更新
const result = await db.user_table.ex.update(
  { id: 1 },
  { username: '赵六' }
)

// 7. 根据ID更新
const result = await db.user_table.ex.updateById(1, { username: '赵六' })

// 8. 字段自增/自减
const result = await db.user_table.ex.addById(1, {
  view_count: 2,      // view_count + 2
  like_count: -1      // like_count - 1
})

// 9. 逻辑删除
const result = await db.user_table.ex.remove({ id: 1 })  // 设置d_flag=1

// 10. 根据ID逻辑删除
const result = await db.user_table.ex.removeById(1)

// 11. 物理删除(根据ID)
const result = await db.user_table.ex.deleteById(1)

// 12. 清理已删除数据
const result = await db.user_table.ex.clear()  // 删除d_flag=1的记录
```

## 事务操作

```javascript
// 获取连接
let conn = await db.pool.getConnection()

// 开始事务
await conn.beginTransaction()

try {
  // 执行多条SQL
  await conn.query('INSERT INTO users (name) VALUES (?)', ['张三'])
  await conn.query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [100, 1])
  await conn.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [100, 2])
  
  // 提交事务
  await conn.commit()
  console.log('事务提交成功')
} catch (e) {
  // 回滚事务
  await conn.rollback()
  console.error('事务回滚:', e)
} finally {
  // 释放连接
  await conn.release()
}
```

## 表结构信息

```javascript
// 获取表的字段列表
db.user_table.field        // ['id', 'username', 'email', ...]

// 获取表的字段类型
db.user_table.type         // ['int', 'varchar', 'varchar', ...]

// 获取驼峰映射
db.user_table.fieldCamel   // { id: 'id', user_name: 'userName', ... }

// 获取生成的SQL(不执行)
const sql = db.user_table.R({ id: 1 }).get()
console.log(sql)  // SELECT * FROM `user_table` WHERE `id`=1;
```

## 批量操作

```javascript
// 批量插入(使用genData生成测试数据)
await db.genData('user_table', 10000)  // 生成1万条测试数据

// 或使用事务批量插入
let conn = await db.pool.getConnection()
await conn.beginTransaction()

try {
  let c = 10000
  while (c--) {
    await conn.query(
      'INSERT INTO user_table (username, age) VALUES (?, ?)',
      [`user_${c}`, Math.floor(Math.random() * 100)]
    )
  }
  await conn.commit()
} catch (e) {
  await conn.rollback()
} finally {
  await conn.release()
}
```

## 高级查询

### 复杂WHERE条件

```javascript
// 多条件组合
const list = await db.user_table.R({
  status: 1,
  age: { '>=': 18, '<=': 60 },
  created_at: { '>=': new Date('2024-01-01') },
  username: /zhang/,  // LIKE '%zhang%'
  id: [1, 2, 3, 4, 5]  // IN (1,2,3,4,5)
}).run()
```

### 使用cmd构建复杂SQL

```javascript
const result = await db.cmd(`
  SELECT 
    u.*,
    COUNT(o.id) as order_count
  FROM user_table u
  LEFT JOIN orders o ON u.id = o.user_id
  WHERE u.status = ?
  GROUP BY u.id
  HAVING order_count > ?
  ORDER BY u.created_at DESC
  LIMIT ?, ?
`, [1, 5, 0, 20]).run()
```

## 错误处理

```javascript
try {
  const result = await db.user_table.C({
    username: '张三'
  }).run()
} catch (e) {
  // j2sql2会返回详细错误信息
  console.error('SQL错误:', e.message)
  console.error('错误SQL:', e.sql)
}

// 或使用全局错误处理
const result = await db.user_table.C({...}).run()
if (result.errCode) {
  console.error('操作失败:', result.msg)
}
```

## 性能优化

1. **使用连接池**: 配置`connectionLimit`
2. **使用预处理语句**: `db.run(preSql, params)`
3. **分页查询**: 使用`ex.page`代替大偏移量LIMIT
4. **只查需要的列**: 指定SELECT列
5. **添加索引**: 为常用查询字段添加索引

## 最佳实践

1. **始终使用预处理语句**防止SQL注入
2. **业务删除使用逻辑删除**(d_flag)而非物理删除
3. **批量操作使用事务**保证数据一致性
4. **查询指定列**而非SELECT *
5. **使用ex扩展方法**简化CRUD操作
6. **启用crudExtend**获得完整功能
