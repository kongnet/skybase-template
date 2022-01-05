module.exports = {
  mysql: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'test',
    pool: 1000,
    timeout: 60000,
    charset: 'utf8mb4',
    supportBigNumbers: true,
    multipleStatements: true,
    connectionLimit: 10,
    showSql: true // 使用BaseModel的才有效，打印sql
  }
}
