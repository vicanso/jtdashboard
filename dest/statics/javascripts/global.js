(function(){var a;a=angular.module("jtApp",["LocalStorageModule","jt.debug","jt.utils","jt.httpLog","jt.user","jt.directive.common"]),a.addRequires&&alert("addRequires is defined"),a.addRequires=function(b){var c;return angular.isArray(b)||(b=[b]),c=a.requires,angular.forEach(b,function(a){~c.indexOf(a)||c.push(a)}),this},a.config(["localStorageServiceProvider",function(a){a.prefix="jt"}]).config(["$httpProvider",function(a){return a.interceptors.push("jtHttpLog")}]).config(["$provide",function(a){var b;return b=["$delegate","$injector",function(a){return function(b,c){return a(b,c),"development"===CONFIG.env?alert("exception:"+b+", cause:"+c):void 0}}],a.decorator("$exceptionHandler",b)}]),a.run(["$http","$timeout",function(a,b){var c,d,e,f;e=window.TIME_LINE,e&&a.post("/timeline",e.getLogs()),"development"===CONFIG.env&&(null!=(f=window.IMPORT_FILES)?f.length:void 0)&&a.post("/import/files",{template:CONFIG.template,files:window.IMPORT_FILES}),c=1e4,d=function(){var a,e;e=[],a=function(b){return b.data().hasOwnProperty("$scope")&&angular.forEach(b.data().$scope.$$watchers,function(a){return e.push(a)}),angular.forEach(b.children(),function(b){return a(angular.element(b))})},a(angular.element(document.getElementsByTagName("body"))),console.dir("watcher total:"+e.length),b(function(){return d()},c)},"development"===CONFIG.env&&b(function(){return d()},c)}])}).call(this);