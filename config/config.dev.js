module.exports = {
  mysql: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'test',
    pool: 100,
    timeout: 60000,
    charset: 'utf8mb4',
    supportBigNumbers: true,
    bigNumberStrings: true,
    multipleStatements: true,
    connectionLimit: 100,
    showSql: true // 使用BaseModel的才有效，打印sql
  }
}
