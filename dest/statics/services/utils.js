(function(){var a;a=angular.module("jt.service.utils",[]),a.factory("jtUtils",["$http","$rootScope",function(){var a;return a={now:Date.now||function(){return(new Date).getTime()},nextTick:function(a){return setTimeout(a,0)},pluck:function(a,b){var c;return c=[],angular.forEach(a,function(a){return c.push(a[b])}),c},throttle:function(b,c,d){var e,f,g,h,i,j;return f=void 0,e=void 0,i=void 0,j=null,h=0,d||(d={}),g=function(){h=d.leading===!1?0:a.now(),j=null,i=b.apply(f,e),j||(f=e=null)},function(){var k,l;return k=a.now(),h||d.leading!==!1||(h=k),l=c-(k-h),f=this,e=arguments,0>=l||l>c?(clearTimeout(j),j=null,h=k,i=b.apply(f,e),j||(f=e=null)):j||d.trailing===!1||(j=setTimeout(g,l)),i}},debounce:function(b,c,d){var e,f,g,h,i,j;return i=void 0,e=void 0,f=void 0,j=void 0,h=void 0,g=function(){var k;k=a.now()-j,c>k&&k>0?i=setTimeout(g,c-k):(i=null,d||(h=b.apply(f,e),i||(f=e=null)))},function(){var k;return f=this,e=arguments,j=a.now(),k=d&&!i,i||(i=setTimeout(g,c)),k&&(h=b.apply(f,e),f=e=null),h}},uuid:function(){var a;return a="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b,c;return b=16*Math.random()|0,c="x"===a?b:3&b|8,c.toString(16)})},memoize:function(b,c){var d,e,f;return d={},f={},c=c||function(a){return a},e=function(){var e,g,h;e=Array.prototype.slice.call(arguments),g=e.pop(),h=c.apply(null,e),h in d?a.nextTick(function(){g.apply(null,d[h])}):h in f?f[h].push(g):(f[h]=[g],b.apply(null,e.concat([function(){var a,b,c;for(d[h]=arguments,c=f[h],delete f[h],a=0,b=c.length;b>a;)c[a].apply(null,arguments),a++}])))},e.memo=d,e.unmemoized=b,e},sortedIndex:function(a,b,c){var d,e,f;for(e=0,d=(null!=a?a.length:void 0)||e;d>e;)f=e+d>>>1,c?c(a[f],b)<0?e=f+1:d=f:a[f]<b?e=f+1:d=f;return e}}}])}).call(this);