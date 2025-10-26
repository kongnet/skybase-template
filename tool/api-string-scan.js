'use strict'
const { method } = require('bluebird')
/* global describe */
/* global it */
const $ = require('meeko')
const path = require('path')
const proPath = '..'
const proCnf = require(path.join(proPath, 'config'))
const skyCnf = require('skybase/skyconfig.js')
let apiCnf = $.requireAll(path.join(__dirname, proPath, skyCnf.apiDir))
/*
0 show all rows of table
1 around string
2 union injection
3 blind injection
4 multi injection/ drop table
*/
let injArr = [
  ['00', '-9 OR 1=1'],
  ['01', '-9 OR 1=1 -- '],
  ['02', '-9 OR 1=1 #'],
  ['03', '9 OR 1=1'],
  ['04', '9 OR 1=1 -- '],
  ['05', '9 OR 1=1 #'],
  ['06', "user1' OR 1=1"],
  ['07', "user1' OR 1=1 -- "],
  ['08', "user1' OR 1=1 #"],
  ['10', "user1'-- and pwd='123456' "],
  ['11', "user1'# and pwd='123456'"],
  ['12', "user1'-- and pwd='affcd'"],

  ['20', "%' UNION SELECT 1,concat(username,0x3a,password) FROM users--"],
  ['21', "%' UNION SELECT 1,concat(username,0x3a,password) FROM users"],
  ['30', "1' AND SUBSTRING((SELECT password FROM users WHERE id=1),1,1)='a'--"],
  ['31', "1' AND SUBSTRING((SELECT password FROM users WHERE id=1),1,1)='a'"],
  [
    '32',
    "user1' AND SUBSTRING((SELECT password FROM users WHERE id=1),1,1)='a'--"
  ],
  [
    '33',
    "user1' AND SUBSTRING((SELECT password FROM users WHERE id=1),1,1)='a'"
  ],
  ['40', "user1'; DROP TABLE orders;--"],
  ['41', '1; DROP TABLE orders;']
]
let apiArr = []
function objWalk (o, path = '') {
  if (!$.tools.isObject(o)) return
  for (let i in o) {
    if ($.tools.isObject(o[i])) {
      if (i === '__swagger__') {
        continue
      }
      if (!o[i].method) {
        objWalk(o[i], [path, i].join('/'))
      } else {
        apiArr.push([path, i, o[i]?.param])
      }
    }
  }
}
objWalk(apiCnf, '')

let apiParamObjArr = []
let apiParamArr = apiArr.filter(it => {
  if (!$.tools.ifObjEmpty(it[2])) {
    for (let i in it[2]) {
      if (it[2][i].type.toLow() === 'string') {
        apiParamObjArr.push({
          router: it[0],
          method: it[1],
          param: i,
          tips: !it[2][i].reg ? 'noRegSet' : ''
        })
        if (it[2][i].reg) {
          console.log('sss')

          let injIndex = injArr
            .filter(x => {
              return new RegExp(it[2][i].reg).test(x[1])
            })
            .map(x => x[0])
            .join(' ')
          console.log(injIndex)
          apiParamObjArr.at(-1).tips += injIndex
        }
      }
    }
    return it
  }
})
$.drawTable(apiParamObjArr, [20, 15, 15, 60])
/*

describe('接口无参数提交', async () => {
  newApiArr.forEach(x=> {
    let xArr = x.split('/')
    xArr.shift()
        let url = `http://127.0.0.1:${proCnf.port || 13000}${x}`
        it(`${url}`, async () => {
          let apiObj = $.tools.objByString(apiCnf,xArr.join('.'))
          let r = await request({
            uri: url,
            method: apiObj.method === 'all' ? 'get' : apiObj.method || 'get'
          })
          let data
          try{
            data = JSON.parse(r || '{}')
          } catch(e){
            data={}
          }
          assert.notStrictEqual(data.code||0, 500)
        })

  })
})
*/
