;(function(global){
'use strict';


angular.module('jtApp').factory('stats', stats);


function stats($http){
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
      if(format === 'text'){
        res.data = convertTextToJSON(res.data);
      }
      return res;
    });
    return promise;
  }

  /**
   * [getServerStats 获取服务器的统计数据]
   * @param  {[type]} server [description]
   * @param  {[type]} date   [description]
   * @param  {[type]} interval   [description]
   * @return {[type]}        [description]
   */
  function getServerStats(server, date, interval){
    var conditions = {
      date : date,
      interval : interval || 60
    };
    return get(server, conditions);
  }



}


stats.$inject = ['$http'];

})(this);