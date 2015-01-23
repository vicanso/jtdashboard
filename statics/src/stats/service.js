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
        values : values
      };
      angular.forEach(arr[1].split(','), function(str){
        var arr = str.split('|');
        values.push({
          t : arr[0],
          v : arr[1]
        });
      });
      result.push(json);
    });
    return result;
  };

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
    var url = '/stats/' + collection + '?' + params.join('&');
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
        type : 'bar',
        data : [],
        keys : ['cpu.busy', 'cpu.iowait']
      };
      var mem = {
        title : '内存监控',
        data : [],
        keys : ['mem.used', 'mem.usageRate']
      };
      var process = {
        title : 'process',
        data : [],
        keys : ['procs_blocked', 'procs_running']
      };
      var tcpAndUdp = {
        title : 'tcp/udp',
        data : [],
        keys : ['tcp', 'udp']
      };
      var network = {
        title : '网络状况',
        data : [],
        keys : function(key){
          var reg = /\S*?\.(receive|transmit)\.(kbytes|rate|packets|errs|drop)/;
          return reg.test(key);
        }
      };

      var disk = {
        title : '磁盘状况',
        data : [],
        keys : function(key){
          var reg = /\S*?\.(read\-times|write\-times|ms\-reading|ms\-writing|writeSpeed|available)/;
          return reg.test(key);
        }
      };

      var result = [
        // cpu,
        // mem,
        // process,
        // tcpAndUdp,
        // network,
        disk
      ];


      angular.forEach(res.data, function(item){
        var key = item.key;
        angular.forEach(result, function(info){
          if(angular.isFunction(info.keys)){
            if(info.keys(key)){
              info.data.push(item);
            }
          }else if(info.keys.indexOf(key) !== -1){
            info.data.push(item);
          }
        });
      });
      angular.forEach(result, function(item){
        item.interval = interval;
        item.title += '(' + server + ')';
        delete item.keys;
      });
      res.data = result;
    });
    return promise;
  }



}


stats.$inject = ['$http', 'STATS_SETTING'];

})(this);