!function(){"use strict";function t(t,s,a,r,n,e,o,u,c){function i(t){g.charts.status="loading",t.success(function(t){g.charts.status="success",g.charts.data=t}).error(function(t){g.charts.status="error",g.charts.error=t.msg||t.error})}function l(){o.getStats().success(function(t){g.myStats.status="success",g.myStats.data=t}).error(function(t){g.myStats.status="error",g.myStats.error=t.msg||t.error})}function d(){g.session.status="loading",c.session().then(function(t){angular.extend(g.session,t),g.session.status="success",t.anonymous?g.myStats.data=null:l()},function(t){g.session.error=t,g.session.status="fail"})}e=e("stats"),o.format="text";var g=this;g.charts={status:"",error:"",data:null},g.myStats={status:"loading",data:null},g.currentStats=null,g.session={status:"loading"},t.$on("user",function(){d()}),d(),g.addStats=function(){var s=angular.element(angular.element("#addStatsDialog").html()),r=t.$new(!0),e="name type category date interval".split(" ");angular.extend(r,{status:"show",modal:!0}),n(s)(r),a.append(s),angular.forEach(e,function(t){r.$watch(t,function(t,s){t!==s&&(r.error="")})}),r.submit=function(){r.error="";var t=!0;if(angular.forEach(e,function(s){t&&!r[s]&&(t=!1)}),!t)return void(r.error="参数不能为空");var s=r.date.split(","),a=[];angular.forEach(s,function(t){var s=t.trim();s&&a.push(s)}),1===a.length&&(a=a[0]);var n={type:r.type,name:r.name,category:r.category,date:a,interval:r.interval};r.msg="正在提交，请稍候...",r.submiting=!0,o.add(n).success(function(){r.destroy()}).error(function(t){r.submiting=!1,r.error=t.msg||t.error||"未知异常",r.msg=""})}},g.showStats=function(t){e("currentStats:%j",t),g.currentStats=t;var s=t.name,a=t.type,r=null,n=t.date;n?-1!==n.indexOf(",")&&(n=n.split(",")):n=u.getDate();var c=t.interval||60;switch(a){case"server":r=o.getServerStats(s,n,c);break;case"mongodb":r=o.getMongodbStats(s,n,c)}r&&i(r)},g.reload=function(){var t=g.currentStats;t&&g.showStats(t)}}angular.module("jtApp").controller("StatsController",t),t.$inject=["$scope","$http","$element","$timeout","$compile","debug","stats","utils","user"]}(this);