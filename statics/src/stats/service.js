;(function(global){
'use strict';


angular.module('jtApp').factory('stats', stats);


function stats($http){

  get('server-black', {key : ['cpu1.busy', 'cpu1.iowait'], date : '2015-01-10:2015-01-19', interval : 60});

  return {
    get : get
  };

  /**
   * [get description]
   * @param  {[type]} collection [description]
   * @param  {[type]} conditions {
   *   key : String|Array,
   *   date : String|Array
   * }
   * @demo 
   * 1. get('server-black', {key : 'cpu1.busy', date : '2015-01-19', interval : 60});
   * 2. get('server-black', {key : '/cpu1./', date : '2015-01-19', interval : 60});
   * 3. get('server-black', {key : 'cpu1.busy', date : '2015-01-10:2015-01-19', interval : 60});
   * 4. get('server-black', {key : ['cpu1.busy', 'cpu1.iowait'], date : '2015-01-10:2015-01-19', interval : 60});
   * @return {[type]}            [description]
   */
  function get(collection, conditions){
    if(!collection || !conditions){
      throw new Error('collection and conditions can not be null');
    }
    if(!conditions.key || !conditions.date || !conditions.interval){
      throw new Error('key and date can not be null');
    }
    var url = '/stats/' + collection + '?conditions=' + JSON.stringify(conditions);
    return $http.get(url);
  }




}


stats.$inject = ['$http'];

})(this);