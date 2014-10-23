/*dest/statics/services/stats.js*/
(function(){var a;a=angular.module("jt.service.stats",["jt.service.debug"]),a.factory("jtStats",["$http","$q","jtDebug",function(a,b,c){var d,e;return d=c("jt.stats"),e={getData:function(c,e){var f,g,h,i;return f={date:c.date,fill:c.fill,point:c.point},h=[],angular.forEach(c.stats,function(d){var e,g,i,j;e=b.defer(),d=angular.extend({},f,d),i="/stats?conditions="+JSON.stringify(d),g={cache:!0},(null!=(j=c.point)?j.interval:void 0)<0&&(i+="&cache=false",g.cache=!1),c.refreshInterval&&(g.cache=!1),a.get(i,g).success(function(a){angular.isArray(a)?angular.forEach(a,function(a){a.chart=d.chart}):a.chart=d.chart,e.resolve(a)}).error(function(a){e.reject(a)}),h.push(e.promise)}),i=function(a){var b;d("getData options:%j, res:%j",c,a),b=[],angular.forEach(a,function(a){angular.isArray(a)?b=b.concat(a):b.push(a)}),e(null,b)},g=function(a){d("getData options%j, err:%j",c,a),e(a)},b.all(h).then(i,g)},getKeys:function(b,c){return a.get("/collection/"+b+"/keys").success(function(a){return d("getKeys res:%j",a),c(null,a)}).error(function(a){return d("getKeys err:%j",a),c(a)})}}}])}).call(this);
/*dest/statics/directives/table.js*/
(function(){var a;a=angular.module("jt.directive.table",["jt.service.debug","jt.service.stats"]),a.directive("jtTable",["$compile","$http","jtDebug","jtStats",function(a,b,c,d){var e,f;return e=c("jt.table"),f=function(a,b){var c,d,e,f,g,h,i;return i=a.getFullYear(),f=a.getMonth()+1,10>f&&(f="0"+f),c=a.getDate()+1,10>c&&(c="0"+c),h=""+i+"-"+f+"-"+c,86400>b&&(d=a.getHours(),10>d&&(d="0"+d),e=a.getMinutes(),10>e&&(e="0"+e),h+=" "+d+":"+e),60>b&&(g=a.getSeconds(),10>g&&(g="0"+g),h+=":"+g),h},{restrict:"A",template:'<div class="jtTable"></div>',link:function(b,c,e){var g,h,i,j,k,l,m;return h=e.jtTable,g=b[h],m=b.$new(),l={index:0,order:0},m.sort=l,m.sortByIndex=function(a){l.index===a?l.order=++l.order%2:(l.index=a,l.order=0)},k=function(a,b){var c,d;c=a.index,d=a.order,b.sort(function(a,b){return a[c]>b[c]?d?1:-1:a[c]<b[c]?d?-1:1:0})},j=function(b){var d,e;e='<div class="panel panel-default"><div class="panel-heading" ng-bind="name"></div><table class="table"><thead><tr><th ng-repeat="th in theadData" ng-click="sortByIndex($index)"><span ng-bind="th"></span><i class="fa" ng-class="{\'fa-sort\' : sort.index != $index, \'fa-sort-desc\' : sort.index == $index && sort.order == 0, \'fa-sort-asc\' : sort.index == $index && sort.order == 1}"></i></th></tr></thead><tbody><tr ng-repeat="data in tableData"><td ng-repeat="td in data track by $index" ng-bind="td"></td></tr></tbody></table></div>',d=c.children("div").html(e),a(d)(b)},i=function(a){return m.name=a.name||"未定义",d.getData(a,function(b,c){var d,e,g,h,i,n,o;return b?void console.dir(error):(e=(null!=(o=a.point)?o.interval:void 0)||60,h={},d=[],g=[],angular.forEach(c,function(a){var b;return b=a.key,g.push(b),angular.forEach(a.values,function(a){var c,g;g=Math.floor(a.t/e)*e*1e3,c=f(new Date(g),e),h[c]||(d.push(c),h[c]={}),h[c][b]=a.v})}),d.sort(),n=["日期"].concat(g),i=[],angular.forEach(d,function(a){var b;b=[a],angular.forEach(g,function(c,d){b[d+1]=h[a][c]}),i.push(b)}),l&&k(l,i),m.theadData=n,m.tableData=i,void j(m))})},b.$watch(h,function(a){a&&i(a)}),m.$watchCollection("sort",function(a){a&&m.tableData&&k(a,m.tableData)})}}}])}).call(this);
/*dest/statics/javascripts/configs.js*/
(function(){var a,b;b=angular.module("jt.configsPage",[]),a=function(a,b,c,d){var e,f,g,h,i;e=d("jt.configsPage"),e("configs:%j",JT_GLOBAL.configs),f=null,g=null,angular.forEach(c.children(),function(a){var b;b=angular.element(a),b.hasClass("previewContainer")&&(f=b,angular.forEach(b.children(),function(a){angular.element(a).hasClass("content")&&(g=angular.element(a))}))}),a.configs=JT_GLOBAL.configs,a.sets=JT_GLOBAL.sets,a.error={},a.success={},a.preview={},a.selectedItems=[],a.selectedTotal=0,c.removeClass("hidden"),a.set={},a.showType="config",h=function(b){var c;a.error.preview="",c=angular.copy(b),delete c.$$hashKey,delete c._id,a.statsOptions=c,f.removeClass("hidden")},i=function(a){var b,c;b=angular.toJson(a.stats,!0),c=angular.element('<pre class="code"><code>'+b+"</code></pre>"),g.empty(),g.append(c),f.removeClass("hidden")},a.closePreview=function(){f.addClass("hidden")},a.preview=function(b,c){switch(a.preview.type=c,c){case"stats":i(b);break;default:h(b)}},a.toggleSelected=function(b){var c;b.selected?(c=a.selectedItems.indexOf(b),a.selectedItems.splice(c,1)):(b.area=1,a.selectedItems.push(b)),b.selected=!b.selected},a.edit=function(b){var c;c=function(b){var c;return c=null,angular.forEach(a.configs,function(a){a._id===b&&(c=a)}),c},angular.forEach(a.selectedItems,function(a){a.selected=!1}),a.selectedItems=[],angular.forEach(b.configs,function(b){var d;d=c(b.id),d.area=b.area,d.selected=!0,a.selectedItems.push(d)}),a.set.name=b.name,a.set.id=b._id},a.save=function(){var c,d,e,f;a.set.name&&(d={name:a.set.name},c=[],angular.forEach(a.selectedItems,function(a){return c.push({id:a._id,area:a.area})}),d.configs=c,f="/set",e=a.set.id,e&&(f+="/"+e),b.post(f,d).then(function(){a.error.save="",a.success.save="已成功保存该配置"},function(){a.success.save="",a.error.save="保存不成功"}))}},a.$inject=["$scope","$http","$element","jtDebug"],angular.module("jtApp").addRequires(["jt.configsPage"]).controller("ConfigsPageController",a)}).call(this);