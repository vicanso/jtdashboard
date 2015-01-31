;(function(global){
'use strict';
var app = angular.module('jtApp');

app.constant('STATS_SETTING', {
  // 服务器返回的数据最小间隔时间
  interval : 60,
  // 在图表中每个点之间的间隔，如有50个点，那么图表的宽度则为 50 * 40 px
  gap : 40
});

app.factory('stats', stats);


function stats($http, STATS_SETTING){
  var self = {
    getServerStats : getServerStats,
    getMongodbStats : getMongodbStats,
    getServers : getServers,
    get : get,
    // 返回数据以什么格式返回，可以是text和json，若为text，会在获取到数据之后转换为json
    format : 'json'
  };
  return self;


  /**
   * [convertTextToJSON 将返回的text的内容转换为json]
   * @param  {[type]} str [description]
   * @return {[type]}     [description]
   */
  function convertTextToJSON(str){
    var result = [];
    angular.forEach(str.split('\n'), function(str){
      var arr = str.split('||');
      var values = [];
      var json = {
        key : arr[0],
        type : arr[1],
        values : values
      };
      angular.forEach(arr.pop().split(','), function(str){
        var arr = str.split('|');
        values.push({
          t : arr[0],
          v : parseFloat(arr[1])
        });
      });
      result.push(json);
    });
    return result;
  }

  /**
   * [get description]
   * @param  {[type]} collection [description]
   * @param  {[type]} conditions {
   *   key : String|Array, 
   *   date : String|Array
   * }
   * key : 'cpu1.busy', ['cpu1.busy', 'cpu1.iowait'], '/cpu1./'
   * date : '2015-01-10', '2015-01-10:2015-01-20', ['2015-01-17', '2015-01-20'], '8h', '9d'
   * @demo 
   * 1. get('server-black', {key : 'cpu1.busy', date : '2015-01-19', interval : 60});
   * 2. get('server-black', {key : '/cpu1./', date : '2015-01-19', interval : 60});
   * 3. get('server-black', {key : 'cpu1.busy', date : '2015-01-10:2015-01-20', interval : 60});
   * 4. get('server-black', {key : ['cpu1.busy', 'cpu1.iowait'], date : '2015-01-10:2015-01-19', interval : 60});
   * 5. get('server-black', {key : ['cpu1.busy', 'cpu1.iowait'], date : '8h', interval : 60});
   * @return {[type]}            [description]
   */
  function get(collection, conditions){
    if(!collection || !conditions){
      throw new Error('collection and conditions can not be null');
    }
    var params = [];
    var format = self.format;
    params.push('format=' + format);
    params.push('conditions=' + JSON.stringify(conditions));
    var url = '/stats/collection/' + collection + '?' + params.join('&');
    var promise = $http.get(url);
    promise.then(function(res){
      if(format === 'text' && res.data){
        res.data = convertTextToJSON(res.data);
      }
      return res;
    });
    return promise;
  }


  
  /**
   * [convertData 将数据转换为chart使用]
   * @param  {[type]} result   [description]
   * @param  {[type]} arr      [description]
   * @param  {[type]} server   [description]
   * @param  {[type]} interval [description]
   * @return {[type]}          [description]
   */
  function convertData(result, arr, server, interval){
    angular.forEach(result, function(item){
      item.interval = interval;
      item.title += '(' + server + ')';
      item.data = [];
    });

    var sum = function(data){
      var total = 0;
      angular.forEach(data, function(item){
        total += item.v;
      });
      var last = data[data.length - 1];
      return {
        v : total,
        t : last.t
      };
    };

    var average = function(data){
      var result = sum(data);
      result.v = Maht.ceil(result.v / data.length);
      return result;
    };


    angular.forEach(arr, function(item){
      var key = item.key;
      angular.forEach(result, function(info){
        var valid = false;
        if(angular.isFunction(info.keys)){
          if(info.keys(key)){
            valid = true;
          }
        }else if(info.keys.indexOf(key) !== -1){
          valid = true;
        }
        if(valid){
          var resultItem = angular.copy(item, {});
          if(info.type === 'pie'){
            switch(item.type){
              // 如果是累加，则计算总和，时间取最新
              case 'counter':
                resultItem.values = [sum(item.values)];
                break;
              // 如果是平均值，计算其平均时，时间取最新
              case 'average':
                resultItem.values = [average(item.values)];
                break;
              case 'gauge':
                var last = item.values[item.values.length - 1];
                resultItem.values = [last];
                break;
            }
          }else{
            resultItem.values = angular.copy(item.values);
          }
          info.data.push(resultItem);
        }
        
      });
    });

    angular.forEach(result, function(item){
      delete item.keys;
    });

    return result;
  }

  /**
   * [getServerStats 获取服务器的统计数据]
   * @param  {[type]} server [服务器名称]
   * @param  {[type]} date   [description]
   * @param  {[type]} interval   [description]
   * @return {[type]}        [description]
   */
  function getServerStats(server, date, interval){
    interval = interval || STATS_SETTING.interval;
    var conditions = {
      date : date,
      interval : interval
    };
    var promise = get(server, conditions);
    promise.then(function(res){
      var cpu = {
        title : 'CPU监控',
        keys : ['cpu.busy', 'cpu.iowait']
      };
      var mem = {
        title : '内存监控',
        data : [],
        keys : ['mem.used', 'mem.usageRate']
      };
      var process = {
        title : 'process',
        keys : ['procs_blocked', 'procs_running']
      };
      var tcpAndUdp = {
        title : 'tcp/udp',
        keys : ['tcp', 'udp']
      };
      var network = {
        title : '网络传输',
        keys : function(key){
          var reg = /\S*?\.(receive|transmit)\.(kbytes|rate|packets)/;
          return reg.test(key);
        }
      };

      var networkError = {
        title : '网络出错',
        keys : function(key){
          var reg = /\S*?\.(receive|transmit)\.(errs|drop)/;
          return reg.test(key);
        }
      };

      var disk = {
        title : '磁盘状况',
        keys : function(key){
          var reg = /\S*?\.(read\-times|write\-times|ms\-reading|ms\-writing|writeSpeed|available)/;
          return reg.test(key);
        }
      };

      var result = [
        cpu,
        mem,
        process,
        tcpAndUdp,
        network,
        networkError,
        disk
      ];
      res.data = convertData(result, res.data, server, interval);
    });
    return promise;
  }

  /**
   * [getMongodbStats 获取mongodb的状态统计]
   * @param  {[type]} server     [description]
   * @param  {[type]} date     [description]
   * @param  {[type]} interval [description]
   * @return {[type]}          [description]
   */
  function getMongodbStats(server, date, interval){
    interval = interval || STATS_SETTING.interval;
    var conditions = {
      date : date,
      interval : interval
    };
    var promise = get(server, conditions);
    promise.then(function(res){
      var bgFlushing = {
        title : 'backgroundFlushing',
        keys : ['bgFlushing.flushes', 'bgFlushing.average_ms', 'bgFlushing.total_ms']
      };

      // 'connections.available' 不显示该统计
      var connections = {
        title : 'connections',
        keys : ['connections.current', 'connections.totalCreated']
      };

      var globalLock = {
        title : 'globalLock',
        keys : ['globalLock.lockTime', 'globalLock.currentQueue.total', 'globalLock.currentQueue.readers', 'globalLock.currentQueue.writers', 'globalLock.activeClients.total', 'globalLock.activeClients.readers', 'globalLock.activeClients.writers', ]
      };

      var indexCounters = {
        title : 'indexCounters',
        // type : 'pie',
        keys : ['indexCounters.accesses', 'indexCounters.hits', 'indexCounters.misses', 'indexCounters.missRatio']
      };

      var indexCountersPie = {
        title : 'indexCounters',
        type : 'pie',
        keys : ['indexCounters.hits', 'indexCounters.misses']
      };

      var network = {
        title : 'network',
        keys : ['network.outkb', 'network.inkb', 'network.numRequests']
      };

      var networkPie = {
        title : 'network',
        type : 'pie',
        keys : ['network.outkb', 'network.inkb']
      };

      var opcounters = {
        title : 'opcounters',
        keys : ['opcounters.query', 'opcounters.update', 'opcounters.delete', 'opcounters.insert', 'opcounters.getmore', 'opcounters.command']
      };

      var opcountersPie = {
        title : 'opcounters',
        type : 'pie',
        keys : ['opcounters.query', 'opcounters.update', 'opcounters.delete', 'opcounters.insert', 'opcounters.getmore', 'opcounters.command']
      };


      var recordStats = {
        title : 'recordStats',
        keys : ['recordStats.accessesNotInMemory', 'recordStats.pageFaultExceptionsThrown']
      };

      var mem = {
        title : 'mem',
        keys : ['mem.virtual', 'mem.resident']
      };

      var result = [
        indexCountersPie,
        opcountersPie,
        networkPie,
        bgFlushing,
        connections,
        globalLock,
        indexCounters,
        network,
        opcounters,
        recordStats,
        mem
      ];

      // result = [indexCounters];

      var keysTotal = 0;
      angular.forEach(result, function(item){
        keysTotal += item.keys.length;
      });
      var total = 0;
      angular.forEach(res.data, function(item){
        var key = item.key;
        total++;
      });
      res.data = convertData(result, res.data, server, interval);
    });
    return promise;
  }

  function getServers(){
    var promise = $http.get('/stats/servers');
    return promise;
  }
}


stats.$inject = ['$http', 'STATS_SETTING'];

})(this);