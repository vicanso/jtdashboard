!function(){"use strict";function r(r,t,s,e,a,n,o){function c(r){u.charts.status="loading",r.success(function(r){u.charts.status="success",u.charts.data=r}).error(function(r){u.charts.status="error",u.charts.error=r.msg||r.error})}a=a("homePage"),n.format="text";var u=this;u.charts={status:"",error:"",data:null},u.servers={status:"",data:null},u.currentServer=null,u.conditions={status:""},u.showServerStats=function(r){u.currentServer=r;var t=r.name,s=r.type,e=null,a=u.conditions.date;a?-1!==a.indexOf(",")&&(a=a.split(",")):a=o.getDate();var i=u.conditions.interval||60;switch(s){case"server":e=n.getServerStats(t,a,i);break;case"mongodb":e=n.getMongodbStats(t,a,i)}e&&c(e)},u.refresh=function(){var r=u.currentServer;r&&u.showServerStats(r)},u.servers.status="loading",n.getServers().success(function(r){u.servers.status="success",u.servers.data=r}).error(function(r){u.servers.status="error",u.servers.error=r.msg||r.error})}angular.module("jtApp").controller("StatsController",r),r.$inject=["$scope","$http","$element","$timeout","debug","stats","utils"]}(this);