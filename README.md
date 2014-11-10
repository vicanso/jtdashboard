JTDashboard
======

通过UDP的方式将统计数据发送到统计后台，在特定的时间段（默认10秒）内整理数据之后，存储到数据库。能支持三种类型的统计数据：累加、均值和数值型。


背景
======


很早之前，一直想对自己写的代码做性能优化，包括前端与后端，但是一直不知道怎么下手，没有衡量的指标，只能靠自己认为，优化了也不知道有什么作用，后来有了解到 [StatsD](https://github.com/etsy/statsd)，发现统计原来也可以很简单，大部的统计都是和数字相关，因此自己试用了StatsD。感觉很不错，不过不太喜欢 [graphite](http://graphite.readthedocs.org/en/latest/)，因此自己就另外尝试了写了另外一套方案。
注：如果是在产品线上，我建议使用StatsD


相关模块：
======

[JTStats](https://github.com/vicanso/jtstats) 数据收集的后端。

[JTStats_client](https://github.com/vicanso/jtstats_client) JTStats Client

