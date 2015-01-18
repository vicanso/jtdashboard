;(function(global){
'use strict';


angular.module('jtApp').factory('stats', stats);


function stats($http){
  return {
    get : get
  };


  function get(collection, conditions){
    if(!collection || !conditions){
      throw new Error('collection and conditions can not be null');
    }
    var url = '/stats/' + collection + '?conditions=' + JSON.stringify(conditions);
    return $http.get(url);
  }
}


stats.$inject = ['$http'];

})(this);