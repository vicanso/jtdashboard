(function(){var a;a=angular.module("jt.directive.table",["jt.service.debug","jt.service.stats"]),a.directive("jtTable",["$compile","$http","jtDebug","jtStats",function(a,b,c,d){var e,f;return e=c("jt.table"),f=function(a,b){var c,d,e,f,g,h,i;return i=a.getFullYear(),f=a.getMonth()+1,10>f&&(f="0"+f),c=a.getDate()+1,10>c&&(c="0"+c),h=""+i+"-"+f+"-"+c,86400>b&&(d=a.getHours(),10>d&&(d="0"+d),e=a.getMinutes(),10>e&&(e="0"+e),h+=" "+d+":"+e),60>b&&(g=a.getSeconds(),10>g&&(g="0"+g),h+=":"+g),h},{restrict:"A",template:'<div class="jtTable"></div>',link:function(b,c,e){var g,h,i,j,k,l,m;return h=e.jtTable,g=b[h],m=b.$new(),l={index:0,order:0},m.sort=l,m.sortByIndex=function(a){l.index===a?l.order=++l.order%2:(l.index=a,l.order=0)},k=function(a,b){var c,d;c=a.index,d=a.order,b.sort(function(a,b){return a[c]>b[c]?d?1:-1:a[c]<b[c]?d?-1:1:0})},j=function(b){var d,e;e='<div class="panel panel-default"><div class="panel-heading" ng-bind="name"></div><table class="table"><thead><tr><th ng-repeat="th in theadData" ng-click="sortByIndex($index)"><span ng-bind="th"></span><i class="fa" ng-class="{\'fa-sort\' : sort.index != $index, \'fa-sort-desc\' : sort.index == $index && sort.order == 0, \'fa-sort-asc\' : sort.index == $index && sort.order == 1}"></i></th></tr></thead><tbody><tr ng-repeat="data in tableData"><td ng-repeat="td in data track by $index" ng-bind="td"></td></tr></tbody></table></div>',d=c.children("div").html(e),a(d)(b)},i=function(a){return m.name=a.name||"未定义",d.getData(a,function(b,c){var d,e,g,h,i,n,o;return b?void console.dir(error):(e=(null!=(o=a.point)?o.interval:void 0)||60,h={},d=[],g=[],angular.forEach(c,function(a){var b;return b=a.key,g.push(b),angular.forEach(a.values,function(a){var c,g;g=Math.floor(a.t/e)*e*1e3,c=f(new Date(g),e),h[c]||(d.push(c),h[c]={}),h[c][b]=a.v})}),d.sort(),n=["日期"].concat(g),i=[],angular.forEach(d,function(a){var b;b=[a],angular.forEach(g,function(c,d){b[d+1]=h[a][c]}),i.push(b)}),l&&k(l,i),m.theadData=n,m.tableData=i,void j(m))})},b.$watch(h,function(a){a&&i(a)}),m.$watchCollection("sort",function(a){a&&m.tableData&&k(a,m.tableData)})}}}])}).call(this);