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
    "api": "node ./tool/api2markdown.js"
  },
  "author": "",
  "license": "MIT",
  "dependencies": {
    "amqplib": "^0.5.3",
    "ioredis": "^4.9.5",
    "j2sql": "^1.9.21",
    "j2sql2": "*",
    "kafka-node": "^4.1.3",
    "cz-jt": "*",
    "mock": "*",
    "skybase": "*",
    "skyrts": "*",
    "meeko": "*",
    "standard": "^12.0.1",
    "axios": "^0.19.0",
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
