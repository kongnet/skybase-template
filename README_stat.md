# API统计系统相关API


### 本地配置设置 - ./config/config.local.js
```js
module.exports = {
    redis: {
        host: 'localhost',
        port: 6379,
        auth: '',
        db: 1
    },
    redisStack: {
        host: 'localhost',
        port: 6379,
        auth: '',
        db: 2
    },
    stackRabbitMQ: { // 可选
        protocol: 'amqp',
        host: 'localhost',
        port: '5672'
    }
}
```

### 启动项目

```bash
$ nodemon index_stat.js
```

### 访问相应api

```
http://localhost:13000/skyapi/sky-stat/getAll?type=mix
http://localhost:13000/skyapi/sky-stat/getOne?api=_skyapi_getAll&type=chart
http://localhost:13000/skyapi/sky-stat/getSpecialKeys?keyList=["api:_skyapi_getAll"]&count5m=1&count1h=1&count1d=1
```


### 获取所有统计

获取所有接口调用总数，每个接口1h的count执行最长max时长 执行min时长 avg时长

**地址**： `/skyapi/getAll`

**方法**： `GET`



**query参数**：

| 参数名 | 必须 | 类型 | 默认值 | 说明 |
| ---: | :---: | :---: | :--- | :--- |
| type | 否 | string | 默认：api<br> | **输出类型 [api-输出输出 mix-html输出]**<br>直接输出html界面 |



**200返回说明**：



```json
{
  "data": {
    "_skyapi_getAll": {
      "count": 0,
      "max": "0 ms",
      "min": "0 ms",
      "avg": "0 ms"
    },
    "_skyapi_getSome": {
      "count": 0,
      "max": "0 ms",
      "min": "0 ms",
      "avg": "0 ms"
    },
    "_skyapi_getOne": {
      "count": 2,
      "max": "30 ms",
      "min": "15 ms",
      "avg": "22.5 ms"
    },
    "_skyapi_getSpecialKeys": {
      "count": 4,
      "max": "35 ms",
      "min": "5 ms",
      "avg": "16.25 ms"
    }
  },
  "code": 200,
  "msg": "成功",
  "t": 1561964915613
}
```


### 获取某几个统计

获取指定列表中 api1h同getAll一样的数据

**地址**： `/skyapi/getSome`

**方法**： `GET`



**query参数**：

| 参数名 | 必须 | 类型 | 默认值 | 说明 |
| ---: | :---: | :---: | :--- | :--- |
| apiList | 是 | string | 默认：无<br> | **输出api列表名称 jsonStr**<br>输出api列表名称 jsonStr 例：["_test", "_test1_test2"] |
| type | 否 | string | 默认：api<br> | **输出类型 [api-输出输出 mix-html输出]**<br>直接输出html界面 |



**200返回说明**：



```json
{
  "data": {
    "_skyapi_getAll": {
      "count": 0,
      "max": "0 ms",
      "min": "0 ms",
      "avg": "0 ms"
    },
    "_skyapi_getSome": {
      "count": 0,
      "max": "0 ms",
      "min": "0 ms",
      "avg": "0 ms"
    },
    "_skyapi_getOne": {
      "count": 2,
      "max": "30 ms",
      "min": "15 ms",
      "avg": "22.5 ms"
    },
    "_skyapi_getSpecialKeys": {
      "count": 4,
      "max": "35 ms",
      "min": "5 ms",
      "avg": "16.25 ms"
    }
  },
  "code": 200,
  "msg": "成功",
  "t": 1561964915613
}
```

### 获取单个统计

获取指定api 5m 24个点，1h 24个点,1d 30个点

**地址**： `/skyapi/getOne`

**方法**： `GET`



**query参数**：

| 参数名 | 必须 | 类型 | 默认值 | 说明 |
| ---: | :---: | :---: | :--- | :--- |
| api | 是 | string | 默认：无<br> | **api名称**<br>指定api名称  例： _test |
| type | 否 | string | 默认：api<br> | **输出类型 [api-输出输出 mix-html输出 chart-html只有图表]**<br>直接输出html界面 |



**200返回说明**：



