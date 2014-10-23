(function(){var a;a=angular.module("jt.directive.chart",["jt.service.utils","jt.service.debug"]),a.directive("jtChart",["$http","$timeout","$q","jtUtils","jtDebug",function(a,b,c,d,e){var f,g,h,i,j,k,l,m,n,o,p,q;return i=e("jt.chart"),o={getData:function(b,d){var e,f,g,h;return e={date:b.date,fill:b.fill,point:b.point},g=[],angular.forEach(b.stats,function(d){var f,h,i,j;f=c.defer(),d=angular.extend({},e,d),i="/stats?conditions="+JSON.stringify(d),h={cache:!0},(null!=(j=b.point)?j.interval:void 0)<0&&(i+="&cache=false",h.cache=!1),b.refreshInterval&&(h.cache=!1),a.get(i,h).success(function(a){angular.isArray(a)?angular.forEach(a,function(a){a.chart=d.chart}):a.chart=d.chart,f.resolve(a)}).error(function(a){f.reject(a)}),g.push(f.promise)}),h=function(a){var c;i("getData options:%j, res:%j",b,a),c=[],angular.forEach(a,function(a){angular.isArray(a)?c=c.concat(a):c.push(a)}),d(null,c)},f=function(a){i("getData options%j, err:%j",b,a),d(a)},c.all(g).then(h,f)}},h=86400,j={tooltip:{trigger:"axis"},calculable:!0,toolbox:{show:!0,feature:{mark:{show:!0},dataView:{show:!0},magicType:{show:!0,type:["line","bar"]},restore:{show:!0},saveAsImage:{show:!0}}},yAxis:[{type:"value"}],animation:!1},k={tooltip:{trigger:"item",formatter:"{a} <br/>{b} : {c} ({d}%)"},toolbox:{show:!0,feature:{mark:{show:!0},dataView:{show:!0},restore:{show:!0},saveAsImage:{show:!0}},calculable:!0}},q=function(a){var b;return b=0,angular.forEach(a,function(a){return b+=a}),b},f=function(a){var b;return b=q(a),Math.round(b/a.length)},p=function(a){var b,c;return c=[],angular.forEach(a,function(a){var b;b=[],angular.forEach(a.values,function(a){return b.push(a.t)}),c.push(b)}),b=c.shift(),angular.forEach(c,function(a){angular.forEach(a,function(a){var c;c=d.sortedIndex(b,a),b[c]!==a&&b.splice(c,0,a)})}),b},g=function(a,b){var c,d,e,f,g;for(e=[],angular.forEach(a,function(a){e.push(a.values)}),d=[],c=f=0,g=e.length;g>=0?g>f:f>g;c=g>=0?++f:--f)d.push([]);return angular.forEach(b,function(a){angular.forEach(e,function(b,c){var e,f;(null!=(f=b[0])?f.t:void 0)===a?(e=b.shift(),d[c].push(e.v)):d[c].push(0)})}),d},m=function(a,b){var c,d;return c=3,b&&(b%h===0?c=0:b%3600===0?c=1:b%60===0&&(c=2)),d=[],angular.forEach(a,function(a){var b,e,f,g,h,i,j;switch(b=new Date(1e3*a),j=b.getFullYear(),h=b.getMonth()+1,e=b.getDate(),f=b.getHours(),g=b.getMinutes(),i=b.getSeconds(),10>h&&(h="0"+h),10>e&&(e="0"+e),10>f&&(f="0"+f),10>g&&(g="0"+g),10>i&&(i="0"+i),c){case 0:b=""+j+"-"+h+"-"+e;break;case 1:b=""+j+"-"+h+"-"+e+" "+f;break;case 2:b=""+j+"-"+h+"-"+e+" "+f+":"+g;break;case 3:b=""+j+"-"+h+"-"+e+" "+f+":"+g+":"+i}d.push(b)}),d},n=function(a,b){return null==b&&(b=50),a>b?{show:!0,realtime:!0,start:100-Math.floor(100*b/a),end:100}:null},o.line=function(a,b,c){var d,e,f,h,k,o;if(null!=b?b.length:void 0)return i("line data:%j options:%j",b,c),k=p(b),o=g(b,k),k=m(k,null!=c?c.interval:void 0),h=[],angular.forEach(b,function(a,b){h.push({name:a.key,type:a.chart,data:o[b]})}),e=[],angular.forEach(b,function(a){e.push(a.key)}),d=angular.extend({},j,{legend:{data:e},dataZoom:n(k.length),xAxis:[{type:"category",boundaryGap:!1,data:k}],series:h},c),f=angular.isElement(a)?echarts.init(a,l):a,f.setOption(d,!0),f},o.barVertical=o.line,o.stack=function(a,b,c){var e,f,h,i,k;if(null!=b?b.length:void 0)return i=p(b),k=g(b,i),i=m(i,null!=c?c.interval:void 0),h=[],angular.forEach(b,function(a,b){h.push({name:a.key,type:a.chart,stack:"总量",data:k[b]})}),e=angular.extend({},j,{legend:{data:d.pluck(b,"key")},dataZoom:n(i.length),xAxis:[{type:"category",boundaryGap:!1,data:i}],series:h},c),f=angular.isElement(a)?echarts.init(a,l):a,f.setOption(e,!0),f},o.stackBarVertical=o.stack,o.barHorizontal=function(a,b,c,e){var f,h,i,k,o;return null==e&&(e=!1),(null!=b?b.length:void 0)?(k=p(b),o=g(b,k),k=m(k,null!=c?c.interval:void 0),i=[],angular.forEach(b,function(a,b){var c;c={name:a.key,type:a.chart,data:o[b]},e&&(c.stack="总量"),i.push(c)}),f=angular.extend({},j,{legend:{data:d.pluck(b,"key")},dataZoom:n(k.length),xAxis:[{type:"value",boundaryGap:[0,.01]}],yAxis:[{type:"category",data:k}],series:i},c),h=angular.isElement(a)?echarts.init(a,l):a,h.setOption(f,!0),h):void 0},o.stackBarHorizontal=function(a,b,c){return o.barHorizontal(a,b,c,!0)},o.pie=function(a,b,c){var e,g,h;return g=[],angular.forEach(b,function(a){var b,c;switch(c=d.pluck(a.values,"v"),a.type){case"counter":b=q(c);break;case"average":b=f(c);break;case"gauge":b=c[c.length-1]||0}g.push({name:a.key,value:b})}),c=angular.extend({},k,{legend:{data:d.pluck(g,"name"),orient:"vertical",x:"left",y:"30px"},series:[{name:null!=c&&null!=(h=c.title)?h.text:void 0,type:"pie",data:g}],animation:!1},c),e=angular.isElement(a)?echarts.init(a,l):a,e.setOption(c,!0),e},o.ring=function(a,b,c){var e,g,h,i,j,m;return g={normal:{label:{show:!1},labelLine:{show:!1}}},i={normal:{color:"rgba(0,0,0,0)",label:{show:!1},labelLine:{show:!1}},emphasis:{color:"rgba(0,0,0,0)"}},j=[],b.length>1&&(b.length=1),e=[],angular.forEach(b,function(a){var b,h,k;switch(h=d.pluck(a.values,"v"),a.type){case"counter":b=q(h);break;case"average":b=f(h);break;case"gauge":b=h[h.length-1]||0}e.push(b),j.push({name:null!=c&&null!=(k=c.title)?k.text:void 0,type:"pie",clockWise:!1,radius:["65%","80%"],itemStyle:g,data:[{value:b,name:a.key},{value:100-b,name:"invisible",itemStyle:i}]})}),c=angular.extend({},k,{title:{text:e.join(","),subtext:null!=c&&null!=(m=c.title)?m.text:void 0,x:"center",y:"center",itemGap:20,textStyle:{color:"rgba(30,144,255,0.8)",fontFamily:"微软雅黑",fontSize:48,fontWeight:"bolder"}},series:j,animation:!1}),h=angular.isElement(a)?echarts.init(a,l):a,h.setOption(c,!0),h},o.nestedPie=function(){},o.gauge=function(a,b,c){var d,e,f;return d=angular.extend({toolbox:{show:!0,feature:{mark:{show:!0},restore:{show:!0},saveAsImage:{show:!0}}}},c),f=[],angular.forEach(b,function(a){f.push({name:a.key,type:"gauge",detail:{formatter:"{value}"},data:[{value:a.values[0].v}]})}),d.series=f,e=angular.isElement(a)?echarts.init(a,l):a,e.setOption(d),e},o.funnel=function(a,b,c){var e,g,h,i;return i=[],angular.forEach(b,function(a){var b,c;switch(c=d.pluck(a.values,"v"),a.type){case"counter":b=q(c);break;case"average":b=f(c);break;case"gauge":b=c[c.length-1]||0}i.push({name:a.key,value:b})}),g=0,angular.forEach(i,function(a){a.value>g&&(g=a.value)}),angular.forEach(i,function(a){a.value=Math.floor(100*a.value/g)}),e=angular.extend({title:c.title,tooltip:{trigger:"item",formatter:"{b} : {c}%"},toolbox:{show:!0,feature:{mark:{show:!0},dataView:{show:!0,readOnly:!1},restore:{show:!0},saveAsImage:{show:!0}}},legend:{data:d.pluck(i,"name")},calculable:!0,series:[{type:"funnel",data:i}]}),h=angular.isElement(a)?echarts.init(a,l):a,h.setOption(e,!0),h},l={color:["#2ec7c9","#b6a2de","#5ab1ef","#ffb980","#d87a80","#8d98b3","#e5cf0d","#97b552","#95706d","#dc69aa","#07a2a4","#9a7fd1","#588dd5","#f5994e","#c05050","#59678c","#c9ab00","#7eb00a","#6f5553","#c14089"],title:{itemGap:8,textStyle:{fontWeight:"normal",color:"#008acd"}},legend:{itemGap:8},dataRange:{itemWidth:15,color:["#2ec7c9","#b6a2de"]},toolbox:{color:["#1e90ff","#1e90ff","#1e90ff","#1e90ff"],effectiveColor:"#ff4500",itemGap:8},tooltip:{backgroundColor:"rgba(50,50,50,0.5)",axisPointer:{type:"line",lineStyle:{color:"#008acd"},crossStyle:{color:"#008acd"},shadowStyle:{color:"rgba(200,200,200,0.2)"}}},dataZoom:{dataBackgroundColor:"#efefff",fillerColor:"rgba(182,162,222,0.2)",handleColor:"#008acd"},grid:{borderColor:"#eee"},categoryAxis:{axisLine:{lineStyle:{color:"#008acd"}},splitLine:{lineStyle:{color:["#eee"]}}},valueAxis:{axisLine:{lineStyle:{color:"#008acd"}},splitArea:{show:!0,areaStyle:{color:["rgba(250,250,250,0.1)","rgba(200,200,200,0.1)"]}},splitLine:{lineStyle:{color:["#eee"]}}},polar:{axisLine:{lineStyle:{color:"#ddd"}},splitArea:{show:!0,areaStyle:{color:["rgba(250,250,250,0.2)","rgba(200,200,200,0.2)"]}},splitLine:{lineStyle:{color:"#ddd"}}},timeline:{lineStyle:{color:"#008acd"},controlStyle:{normal:{color:"#008acd"},emphasis:{color:"#008acd"}},symbol:"emptyCircle",symbolSize:3},bar:{itemStyle:{normal:{borderRadius:5},emphasis:{borderRadius:5}}},line:{smooth:!0,symbol:"emptyCircle",symbolSize:3},k:{itemStyle:{normal:{color:"#d87a80",color0:"#2ec7c9",lineStyle:{width:1,color:"#d87a80",color0:"#2ec7c9"}}}},scatter:{symbol:"circle",symbolSize:4},radar:{symbol:"emptyCircle",symbolSize:3},map:{itemStyle:{normal:{areaStyle:{color:"#ddd"},label:{textStyle:{color:"#d87a80"}}},emphasis:{areaStyle:{color:"#fe994e"},label:{textStyle:{color:"rgb(100,0,0)"}}}}},force:{itemStyle:{normal:{linkStyle:{strokeColor:"#1e90ff"}}}},chord:{padding:4,itemStyle:{normal:{lineStyle:{width:1,color:"rgba(128, 128, 128, 0.5)"},chordStyle:{lineStyle:{width:1,color:"rgba(128, 128, 128, 0.5)"}}},emphasis:{lineStyle:{width:1,color:"rgba(128, 128, 128, 0.5)"},chordStyle:{lineStyle:{width:1,color:"rgba(128, 128, 128, 0.5)"}}}}},gauge:{startAngle:225,endAngle:-45,axisLine:{show:!0,lineStyle:{color:[[.2,"#2ec7c9"],[.8,"#5ab1ef"],[1,"#d87a80"]],width:10}},axisTick:{splitNumber:10,length:15,lineStyle:{color:"auto"}},axisLabel:{textStyle:{color:"auto"}},splitLine:{length:22,lineStyle:{color:"auto"}},pointer:{width:5,color:"auto"},title:{textStyle:{color:"#333"}},detail:{textStyle:{color:"auto"}}},textStyle:{fontFamily:"微软雅黑, Arial, Verdana, sans-serif"}},{restrict:"A",link:function(a,c,d){var e,f,g,h,i;g=d.jtChart,e=a[g],f=null,i=null,h=function(a,d){var e,g;null==d&&(d=!1),g=a.type,e=a.refreshInterval,d||c.html('<div style="margin:15px"><div class="alert alert-info">正在加载数据，请稍候...</div></div>'),o.getData(a,function(j,k){var l,m;j?c.html(j.msg):(null!=k?k.length:void 0)?(d&&f?l=f:(c.empty(),l=angular.element('<div style="height:100%"></div>'),c.append(l),l=l[0]),f=o[g](l,k,{title:{text:a.name||"未定义"},interval:null!=(m=a.point)?m.interval:void 0})):c.html('<div style="margin:15px"><div class="alert alert-danger">没有相关统计数据</div></div>'),e&&(i=b(function(){return h(a,!0)},1e3*e))})},e&&h(e),a.$watch(g,function(a){i&&b.cancel(i),a&&h(a)}),a.$on("$destroy",function(){return c.empty(),i?b.cancel(i):void 0})}}}])}).call(this);