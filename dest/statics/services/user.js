(function(){var a;a=angular.module("jt.user",[]),a.factory("user",["$http","$document","localStorageService","jtUtils",function(a,b,c,d){var e,f,g;return e=d.memoize(function(b){return a.get("/user").success(function(a){return b(null,a)}).error(function(a){return b(a)})}),g=c.get("user"),g||(g={uuid:d.uuid()}),g.updatedAt=d.now(),c.cookie.set("uuid",g.uuid),c.set("user",g),f={getInfo:function(a){return a(null,g)}}}])}).call(this);