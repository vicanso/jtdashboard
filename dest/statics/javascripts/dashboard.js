(function(){var a,b;b=angular.module("jt.dashboardPage",[]),b.factory("jtSet",["$http","jtDebug",function(a,b){var c,d;return c=b("jt.jtSet"),d={get:function(b,c){return a.get("/set/"+b,{cache:!0}).success(function(a){return c(null,a)}).error(function(a){return c(a)})}}}]),a=function(a,b,c,d,e,f){var g;g=c("jt.dashboardPage"),g("start"),a.setList=JT_GLOBAL.setList,a.chartType="",a.selectedSetList=[],a.add=function(b){var c;c=a.setList[b],b=a.selectedSetList.indexOf(c),~b||(a.show(c),a.selectedSetList.push(c))},a.remove=function(b){var c;c=a.selectedSetList.indexOf(b),~c&&a.selectedSetList.splice(c,1)},a.show=function(b){b.selected||(angular.forEach(a.selectedSetList,function(a){a.selected=!1}),b.selected=!0,f.get(b._id,function(b,c){var d;(null!=c&&null!=(d=c.configs)?d.length:void 0)&&(a.configs=c.configs)}))},JT_GLOBAL.selectedSetId&&!function(){var b;b=-1,angular.forEach(a.setList,function(a,c){JT_GLOBAL.selectedSetId===a._id&&(b=c)}),~b&&a.add(b)}()},a.$inject=["$scope","$http","jtDebug","$log","user","jtSet"],angular.module("jtApp").addRequires(["jt.dashboardPage"]).controller("DashboardController",a)}).call(this);