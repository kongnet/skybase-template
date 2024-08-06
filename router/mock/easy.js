/* global $ */
/*
此处使用 request-promise-native来获取
let request = require('request-promise-native')
async function req (url = 'http://www.baidu.com', isJson = false, proxy) {
  let body = await request({
    method: 'GET',
    uri: url,
    json: isJson,
    timeout: 2000,
    https_proxy: proxy,
    headers: {
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng;q=0.8,application/signed-exchange;v=b3',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
      Cookie:
        'BIDUPSID=0E4678CB6E4BCAE5798DAE469EDA6E95; BAIDUID=E8E2EF29B5D469301338A9AD7104E8D2:FG=1; PSTM=1558438957; BD_UPN=12314753; BDUSS=1FwTWxpdFJoMm9IVTR-WjU3Qkx4UnBIbmR-aHhrb3pOb1p0N2dDdjZFbWdOZ3hkSVFBQUFBJCQAAAAAAAAAAAEAAACWffJMS8zsxr0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKCp5FygqeRcU; BDORZ=B490B5EBF6F3CD402E515D22BCDA1598; BD_HOME=1; delPer=0; BD_CK_SAM=1; ZD_ENTRY=baidu; pgv_pvi=4272933888; pgv_si=s1855449088; locale=zh; yjs_js_security_passport=67f2dccc01b63751a423a47e779c047992b6c1a8_1565661859_js; BDRCVFR[feWj1Vr5u3D]=I67x6TjHwwYf0; H_PS_PSSID=26524_1425_21106_29073_29523_29519_29098_29567_28833_29220; COOKIE_SESSION=257_0_8_9_1_16_0_3_5_4_0_6_0_0_3_0_1565662917_0_1565662914%7C9%23169278_21_1562301560%7C6; BDRCVFR[S4-dAuiWMmn]=mk3SLVN4HKm; PSINO=6; BDSVRTM=24; sugstore=1; H_PS_645EC=fcc6stWXxov8krAL6l4bp6mAvY66LWMqV6PuIYMh%2BjYGC6dxrUuZwigXIkzEVP%2B9mA'
    }
  })
  return body
}
*/
const $ = require('meeko')
const fs = require('fs')
const path = require('path')
const speakeasy = require('speakeasy')
const request = require('axios')
async function req (url = 'http://www.baidu.com', isJson = false, proxy) {
  const body = await request({
    method: 'GET',
    url: url,
    responseType: 'json',
    timeout: 2000,
    proxy: proxy,
    headers: {
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng;q=0.8,application/signed-exchange;v=b3',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
      Cookie:
        'BIDUPSID=0E4678CB6E4BCAE5798DAE469EDA6E95; BAIDUID=E8E2EF29B5D469301338A9AD7104E8D2:FG=1; PSTM=1558438957; BD_UPN=12314753; BDUSS=1FwTWxpdFJoMm9IVTR-WjU3Qkx4UnBIbmR-aHhrb3pOb1p0N2dDdjZFbWdOZ3hkSVFBQUFBJCQAAAAAAAAAAAEAAACWffJMS8zsxr0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKCp5FygqeRcU; BDORZ=B490B5EBF6F3CD402E515D22BCDA1598; BD_HOME=1; delPer=0; BD_CK_SAM=1; ZD_ENTRY=baidu; pgv_pvi=4272933888; pgv_si=s1855449088; locale=zh; yjs_js_security_passport=67f2dccc01b63751a423a47e779c047992b6c1a8_1565661859_js; BDRCVFR[feWj1Vr5u3D]=I67x6TjHwwYf0; H_PS_PSSID=26524_1425_21106_29073_29523_29519_29098_29567_28833_29220; COOKIE_SESSION=257_0_8_9_1_16_0_3_5_4_0_6_0_0_3_0_1565662917_0_1565662914%7C9%23169278_21_1562301560%7C6; BDRCVFR[S4-dAuiWMmn]=mk3SLVN4HKm; PSINO=6; BDSVRTM=24; sugstore=1; H_PS_645EC=fcc6stWXxov8krAL6l4bp6mAvY66LWMqV6PuIYMh%2BjYGC6dxrUuZwigXIkzEVP%2B9mA'
    }
  })
  return body
}
module.exports = {
  async getEmpty (ctx) {
    ctx.ok('返回正常')
  },
  async getSign (ctx) {
    const { t, sign } = ctx.checkedData.data
    ctx.ok(['通过验签', t, sign]) // 这里时间用t参数
  },
  async getHtml (ctx) {
    ctx.type = 'html'
    ctx.body = '<H1>Hello World</H1>'
  },
  async getEchartHtml (ctx) {
    ctx.type = 'html'
    let r = fs.readFileSync(
      path.join(__dirname, '../../template/echart-responsive-box.html')
    )
    let data = [
      '53.99161065013451',
      '46',
      '53',
      '58',
      '51',
      '58',
      '67',
      '73',
      '82',
      '81',
      '78',
      '74',
      '83',
      '83',
      '80',
      '76',
      '81',
      '71',
      '72',
      '75',
      '72',
      '73',
      '77',
      '77',
      '79',
      '79',
      '81',
      '81',
      '90',
      '80',
      '72',
      '72',
      '71',
      '80',
      '81',
      '71',
      '79',
      '88',
      '86',
      '93',
      '85',
      '89',
      '90',
      '92',
      '92',
      '99',
      '90',
      '99',
      '103',
      '97',
      '103',
      '112',
      '113',
      '119',
      '110',
      '119',
      '111',
      '108',
      '109',
      '117',
      '117',
      '114',
      '107',
      '110',
      '111',
      '105',
      '97',
      '92',
      '88',
      '95',
      '85',
      '95',
      '100',
      '102',
      '107',
      '114',
      '108',
      '111',
      '113',
      '120',
      '112',
      '110',
      '116',
      '112',
      '121',
      '113',
      '116',
      '116',
      '116',
      '114',
      '105',
      '99',
      '89',
      '80',
      '85',
      '87',
      '80',
      '72',
      '63',
      '65'
    ]
    let date = [
      '1968/10/4',
      '1968/10/5',
      '1968/10/6',
      '1968/10/7',
      '1968/10/8',
      '1968/10/9',
      '1968/10/10',
      '1968/10/11',
      '1968/10/12',
      '1968/10/13',
      '1968/10/14',
      '1968/10/15',
      '1968/10/16',
      '1968/10/17',
      '1968/10/18',
      '1968/10/19',
      '1968/10/20',
      '1968/10/21',
      '1968/10/22',
      '1968/10/23',
      '1968/10/24',
      '1968/10/25',
      '1968/10/26',
      '1968/10/27',
      '1968/10/28',
      '1968/10/29',
      '1968/10/30',
      '1968/10/31',
      '1968/11/1',
      '1968/11/2',
      '1968/11/3',
      '1968/11/4',
      '1968/11/5',
      '1968/11/6',
      '1968/11/7',
      '1968/11/8',
      '1968/11/9',
      '1968/11/10',
      '1968/11/11',
      '1968/11/12',
      '1968/11/13',
      '1968/11/14',
      '1968/11/15',
      '1968/11/16',
      '1968/11/17',
      '1968/11/18',
      '1968/11/19',
      '1968/11/20',
      '1968/11/21',
      '1968/11/22',
      '1968/11/23',
      '1968/11/24',
      '1968/11/25',
      '1968/11/26',
      '1968/11/27',
      '1968/11/28',
      '1968/11/29',
      '1968/11/30',
      '1968/12/1',
      '1968/12/2',
      '1968/12/3',
      '1968/12/4',
      '1968/12/5',
      '1968/12/6',
      '1968/12/7',
      '1968/12/8',
      '1968/12/9',
      '1968/12/10',
      '1968/12/11',
      '1968/12/12',
      '1968/12/13',
      '1968/12/14',
      '1968/12/15',
      '1968/12/16',
      '1968/12/17',
      '1968/12/18',
      '1968/12/19',
      '1968/12/20',
      '1968/12/21',
      '1968/12/22',
      '1968/12/23',
      '1968/12/24',
      '1968/12/25',
      '1968/12/26',
      '1968/12/27',
      '1968/12/28',
      '1968/12/29',
      '1968/12/30',
      '1968/12/31',
      '1969/1/1',
      '1969/1/2',
      '1969/1/3',
      '1969/1/4',
      '1969/1/5',
      '1969/1/6',
      '1969/1/7',
      '1969/1/8',
      '1969/1/9',
      '1969/1/10'
    ]

    ctx.body = $.tpl(r.toString()).render({
      box: [
        {
          option: {
            tooltip: {
              trigger: 'axis',
              position: function (pt) {
                return [pt[0], '10%']
              }
            },
            title: {
              left: 'center',
              text: 'Price'
            },
            toolbox: {
              feature: {
                dataZoom: {
                  yAxisIndex: 'none'
                },
                restore: {},
                saveAsImage: {}
              }
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: date
            },
            yAxis: {
              type: 'value',
              boundaryGap: [0, '100%']
            },
            series: [
              {
                name: 'Data',
                type: 'line',
                symbol: 'none',
                sampling: 'lttb',
                itemStyle: {
                  color: 'rgb(255, 70, 131)'
                },
                // areaStyle: {
                //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                //     {
                //       offset: 0,
                //       color: 'rgb(255, 158, 68)'
                //     },
                //     {
                //       offset: 1,
                //       color: 'rgb(255, 70, 131)'
                //     }
                //   ])
                // },
                data: data
              }
            ]
          }
        },
        {},
        {
          option: {
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
                crossStyle: {
                  color: '#999'
                }
              }
            },
            toolbox: {
              feature: {
                dataView: { show: true, readOnly: false },
                magicType: { show: true, type: ['line', 'bar'] },
                restore: { show: true },
                saveAsImage: { show: true }
              }
            },
            legend: {
              data: ['Evaporation', 'Precipitation', 'Temperature']
            },
            xAxis: [
              {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                axisPointer: {
                  type: 'shadow'
                }
              }
            ],
            yAxis: [
              {
                type: 'value',
                name: 'Precipitation',
                min: 0,
                max: 250,
                interval: 50,
                axisLabel: {
                  formatter: '{value} ml'
                }
              },
              {
                type: 'value',
                name: 'Temperature',
                min: 0,
                max: 25,
                interval: 5,
                axisLabel: {
                  formatter: '{value} °C'
                }
              }
            ],
            series: [
              {
                name: 'Evaporation',
                type: 'bar',
                tooltip: {
                  valueFormatter: function (value) {
                    return value + ' ml'
                  }
                },
                data: [
                  2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0,
                  6.4, 3.3
                ]
              },
              {
                name: 'Precipitation',
                type: 'bar',
                tooltip: {
                  valueFormatter: function (value) {
                    return value + ' ml'
                  }
                },
                data: [
                  2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8,
                  6.0, 2.3
                ]
              },
              {
                name: 'Temperature',
                type: 'line',
                yAxisIndex: 1,
                tooltip: {
                  valueFormatter: function (value) {
                    return value + ' °C'
                  }
                },
                data: [
                  2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0,
                  6.2
                ]
              }
            ]
          }
        },
        {},
        {}
      ]
    })
  },

  async getUrl (ctx) {
    const { url } = ctx.checkedData.data
    // let r = await req(url) //request-promise-native
    const r = (await req(url)).data
    ctx.type = 'html'
    ctx.body = `<pre style='text-align:left'>${r.esHtml()}</pre>${r}`
  },
  async getBing (ctx) {
    const r = await req(
      'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1',
      true
    )
    ctx.type = 'html'
    ctx.body = `<img src='https://cn.bing.com${r.data.images[0].url}'></>`
  },
  async echo (ctx) {
    console.log(ctx)
    // const { str } = ctx.checkedData.data
    ctx.body = ctx
  },
  async qrcode (ctx) {
    const { str } = ctx.checkedData.data
    ctx.type = 'html'
    ctx.body = $.qrcode.generateHTML(
      str || 'https://github.com/kongnet/skybase/blob/master/BestPractice.md'
    )
  },
  /* google验证
{
  ascii: 'KH#RoG%6rEE9It#)gI2l1W&#X2:E1;sW',
  hex: '4b4823526f47253672454539497423296749326c3157262358323a45313b7357',
  base32: 'JNECGUTPI4STM4SFIU4US5BDFFTUSMTMGFLSMI2YGI5EKMJ3ONLQ',
  otpauth_url: 'otpauth://totp/SecretKey?secret=JNECGUTPI4STM4SFIU4US5BDFFTUSMTMGFLSMI2YGI5EKMJ3ONLQ'
}
*/
  async googleQR (ctx) {
    const qrURL = speakeasy.otpauthURL({
      secret:
        '4b4823526f47253672454539497423296749326c3157262358323a45313b7357',
      encoding: 'hex',
      label: 'Sky2021 Secret'
    })
    ctx.type = 'html'
    ctx.body = 'Sky2021 Secret<br>' + $.qrcode.generateHTML(qrURL)
  },
  async googleVerify (ctx) {
    const { userToken } = ctx.checkedData.data
    const verifyFuc = token => {
      return speakeasy.totp.verify({
        secret: 'JNECGUTPI4STM4SFIU4US5BDFFTUSMTMGFLSMI2YGI5EKMJ3ONLQ',
        encoding: 'base32',
        token: token
      })
    }
    ctx.type = 'html'
    ctx.body = verifyFuc(userToken)
      ? '🔥ok'
      : '😶请先添加<a href="./googleQR">Sky2021 Secret</a>'
  }
}
