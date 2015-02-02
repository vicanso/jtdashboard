!function(){"use strict";function e(e,t){function n(e){var t=[];return angular.forEach(e.split("\n"),function(e){var n=e.split("||"),r=[],a={key:n[0],type:n[1],values:r};angular.forEach(n.pop().split(","),function(e){var t=e.split("|");r.push({t:t[0],v:parseFloat(t[1])})}),t.push(a)}),t}function r(t,r){if(!t||!r)throw new Error("collection and conditions can not be null");var a=[],o=u.format;a.push("format="+o),a.push("conditions="+JSON.stringify(r));var s="/stats/collection/"+t+"?"+a.join("&"),i=e.get(s);return i.then(function(e){return"text"===o&&e.data&&(e.data=n(e.data)),e}),i}function a(e,t,n,r){angular.forEach(e,function(e){e.interval=r,e.title+="("+n+")",e.data=[]});var a=function(e){var t=0;angular.forEach(e,function(e){t+=e.v});var n=e[e.length-1];return{v:t,t:n.t}},o=function(e){var t=a(e);return t.v=Maht.ceil(t.v/e.length),t};return angular.forEach(t,function(t){var n=t.key;angular.forEach(e,function(e){var r=!1;if(angular.isFunction(e.keys)?e.keys(n)&&(r=!0):-1!==e.keys.indexOf(n)&&(r=!0),r){var s=angular.copy(t,{});if("pie"===e.type)switch(t.type){case"counter":s.values=[a(t.values)];break;case"average":s.values=[o(t.values)];break;case"gauge":var i=t.values[t.values.length-1];s.values=[i]}else s.values=angular.copy(t.values);e.data.push(s)}})}),angular.forEach(e,function(e){delete e.keys}),e}function o(e,n,o){o=o||t.interval;var s={date:n,interval:o},i=r(e,s);return i.then(function(t){var n={title:"CPU监控",keys:["cpu.busy","cpu.iowait"]},r={title:"内存监控",data:[],keys:["mem.used","mem.usageRate"]},s={title:"process",keys:["procs_blocked","procs_running"]},i={title:"tcp/udp",keys:["tcp","udp"]},u={title:"网络传输",keys:function(e){var t=/\S*?\.(receive|transmit)\.(kbytes|rate|packets)/;return t.test(e)}},c={title:"网络出错",keys:function(e){var t=/\S*?\.(receive|transmit)\.(errs|drop)/;return t.test(e)}},l={title:"磁盘状况",keys:function(e){var t=/\S*?\.(read\-times|write\-times|ms\-reading|ms\-writing|writeSpeed|available)/;return t.test(e)}},p=[n,r,s,i,u,c,l];t.data=a(p,t.data,e,o)}),i}function s(e,n,o){o=o||t.interval;var s={date:n,interval:o},i=r(e,s);return i.then(function(t){var n={title:"backgroundFlushing",keys:["bgFlushing.flushes","bgFlushing.average_ms","bgFlushing.total_ms"]},r={title:"connections",keys:["connections.current","connections.totalCreated"]},s={title:"globalLock",keys:["globalLock.lockTime","globalLock.currentQueue.total","globalLock.currentQueue.readers","globalLock.currentQueue.writers","globalLock.activeClients.total","globalLock.activeClients.readers","globalLock.activeClients.writers"]},i={title:"indexCounters",keys:["indexCounters.accesses","indexCounters.hits","indexCounters.misses","indexCounters.missRatio"]},u={title:"indexCounters",type:"pie",keys:["indexCounters.hits","indexCounters.misses"]},c={title:"network",keys:["network.outkb","network.inkb","network.numRequests"]},l={title:"network",type:"pie",keys:["network.outkb","network.inkb"]},p={title:"opcounters",keys:["opcounters.query","opcounters.update","opcounters.delete","opcounters.insert","opcounters.getmore","opcounters.command"]},v={title:"opcounters",type:"pie",keys:["opcounters.query","opcounters.update","opcounters.delete","opcounters.insert","opcounters.getmore","opcounters.command"]},g={title:"recordStats",keys:["recordStats.accessesNotInMemory","recordStats.pageFaultExceptionsThrown"]},k={title:"mem",keys:["mem.virtual","mem.resident"]},d=[u,v,l,n,r,s,i,c,p,g,k],f=0;angular.forEach(d,function(e){f+=e.keys.length});var y=0;angular.forEach(t.data,function(e){e.key;y++}),t.data=a(d,t.data,e,o)}),i}function i(){var t=e.get("/stats/servers");return t}var u={getServerStats:o,getMongodbStats:s,getServers:i,get:r,format:"json"};return u}var t=angular.module("jtApp");t.constant("STATS_SETTING",{interval:60,gap:40}),t.factory("stats",e),e.$inject=["$http","STATS_SETTING"]}(this);