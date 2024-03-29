{
  "name": "{{d.proName}}",
  "version": "{{d.proVersion}}",
  "description": "{{d.proDesc}}",
  "main": "index.js",
  "scripts": {
    "start": "nodemon index.js",
    "test": "mocha ./tests/*.js",
    "testapi": "node ./tool/scanNoParam.js",
    "cz": "git add . && git status && git cz",
    "api": "node ./tool/api2markdown.js",
    "swagger": "node ./tool/api2swagger.js"
  },
  "author": "",
  "license": "MIT",
  "dependencies": {
    "amqplib": "*",
    "ioredis": "^4.9.5",
    "j2sql2": "*",
    "cz-jt": "*",
    "mockjs": "*",
    "skybase": "*",
    "skyrts": "*",
    "meeko": "*",
    "standard": "^12.0.1",
    "axios": "*",
    "request": "^2.88.0",
    "request-promise-native": "^1.0.7",
    "svg-captcha": "^1.4.0",
    "speakeasy": "*"
  },
  "devDependencies": {
    "mocha": "^6.2.0"
  },
    "config": {
    "commitizen": {
      "path": "./node_modules/cz-jt"
    }
  }
}
