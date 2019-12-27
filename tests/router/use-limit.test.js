const assert = require('assert')
const request = require('request-promise-native')

const wait = (msec) => new Promise(resolve => setTimeout(resolve, msec))

describe('接口频度限制', () => {
  describe('每秒次数限制', () => {
    it('每秒只允许两次请求成功', async () => {
      const fn = async (i) => {
        const res = await request({
          uri: 'http://127.0.0.1:13000/skyapi/use-limit/feqLimit',
          method: 'get',
          json: true
        })
        return res.code === 200
      }

      const firsts = []

      firsts.push(await fn())
      await wait(500)
      firsts.push(await fn())
      firsts.push(await fn())

      assert.strictEqual(firsts.filter(d => d).length, 2)
    })
  })
  describe('接口锁限制', () => {
    it('是否只有一次能请求进去', async () => {
      const lockFn = async (i) => {
        await wait(50 - i)
        const res = await request({
          uri: 'http://127.0.0.1:13000/skyapi/use-limit/lock',
          method: 'get',
          json: true
        })
        return res.code === 200 && i
      }
      const fns = []
      for (let i = 0; i < 5; i++) {
        fns.push(lockFn(i))
      }
      const res = await Promise.all(fns)
      let succI = -1
      const succNum = res.reduce((prev, curr) => {
        if (curr !== false) {
          succI = curr
          return ++prev
        }
        return prev
      }, 0)
      console.log(`获得锁的index：${succI.toString()}`)

      assert.strictEqual(succNum, 1)
    })
    it('是否能自动解锁', async () => {
      for (let i = 0; i < 3; i++){
        const res = await request({
          uri: 'http://127.0.0.1:13000/skyapi/use-limit/lock',
          method: 'get',
          json: true
        })

        console.log('当前：', i)
        assert.strictEqual(res.code, 200)
      }

    })
  })
})
