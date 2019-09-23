'use strict'
/* global $ */

const Mock = require('mockjs')
Mock.Random.extend($.Mock) // 加载meeko中 mock扩展函数

module.exports = {
  noMock,
  mockRouter,
  mock
}

function noMock () {
  return function (ctx) {
    ctx.ok('controller未定义 & mock未定义')
  }
}

function mockRouter (mockModels) {
  return function (ctx) {
    ctx.ok(Mock.mock(mockModels))
  }
}

function mock (mockModels) {
  return Mock.mock(mockModels)
}
