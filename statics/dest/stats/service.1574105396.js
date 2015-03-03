!function(){"use strict";function t(t,e){function n(t){var e=[];return angular.forEach(t.split("\n"),function(t){var n=t.split("||"),r=[],a={key:n[0],type:n[1],values:r};angular.forEach(n.pop().split(","),function(t){var e=t.split("|");r.push({t:e[0],v:parseFloat(e[1])})}),e.push(a)}),e}function r(e,r){if(!e||!r)throw new Error("collection and conditions can not be null");var a=[],o=c.format;a.push("format="+o),a.push("conditions="+JSON.stringify(r));var s="/stats/collection/"+e+"?"+a.join("&"),i=t.get(s);return i.then(function(t){return"text"===o&&t.data&&(t.data=n(t.data)),t}),i}function a(t,e,n,r){angular.forEach(t,function(t){t.interval=r,t.title+="("+n+")",t.data=[]});var a=function(t){var e=0;angular.forEach(t,function(t){e+=t.v});var n=t[t.length-1];return{v:e,t:n.t}},o=function(t){var e=a(t);return e.v=Maht.ceil(e.v/t.length),e};return angular.forEach(e,function(e){var n=e.key;angular.forEach(t,function(t){var r=!1;if(angular.isFunction(t.keys)?t.keys(n)&&(r=!0):-1!==t.keys.indexOf(n)&&(r=!0),r){var s=angular.copy(e,{});if("pie"===t.type)switch(e.type){case"counter":s.values=[a(e.values)];break;case"average":s.values=[o(e.values)];break;case"gauge":var i=e.values[e.values.length-1];s.values=[i]}else s.values=angular.copy(e.values);t.data.push(s)}})}),angular.forEach(t,function(t){delete t.keys}),t}function o(t,n,o){o=o||e.interval;var s={date:n,interval:o},i=r(t,s);return i.then(function(e){var n={title:"CPU监控",keys:["cpu.busy","cpu.iowait"]},r={title:"内存监控",data:[],keys:["mem.used","mem.usageRate"]},s={title:"process",keys:["procs_blocked","procs_running"]},i={title:"tcp/udp",keys:["tcp","udp"]},u={title:"网络传输",keys:function(t){var e=/\S*?\.(receive|transmit)\.(kbytes|rate|packets)/;return e.test(t)}},c={title:"网络出错",keys:function(t){var e=/\S*?\.(receive|transmit)\.(errs|drop)/;return e.test(t)}},l={title:"磁盘状况",keys:function(t){var e=/\S*?\.(read\-times|write\-times|ms\-reading|ms\-writing|writeSpeed|available)/;return e.test(t)}},p=[n,r,s,i,u,c,l];e.data=a(p,e.data,t,o)}),i}function s(t,n,o){o=o||e.interval;var s={date:n,interval:o},i=r(t,s);return i.then(function(e){var n={title:"backgroundFlushing",keys:["bgFlushing.flushes","bgFlushing.average_ms","bgFlushing.total_ms"]},r={title:"connections",keys:["connections.current","connections.totalCreated"]},s={title:"globalLock",keys:["globalLock.lockTime","globalLock.currentQueue.total","globalLock.currentQueue.readers","globalLock.currentQueue.writers","globalLock.activeClients.total","globalLock.activeClients.readers","globalLock.activeClients.writers"]},i={title:"indexCounters",keys:["indexCounters.accesses","indexCounters.hits","indexCounters.misses","indexCounters.missRatio"]},u={title:"indexCounters",type:"pie",keys:["indexCounters.hits","indexCounters.misses"]},c={title:"network",keys:["network.outkb","network.inkb","network.numRequests"]},l={title:"network",type:"pie",keys:["network.outkb","network.inkb"]},p={title:"opcounters",keys:["opcounters.query","opcounters.update","opcounters.delete","opcounters.insert","opcounters.getmore","opcounters.command"]},v={title:"opcounters",type:"pie",keys:["opcounters.query","opcounters.update","opcounters.delete","opcounters.insert","opcounters.getmore","opcounters.command"]},g={title:"recordStats",keys:["recordStats.accessesNotInMemory","recordStats.pageFaultExceptionsThrown"]},d={title:"mem",keys:["mem.virtual","mem.resident"]},k=[u,v,l,n,r,s,i,c,p,g,d],f=0;angular.forEach(k,function(t){f+=t.keys.length});var y=0;angular.forEach(e.data,function(t){t.key;y++}),e.data=a(k,e.data,t,o)}),i}function i(){var e=t.get("/my/stats?cache=false");return e}function u(e){var n=t.post("/stats",e);return n}var c={getServerStats:o,getMongodbStats:s,getStats:i,get:r,add:u,format:"json"};return c}var e=angular.module("jtApp");e.constant("STATS_SETTING",{interval:60,gap:40}),e.factory("stats",t),t.$inject=["$http","STATS_SETTING"]}(this);