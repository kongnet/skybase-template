{{d.proDesc}}

# 默认生成接口
* http://127.0.0.1:13000/skyapi/mock/first
* http://127.0.0.1:13000/skyapi/mock/img?size=128x128 占位符
* http://127.0.0.1:13000/skyapi/probe/mysql

# 启动例子
* nodemo //启动基础例子
* nodemo index_stat // 启动统计例子 含基础例子，需要配置redis,增删改成扩展,占位符扩展
* http://localhost:13000/skyapi/sky-stat/getOne?api=_skyapi_sky-stat_getAll&type=chart

# 中间件使用查看
* ./middleware/README.md

# 根目录下的 skyconfig.js 是默认情况下 skybase系统内部的参数
