(function(){"use strict";var a=angular.module("LocalStorageModule",[]);a.provider("localStorageService",function(){this.prefix="ls",this.storageType="localStorage",this.cookie={expiry:30,path:"/"},this.notify={setItem:!0,removeItem:!1},this.setPrefix=function(a){this.prefix=a},this.setStorageType=function(a){this.storageType=a},this.setStorageCookie=function(a,b){this.cookie={expiry:a,path:b}},this.setStorageCookieDomain=function(a){this.cookie.domain=a},this.setNotify=function(a,b){this.notify={setItem:a,removeItem:b}},this.$get=["$rootScope","$window","$document",function(a,b,c){var d,e=this,f=e.prefix,g=e.cookie,h=e.notify,i=e.storageType;c?c[0]&&(c=c[0]):c=document,"."!==f.substr(-1)&&(f=f?f+".":"");var j=function(a){return f+a},k=function(){try{var c=i in b&&null!==b[i],e=j("__"+Math.round(1e7*Math.random()));return c&&(d=b[i],d.setItem(e,""),d.removeItem(e)),c}catch(f){return i="cookie",a.$broadcast("LocalStorageModule.notification.error",f.message),!1}}(),l=function(b,c){if(!k||"cookie"===e.storageType)return a.$broadcast("LocalStorageModule.notification.warning","LOCAL_STORAGE_NOT_SUPPORTED"),h.setItem&&a.$broadcast("LocalStorageModule.notification.setitem",{key:b,newvalue:c,storageType:"cookie"}),r(b,c);"undefined"==typeof c&&(c=null);try{(angular.isObject(c)||angular.isArray(c))&&(c=angular.toJson(c)),d&&d.setItem(j(b),c),h.setItem&&a.$broadcast("LocalStorageModule.notification.setitem",{key:b,newvalue:c,storageType:e.storageType})}catch(f){return a.$broadcast("LocalStorageModule.notification.error",f.message),r(b,c)}return!0},m=function(b){if(!k||"cookie"===e.storageType)return a.$broadcast("LocalStorageModule.notification.warning","LOCAL_STORAGE_NOT_SUPPORTED"),s(b);var c=d?d.getItem(j(b)):null;return c&&"null"!==c?"{"===c.charAt(0)||"["===c.charAt(0)?angular.fromJson(c):c:null},n=function(b){if(!k)return a.$broadcast("LocalStorageModule.notification.warning","LOCAL_STORAGE_NOT_SUPPORTED"),h.removeItem&&a.$broadcast("LocalStorageModule.notification.removeitem",{key:b,storageType:"cookie"}),t(b);try{d.removeItem(j(b)),h.removeItem&&a.$broadcast("LocalStorageModule.notification.removeitem",{key:b,storageType:e.storageType})}catch(c){return a.$broadcast("LocalStorageModule.notification.error",c.message),t(b)}return!0},o=function(){if(!k)return a.$broadcast("LocalStorageModule.notification.warning","LOCAL_STORAGE_NOT_SUPPORTED"),!1;var b=f.length,c=[];for(var e in d)if(e.substr(0,b)===f)try{c.push(e.substr(b))}catch(g){return a.$broadcast("LocalStorageModule.notification.error",g.Description),[]}return c},p=function(b){b=b||"";var c=f.slice(0,-1),e=new RegExp(c+"."+b);if(!k)return a.$broadcast("LocalStorageModule.notification.warning","LOCAL_STORAGE_NOT_SUPPORTED"),u();var g=f.length;for(var h in d)if(e.test(h))try{n(h.substr(g))}catch(i){return a.$broadcast("LocalStorageModule.notification.error",i.message),u()}return!0},q=function(){try{return navigator.cookieEnabled||"cookie"in c&&(c.cookie.length>0||(c.cookie="test").indexOf.call(c.cookie,"test")>-1)}catch(b){return a.$broadcast("LocalStorageModule.notification.error",b.message),!1}},r=function(b,d){if("undefined"==typeof d)return!1;if(!q())return a.$broadcast("LocalStorageModule.notification.error","COOKIES_NOT_SUPPORTED"),!1;try{var e="",f=new Date,h="";if(null===d?(f.setTime(f.getTime()+-864e5),e="; expires="+f.toGMTString(),d=""):0!==g.expiry&&(f.setTime(f.getTime()+24*g.expiry*60*60*1e3),e="; expires="+f.toGMTString()),b){var i="; path="+g.path;g.domain&&(h="; domain="+g.domain),console.dir(j(b)+"="+encodeURIComponent(d)+e+i+h),c.cookie=j(b)+"="+encodeURIComponent(d)+e+i+h}}catch(k){return a.$broadcast("LocalStorageModule.notification.error",k.message),!1}return!0},s=function(b){if(!q())return a.$broadcast("LocalStorageModule.notification.error","COOKIES_NOT_SUPPORTED"),!1;for(var d=c.cookie&&c.cookie.split(";")||[],e=0;e<d.length;e++){for(var g=d[e];" "===g.charAt(0);)g=g.substring(1,g.length);if(0===g.indexOf(j(b)+"="))return decodeURIComponent(g.substring(f.length+b.length+1,g.length))}return null},t=function(a){r(a,null)},u=function(){for(var a=null,b=f.length,d=c.cookie.split(";"),e=0;e<d.length;e++){for(a=d[e];" "===a.charAt(0);)a=a.substring(1,a.length);var g=a.substring(b,a.indexOf("="));t(g)}},v=function(){return i},w=function(a,b,c){var d=m(b);null===d&&angular.isDefined(c)?d=c:angular.isObject(d)&&angular.isObject(c)&&(d=angular.extend(c,d)),a[b]=d,a.$watchCollection(b,function(a){l(b,a)})};return{isSupported:k,getStorageType:v,set:l,add:l,get:m,keys:o,remove:n,clearAll:p,bind:w,deriveKey:j,cookie:{set:r,add:r,get:s,remove:t,clearAll:u}}}]})}).call(this);
(function(){var a;a=angular.module("jt.utils",[]),a.factory("jtUtils",["$http","$rootScope",function(){var a;return a={now:Date.now||function(){return(new Date).getTime()},nextTick:function(a){return setTimeout(a,0)},pluck:function(a,b){var c;return c=[],angular.forEach(a,function(a){return c.push(a[b])}),c},throttle:function(b,c,d){var e,f,g,h,i,j;return f=void 0,e=void 0,i=void 0,j=null,h=0,d||(d={}),g=function(){h=d.leading===!1?0:a.now(),j=null,i=b.apply(f,e),j||(f=e=null)},function(){var k,l;return k=a.now(),h||d.leading!==!1||(h=k),l=c-(k-h),f=this,e=arguments,0>=l||l>c?(clearTimeout(j),j=null,h=k,i=b.apply(f,e),j||(f=e=null)):j||d.trailing===!1||(j=setTimeout(g,l)),i}},debounce:function(b,c,d){var e,f,g,h,i,j;return i=void 0,e=void 0,f=void 0,j=void 0,h=void 0,g=function(){var k;k=a.now()-j,c>k&&k>0?i=setTimeout(g,c-k):(i=null,d||(h=b.apply(f,e),i||(f=e=null)))},function(){var k;return f=this,e=arguments,j=a.now(),k=d&&!i,i||(i=setTimeout(g,c)),k&&(h=b.apply(f,e),f=e=null),h}},uuid:function(){var a;return a="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b,c;return b=16*Math.random()|0,c="x"===a?b:3&b|8,c.toString(16)})},memoize:function(b,c){var d,e,f;return d={},f={},c=c||function(a){return a},e=function(){var e,g,h;e=Array.prototype.slice.call(arguments),g=e.pop(),h=c.apply(null,e),h in d?a.nextTick(function(){g.apply(null,d[h])}):h in f?f[h].push(g):(f[h]=[g],b.apply(null,e.concat([function(){var a,b,c;for(d[h]=arguments,c=f[h],delete f[h],a=0,b=c.length;b>a;)c[a].apply(null,arguments),a++}])))},e.memo=d,e.unmemoized=b,e},sortedIndex:function(a,b,c){var d,e,f;for(e=0,d=(null!=a?a.length:void 0)||e;d>e;)f=e+d>>>1,c?c(a[f],b)<0?e=f+1:d=f:a[f]<b?e=f+1:d=f;return e}}}])}).call(this);
(function(){var a,b;a=angular.module("jt.httpLog",["LocalStorageModule"]),b=Date.now||function(){return(new Date).getTime()},a.factory("jtHttpLog",["$q","$injector","localStorageService",function(a,c,d){var e,f,g;return f=d.get("httpLog")||{success:[],error:[]},g=function(){var a;return a=c.get("$http"),f.success.length||f.error.length?(a.post("/httplog",f).success(function(a){return console.dir(a)}).error(function(a){return console.dir(a)}),f={success:[],error:[]},d.set("httpLog",f)):void 0},setInterval(function(){return g()},12e4),e={request:function(a){return a._createdAt=b(),a},response:function(a){var c,e,g;return c=a.config,e=c.url,"/httplog"!==e&&(g=b()-c._createdAt,f.success.push({url:e,use:g}),d.set("httpLog",f)),a},requestError:function(b){return a.reject(b)},responseError:function(b){return f.error.push({url:b.config.url,status:b.status}),d.set("httpLog",f),a.reject(b)}}}])}).call(this);
(function(){var a;a=angular.module("jt.user",[]),a.factory("user",["$http","$document","localStorageService","jtUtils",function(a,b,c,d){var e,f,g;return e=d.memoize(function(b){return a.get("/user").success(function(a){return b(null,a)}).error(function(a){return b(a)})}),g=c.get("user"),g||(g={uuid:d.uuid()}),g.updatedAt=d.now(),c.cookie.set("uuid",g.uuid),c.set("user",g),f={getInfo:function(a){return a(null,g)}}}])}).call(this);
(function(){var a;a=angular.module("jt.directive.common",[]),a.directive("jtFocus",[function(){var a;return a="jtFocused",{restrict:"A",require:"ngModel",link:function(b,c,d,e){return e.$focused=!1,c.bind("focus",function(){c.addClass(a),b.$apply(function(){e.$focused=!0})}),c.bind("blur",function(){c.removeClass(a),b.$apply(function(){e.$focused=!1})})}}}]),a.directive("jtSelect",["$compile",function(a){return{restrict:"A",require:"ngModel",template:'<i class="fa fa-plus"></i><span class="placeholder"></span><ul></ul>',link:function(b,c,d){var e,f,g,h,i,j;i=d.placeholder,g=d.ngModel,f=d.jtSelect,i&&(j=c.find("span").text(i)),h="multiple"===d.multiple,e=function(d,e){var f,i,j,k,l;i=[],j=g.split("."),k=j.pop(),l=b,angular.forEach(j,function(a){l=b[a]}),e&&(l[k]=h?{}:""),angular.forEach(d,function(a){var b,c,d;h?(d=""+g+"['"+a+"'] = !"+g+"['"+a+"']",c="{'fa-square' : "+g+"['"+a+"'], 'fa-square-o' : !"+g+"['"+a+"']}"):(d=""+g+"='"+a+"'",c="{'fa-square' : "+g+" == '"+a+"', 'fa-square-o' : "+g+" != '"+a+"'}"),b='<li ng-click="'+d+'"><i class="fa" ng-class="'+c+'"></i>'+a+"</li>",i.push(b)}),f=c.find("ul").html(i.join("")),a(f)(b)},b[f]&&e(b[f],!1),b.$watch(f,function(a,b){a!==b&&e(a,!0)}),b.$watch(g,function(a){var b;a&&(h?(b=[],angular.forEach(a,function(a,c){return a?b.push(c):void 0}),j.text(b.length?b.join(" "):i)):j.text(a?a:i))},h)}}}])}).call(this);
(function(){var a;a=angular.module("jt.chart",["jt.utils","jt.debug"]),a.directive("jtChart",["$http","$timeout","$q","jtUtils","jtDebug",function(a,b,c,d,e){var f,g,h,i,j,k,l,m,n,o,p,q;return i=e("jt.chart"),o={getData:function(b,d){var e,f,g,h;return e={date:b.date,fill:b.fill,point:b.point},g=[],angular.forEach(b.stats,function(d){var f,h,i,j;f=c.defer(),d=angular.extend({},e,d),i="/stats?conditions="+JSON.stringify(d),h={cache:!0},(null!=(j=b.point)?j.interval:void 0)<0&&(i+="&cache=false",h.cache=!1),b.refreshInterval&&(h.cache=!1),a.get(i,h).success(function(a){angular.isArray(a)?angular.forEach(a,function(a){a.chart=d.chart}):a.chart=d.chart,f.resolve(a)}).error(function(a){f.reject(a)}),g.push(f.promise)}),h=function(a){var c;i("getData options:%j, res:%j",b,a),c=[],angular.forEach(a,function(a){angular.isArray(a)?c=c.concat(a):c.push(a)}),d(null,c)},f=function(a){i("getData options%j, err:%j",b,a),d(a)},c.all(g).then(h,f)}},h=86400,j={tooltip:{trigger:"axis"},calculable:!0,toolbox:{show:!0,feature:{mark:{show:!0},dataView:{show:!0},magicType:{show:!0,type:["line","bar"]},restore:{show:!0},saveAsImage:{show:!0}}},yAxis:[{type:"value"}],animation:!1},k={tooltip:{trigger:"item",formatter:"{a} <br/>{b} : {c} ({d}%)"},toolbox:{show:!0,feature:{mark:{show:!0},dataView:{show:!0},restore:{show:!0},saveAsImage:{show:!0}},calculable:!0}},q=function(a){var b;return b=0,angular.forEach(a,function(a){return b+=a}),b},f=function(a){var b;return b=q(a),Math.round(b/a.length)},p=function(a){var b,c;return c=[],angular.forEach(a,function(a){var b;b=[],angular.forEach(a.values,function(a){return b.push(a.t)}),c.push(b)}),b=c.shift(),angular.forEach(c,function(a){angular.forEach(a,function(a){var c;c=d.sortedIndex(b,a),b[c]!==a&&b.splice(c,0,a)})}),b},g=function(a,b){var c,d,e,f,g;for(e=[],angular.forEach(a,function(a){e.push(a.values)}),d=[],c=f=0,g=e.length;g>=0?g>f:f>g;c=g>=0?++f:--f)d.push([]);return angular.forEach(b,function(a){angular.forEach(e,function(b,c){var e,f;(null!=(f=b[0])?f.t:void 0)===a?(e=b.shift(),d[c].push(e.v)):d[c].push(0)})}),d},m=function(a,b){var c,d;return c=3,b&&(b%h===0?c=0:b%3600===0?c=1:b%60===0&&(c=2)),d=[],angular.forEach(a,function(a){var b,e,f,g,h,i,j;switch(b=new Date(1e3*a),j=b.getFullYear(),h=b.getMonth()+1,e=b.getDate(),f=b.getHours(),g=b.getMinutes(),i=b.getSeconds(),10>h&&(h="0"+h),10>e&&(e="0"+e),10>f&&(f="0"+f),10>g&&(g="0"+g),10>i&&(i="0"+i),c){case 0:b=""+j+"-"+h+"-"+e;break;case 1:b=""+j+"-"+h+"-"+e+" "+f;break;case 2:b=""+j+"-"+h+"-"+e+" "+f+":"+g;break;case 3:b=""+j+"-"+h+"-"+e+" "+f+":"+g+":"+i}d.push(b)}),d},n=function(a,b){return null==b&&(b=50),a>b?{show:!0,realtime:!0,start:100-Math.floor(100*b/a),end:100}:null},o.line=function(a,b,c){var d,e,f,h,k,o;if(null!=b?b.length:void 0)return i("line data:%j options:%j",b,c),k=p(b),o=g(b,k),k=m(k,null!=c?c.interval:void 0),h=[],angular.forEach(b,function(a,b){h.push({name:a.key,type:a.chart,data:o[b]})}),e=[],angular.forEach(b,function(a){e.push(a.key)}),d=angular.extend({},j,{legend:{data:e},dataZoom:n(k.length),xAxis:[{type:"category",boundaryGap:!1,data:k}],series:h},c),f=angular.isElement(a)?echarts.init(a,l):a,f.setOption(d,!0),f},o.barVertical=o.line,o.stack=function(a,b,c){var e,f,h,i,k;if(null!=b?b.length:void 0)return i=p(b),k=g(b,i),i=m(i,null!=c?c.interval:void 0),h=[],angular.forEach(b,function(a,b){h.push({name:a.key,type:a.chart,stack:"总量",data:k[b]})}),e=angular.extend({},j,{legend:{data:d.pluck(b,"key")},dataZoom:n(i.length),xAxis:[{type:"category",boundaryGap:!1,data:i}],series:h},c),f=angular.isElement(a)?echarts.init(a,l):a,f.setOption(e,!0),f},o.stackBarVertical=o.stack,o.barHorizontal=function(a,b,c,e){var f,h,i,k,o;return null==e&&(e=!1),(null!=b?b.length:void 0)?(k=p(b),o=g(b,k),k=m(k,null!=c?c.interval:void 0),i=[],angular.forEach(b,function(a,b){var c;c={name:a.key,type:a.chart,data:o[b]},e&&(c.stack="总量"),i.push(c)}),f=angular.extend({},j,{legend:{data:d.pluck(b,"key")},dataZoom:n(k.length),xAxis:[{type:"value",boundaryGap:[0,.01]}],yAxis:[{type:"category",data:k}],series:i},c),h=angular.isElement(a)?echarts.init(a,l):a,h.setOption(f,!0),h):void 0},o.stackBarHorizontal=function(a,b,c){return o.barHorizontal(a,b,c,!0)},o.pie=function(a,b,c){var e,g,h;return g=[],angular.forEach(b,function(a){var b,c;switch(c=d.pluck(a.values,"v"),a.type){case"counter":b=q(c);break;case"average":b=f(c);break;case"gauge":b=c[c.length-1]||0}g.push({name:a.key,value:b})}),c=angular.extend({},k,{legend:{data:d.pluck(g,"name"),orient:"vertical",x:"left",y:"30px"},series:[{name:null!=c&&null!=(h=c.title)?h.text:void 0,type:"pie",data:g}],animation:!1},c),e=angular.isElement(a)?echarts.init(a,l):a,e.setOption(c,!0),e},o.ring=function(a,b,c){var e,g,h,i,j,m;return g={normal:{label:{show:!1},labelLine:{show:!1}}},i={normal:{color:"rgba(0,0,0,0)",label:{show:!1},labelLine:{show:!1}},emphasis:{color:"rgba(0,0,0,0)"}},j=[],b.length>1&&(b.length=1),e=[],angular.forEach(b,function(a){var b,h,k;switch(h=d.pluck(a.values,"v"),a.type){case"counter":b=q(h);break;case"average":b=f(h);break;case"gauge":b=h[h.length-1]||0}e.push(b),j.push({name:null!=c&&null!=(k=c.title)?k.text:void 0,type:"pie",clockWise:!1,radius:["65%","80%"],itemStyle:g,data:[{value:b,name:a.key},{value:100-b,name:"invisible",itemStyle:i}]})}),c=angular.extend({},k,{title:{text:e.join(","),subtext:null!=c&&null!=(m=c.title)?m.text:void 0,x:"center",y:"center",itemGap:20,textStyle:{color:"rgba(30,144,255,0.8)",fontFamily:"微软雅黑",fontSize:48,fontWeight:"bolder"}},series:j,animation:!1}),h=angular.isElement(a)?echarts.init(a,l):a,h.setOption(c,!0),h},o.nestedPie=function(){},o.gauge=function(a,b,c){var d,e,f;return d=angular.extend({toolbox:{show:!0,feature:{mark:{show:!0},restore:{show:!0},saveAsImage:{show:!0}}}},c),f=[],angular.forEach(b,function(a){f.push({name:a.key,type:"gauge",detail:{formatter:"{value}"},data:[{value:a.values[0].v}]})}),d.series=f,e=angular.isElement(a)?echarts.init(a,l):a,e.setOption(d),e},o.funnel=function(a,b,c){var e,g,h,i;return i=[],angular.forEach(b,function(a){var b,c;switch(c=d.pluck(a.values,"v"),a.type){case"counter":b=q(c);break;case"average":b=f(c);break;case"gauge":b=c[c.length-1]||0}i.push({name:a.key,value:b})}),g=0,angular.forEach(i,function(a){a.value>g&&(g=a.value)}),angular.forEach(i,function(a){a.value=Math.floor(100*a.value/g)}),e=angular.extend({title:c.title,tooltip:{trigger:"item",formatter:"{b} : {c}%"},toolbox:{show:!0,feature:{mark:{show:!0},dataView:{show:!0,readOnly:!1},restore:{show:!0},saveAsImage:{show:!0}}},legend:{data:d.pluck(i,"name")},calculable:!0,series:[{type:"funnel",data:i}]}),h=angular.isElement(a)?echarts.init(a,l):a,h.setOption(e,!0),h},l={color:["#2ec7c9","#b6a2de","#5ab1ef","#ffb980","#d87a80","#8d98b3","#e5cf0d","#97b552","#95706d","#dc69aa","#07a2a4","#9a7fd1","#588dd5","#f5994e","#c05050","#59678c","#c9ab00","#7eb00a","#6f5553","#c14089"],title:{itemGap:8,textStyle:{fontWeight:"normal",color:"#008acd"}},legend:{itemGap:8},dataRange:{itemWidth:15,color:["#2ec7c9","#b6a2de"]},toolbox:{color:["#1e90ff","#1e90ff","#1e90ff","#1e90ff"],effectiveColor:"#ff4500",itemGap:8},tooltip:{backgroundColor:"rgba(50,50,50,0.5)",axisPointer:{type:"line",lineStyle:{color:"#008acd"},crossStyle:{color:"#008acd"},shadowStyle:{color:"rgba(200,200,200,0.2)"}}},dataZoom:{dataBackgroundColor:"#efefff",fillerColor:"rgba(182,162,222,0.2)",handleColor:"#008acd"},grid:{borderColor:"#eee"},categoryAxis:{axisLine:{lineStyle:{color:"#008acd"}},splitLine:{lineStyle:{color:["#eee"]}}},valueAxis:{axisLine:{lineStyle:{color:"#008acd"}},splitArea:{show:!0,areaStyle:{color:["rgba(250,250,250,0.1)","rgba(200,200,200,0.1)"]}},splitLine:{lineStyle:{color:["#eee"]}}},polar:{axisLine:{lineStyle:{color:"#ddd"}},splitArea:{show:!0,areaStyle:{color:["rgba(250,250,250,0.2)","rgba(200,200,200,0.2)"]}},splitLine:{lineStyle:{color:"#ddd"}}},timeline:{lineStyle:{color:"#008acd"},controlStyle:{normal:{color:"#008acd"},emphasis:{color:"#008acd"}},symbol:"emptyCircle",symbolSize:3},bar:{itemStyle:{normal:{borderRadius:5},emphasis:{borderRadius:5}}},line:{smooth:!0,symbol:"emptyCircle",symbolSize:3},k:{itemStyle:{normal:{color:"#d87a80",color0:"#2ec7c9",lineStyle:{width:1,color:"#d87a80",color0:"#2ec7c9"}}}},scatter:{symbol:"circle",symbolSize:4},radar:{symbol:"emptyCircle",symbolSize:3},map:{itemStyle:{normal:{areaStyle:{color:"#ddd"},label:{textStyle:{color:"#d87a80"}}},emphasis:{areaStyle:{color:"#fe994e"},label:{textStyle:{color:"rgb(100,0,0)"}}}}},force:{itemStyle:{normal:{linkStyle:{strokeColor:"#1e90ff"}}}},chord:{padding:4,itemStyle:{normal:{lineStyle:{width:1,color:"rgba(128, 128, 128, 0.5)"},chordStyle:{lineStyle:{width:1,color:"rgba(128, 128, 128, 0.5)"}}},emphasis:{lineStyle:{width:1,color:"rgba(128, 128, 128, 0.5)"},chordStyle:{lineStyle:{width:1,color:"rgba(128, 128, 128, 0.5)"}}}}},gauge:{startAngle:225,endAngle:-45,axisLine:{show:!0,lineStyle:{color:[[.2,"#2ec7c9"],[.8,"#5ab1ef"],[1,"#d87a80"]],width:10}},axisTick:{splitNumber:10,length:15,lineStyle:{color:"auto"}},axisLabel:{textStyle:{color:"auto"}},splitLine:{length:22,lineStyle:{color:"auto"}},pointer:{width:5,color:"auto"},title:{textStyle:{color:"#333"}},detail:{textStyle:{color:"auto"}}},textStyle:{fontFamily:"微软雅黑, Arial, Verdana, sans-serif"}},{restrict:"A",link:function(a,c,d){var e,f,g,h,i;g=d.jtChart,e=a[g],f=null,i=null,h=function(a,d){var e,g;null==d&&(d=!1),g=a.type,e=a.refreshInterval,d||c.html('<div style="margin:15px"><div class="alert alert-info">正在加载数据，请稍候...</div></div>'),o.getData(a,function(j,k){var l,m;j?c.html(j.msg):(null!=k?k.length:void 0)?(d&&f?l=f:(c.empty(),l=angular.element('<div style="height:100%"></div>'),c.append(l),l=l[0]),f=o[g](l,k,{title:{text:a.name||"未定义"},interval:null!=(m=a.point)?m.interval:void 0})):c.html('<div style="margin:15px"><div class="alert alert-danger">没有相关统计数据</div></div>'),e&&(i=b(function(){return h(a,!0)},1e3*e))})},e&&h(e),a.$watch(g,function(a){i&&b.cancel(i),a&&h(a)}),a.$on("$destroy",function(){return c.empty(),i?b.cancel(i):void 0})}}}])}).call(this);
(function(){var a,b;a=angular.module("jt.debug",[]),b=function(){},a.factory("jtDebug",["$http","$rootScope",function(){var a,c,d;return a=window.debug,a?(c=null!=(d=window.CONFIG)?d.pattern:void 0,c?a.enable(c):a.disable(),a):function(){return b}}])}).call(this);
(function(){var a;a=angular.module("jtApp",["LocalStorageModule","jt.debug","jt.utils","jt.httpLog","jt.user","jt.directive.common"]),a.addRequires&&alert("addRequires is defined"),a.addRequires=function(b){var c;return angular.isArray(b)||(b=[b]),c=a.requires,angular.forEach(b,function(a){~c.indexOf(a)||c.push(a)}),this},a.config(["localStorageServiceProvider",function(a){a.prefix="jt"}]).config(["$httpProvider",function(a){return a.interceptors.push("jtHttpLog")}]).config(["$provide",function(a){var b;return b=["$delegate","$injector",function(a){return function(b,c){return a(b,c),"development"===CONFIG.env?alert("exception:"+b+", cause:"+c):void 0}}],a.decorator("$exceptionHandler",b)}]),a.run(["$http","$timeout",function(a,b){var c,d,e,f;e=window.TIME_LINE,e&&a.post("/timeline",e.getLogs()),"development"===CONFIG.env&&(null!=(f=window.IMPORT_FILES)?f.length:void 0)&&a.post("/import/files",{template:CONFIG.template,files:window.IMPORT_FILES}),c=1e4,d=function(){var a,e;e=[],a=function(b){return b.data().hasOwnProperty("$scope")&&angular.forEach(b.data().$scope.$$watchers,function(a){return e.push(a)}),angular.forEach(b.children(),function(b){return a(angular.element(b))})},a(angular.element(document.getElementsByTagName("body"))),console.dir("watcher total:"+e.length),b(function(){return d()},c)},"development"===CONFIG.env&&b(function(){return d()},c)}])}).call(this);