```json
{
  "data": {
    "5m": {
      "count": {
        "step": 300000,
        "unitType": "m",
        "data": [
          [
            1561964700000,
            1
          ]
        ]
      },
      "max": {
        "step": 300000,
        "unitType": "m",
        "data": [
          [
            1561964700000,
            8
          ]
        ]
      },
      "min": {
        "step": 300000,
        "unitType": "m",
        "data": [
          [
            1561964700000,
            8
          ]
        ]
      },
      "avg": {
        "step": 300000,
        "unitType": "m",
        "data": [
          [
            1561964700000,
            8
          ]
        ]
      }
    },
    "1h": {
      "count": {
        "step": 3600000,
        "unitType": "h",
        "data": [
          [
            1561964400000,
            1
          ]
        ]
      },
      "max": {
        "step": 3600000,
        "unitType": "h",
        "data": [
          [
            1561964400000,
            8
          ]
        ]
      },
      "min": {
        "step": 3600000,
        "unitType": "h",
        "data": [
          [
            1561964400000,
            8
          ]
        ]
      },
      "avg": {
        "step": 3600000,
        "unitType": "h",
        "data": [
          [
            1561964400000,
            8
          ]
        ]
      }
    },
    "1d": {
      "count": {
        "step": 86400000,
        "unitType": "d",
        "data": [
          [
            1561910400000,
            9
          ]
        ]
      },
      "max": {
        "step": 86400000,
        "unitType": "d",
        "data": [
          [
            1561910400000,
            20
          ]
        ]
      },
      "min": {
        "step": 86400000,
        "unitType": "d",
        "data": [
          [
            1561910400000,
            4
          ]
        ]
      },
      "avg": {
        "step": 86400000,
        "unitType": "d",
        "data": [
          [
            1561910400000,
            7.111111111111111
          ]
        ]
      }
    }
  },
  "code": 200,
  "msg": "成功",
  "t": 1561964994648
}
```

### 获取指定几个key相应数据

获取指定几个key相应数据 5m 24个点，1h 24个点,1d 30个点

**地址**： `/skyapi/getSpecialKeys`

**方法**： `GET`



**query参数**：

| 参数名 | 必须 | 类型 | 默认值 | 说明 |
| ---: | :---: | :---: | :--- | :--- |
| keyList | 是 | string | 默认：无<br> | **输出key列表名称 jsonStr**<br>输出key列表名称 jsonStr 例：["_test", "_test1_test2"] |
| count5m | 否 | number | 默认：24<br> | **相应5m展示个数**<br>相应5m展示个数 |
| count1h | 否 | number | 默认：24<br> | **相应1h展示个数**<br>相应1h展示个数 |
| count1d | 否 | number | 默认：30<br> | **相应1d展示个数**<br>相应1d展示个数 |



**200返回说明**：



```json
{
  "data": {
    "api:_skyapi_getAll": {
      "5m": {
        "count": {
          "step": 300000,
          "unitType": "m",
          "data": [
            [
              1561964400000,
              0
            ]
          ]
        },
        "max": {
          "step": 300000,
          "unitType": "m",
          "data": [
            [
              1561964400000,
              0
            ]
          ]
        },
        "min": {
          "step": 300000,
          "unitType": "m",
          "data": [
            [
              1561964400000,
              0
            ]
          ]
        },
        "avg": {
          "step": 300000,
          "unitType": "m",
          "data": [
            [
              1561964400000,
              0
            ]
          ]
        }
      },
      "1h": {
        "count": {
          "step": 3600000,
          "unitType": "h",
          "data": [
            [
              1561964400000,
              0
            ]
          ]
        },
        "max": {
          "step": 3600000,
          "unitType": "h",
          "data": [
            [
              1561964400000,
              0
            ]
          ]
        },
        "min": {
          "step": 3600000,
          "unitType": "h",
          "data": [
            [
              1561964400000,
              0
            ]
          ]
        },
        "avg": {
          "step": 3600000,
          "unitType": "h",
          "data": [
            [
              1561964400000,
              0
            ]
          ]
        }
      },
      "1d": {
        "count": {
          "step": 86400000,
          "unitType": "d",
          "data": [
            [
              1561910400000,
              8
            ]
          ]
        },
        "max": {
          "step": 86400000,
          "unitType": "d",
          "data": [
            [
              1561910400000,
              20
            ]
          ]
        },
        "min": {
          "step": 86400000,
          "unitType": "d",
          "data": [
            [
              1561910400000,
              4
            ]
          ]
        },
        "avg": {
          "step": 86400000,
          "unitType": "d",
          "data": [
            [
              1561910400000,
              7
            ]
          ]
        }
      }
    }
  },
  "code": 200,
  "msg": "成功",
  "t": 1561964527619
}
```
